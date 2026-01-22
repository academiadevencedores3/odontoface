import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { BookingModal } from './components/BookingModal';
import { Button } from './components/ui/Button';
import { AdminPage } from './pages/Admin';
import { Menu, MapPin, Phone } from 'lucide-react';
import { getSiteConfig, getServices, getProfessionals } from './services/supabase';
import { Service, Professional } from './types';

// Define Social Icons locally to ensure availability (brand icons removed in recent Lucide versions)
const Instagram = ({ className = "" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

const Facebook = ({ className = "" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);

const WhatsApp = ({ className = "" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none" className={className}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const LandingPage: React.FC = () => {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Data State
  const [services, setServices] = useState<Service[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [heroImage, setHeroImage] = useState('https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=2068');

  useEffect(() => {
    // Fetch dynamic data
    getServices().then(setServices);
    getProfessionals().then(setProfessionals);
    getSiteConfig().then(config => {
      if (config.hero_image_url) setHeroImage(config.hero_image_url);
    });
  }, []);

  // Helper to scroll to section avoiding HashRouter conflict
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="font-sans text-slate-800">
      <BookingModal isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)} />

      {/* Navigation */}
      <nav className="fixed w-full z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 transition-all duration-300">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="text-2xl font-serif font-bold text-navy-900 tracking-wider">
            LUMINA
          </div>
          
          <div className="hidden md:flex items-center space-x-8 text-sm font-medium tracking-wide text-gray-600">
            <button onClick={() => scrollToSection('sobre')} className="hover:text-gold-600 transition-colors">A CLÍNICA</button>
            <button onClick={() => scrollToSection('tratamentos')} className="hover:text-gold-600 transition-colors">TRATAMENTOS</button>
            <button onClick={() => scrollToSection('equipe')} className="hover:text-gold-600 transition-colors">ESPECIALISTAS</button>
            <Button onClick={() => setIsBookingOpen(true)} variant="primary">
              AGENDAR CONSULTA
            </Button>
          </div>

          <button className="md:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            <Menu size={24} />
          </button>
        </div>
        
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t p-6 space-y-4">
             <button onClick={() => scrollToSection('sobre')} className="block py-2 w-full text-left">A Clínica</button>
             <button onClick={() => scrollToSection('tratamentos')} className="block py-2 w-full text-left">Tratamentos</button>
             <button onClick={() => scrollToSection('equipe')} className="block py-2 w-full text-left">Especialistas</button>
             <Button fullWidth onClick={() => { setIsBookingOpen(true); setIsMobileMenuOpen(false); }}>
               Agendar
             </Button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={heroImage} 
            alt="Luxury Dental Clinic" 
            className="w-full h-full object-cover brightness-[0.6] transition-opacity duration-700"
          />
        </div>
        <div className="relative z-10 text-center text-white px-4 max-w-4xl animate-fadeIn">
          <h1 className="font-serif text-5xl md:text-7xl font-light mb-6 leading-tight">
            A Arte da <span className="text-gold-300 italic">Estética</span> & Odontologia
          </h1>
          <p className="text-lg md:text-xl font-light mb-10 text-gray-200 tracking-wide">
            Tecnologia de ponta e conforto absoluto para revelar o seu melhor sorriso.
          </p>
          <Button onClick={() => setIsBookingOpen(true)} variant="secondary" className="text-lg px-10 py-4">
            Agendar Avaliação
          </Button>
        </div>
      </section>

      {/* Services Section */}
      <section id="tratamentos" className="py-24 bg-white scroll-mt-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl text-navy-900 mb-4">Tratamentos Exclusivos</h2>
            <div className="w-24 h-1 bg-gold-500 mx-auto"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {services.map((item) => (
              <div key={item.id} className="group cursor-pointer">
                <div className="overflow-hidden mb-6 h-80 relative">
                  <img 
                    src={item.image_url || 'https://via.placeholder.com/800x600?text=Sem+Imagem'} 
                    alt={item.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                </div>
                <h3 className="font-serif text-2xl mb-2 text-navy-900 group-hover:text-gold-600 transition-colors">{item.title}</h3>
                <p className="text-gray-500 font-light leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About / Luxury Section */}
      <section id="sobre" className="py-24 bg-gray-50 scroll-mt-20">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center gap-16">
          <div className="md:w-1/2">
            <img 
              src="https://images.unsplash.com/photo-1616047006789-b7af5afb8c20?auto=format&fit=crop&q=80&w=1200" 
              alt="Interior da Clínica" 
              className="rounded-sm shadow-2xl" 
            />
          </div>
          <div className="md:w-1/2">
            <h2 className="font-serif text-4xl text-navy-900 mb-6">Uma Experiência Única</h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Na Lumina, acreditamos que a visita ao dentista deve ser um momento de cuidado e relaxamento. 
              Nossa arquitetura foi pensada para proporcionar bem-estar, com salas privativas, aromaterapia e atendimento personalizado.
            </p>
            <ul className="space-y-4 mb-8">
              {['Equipamentos 3D de Última Geração', 'Sala de Repouso Premium', 'Concierge Exclusivo'].map(item => (
                <li key={item} className="flex items-center text-navy-900">
                  <div className="w-2 h-2 bg-gold-500 mr-4 rounded-full"></div>
                  {item}
                </li>
              ))}
            </ul>
            <Button variant="outline" onClick={() => setIsBookingOpen(true)}>Conheça a Estrutura</Button>
          </div>
        </div>
      </section>

      {/* Specialists Section */}
      <section id="equipe" className="py-24 bg-white scroll-mt-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl text-navy-900 mb-4">Corpo Clínico</h2>
            <div className="w-24 h-1 bg-gold-500 mx-auto"></div>
            <p className="mt-4 text-gray-500 max-w-2xl mx-auto">
              Nossa equipe é formada por mestres e doutores dedicados à excelência em cada detalhe do seu sorriso.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {professionals.map((pro) => (
              <div key={pro.id} className="text-center group">
                <div className="relative mb-6 mx-auto w-64 h-64 overflow-hidden rounded-full border-4 border-gray-100 group-hover:border-gold-200 transition-colors">
                  <img 
                    src={pro.photo_url || "https://via.placeholder.com/400"} 
                    alt={pro.name} 
                    className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-500 transform group-hover:scale-110" 
                  />
                </div>
                <h3 className="font-serif text-2xl text-navy-900 mb-1">{pro.name}</h3>
                <p className="text-sm font-bold text-gold-600 tracking-widest uppercase mb-4">{pro.specialty}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-navy-900 text-white py-16">
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div>
            <h3 className="font-serif text-2xl mb-6">LUMINA</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Excelência em odontologia estética e harmonização facial. Seu sorriso é nossa obra de arte.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold mb-6 text-sm tracking-widest text-gold-500">CONTATO</h4>
            <div className="space-y-4 text-gray-300 text-sm">
              <p className="flex items-center gap-3"><Phone size={16} /> (11) 99999-9999</p>
              <p className="flex items-center gap-3"><MapPin size={16} /> Av. Paulista, 1000 - SP</p>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold mb-6 text-sm tracking-widest text-gold-500">SOCIAL</h4>
            <div className="flex gap-4">
              <a href="#" className="hover:text-gold-500 transition-colors"><Instagram /></a>
              <a href="#" className="hover:text-gold-500 transition-colors"><Facebook /></a>
              <a href="#" className="hover:text-gold-500 transition-colors"><WhatsApp /></a>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold mb-6 text-sm tracking-widest text-gold-500">ADMINISTRATIVO</h4>
            <Link to="/admin" className="text-gray-400 text-sm hover:text-white transition-colors">
              Área Restrita
            </Link>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-16 pt-8 text-center text-gray-500 text-xs">
          © 2024 Lumina Dental Clinic. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </Router>
  );
};

export default App;