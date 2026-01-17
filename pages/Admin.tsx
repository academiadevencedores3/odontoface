import React, { useState, useEffect } from 'react';
import { supabase, getAdminAppointments, mockAdminLogin, updateAppointmentStatus, USE_MOCK } from '../services/supabase';
import { Button } from '../components/ui/Button';
import { Appointment } from '../types';
import { LogOut, Calendar, Users, Briefcase } from 'lucide-react';
import { format } from 'date-fns';

export const AdminPage: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (USE_MOCK) {
      // Check local storage for mock session
      const mockSession = localStorage.getItem('lumina_mock_session');
      if (mockSession) setSession(JSON.parse(mockSession));
      setLoading(false);
    } else {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setLoading(false);
      });

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
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
        <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
          <h1 className="text-2xl font-serif text-navy-900 mb-6 text-center">Admin Login</h1>
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
              className="w-full p-2 border rounded"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Senha"
              className="w-full p-2 border rounded"
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
  const [tab, setTab] = useState<'appointments' | 'services' | 'professionals'>('appointments');
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    if (tab === 'appointments') {
      getAdminAppointments().then(setAppointments).catch(console.error);
    }
  }, [tab]);

  const updateStatus = async (id: string, newStatus: string) => {
    await updateAppointmentStatus(id, newStatus);
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } as any : a));
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="bg-navy-900 text-white w-full md:w-64 p-6 flex flex-col">
        <h2 className="text-2xl font-serif mb-8">Lumina Admin</h2>
        <nav className="space-y-2 flex-1">
          <button 
            onClick={() => setTab('appointments')}
            className={`flex items-center gap-3 w-full p-3 rounded transition-colors ${tab === 'appointments' ? 'bg-gold-600' : 'hover:bg-white/10'}`}
          >
            <Calendar size={20} /> Agendamentos
          </button>
          <button 
            onClick={() => setTab('professionals')}
            className={`flex items-center gap-3 w-full p-3 rounded transition-colors ${tab === 'professionals' ? 'bg-gold-600' : 'hover:bg-white/10'}`}
          >
            <Users size={20} /> Profissionais
          </button>
          <button 
            onClick={() => setTab('services')}
            className={`flex items-center gap-3 w-full p-3 rounded transition-colors ${tab === 'services' ? 'bg-gold-600' : 'hover:bg-white/10'}`}
          >
            <Briefcase size={20} /> Serviços
          </button>
        </nav>
        <button onClick={onLogout} className="flex items-center gap-2 text-gray-400 hover:text-white mt-auto pt-6 border-t border-gray-700">
          <LogOut size={18} /> Sair
        </button>
      </aside>

      {/* Content */}
      <main className="flex-1 p-8 overflow-x-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 capitalize">{tab}</h1>
        
        {tab === 'appointments' && (
          <div className="bg-white rounded shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data/Hora</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Serviço/Prof</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {appointments.map((app) => (
                  <tr key={app.id}>
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
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${app.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                          app.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                          'bg-yellow-100 text-yellow-800'}`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                       {app.status !== 'confirmed' && (
                         <button onClick={() => updateStatus(app.id, 'confirmed')} className="text-green-600 hover:text-green-900">Confirmar</button>
                       )}
                       {app.status !== 'cancelled' && (
                         <button onClick={() => updateStatus(app.id, 'cancelled')} className="text-red-600 hover:text-red-900">Cancelar</button>
                       )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab !== 'appointments' && (
           <div className="bg-white p-12 text-center rounded shadow">
             <p className="text-gray-500">Implementação de CRUD para {tab} estaria aqui.</p>
             <p className="text-sm text-gray-400">Use o editor SQL do Supabase para gerenciar dados iniciais.</p>
           </div>
        )}
      </main>
    </div>
  );
};
