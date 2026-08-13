import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  deleteDoc, 
  query, 
  where 
} from 'firebase/firestore';
import { db } from './firebase';

// Interface que define a estrutura de um compromisso no banco
export interface Appointment {
  id?: string;
  userId: string;
  title: string;
  description: string;
  time: string;
  color: string;
  dateKey: string; // Ex: "2026-08-12"
  isRecurring: boolean;
  recurrenceType: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
}

const COLLECTION_NAME = 'appointments';

// Salva ou atualiza um compromisso no banco de dados do Firebase
export const saveAppointment = async (appointment: Appointment): Promise<string> => {
  try {
    const appointmentsRef = collection(db, COLLECTION_NAME);
    // Se já tiver ID, edita o existente. Se não, cria um documento novo com ID automático
    const docRef = appointment.id ? doc(db, COLLECTION_NAME, appointment.id) : doc(appointmentsRef);
    
    const dataToSave = {
      ...appointment,
      id: docRef.id
    };

    await setDoc(docRef, dataToSave);
    return docRef.id;
  } catch (error) {
    console.error("Erro ao salvar compromisso:", error);
    throw error;
  }
};

// Busca todos os compromissos salvos de um usuário específico
export const getUserAppointments = async (userId: string): Promise<Appointment[]> => {
  try {
    const q = query(collection(db, COLLECTION_NAME), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    const appointments: Appointment[] = [];
    
    querySnapshot.forEach((doc) => {
      appointments.push(doc.data() as Appointment);
    });
    
    return appointments;
  } catch (error) {
    console.error("Erro ao buscar compromissos do usuário:", error);
    throw error;
  }
};

// Deleta permanentemente um compromisso do banco de dados pelo ID
export const deleteAppointment = async (appointmentId: string): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, appointmentId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Erro ao deletar compromisso:", error);
    throw error;
  }
};
