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
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('admin')
          .eq('user_id', user.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          navigate('/dashboard');
          return;
        }

        const isAdmin = profile?.admin === true;
        let expectedPath = '/';
        let description = 'Debes iniciar sesión para acceder a esta página.';

        if (user) {
          if (isAdmin && currentPath === '/dashboard') {
            expectedPath = '/dashboard/admin';
            description = 'Acceso no autorizado. Redirigiendo...';
            // Removed toast notification
            navigate(expectedPath, { replace: true });
          } else if (!isAdmin && currentPath !== '/dashboard') {
            expectedPath = '/dashboard';
             description = 'Acceso no autorizado. Redirigiendo...';
            // Removed toast notification
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
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('admin')
      .eq('user_id', data.user.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      navigate('/dashboard');
      return;
    }

    const isAdmin = profile?.admin === true;
    navigate(isAdmin ? '/dashboard/admin' : '/dashboard');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: 'Sesión Cerrada',
      description: 'Has cerrado sesión correctamente.',
    });
    setIsAuthenticated(false);
    navigate('/');
  };

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user !== null;
  };

  return {
    isAuthenticated,
    handleLogin,
    handleLogout,
    checkAuth,
    authChecked
  };
};

export default AuthManager;
