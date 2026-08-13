import { db } from './firebase';
import { collection, addDoc, getDocs, query, where, deleteDoc, doc, updateDoc } from 'firebase/firestore';
export * from './csvHelper'; // Exporta o tipo Appointment e as funções de CSV que os botões procuram aqui

export interface Appointment {
  id: string;
  title: string;
  date: string;
  time?: string;
  description?: string;
  color?: string;
  userId?: string;
  userEmail?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Funções do banco para salvar compromissos no Firebase
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

export const deleteAppointment = async (id: string) => {
  await deleteDoc(doc(db, 'appointments', id));
};

export const updateAppointment = async (id: string, appointment: Partial<Appointment>) => {
  await updateDoc(doc(db, 'appointments', id), appointment);
};
