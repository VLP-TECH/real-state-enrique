
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import RegistrationForm from '@/components/RegistrationForm';
import Dashboard from '@/components/Dashboard';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RegistrationFormData } from '@/utils/types';
import { useToast } from '@/hooks/use-toast';
import { Lock, Building, Users, Shield, ChevronRight } from 'lucide-react';

const Index = () => {
  const { toast } = useToast();
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
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
  
  // Mock login for demo purposes
  const handleLoginClick = () => {
    setIsLoggedIn(true);
    toast({
      title: 'Inicio de Sesión Exitoso',
      description: 'Bienvenido de nuevo a Henry Williams & Partners.',
    });
  };
  
  if (isLoggedIn) {
    return <Dashboard />;
  }
  
  return (
    <div className="min-h-screen bg-estate-offwhite">
      {/* Hero Section with new background */}
      <header className="bg-estate-navy text-white relative">
        {/* Navigation */}
        <div className="estate-container py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              {/* Logo */}
              <div className="w-12 h-12">
                <img 
                  src="/lovable-uploads/b6a96218-180b-4de1-b4a9-b5e3a968cd47.png" 
                  alt="HW Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <h1 className="font-serif text-2xl font-bold">
                Henry Williams <span className="text-estate-gold">&</span> Partners
              </h1>
            </div>
            <Button 
              variant="outline" 
              className="border-estate-gold text-estate-gold hover:bg-estate-gold hover:text-estate-navy" 
              onClick={handleLoginClick}>
              Acceso
            </Button>
          </div>
        </div>
        
        {/* Hero content */}
        <div className="estate-container py-20 md:py-32 relative z-10">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 font-serif">
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
        </div>
        
        {/* Background overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-estate-navy to-estate-navy/80 z-0">
          <div className="absolute inset-0 bg-[url('/lovable-uploads/6ac62d59-e4f6-4d2d-9ad2-996db1306cef.png')] opacity-20 mix-blend-overlay bg-no-repeat bg-cover"></div>
        </div>
      </header>
      
      {/* Features Section */}
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
      
      {/* How It Works Section */}
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
              {/* Timeline line */}
              <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-estate-gold/30"></div>
              
              {/* Steps */}
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
      
      {/* Call to Action */}
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
      
      {/* Footer */}
      <footer className="bg-estate-slate text-white py-10">
        <div className="estate-container">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0 flex items-center space-x-3">
              <div className="w-10 h-10">
                <img 
                  src="/lovable-uploads/b6a96218-180b-4de1-b4a9-b5e3a968cd47.png" 
                  alt="HW Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h2 className="text-xl font-bold font-serif">Henry Williams & Partners</h2>
                <p className="text-estate-lightgrey text-sm mt-1">Exclusivo. Seguro. Confidencial.</p>
              </div>
            </div>
            <div className="text-sm text-estate-lightgrey">
              &copy; {new Date().getFullYear()} Henry Williams & Partners. Todos los derechos reservados.
            </div>
          </div>
        </div>
      </footer>
      
      {/* Registration Modal */}
      <Dialog open={showRegistrationForm} onOpenChange={setShowRegistrationForm}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-estate-navy font-serif">Solicitud de Acceso</DialogTitle>
          </DialogHeader>
          <RegistrationForm onSubmit={handleRegistrationSubmit} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
