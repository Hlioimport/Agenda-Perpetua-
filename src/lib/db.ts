import { db } from './firebase';
import { collection, addDoc, getDocs, query, where, deleteDoc, doc, updateDoc } from 'firebase/firestore';
export * from './csvHelper';

export interface Appointment {
  id: any; // Ajustado para 'any' para aceitar conversões de referências ou strings sem travar a build
  title: string;
  date: string;
  time?: string;
  description?: string;
  color?: string;
  userId?: string;
  userEmail?: string;
  createdAt?: string;
  updatedAt?: string;
  dateKey?: string;
  isRecurring?: boolean;
  recurrenceType?: string;
}

export const saveAppointment = async (appointment: Omit<Appointment, 'id'>) => {
  return await addDoc(collection(db, 'appointments'), appointment);
};

export const getAppointments = async (userId: string) => {
  const q = query(collection(db, 'appointments'), where('userId', '==', userId));
  const querySnapshot = await getDocs(q);
  const appointments: Appointment[] = [];
  querySnapshot.forEach((doc) => {
    appointments.push({ id: doc.id, ...doc.data() } as Appointment);
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
