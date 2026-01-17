export interface Service {
  id: string;
  title: string;
  description?: string;
  price: number;
  duration_min: number;
}

export interface Professional {
  id: string;
  name: string;
  specialty: string;
  photo_url?: string;
  bio?: string;
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface Appointment {
  id: string;
  client_name: string;
  client_phone: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  status: AppointmentStatus;
  service_id: string;
  professional_id: string;
  // Joins
  services?: Service;
  professionals?: Professional;
}
