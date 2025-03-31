
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
      description: 'Bienvenido de nuevo a Real State Club.',
    });
  };
  
  if (isLoggedIn) {
    return <Dashboard />;
  }
  
  return (
    <div className="min-h-screen bg-estate-offwhite">
      {/* Hero Section */}
      <header className="bg-estate-navy text-white">
        <div className="estate-container py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Real State Club</h1>
            <Button variant="outline" className="border-white text-estate-navy bg-white hover:bg-estate-lightgrey hover:text-estate-navy" onClick={handleLoginClick}>
              Acceso de Miembros
            </Button>
          </div>
        </div>
        
        <div className="estate-container py-20 md:py-32">
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Oportunidades Inmobiliarias Exclusivas para Inversores Cualificados</h2>
            <p className="text-lg mb-8 text-estate-lightgrey">
              Una plataforma privada y segura que conecta mandatarios de confianza e inversores sofisticados para transacciones inmobiliarias de alto valor.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-white text-estate-navy hover:bg-estate-lightgrey"
                onClick={handleRegisterClick}
              >
                Solicitar Membresía
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Features Section */}
      <section className="py-20">
        <div className="estate-container">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold mb-4 text-estate-slate">¿Por Qué Elegir Nuestra Plataforma?</h2>
            <p className="text-estate-steel max-w-2xl mx-auto">
              Proporcionamos un entorno seguro y privado para que profesionales inmobiliarios e inversores se conecten sin comprometer la confidencialidad.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-estate-navy/10 rounded-full flex items-center justify-center mb-4">
                <Lock className="h-6 w-6 text-estate-navy" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-estate-slate">Privacidad Absoluta</h3>
              <p className="text-estate-steel">
                Todas las identidades de usuarios están anonimizadas y protegidas mediante un sistema de ID seguro.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-estate-navy/10 rounded-full flex items-center justify-center mb-4">
                <Building className="h-6 w-6 text-estate-navy" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-estate-slate">Activos Premium</h3>
              <p className="text-estate-steel">
                Acceso a propiedades exclusivas fuera del mercado y oportunidades de inversión.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-estate-navy/10 rounded-full flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-estate-navy" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-estate-slate">Red Verificada</h3>
              <p className="text-estate-steel">
                Cada miembro es verificado y aprobado manualmente por nuestro equipo.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-estate-navy/10 rounded-full flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-estate-navy" />
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
      <section className="py-20 bg-white">
        <div className="estate-container">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold mb-4 text-estate-slate">Cómo Funciona</h2>
            <p className="text-estate-steel max-w-2xl mx-auto">
              Nuestra plataforma está diseñada con la seguridad y la discreción como pilares, garantizando un proceso controlado desde el registro hasta la transacción.
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-estate-lightgrey"></div>
              
              {/* Steps */}
              <div className="space-y-12">
                <div className="relative pl-16">
                  <div className="absolute left-0 w-10 h-10 rounded-full bg-estate-navy text-white flex items-center justify-center font-bold">1</div>
                  <h3 className="text-xl font-semibold mb-2 text-estate-slate">Solicitud y Verificación</h3>
                  <p className="text-estate-steel">
                    Envíe su solicitud de membresía. Nuestro equipo revisará y verificará manualmente sus credenciales.
                  </p>
                </div>
                
                <div className="relative pl-16">
                  <div className="absolute left-0 w-10 h-10 rounded-full bg-estate-navy text-white flex items-center justify-center font-bold">2</div>
                  <h3 className="text-xl font-semibold mb-2 text-estate-slate">Acceso Concedido</h3>
                  <p className="text-estate-steel">
                    Una vez aprobado, recibirá un ID anónimo seguro y acceso a la plataforma.
                  </p>
                </div>
                
                <div className="relative pl-16">
                  <div className="absolute left-0 w-10 h-10 rounded-full bg-estate-navy text-white flex items-center justify-center font-bold">3</div>
                  <h3 className="text-xl font-semibold mb-2 text-estate-slate">Descubra Oportunidades</h3>
                  <p className="text-estate-steel">
                    Explore listados anonimizados de activos exclusivos o envíe sus propias oportunidades.
                  </p>
                </div>
                
                <div className="relative pl-16">
                  <div className="absolute left-0 w-10 h-10 rounded-full bg-estate-navy text-white flex items-center justify-center font-bold">4</div>
                  <h3 className="text-xl font-semibold mb-2 text-estate-slate">Solicitud de Información</h3>
                  <p className="text-estate-steel">
                    Solicite información detallada sobre activos de interés. Firme un NDA específico para cada activo.
                  </p>
                </div>
                
                <div className="relative pl-16">
                  <div className="absolute left-0 w-10 h-10 rounded-full bg-estate-navy text-white flex items-center justify-center font-bold">5</div>
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
          <h2 className="text-3xl font-bold mb-4">¿Listo para Unirse?</h2>
          <p className="text-lg text-estate-lightgrey mb-8 max-w-2xl mx-auto">
            Solicite membresía para acceder a oportunidades inmobiliarias exclusivas en nuestra red privada.
          </p>
          <Button 
            size="lg" 
            className="bg-white text-estate-navy hover:bg-estate-lightgrey"
            onClick={handleRegisterClick}
          >
            Solicitar Membresía
          </Button>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-estate-slate text-white py-10">
        <div className="estate-container">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h2 className="text-xl font-bold">Real State Club</h2>
              <p className="text-estate-lightgrey text-sm mt-1">Exclusivo. Seguro. Confidencial.</p>
            </div>
            <div className="text-sm text-estate-lightgrey">
              &copy; {new Date().getFullYear()} Real State Club. Todos los derechos reservados.
            </div>
          </div>
        </div>
      </footer>
      
      {/* Registration Modal */}
      <Dialog open={showRegistrationForm} onOpenChange={setShowRegistrationForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Solicitud de Membresía</DialogTitle>
          </DialogHeader>
          <RegistrationForm onSubmit={handleRegistrationSubmit} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
