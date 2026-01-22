import React, { useState, useEffect } from 'react';
import { supabase, mockAdminLogin, USE_MOCK, getAdminAppointments, updateAppointment, getServices, createService, updateService, deleteService, getProfessionals, createProfessional, updateProfessional, deleteProfessional, getSiteConfig, updateSiteConfig } from '../services/supabase';
import { Button } from '../components/ui/Button';
import { Appointment, Service, Professional, SiteConfig } from '../types';
import { LogOut, Calendar, Users, Briefcase, Settings, Edit, Trash2, Plus, X, Image as ImageIcon, MessageCircle, Save } from 'lucide-react';
import { format } from 'date-fns';

export const AdminPage: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (USE_MOCK) {
      const mockSession = localStorage.getItem('lumina_mock_session');
      if (mockSession) setSession(JSON.parse(mockSession));
      setLoading(false);
    } else {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
      });

      return () => subscription.unsubscribe();
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    if (USE_MOCK) {
      const { data, error } = await mockAdminLogin(email, password);
      if (error) {
        alert(error.message);
      } else {
        setSession(data.session);
        localStorage.setItem('lumina_mock_session', JSON.stringify(data.session));
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) alert(error.message);
    }
    setLoading(false);
  };

  const handleLogout = () => {
    if (USE_MOCK) {
      localStorage.removeItem('lumina_mock_session');
      setSession(null);
    } else {
      supabase.auth.signOut();
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded shadow-md w-full max-w-md border-t-4 border-navy-900">
          <h1 className="text-2xl font-serif text-navy-900 mb-6 text-center">Lumina Admin</h1>
          {USE_MOCK && (
            <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 text-xs text-yellow-800 rounded">
              <strong>Modo Mock Ativo:</strong><br/>
              Email: admin@lumina.com<br/>
              Senha: admin
            </div>
          )}
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              className="w-full p-3 border rounded focus:border-gold-500 outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Senha"
              className="w-full p-3 border rounded focus:border-gold-500 outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button fullWidth type="submit">Entrar</Button>
          </form>
        </div>
      </div>
    );
  }

  return <AdminDashboard onLogout={handleLogout} />;
};

const AdminDashboard: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const [tab, setTab] = useState<'appointments' | 'services' | 'professionals' | 'config'>('appointments');
  
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="bg-navy-900 text-white w-full md:w-64 p-6 flex flex-col">
        <h2 className="text-2xl font-serif mb-8 tracking-wider">LUMINA</h2>
        <nav className="space-y-2 flex-1">
          <button onClick={() => setTab('appointments')} className={`flex items-center gap-3 w-full p-3 rounded transition-colors ${tab === 'appointments' ? 'bg-gold-600' : 'hover:bg-white/10'}`}>
            <Calendar size={20} /> Agendamentos
          </button>
          <button onClick={() => setTab('professionals')} className={`flex items-center gap-3 w-full p-3 rounded transition-colors ${tab === 'professionals' ? 'bg-gold-600' : 'hover:bg-white/10'}`}>
            <Users size={20} /> Profissionais
          </button>
          <button onClick={() => setTab('services')} className={`flex items-center gap-3 w-full p-3 rounded transition-colors ${tab === 'services' ? 'bg-gold-600' : 'hover:bg-white/10'}`}>
            <Briefcase size={20} /> Serviços
          </button>
          <button onClick={() => setTab('config')} className={`flex items-center gap-3 w-full p-3 rounded transition-colors ${tab === 'config' ? 'bg-gold-600' : 'hover:bg-white/10'}`}>
            <Settings size={20} /> Configurações
          </button>
        </nav>
        <button onClick={onLogout} className="flex items-center gap-2 text-gray-400 hover:text-white mt-auto pt-6 border-t border-gray-700">
          <LogOut size={18} /> Sair
        </button>
      </aside>

      {/* Content */}
      <main className="flex-1 p-4 md:p-8 overflow-x-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 capitalize font-serif border-b border-gray-200 pb-2">
          {tab === 'config' ? 'Configuração do Site' : tab}
        </h1>
        {tab === 'appointments' && <AppointmentsTab />}
        {tab === 'professionals' && <ProfessionalsTab />}
        {tab === 'services' && <ServicesTab />}
        {tab === 'config' && <ConfigTab />}
      </main>
    </div>
  );
};

