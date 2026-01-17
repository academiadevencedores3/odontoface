import { createClient } from '@supabase/supabase-js';
import { Service, Professional, Appointment } from '../types';

// Safe access to import.meta.env to prevent crashes in environments where it is not defined
const meta = import.meta as any;
const env = meta.env || {};

const supabaseUrl = env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || 'placeholder';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- MOCK DATA CONFIGURATION ---
export const USE_MOCK = true; 

const mockServices: Service[] = [
  { 
    id: '1', 
    title: 'Harmonização Facial', 
    description: 'Rejuvenescimento e equilíbrio dos traços faciais com ácido hialurônico e toxina botulínica.',
    price: 2500.00, 
    duration_min: 60 
  },
  { 
    id: '2', 
    title: 'Lentes de Contato Dental', 
    description: 'Facetas de porcelana ultrafinas para um sorriso perfeito e alinhado.',
    price: 12000.00, 
    duration_min: 120 
  },
  { 
    id: '3', 
    title: 'Clareamento a Laser', 
    description: 'Tecnologia avançada para dentes até 3 tons mais brancos em sessão única.',
    price: 800.00, 
    duration_min: 60 
  },
  { 
    id: '4', 
    title: 'Invisalign (Alinhadores)', 
    description: 'Ortodontia invisível e confortável para alinhar seu sorriso.',
    price: 15000.00, 
    duration_min: 45 
  },
  { 
    id: '5', 
    title: 'Implante Unitário Premium', 
    description: 'Reabilitação com implantes suíços de carga imediata.',
    price: 3500.00, 
    duration_min: 90 
  }
];

const mockProfessionals: Professional[] = [
  { 
    id: 'p1', 
    name: 'Dr. Roberto Silva', 
    specialty: 'Implantodontia e Estética', 
    photo_url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400',
    bio: 'Referência em reabilitação oral com mais de 15 anos de experiência.'
  },
  { 
    id: 'p2', 
    name: 'Dra. Ana Costa', 
    specialty: 'Harmonização Orofacial', 
    photo_url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400',
    bio: 'Especialista em realçar a beleza natural através da harmonização.'
  },
  { 
    id: 'p3', 
    name: 'Dr. Lucas Mendes', 
    specialty: 'Ortodontia Digital', 
    photo_url: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400',
    bio: 'Certificado Invisalign Doctor Provider.'
  }
];

// Initial mock appointments
let mockAppointments: Appointment[] = [
  {
    id: 'a1',
    client_name: 'Fernanda Lima',
    client_phone: '(82) 99888-7766',
    date: new Date().toISOString().split('T')[0],
    time: '14:00',
    status: 'confirmed',
    service_id: '1',
    professional_id: 'p2',
    services: mockServices[0],
    professionals: mockProfessionals[1]
  }
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Data Fetching Helpers with Mock Support
 */

export const getServices = async (): Promise<Service[]> => {
  if (USE_MOCK) {
    await delay(500);
    return mockServices;
  }
  const { data, error } = await supabase.from('services').select('*');
  if (error) throw error;
  return data || [];
};

export const getProfessionals = async (): Promise<Professional[]> => {
  if (USE_MOCK) {
    await delay(500);
    return mockProfessionals;
  }
  const { data, error } = await supabase.from('professionals').select('*');
  if (error) throw error;
  return data || [];
};

export const getAppointmentsByDateAndPro = async (date: string, proId: string): Promise<Appointment[]> => {
  if (USE_MOCK) {
    await delay(400);
    return mockAppointments.filter(app => 
      app.date === date && 
      app.professional_id === proId && 
      app.status !== 'cancelled'
    );
  }
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('date', date)
    .eq('professional_id', proId)
    .neq('status', 'cancelled');
  
  if (error) throw error;
  return data || [];
};

export const createAppointment = async (appointment: Omit<Appointment, 'id' | 'status' | 'services' | 'professionals'>) => {
  if (USE_MOCK) {
    await delay(800);
    const newAppointment: Appointment = {
      ...appointment,
      id: Math.random().toString(36).substring(2, 11),
      status: 'pending',
      // Simulate Join for immediate UI feedback
      services: mockServices.find(s => s.id === appointment.service_id),
      professionals: mockProfessionals.find(p => p.id === appointment.professional_id)
    };
    mockAppointments.push(newAppointment);
    return [newAppointment];
  }
  const { data, error } = await supabase
    .from('appointments')
    .insert([appointment])
    .select();
  if (error) throw error;
  return data;
};

// Admin Helpers
export const getAdminAppointments = async (): Promise<Appointment[]> => {
  if (USE_MOCK) {
    await delay(600);
    // Sort by date then time
    return [...mockAppointments].sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`).getTime();
      const dateB = new Date(`${b.date}T${b.time}`).getTime();
      return dateA - dateB;
    });
  }
  const { data, error } = await supabase
    .from('appointments')
    .select('*, services(*), professionals(*)')
    .order('date', { ascending: true })
    .order('time', { ascending: true });
    
  if (error) throw error;
  return data || [];
};

// Mock Auth & Updates
export const mockAdminLogin = async (email: string, password: string) => {
  await delay(800);
  if (email === 'admin@lumina.com' && password === 'admin') {
    return { 
      data: { user: { id: 'mock-admin', email: 'admin@lumina.com' }, session: { access_token: 'mock-token' } }, 
      error: null 
    };
  }
  return { data: { user: null, session: null }, error: { message: 'Credenciais inválidas. (Use: admin@lumina.com / admin)' } };
};

export const updateAppointmentStatus = async (id: string, status: string) => {
    if (USE_MOCK) {
        await delay(300);
        const index = mockAppointments.findIndex(a => a.id === id);
        if (index >= 0) {
            mockAppointments[index] = { ...mockAppointments[index], status: status as any };
        }
        return;
    }
    await supabase.from('appointments').update({ status }).eq('id', id);
};
