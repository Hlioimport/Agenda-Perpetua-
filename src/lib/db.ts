import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  getDocs,
  setDoc,
  serverTimestamp,
  orderBy,
  or
} from 'firebase/firestore';
import { db } from './firebase';
import { Appointment, AgendaShare } from '../types';

const APPOINTMENTS_COLLECTION = 'appointments';
const SHARES_COLLECTION = 'agenda_shares';
const LOCAL_STORAGE_KEY = 'agenda_perpetua_local_appointments';

// Helper for local storage guest mode or offline backup
export const getLocalAppointments = (): Appointment[] => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveLocalAppointments = (items: Appointment[]) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('Error saving local appointments', err);
  }
};

// Real-time listener for user's appointments (own + shared)
export const subscribeToAppointments = (
  userId: string,
  userEmail: string | null,
  activeAgendaUid: string | null, // null = own agenda, string = shared user's agenda
  onData: (appointments: Appointment[]) => void,
  onError?: (error: Error) => void
) => {
  if (!userId) {
    // Guest mode
    const localData = getLocalAppointments();
    onData(localData);
    return () => {};
  }

  const targetUid = activeAgendaUid || userId;

  try {
    const collRef = collection(db, APPOINTMENTS_COLLECTION);
    
    // Query for appointments belonging to targetUid or shared with userEmail
    let q;
    if (activeAgendaUid && activeAgendaUid !== userId) {
      // Viewing someone else's agenda (shared with me)
      q = query(
        collRef,
        where('userId', '==', activeAgendaUid)
      );
    } else {
      // Viewing own agenda
      q = query(
        collRef,
        where('userId', '==', userId)
      );
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: Appointment[] = snapshot.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Appointment, 'id'>)
        }));

        // Sort by date and time
        items.sort((a, b) => {
          const dateComp = a.date.localeCompare(b.date);
          if (dateComp !== 0) return dateComp;
          return (a.time || '').localeCompare(b.time || '');
        });

        // Cache Firestore items locally for instant offline fallback
        if (!activeAgendaUid || activeAgendaUid === userId) {
          saveLocalAppointments(items);
        }

        onData(items);
      },
      (err) => {
        console.error('Firestore subscription error:', err);
        // Fallback to local cache
        if (onError) onError(err);
        onData(getLocalAppointments());
      }
    );

    return unsubscribe;
  } catch (e) {
    console.error('Failed to set up Firestore listener:', e);
    onData(getLocalAppointments());
    return () => {};
  }
};

/**
 * Synchronizes local guest/offline appointments to Firestore once user signs in / connects online
 */
export const syncLocalToCloud = async (userId: string, userEmail: string): Promise<number> => {
  if (!userId || !userEmail) return 0;
  
  const localItems = getLocalAppointments();
  const pendingSync = localItems.filter((item) => item.id.startsWith('local_'));
  
  if (pendingSync.length === 0) return 0;

  let syncedCount = 0;
  const remainingLocal = localItems.filter((item) => !item.id.startsWith('local_'));

  for (const item of pendingSync) {
    try {
      const { id, ...dataToUpload } = item;
      await addDoc(collection(db, APPOINTMENTS_COLLECTION), {
        ...dataToUpload,
        userId,
        userEmail,
        updatedAt: Date.now()
      });
      syncedCount++;
    } catch (e) {
      console.error('Failed to sync appointment to cloud:', item, e);
      // Keep in local if failed
      remainingLocal.push(item);
    }
  }

  saveLocalAppointments(remainingLocal);
  return syncedCount;
};

export const addAppointment = async (
  userId: string,
  userEmail: string,
  data: Omit<Appointment, 'id' | 'userId' | 'userEmail' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  const now = Date.now();
  const newApptData = {
    ...data,
    userId,
    userEmail,
    createdAt: now,
    updatedAt: now,
    status: data.status || 'pending',
    category: data.category || 'trabalho',
    sharedWithEmails: data.sharedWithEmails || []
  };

  if (!userId) {
    // Guest mode
    const local = getLocalAppointments();
    const id = 'local_' + Math.random().toString(36).substring(2, 9);
    const item: Appointment = { id, ...newApptData };
    saveLocalAppointments([...local, item]);
    return id;
  }

  const docRef = await addDoc(collection(db, APPOINTMENTS_COLLECTION), newApptData);
  return docRef.id;
};

export const updateAppointment = async (
  id: string,
  userId: string,
  data: Partial<Appointment>
): Promise<void> => {
  if (!userId || id.startsWith('local_')) {
    const local = getLocalAppointments();
    const updated = local.map((item) =>
      item.id === id ? { ...item, ...data, updatedAt: Date.now() } : item
    );
    saveLocalAppointments(updated);
    return;
  }

  const docRef = doc(db, APPOINTMENTS_COLLECTION, id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: Date.now()
  });
};

export const deleteAppointment = async (id: string, userId: string): Promise<void> => {
  if (!userId || id.startsWith('local_')) {
    const local = getLocalAppointments();
    saveLocalAppointments(local.filter((item) => item.id !== id));
    return;
  }

  const docRef = doc(db, APPOINTMENTS_COLLECTION, id);
  await deleteDoc(docRef);
};

// Agenda Sharing API
export const createShareInvitation = async (
  ownerUid: string,
  ownerEmail: string,
  targetEmail: string
) => {
  const cleanTargetEmail = targetEmail.trim().toLowerCase();
  if (cleanTargetEmail === ownerEmail.toLowerCase()) {
    throw new Error('Você não pode compartilhar sua agenda com você mesmo.');
  }

  const coll = collection(db, SHARES_COLLECTION);
  const q = query(
    coll,
    where('ownerUid', '==', ownerUid),
    where('sharedWithEmail', '==', cleanTargetEmail)
  );

  const existing = await getDocs(q);
  if (!existing.empty) {
    throw new Error(`A agenda já está compartilhada com ${cleanTargetEmail}.`);
  }

  await addDoc(coll, {
    ownerUid,
    ownerEmail,
    sharedWithEmail: cleanTargetEmail,
    status: 'accepted', // Auto-accept so user immediately gains access when invited
    createdAt: Date.now()
  });
};

export const subscribeToSharedAgendas = (
  userEmail: string | null,
  userId: string | null,
  onData: (shares: AgendaShare[]) => void
) => {
  if (!userEmail && !userId) {
    onData([]);
    return () => {};
  }

  try {
    const coll = collection(db, SHARES_COLLECTION);
    
    // We listen to shares where user is either owner or sharedWithEmail
    const cleanEmail = (userEmail || '').toLowerCase();
    
    const q = query(
      coll,
      where('sharedWithEmail', '==', cleanEmail)
    );

    return onSnapshot(q, (snapshot) => {
      const shares: AgendaShare[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<AgendaShare, 'id'>)
      }));
      onData(shares);
    }, (err) => {
      console.error('Error fetching shared agendas:', err);
      onData([]);
    });
  } catch (err) {
    console.error('Failed to setup shared agenda listener:', err);
    onData([]);
    return () => {};
  }
};

export const removeShare = async (shareId: string) => {
  const docRef = doc(db, SHARES_COLLECTION, shareId);
  await deleteDoc(docRef);
};
