export interface Service {
  id: string;
  title: string;
  description?: string;
  price: number;
  duration_min: number;
  image_url?: string; // Added for service images
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

export interface SiteConfig {
  hero_image_url: string;
}