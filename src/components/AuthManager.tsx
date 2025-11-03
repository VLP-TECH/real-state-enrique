import { useState, useEffect } from 'react';
import { supabase } from '@/supabaseClient';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const AuthManager = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const checkUserSession = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error) {
        console.error('Error checking session:', error);
      }

      const currentPath = location.pathname;

      if (user) {
        // Simplificar: determinar si es admin basado en el email
        const isAdmin = user.email === 'admin@gmail.com';
        
        let expectedPath = '/';
        let description = 'Debes iniciar sesión para acceder a esta página.';

        if (user) {
          if (isAdmin && currentPath === '/dashboard') {
            expectedPath = '/dashboard/admin';
            description = 'Acceso no autorizado. Redirigiendo...';
            navigate(expectedPath, { replace: true });
          } else if (!isAdmin && currentPath !== '/dashboard') {
            expectedPath = '/dashboard';
            description = 'Acceso no autorizado. Redirigiendo...';
            navigate(expectedPath, { replace: true });
          }
        }
      }

      setAuthChecked(true);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkUserSession();
    });

    checkUserSession();

    return () => subscription.unsubscribe();
  }, [navigate, location, toast]);

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
    
    // Simplificar: determinar si es admin basado en el email
    const isAdmin = data.user?.email === 'admin@gmail.com';
    navigate(isAdmin ? '/dashboard/admin' : '/dashboard');
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
        toast({
          title: 'Error al cerrar sesión',
          description: 'Ocurrió un error al cerrar la sesión.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Sesión cerrada',
          description: 'Has cerrado sesión correctamente.',
        });
        navigate('/');
      }
    } catch (error) {
      console.error('Error during logout:', error);
      toast({
        title: 'Error al cerrar sesión',
        description: 'Ocurrió un error inesperado al cerrar la sesión.',
        variant: 'destructive',
      });
    }
  };

  return {
    isAuthenticated,
    handleLogin,
    handleLogout,
    authChecked,
  };
};

export default AuthManager;
