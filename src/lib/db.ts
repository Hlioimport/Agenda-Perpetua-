import { db } from './firebase';
import { collection, addDoc, getDocs, query, where, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { Appointment } from './csvHelper';
export * from './csvHelper';

export const saveAppointment = async (appointment: Omit<Appointment, 'id'>) => {
  return await addDoc(collection(db, 'appointments'), appointment);
};

export const getAppointments = async (userId: string) => {
  const q = query(collection(db, 'appointments'), where('userId', '==', userId));
  const querySnapshot = await getDocs(q);
  const appointments: Appointment[] = [];
  querySnapshot.forEach((docSnap) => {
    appointments.push({ id: docSnap.id, ...docSnap.data() } as Appointment);
  });
  return appointments;
};

export const getUserAppointments = getAppointments;

export const deleteAppointment = async (id: string) => {
  await deleteDoc(doc(db, 'appointments', id));
};

export const updateAppointment = async (id: string, appointment: Partial<Appointment>) => {
  await updateDoc(doc(db, 'appointments', id), appointment);
};
