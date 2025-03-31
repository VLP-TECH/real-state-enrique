
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RegistrationFormData } from '@/utils/types';
import { useToast } from '@/hooks/use-toast';
import { Lock, Building, Users, Shield, ChevronRight, Mail } from 'lucide-react';
import Logo from '@/components/Logo';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import RegistrationForm from '@/components/RegistrationForm';

const Index = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
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
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login attempted with:', { email, password });
    navigate('/dashboard');
    toast({
      title: 'Inicio de Sesión Exitoso',
      description: 'Bienvenido de nuevo a Henry Williams & Partners.',
    });
  };
  
  return (
    <div className="min-h-screen bg-estate-offwhite">
      <header className="bg-estate-navy text-white relative">
        {/* Top navigation bar - Make the gold color more prominent */}
        <div className="estate-container py-3">
          <div className="flex justify-between items-center">
            <Button 
              variant="link" 
              className="text-[#ffcc00] font-semibold hover:text-white hover:bg-[#ffcc00]/30 p-2 rounded-md transition-colors"
              onClick={handleRegisterClick}
            >
              Request access
            </Button>
            
            <div className="flex flex-col items-center">
              <Logo size="lg" className="mb-1" />
              <h1 className="uppercase tracking-widest text-sm text-[#ffcc00] font-semibold">
                Henry Williams & Partners
              </h1>
            </div>
            
            <div className="flex gap-4 items-center">
              <Button variant="link" className="text-[#ffcc00] font-semibold hover:text-white hover:bg-[#ffcc00]/30 p-2 rounded-md transition-colors">
                About
              </Button>
              <Button variant="link" className="text-[#ffcc00] font-semibold hover:text-white hover:bg-[#ffcc00]/30 p-2 rounded-md transition-colors">
                Member benefits
              </Button>
              <Button variant="link" className="text-[#ffcc00] font-semibold hover:text-white hover:bg-[#ffcc00]/30 p-2 rounded-md transition-colors">
                Privacy
              </Button>
              <Button variant="link" className="text-[#ffcc00] font-semibold hover:text-white hover:bg-[#ffcc00]/30 p-2 rounded-md transition-colors">
                Login
              </Button>
            </div>
          </div>
        </div>
        
        <div className="estate-container py-16 md:py-20 relative z-10">
          <div className="flex justify-center">
            <Card className="w-full max-w-md border-[#ffcc00] shadow-lg">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-estate-slate">Acceso Restringido</CardTitle>
                <CardDescription>Ingrese sus credenciales para acceder a la plataforma</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-estate-slate">Correo Electrónico</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-estate-steel h-4 w-4" />
                      <Input 
                        id="email" 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 border-estate-lightgrey" 
                        placeholder="correo@ejemplo.com"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-estate-slate">Contraseña</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-estate-steel h-4 w-4" />
                      <Input 
                        id="password" 
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 border-estate-lightgrey" 
                        required
                      />
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-[#ffcc00] hover:bg-[#ffcc00]/90 text-estate-navy font-medium"
                  >
                    Acceder
                  </Button>
                </form>
              </CardContent>
              <CardFooter className="flex flex-col">
                <p className="text-sm text-estate-steel mb-4">
                  ¿Aún no es miembro? Solicite acceso a nuestra plataforma exclusiva.
                </p>
                <Button 
                  variant="outline"
                  className="w-full border-[#ffcc00] text-[#ffcc00] hover:bg-[#ffcc00] hover:text-estate-navy font-medium"
                  onClick={handleRegisterClick}
                >
                  Solicitar Acceso
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-r from-estate-navy to-estate-navy/80 z-0">
          <div className="absolute inset-0 bg-[url('/lovable-uploads/6ac62d59-e4f6-4d2d-9ad2-996db1306cef.png')] opacity-20 mix-blend-overlay bg-no-repeat bg-cover"></div>
        </div>
      </header>
      
      <footer className="bg-estate-slate text-white py-8">
        <div className="estate-container flex flex-col items-center justify-center">
          <div className="mb-4">
            <Logo size="lg" />
          </div>
          
          <div className="text-center mb-4">
            <p className="text-[#ffcc00] uppercase tracking-wide text-xs font-light">
              Henry Williams & Partners
            </p>
          </div>
          
          <div className="text-xs text-estate-lightgrey">
            &copy;{new Date().getFullYear()} Henry Williams & Partners | <span className="hover:text-[#ffcc00] cursor-pointer">Privacy Policy</span>
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
