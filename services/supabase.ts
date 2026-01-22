import { createClient } from '@supabase/supabase-js';
import { Service, Professional, Appointment, SiteConfig } from '../types';

// Safe access to import.meta.env to prevent crashes in environments where it is not defined
const meta = import.meta as any;
const env = meta.env || {};

const supabaseUrl = env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || 'placeholder';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const USE_MOCK = true; 

// --- MOCK DATA ---
// We use let and keep it in memory for the session to allow CRUD operations to be visible
let mockServices: Service[] = [
  { 
    id: '1', 
    title: 'Harmonização Facial', 
    description: 'Rejuvenescimento e equilíbrio dos traços faciais com ácido hialurônico e toxina botulínica.',
    price: 2500.00, 
    duration_min: 60,
    image_url: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=800'
  },
  { 
    id: '2', 
    title: 'Lentes de Contato Dental', 
    description: 'Facetas de porcelana ultrafinas para um sorriso perfeito e alinhado.',
    price: 12000.00, 
    duration_min: 120,
    image_url: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&q=80&w=800'
  },
  { 
    id: '3', 
    title: 'Implantes Premium', 
    description: 'Reabilitação oral completa com tecnologia suíça de implantes.',
    price: 3500.00, 
    duration_min: 90,
    image_url: 'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&q=80&w=800'
  }
];

let mockProfessionals: Professional[] = [
  { 
    id: 'p1', 
    name: 'Dr. Roberto Silva', 
    specialty: 'Diretor Clínico & Implantodontia', 
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

let mockAppointments: Appointment[] = [
  {
    id: 'a1',
    client_name: 'Fernanda Lima',
    client_phone: '11998887766',
    date: new Date().toISOString().split('T')[0],
    time: '14:00',
    status: 'confirmed',
    service_id: '1',
    professional_id: 'p2',
    services: mockServices[0],
    professionals: mockProfessionals[1]
  }
];

let mockSiteConfig: SiteConfig = {
  hero_image_url: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=2068'
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- READ FUNCTIONS ---

export const getServices = async (): Promise<Service[]> => {
  if (USE_MOCK) {
    await delay(300);
    return [...mockServices];
  }
  const { data, error } = await supabase.from('services').select('*');
  if (error) throw error;
  return data || [];
};

export const getProfessionals = async (): Promise<Professional[]> => {
  if (USE_MOCK) {
    await delay(300);
    return [...mockProfessionals];
  }
  const { data, error } = await supabase.from('professionals').select('*');
  if (error) throw error;
  return data || [];
};

export const getSiteConfig = async (): Promise<SiteConfig> => {
  if (USE_MOCK) {
    await delay(100);
    // Try to load from local storage to persist across reloads in mock mode
    const stored = localStorage.getItem('lumina_site_config');
    if (stored) return JSON.parse(stored);
    return mockSiteConfig;
  }
  // In real Supabase, this would be a specific table
  return mockSiteConfig; 
};

// --- APPOINTMENTS CRUD ---

export const getAppointmentsByDateAndPro = async (date: string, proId: string): Promise<Appointment[]> => {
  if (USE_MOCK) {
    await delay(300);
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
    await delay(500);
    const newAppointment: Appointment = {
      ...appointment,
      id: Math.random().toString(36).substring(2, 11),
      status: 'pending',
      services: mockServices.find(s => s.id === appointment.service_id),
      professionals: mockProfessionals.find(p => p.id === appointment.professional_id)
    };
    mockAppointments.push(newAppointment);
    return [newAppointment];
  }
  const { data, error } = await supabase.from('appointments').insert([appointment]).select();
  if (error) throw error;
  return data;
};

export const getAdminAppointments = async (): Promise<Appointment[]> => {
  if (USE_MOCK) {
    await delay(300);
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

export const updateAppointment = async (id: string, updates: Partial<Appointment>) => {
    if (USE_MOCK) {
        await delay(300);
        const index = mockAppointments.findIndex(a => a.id === id);
        if (index >= 0) {
            mockAppointments[index] = { ...mockAppointments[index], ...updates };
        }
        return;
    }
    await supabase.from('appointments').update(updates).eq('id', id);
};

// --- SERVICES CRUD ---

export const createService = async (service: Omit<Service, 'id'>) => {
  if (USE_MOCK) {
    await delay(300);
    const newService = { ...service, id: Math.random().toString(36).substring(2, 9) };
    mockServices.push(newService);
    return newService;
  }
  // Supabase logic
};

export const updateService = async (id: string, updates: Partial<Service>) => {
  if (USE_MOCK) {
    await delay(300);
    mockServices = mockServices.map(s => s.id === id ? { ...s, ...updates } : s);
    return;
  }
  // Supabase logic
};

export const deleteService = async (id: string) => {
  if (USE_MOCK) {
    await delay(300);
    mockServices = mockServices.filter(s => s.id !== id);
    return;
  }
  // Supabase logic
};

// --- PROFESSIONALS CRUD ---

export const createProfessional = async (pro: Omit<Professional, 'id'>) => {
  if (USE_MOCK) {
    await delay(300);
    const newPro = { ...pro, id: Math.random().toString(36).substring(2, 9) };
    mockProfessionals.push(newPro);
    return newPro;
  }
  // Supabase logic
};

export const updateProfessional = async (id: string, updates: Partial<Professional>) => {
  if (USE_MOCK) {
    await delay(300);
    mockProfessionals = mockProfessionals.map(p => p.id === id ? { ...p, ...updates } : p);
    return;
  }
  // Supabase logic
};

export const deleteProfessional = async (id: string) => {
  if (USE_MOCK) {
    await delay(300);
    mockProfessionals = mockProfessionals.filter(p => p.id !== id);
    return;
  }
  // Supabase logic
};

// --- CONFIG CRUD ---

export const updateSiteConfig = async (config: SiteConfig) => {
  if (USE_MOCK) {
    await delay(300);
    mockSiteConfig = config;
    localStorage.setItem('lumina_site_config', JSON.stringify(config));
    return;
  }
};


// --- AUTH ---
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
