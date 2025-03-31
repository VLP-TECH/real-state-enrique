import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import RegistrationForm from '@/components/RegistrationForm';
import Dashboard from '@/components/Dashboard';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RegistrationFormData } from '@/utils/types';
import { useToast } from '@/hooks/use-toast';
import { Lock, Building, Users, Shield, ChevronRight } from 'lucide-react';
import Logo from '@/components/Logo';
import BuildingGraphic from '@/components/BuildingGraphic';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  
  const handleRegisterClick = () => {
    setShowRegistrationForm(true);
  };
  
  const handleRegistrationSubmit = (data: RegistrationFormData) => {
    console.log('Registration submitted:', data);
    toast({
      title: 'Registro Recibido',
      description: 'Su solicitud será revisada manualmente por nuestro equipo.',
    });
    setShowRegistrationForm(false);
  };
  
  const handleLoginClick = () => {
    navigate('/dashboard');
    toast({
      title: 'Inicio de Sesión Exitoso',
      description: 'Bienvenido de nuevo a Henry Williams & Partners.',
    });
  };
  
  return (
    <div className="min-h-screen bg-estate-offwhite">
      <header className="bg-estate-navy text-white relative">
        <div className="estate-container py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Logo size="md" className="flex-shrink-0" />
              <h1 className="font-sans text-xl md:text-2xl font-bold text-white">
                Henry Williams <span className="text-estate-gold">&</span> Partners
              </h1>
            </div>
            <Button 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-estate-navy" 
              onClick={handleLoginClick}>
              Acceso
            </Button>
          </div>
        </div>
        
        <div className="estate-container py-16 md:py-28 relative z-10">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold mb-6 font-sans leading-tight">
                EL ÚNICO <span className="text-estate-gold">CLUB PRIVADO</span> DE PROPIEDADES EXCLUSIVAS EN ESPAÑA
              </h2>
              <p className="text-lg mb-8 text-estate-lightgrey">
                Una plataforma privada y segura que conecta mandatarios de confianza e inversores sofisticados para transacciones inmobiliarias de alto valor.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="bg-estate-gold text-estate-navy hover:bg-estate-gold/90"
                  onClick={handleRegisterClick}
                >
                  Solicitar Acceso
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="hidden md:block">
              <BuildingGraphic />
            </div>
          </div>
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-r from-estate-navy to-estate-navy/80 z-0">
          <div className="absolute inset-0 bg-[url('/lovable-uploads/6ac62d59-e4f6-4d2d-9ad2-996db1306cef.png')] opacity-20 mix-blend-overlay bg-no-repeat bg-cover"></div>
        </div>
      </header>
      
      <section className="py-20 bg-white">
        <div className="estate-container">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold mb-4 text-estate-slate font-serif">¿Por Qué Elegir Nuestra Plataforma?</h2>
            <p className="text-estate-steel max-w-2xl mx-auto">
              Proporcionamos un entorno seguro y privado para que profesionales inmobiliarios e inversores se conecten sin comprometer la confidencialidad.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-estate-offwhite p-6 rounded-lg shadow-sm border border-estate-lightgrey">
              <div className="w-12 h-12 bg-estate-gold/10 rounded-full flex items-center justify-center mb-4">
                <Lock className="h-6 w-6 text-estate-gold" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-estate-slate">Privacidad Absoluta</h3>
              <p className="text-estate-steel">
                Todas las identidades de usuarios están anonimizadas y protegidas mediante un sistema de ID seguro.
              </p>
            </div>
            
            <div className="bg-estate-offwhite p-6 rounded-lg shadow-sm border border-estate-lightgrey">
              <div className="w-12 h-12 bg-estate-gold/10 rounded-full flex items-center justify-center mb-4">
                <Building className="h-6 w-6 text-estate-gold" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-estate-slate">Activos Premium</h3>
              <p className="text-estate-steel">
                Acceso a propiedades exclusivas fuera del mercado y oportunidades de inversión.
              </p>
            </div>
            
            <div className="bg-estate-offwhite p-6 rounded-lg shadow-sm border border-estate-lightgrey">
              <div className="w-12 h-12 bg-estate-gold/10 rounded-full flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-estate-gold" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-estate-slate">Red Verificada</h3>
              <p className="text-estate-steel">
                Cada miembro es verificado y aprobado manualmente por nuestro equipo.
              </p>
            </div>
            
            <div className="bg-estate-offwhite p-6 rounded-lg shadow-sm border border-estate-lightgrey">
              <div className="w-12 h-12 bg-estate-gold/10 rounded-full flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-estate-gold" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-estate-slate">Proceso Seguro</h3>
              <p className="text-estate-steel">
                Requisitos estrictos de NDA y compartición de información controlada.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      <section className="py-20 bg-estate-offwhite">
        <div className="estate-container">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold mb-4 text-estate-slate font-serif">Cómo Funciona</h2>
            <p className="text-estate-steel max-w-2xl mx-auto">
              Nuestra plataforma está diseñada con la seguridad y la discreción como pilares, garantizando un proceso controlado desde el registro hasta la transacción.
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-estate-gold/30"></div>
              
              <div className="space-y-12">
                <div className="relative pl-16">
                  <div className="absolute left-0 w-10 h-10 rounded-full bg-estate-gold text-estate-navy flex items-center justify-center font-bold">1</div>
                  <h3 className="text-xl font-semibold mb-2 text-estate-slate">Solicitud y Verificación</h3>
                  <p className="text-estate-steel">
                    Envíe su solicitud de membresía. Nuestro equipo revisará y verificará manualmente sus credenciales.
                  </p>
                </div>
                
                <div className="relative pl-16">
                  <div className="absolute left-0 w-10 h-10 rounded-full bg-estate-gold text-estate-navy flex items-center justify-center font-bold">2</div>
                  <h3 className="text-xl font-semibold mb-2 text-estate-slate">Acceso Concedido</h3>
                  <p className="text-estate-steel">
                    Una vez aprobado, recibirá un ID anónimo seguro y acceso a la plataforma.
                  </p>
                </div>
                
                <div className="relative pl-16">
                  <div className="absolute left-0 w-10 h-10 rounded-full bg-estate-gold text-estate-navy flex items-center justify-center font-bold">3</div>
                  <h3 className="text-xl font-semibold mb-2 text-estate-slate">Descubra Oportunidades</h3>
                  <p className="text-estate-steel">
                    Explore listados anonimizados de activos exclusivos o envíe sus propias oportunidades.
                  </p>
                </div>
                
                <div className="relative pl-16">
                  <div className="absolute left-0 w-10 h-10 rounded-full bg-estate-gold text-estate-navy flex items-center justify-center font-bold">4</div>
                  <h3 className="text-xl font-semibold mb-2 text-estate-slate">Solicitud de Información</h3>
                  <p className="text-estate-steel">
                    Solicite información detallada sobre activos de interés. Firme un NDA específico para cada activo.
                  </p>
                </div>
                
                <div className="relative pl-16">
                  <div className="absolute left-0 w-10 h-10 rounded-full bg-estate-gold text-estate-navy flex items-center justify-center font-bold">5</div>
                  <h3 className="text-xl font-semibold mb-2 text-estate-slate">Transacciones Seguras</h3>
                  <p className="text-estate-steel">
                    Conecte con contrapartes a través de nuestra plataforma segura con total confidencialidad.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <section className="py-20 bg-estate-navy text-white">
        <div className="estate-container text-center">
          <h2 className="text-3xl font-bold mb-4 font-serif">ACTIVOS NO LISTADOS Y SINGULARES</h2>
          <p className="text-lg text-estate-lightgrey mb-8 max-w-2xl mx-auto">
            Solicite acceso para descubrir oportunidades inmobiliarias exclusivas en nuestra red privada.
          </p>
          <Button 
            size="lg" 
            className="bg-estate-gold text-estate-navy hover:bg-estate-gold/90"
            onClick={handleRegisterClick}
          >
            Solicitar Acceso
          </Button>
        </div>
      </section>
      
      <footer className="bg-estate-slate text-white py-16">
        <div className="estate-container flex flex-col items-center justify-center">
          <div className="mb-6">
            <Logo size="lg" />
          </div>
          
          <div className="text-center mb-12">
            <p className="text-estate-gold uppercase tracking-wide text-sm font-light">
              Henry Williams & Partners
            </p>
          </div>
          
          <div className="text-sm text-estate-lightgrey">
            &copy;{new Date().getFullYear()} Henry Williams & Partners | <span className="hover:text-estate-gold cursor-pointer">Privacy Policy</span>
          </div>
        </div>
      </footer>
      
      <Dialog open={showRegistrationForm} onOpenChange={setShowRegistrationForm}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-estate-navy font-sans">Solicitud de Acceso</DialogTitle>
          </DialogHeader>
          <RegistrationForm onSubmit={handleRegistrationSubmit} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
