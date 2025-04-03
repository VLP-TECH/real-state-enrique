import { useState, useEffect } from 'react';
import { supabase } from '@/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const AuthManager = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Verifica si el usuario está autenticado
  useEffect(() => {
    const checkUserSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setIsAuthenticated(true); // El usuario está autenticado
        navigate('/dashboard'); // Si está autenticado, redirigir al Dashboard
      } else {
        setIsAuthenticated(false); // El usuario no está autenticado
        navigate('/'); // Redirigir a la página principal si no está autenticado
      }
    };

    checkUserSession();
  }, [navigate]);

  // Función para iniciar sesión
  const handleLogin = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      toast({
        title: 'Error en el Inicio de Sesión',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Inicio de Sesión Exitoso',
      description: `Bienvenido, ${data.user?.email}`,
    });

    setIsAuthenticated(true);
    navigate('/dashboard');
  };

  // Función para cerrar sesión
  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: 'Sesión Cerrada',
      description: 'Has cerrado sesión correctamente.',
    });
    setIsAuthenticated(false);
    navigate('/'); // Redirigir a la página principal
  };

  // Función para verificar si el usuario está autenticado
  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user !== null;
  };

  return {
    isAuthenticated,
    handleLogin,
    handleLogout,
    checkAuth
  };
};

export default AuthManager;