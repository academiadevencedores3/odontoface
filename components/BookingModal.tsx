import React, { useState, useEffect } from 'react';
import { X, ChevronRight, Check, Calendar as CalendarIcon, Clock, User } from 'lucide-react';
import { format, addDays, startOfToday, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getServices, getProfessionals, getAppointmentsByDateAndPro, createAppointment } from '../services/supabase';
import { Service, Professional } from '../types';
import { Button } from './ui/Button';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const steps = ['Serviço', 'Profissional', 'Data & Hora', 'Confirmação'];

export const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Data State
  const [services, setServices] = useState<Service[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  
  // Selection State
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedPro, setSelectedPro] = useState<Professional | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({ name: '', phone: '' });
  const [success, setSuccess] = useState(false);

  // Fetch initial data
  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      Promise.all([getServices(), getProfessionals()])
        .then(([sData, pData]) => {
          setServices(sData);
          setProfessionals(pData);
        })
        .finally(() => setLoading(false));
    } else {
      // Reset on close
      setTimeout(() => {
        setCurrentStep(1);
        setSelectedService(null);
        setSelectedPro(null);
        setSelectedDate(null);
        setSelectedTime(null);
        setSuccess(false);
        setFormData({ name: '', phone: '' });
      }, 300);
    }
  }, [isOpen]);

  // Fetch Slots when Date/Pro changes
  useEffect(() => {
    if (selectedDate && selectedPro) {
      const fetchSlots = async () => {
        setLoading(true);
        try {
          const dateStr = format(selectedDate, 'yyyy-MM-dd');
          const existing = await getAppointmentsByDateAndPro(dateStr, selectedPro.id);
          const bookedTimes = existing.map(app => app.time);
          
          // Generate slots 09:00 to 18:00
          const allSlots = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
          const free = allSlots.filter(slot => !bookedTimes.includes(slot));
          setAvailableSlots(free);
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      };
      fetchSlots();
    }
  }, [selectedDate, selectedPro]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !selectedPro || !selectedDate || !selectedTime) return;

    setLoading(true);
    try {
      await createAppointment({
        client_name: formData.name,
        client_phone: formData.phone,
        service_id: selectedService.id,
        professional_id: selectedPro.id,
        date: format(selectedDate, 'yyyy-MM-dd'),
        time: selectedTime,
      });
      setSuccess(true);
    } catch (error) {
      alert('Erro ao agendar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const generateNextDays = () => {
    const days = [];
    const today = startOfToday();
    for (let i = 0; i < 14; i++) {
      days.push(addDays(today, i));
    }
    return days;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl min-h-[500px] rounded-sm shadow-2xl overflow-hidden flex flex-col animate-fadeIn">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div>
            <h2 className="font-serif text-2xl text-navy-900">Agendar Consulta</h2>
            <p className="text-sm text-gray-500 mt-1">
              Passo {currentStep} de 4: {steps[currentStep - 1]}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 p-6 overflow-y-auto">
          {success ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                <Check size={32} />
              </div>
              <h3 className="font-serif text-2xl text-navy-900">Agendamento Confirmado!</h3>
              <p className="text-gray-600 max-w-sm">
                Obrigado, {formData.name}. Aguardamos você dia {format(selectedDate!, 'dd/MM/yyyy')} às {selectedTime} com {selectedPro?.name}.
              </p>
              <Button onClick={onClose}>Fechar</Button>
            </div>
          ) : (
            <>
              {/* Step 1: Services */}
              {currentStep === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {services.map(service => (
                    <button
                      key={service.id}
                      onClick={() => { setSelectedService(service); setCurrentStep(2); }}
                      className="text-left p-4 border border-gray-200 hover:border-gold-500 hover:bg-gold-50 transition-all group"
                    >
                      <h4 className="font-bold text-navy-900 group-hover:text-gold-700">{service.title}</h4>
                      <div className="flex justify-between mt-2 text-sm text-gray-500">
                        <span>R$ {service.price}</span>
                        <span>{service.duration_min} min</span>
                      </div>
                    </button>
                  ))}
                  {services.length === 0 && !loading && <p>Nenhum serviço encontrado.</p>}
                </div>
              )}

              {/* Step 2: Professionals */}
              {currentStep === 2 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {professionals.map(pro => (
                    <button
                      key={pro.id}
                      onClick={() => { setSelectedPro(pro); setCurrentStep(3); }}
                      className="flex items-center p-4 border border-gray-200 hover:border-gold-500 hover:bg-gold-50 transition-all text-left"
                    >
                      <img 
                        src={pro.photo_url || "https://picsum.photos/100"} 
                        alt={pro.name} 
                        className="w-12 h-12 rounded-full object-cover mr-4"
                      />
                      <div>
                        <h4 className="font-bold text-navy-900">{pro.name}</h4>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">{pro.specialty}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Step 3: Date & Time */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  {/* Date Picker (Horizontal Scroll) */}
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <CalendarIcon size={16}/> Selecione o Dia
                    </h4>
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                      {generateNextDays().map(day => (
                        <button
                          key={day.toISOString()}
                          onClick={() => { setSelectedDate(day); setSelectedTime(null); }}
                          className={`flex-shrink-0 w-16 h-20 flex flex-col items-center justify-center border rounded transition-colors ${
                            selectedDate && isSameDay(selectedDate, day)
                              ? 'bg-navy-900 text-white border-navy-900'
                              : 'bg-white text-gray-600 border-gray-200 hover:border-gold-500'
                          }`}
                        >
                          <span className="text-xs uppercase">{format(day, 'EEE', { locale: ptBR })}</span>
                          <span className="text-xl font-bold">{format(day, 'd')}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Time Slots */}
                  {selectedDate && (
                    <div className="animate-fadeIn">
                      <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                         <Clock size={16} /> Horários Disponíveis
                      </h4>
                      {loading ? (
                        <p className="text-sm text-gray-400">Verificando agenda...</p>
                      ) : availableSlots.length > 0 ? (
                        <div className="grid grid-cols-4 gap-2">
                          {availableSlots.map(time => (
                            <button
                              key={time}
                              onClick={() => setSelectedTime(time)}
                              className={`py-2 px-3 text-sm border rounded transition-all ${
                                selectedTime === time
                                  ? 'bg-gold-500 text-white border-gold-500'
                                  : 'bg-white text-gray-700 hover:border-gold-500'
                              }`}
                            >
                              {time}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-red-500">Não há horários livres nesta data.</p>
                      )}
                    </div>
                  )}

                  <div className="flex justify-end pt-4">
                    <Button 
                      disabled={!selectedDate || !selectedTime} 
                      onClick={() => setCurrentStep(4)}
                    >
                      Continuar
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 4: Final Form */}
              {currentStep === 4 && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded text-sm space-y-1 mb-6 border-l-4 border-gold-500">
                    <p><strong>Serviço:</strong> {selectedService?.title}</p>
                    <p><strong>Profissional:</strong> {selectedPro?.name}</p>
                    <p><strong>Data:</strong> {selectedDate && format(selectedDate, 'dd/MM/yyyy')} às {selectedTime}</p>
                    <p><strong>Valor:</strong> R$ {selectedService?.price}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 text-gray-400" size={18} />
                      <input
                        required
                        type="text"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-gold-500 focus:border-gold-500 outline-none"
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        placeholder="Ex: Renato Evangelista"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp / Telefone</label>
                    <input
                      required
                      type="tel"
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-gold-500 focus:border-gold-500 outline-none"
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      placeholder="(82) 99309-1738"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      onClick={() => setCurrentStep(3)}
                      className="flex-1"
                    >
                      Voltar
                    </Button>
                    <Button 
                      type="submit" 
                      fullWidth 
                      className="flex-1"
                      disabled={loading}
                    >
                      {loading ? 'Confirmando...' : 'Confirmar Agendamento'}
                    </Button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
        
        {/* Footer (Back Button for early steps) */}
        {!success && currentStep > 1 && currentStep < 4 && (
          <div className="p-4 border-t border-gray-100 flex justify-start">
             <button 
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="text-sm text-gray-500 hover:text-navy-900 flex items-center gap-1"
             >
               Voltar
             </button>
          </div>
        )}
      </div>
    </div>
  );
};