// --- TABS COMPONENTS ---

const AppointmentsTab = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Appointment>>({});

  const loadData = () => getAdminAppointments().then(setAppointments).catch(console.error);
  useEffect(() => { loadData(); }, []);

  const openWhatsApp = (phone: string, clientName: string) => {
    // Clean phone number: remove non-numeric chars
    const cleanPhone = phone.replace(/\D/g, '');
    const message = `Olá ${clientName}, somos da Clínica Lumina. Gostariamos de falar sobre seu agendamento.`;
    const url = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleEdit = (app: Appointment) => {
    setEditingId(app.id);
    setEditForm({ 
      client_name: app.client_name, 
      client_phone: app.client_phone, 
      date: app.date, 
      time: app.time 
    });
  };

  const handleSave = async (id: string) => {
    await updateAppointment(id, editForm);
    setEditingId(null);
    loadData();
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    await updateAppointment(id, { status: newStatus as any });
    loadData();
  };

  return (
    <div className="bg-white rounded shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data/Hora</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Serviço/Prof</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {appointments.map((app) => (
            <tr key={app.id}>
              {editingId === app.id ? (
                <>
                  <td className="px-6 py-4">
                    <input type="date" className="border p-1 rounded w-full mb-1" value={editForm.date} onChange={e => setEditForm({...editForm, date: e.target.value})} />
                    <input type="time" className="border p-1 rounded w-full" value={editForm.time} onChange={e => setEditForm({...editForm, time: e.target.value})} />
                  </td>
                  <td className="px-6 py-4">
                    <input className="border p-1 rounded w-full mb-1" value={editForm.client_name} onChange={e => setEditForm({...editForm, client_name: e.target.value})} />
                    <input className="border p-1 rounded w-full" value={editForm.client_phone} onChange={e => setEditForm({...editForm, client_phone: e.target.value})} />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{app.services?.title}<br/>{app.professionals?.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{app.status}</td>
                  <td className="px-6 py-4 space-x-2">
                    <button onClick={() => handleSave(app.id)} className="text-green-600 hover:text-green-800"><Save size={18} /></button>
                    <button onClick={() => setEditingId(null)} className="text-gray-500 hover:text-gray-700"><X size={18} /></button>
                  </td>
                </>
              ) : (
                <>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{format(new Date(app.date), 'dd/MM/yyyy')}</div>
                    <div className="text-sm text-gray-500">{app.time}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{app.client_name}</div>
                    <div className="text-sm text-gray-500">{app.client_phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{app.services?.title}</div>
                    <div className="text-sm text-gray-500">{app.professionals?.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select 
                      value={app.status} 
                      onChange={(e) => handleStatusChange(app.id, e.target.value)}
                      className={`text-xs font-semibold rounded-full px-2 py-1 border-none focus:ring-0 cursor-pointer
                        ${app.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                          app.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                          'bg-yellow-100 text-yellow-800'}`}
                    >
                      <option value="pending">Pendente</option>
                      <option value="confirmed">Confirmado</option>
                      <option value="completed">Concluído</option>
                      <option value="cancelled">Cancelado</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex items-center space-x-3">
                    <button onClick={() => handleEdit(app)} className="text-blue-600 hover:text-blue-900" title="Editar">
                      <Edit size={18} />
                    </button>
                    <button onClick={() => openWhatsApp(app.client_phone, app.client_name)} className="text-green-600 hover:text-green-900" title="Conversar no WhatsApp">
                      <MessageCircle size={18} />
                    </button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// --- GENERIC MODAL & IMAGE INPUT FOR CRUD ---

const ImageInput: React.FC<{ 
  value: string; 
  onChange: (val: string) => void; 
  recommendedSize: string 
}> = ({ value, onChange, recommendedSize }) => {
  const [mode, setMode] = useState<'link' | 'upload'>('upload');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      // Mock upload: create local URL
      const url = URL.createObjectURL(e.target.files[0]);
      onChange(url);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">Foto / Imagem</label>
      <div className="flex gap-4 mb-2">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="radio" checked={mode === 'upload'} onChange={() => setMode('upload')} /> Upload
        </label>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="radio" checked={mode === 'link'} onChange={() => setMode('link')} /> Link Externo
        </label>
      </div>
      
      {mode === 'link' ? (
        <input 
          type="text" 
          className="w-full p-2 border rounded" 
          placeholder="https://..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded p-4 text-center hover:bg-gray-50 transition-colors relative">
          <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
          <div className="text-gray-500 flex flex-col items-center">
            <ImageIcon size={24} />
            <span className="text-xs mt-1">Clique para enviar</span>
          </div>
        </div>
      )}
      
      <p className="text-xs text-gray-500">Dimensão recomendada: {recommendedSize}</p>
      
      {value && (
        <div className="mt-2 relative w-24 h-24 border rounded overflow-hidden group">
          <img src={value} alt="Preview" className="w-full h-full object-cover" />
          <button 
            type="button" 
            onClick={() => onChange('')} 
            className="absolute top-0 right-0 bg-red-500 text-white p-1 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X size={12} />
          </button>
        </div>
      )}
    </div>
  );
};

const GenericModal: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void; 
  title: string; 
  children: React.ReactNode; 
  onSubmit: (e: React.FormEvent) => void; 
}> = ({ isOpen, onClose, title, children, onSubmit }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded shadow-xl overflow-hidden animate-fadeIn">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-navy-900">{title}</h3>
          <button onClick={onClose}><X size={20} className="text-gray-400 hover:text-red-500" /></button>
        </div>
        <form onSubmit={onSubmit} className="p-6 space-y-4">
          {children}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button type="submit">Salvar</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- PROFESSIONALS TAB ---

const ProfessionalsTab = () => {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Professional>>({});

  const loadData = () => getProfessionals().then(setProfessionals);
  useEffect(() => { loadData(); }, []);

  const handleOpen = (pro?: Professional) => {
    setFormData(pro || { name: '', specialty: '', bio: '', photo_url: '' });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.id) {
      await updateProfessional(formData.id, formData);
    } else {
      await createProfessional(formData as Omit<Professional, 'id'>);
    }
    setIsModalOpen(false);
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir?')) {
      await deleteProfessional(id);
      loadData();
    }
  };

  return (
    <div>
      <div className="flex justify-between mb-4">
        <p className="text-gray-600">Gerencie a equipe médica.</p>
        <Button onClick={() => handleOpen()} className="flex items-center gap-2"><Plus size={16}/> Novo Profissional</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {professionals.map(pro => (
          <div key={pro.id} className="bg-white rounded shadow p-4 flex flex-col items-center text-center relative group">
            <img src={pro.photo_url || "https://via.placeholder.com/150"} alt={pro.name} className="w-24 h-24 rounded-full object-cover mb-3 border-2 border-gold-100" />
            <h3 className="font-bold text-navy-900">{pro.name}</h3>
            <p className="text-xs text-gold-600 uppercase font-bold mb-2">{pro.specialty}</p>
            <p className="text-sm text-gray-500 mb-4 line-clamp-2">{pro.bio}</p>
            
            <div className="flex gap-2 w-full mt-auto">
              <Button variant="outline" className="flex-1 py-2 text-xs" onClick={() => handleOpen(pro)}>Editar</Button>
              <Button variant="ghost" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(pro.id)}><Trash2 size={16} /></Button>
            </div>
          </div>
        ))}
      </div>

      <GenericModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={formData.id ? "Editar Profissional" : "Novo Profissional"} onSubmit={handleSubmit}>
        <input className="w-full p-2 border rounded" placeholder="Nome Completo" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
        <input className="w-full p-2 border rounded" placeholder="Especialidade" value={formData.specialty} onChange={e => setFormData({...formData, specialty: e.target.value})} required />
        <textarea className="w-full p-2 border rounded" placeholder="Biografia curta" rows={3} value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} />
        <ImageInput 
          value={formData.photo_url || ''} 
          onChange={url => setFormData({...formData, photo_url: url})} 
          recommendedSize="400x400px (1:1)"
        />
      </GenericModal>
    </div>
  );
};

// --- SERVICES TAB ---

const ServicesTab = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Service>>({});

  const loadData = () => getServices().then(setServices);
  useEffect(() => { loadData(); }, []);

  const handleOpen = (svc?: Service) => {
    setFormData(svc || { title: '', description: '', price: 0, duration_min: 60, image_url: '' });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.id) {
      await updateService(formData.id, formData);
    } else {
      await createService(formData as Omit<Service, 'id'>);
    }
    setIsModalOpen(false);
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Excluir este serviço?')) {
      await deleteService(id);
      loadData();
    }
  };

  return (
    <div>
       <div className="flex justify-between mb-4">
        <p className="text-gray-600">Catálogo de procedimentos.</p>
        <Button onClick={() => handleOpen()} className="flex items-center gap-2"><Plus size={16}/> Novo Serviço</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map(svc => (
          <div key={svc.id} className="bg-white rounded shadow overflow-hidden flex flex-col">
            <div className="h-40 bg-gray-200 relative">
              {svc.image_url ? (
                <img src={svc.image_url} alt={svc.title} className="w-full h-full object-cover" />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400"><ImageIcon /></div>
              )}
              <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded text-xs font-bold shadow">
                R$ {svc.price}
              </div>
            </div>
            <div className="p-4 flex-1 flex flex-col">
              <h3 className="font-bold text-navy-900 text-lg mb-1">{svc.title}</h3>
              <p className="text-sm text-gray-500 mb-4 line-clamp-3 flex-1">{svc.description}</p>
              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <span className="text-xs text-gray-400">{svc.duration_min} min</span>
                <div className="flex gap-2">
                  <button onClick={() => handleOpen(svc)} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><Edit size={16} /></button>
                  <button onClick={() => handleDelete(svc.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <GenericModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={formData.id ? "Editar Serviço" : "Novo Serviço"} onSubmit={handleSubmit}>
        <input className="w-full p-2 border rounded" placeholder="Título do Serviço" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
        <textarea className="w-full p-2 border rounded" placeholder="Descrição" rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
        <div className="flex gap-4">
          <div className="flex-1">
             <label className="text-xs text-gray-500">Preço (R$)</label>
             <input type="number" className="w-full p-2 border rounded" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} />
          </div>
          <div className="flex-1">
             <label className="text-xs text-gray-500">Duração (min)</label>
             <input type="number" className="w-full p-2 border rounded" value={formData.duration_min} onChange={e => setFormData({...formData, duration_min: Number(e.target.value)})} />
          </div>
        </div>
        <ImageInput 
          value={formData.image_url || ''} 
          onChange={url => setFormData({...formData, image_url: url})} 
          recommendedSize="600x800px (3:4) ou 800x800px"
        />
      </GenericModal>
    </div>
  );
};

// --- CONFIG TAB ---

const ConfigTab = () => {
  const [config, setConfig] = useState<SiteConfig>({ hero_image_url: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => { getSiteConfig().then(setConfig); }, []);

  const handleSave = async () => {
    setLoading(true);
    await updateSiteConfig(config);
    setLoading(false);
    alert('Configurações salvas!');
  };

  return (
    <div className="bg-white p-8 rounded shadow max-w-2xl mx-auto">
      <h3 className="font-bold text-navy-900 mb-6 text-xl">Aparência do Site</h3>
      
      <div className="space-y-6">
        <div>
          <h4 className="font-medium text-gray-700 mb-2">Imagem de Capa (Hero Section)</h4>
          <p className="text-sm text-gray-500 mb-4">Esta é a imagem principal que aparece no topo da página inicial.</p>
          
          <ImageInput 
             value={config.hero_image_url}
             onChange={(url) => setConfig({...config, hero_image_url: url})}
             recommendedSize="1920x1080px (16:9)"
          />
        </div>

        <div className="pt-6 border-t">
          <Button onClick={handleSave} disabled={loading} className="w-full md:w-auto">
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </div>
    </div>
  );
};
