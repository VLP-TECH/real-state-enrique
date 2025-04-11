import React, { useState, useEffect } from 'react';
import { supabase } from '@/supabaseClient';
import UserProfile from './UserProfile';
import { User } from '@/utils/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { TabsContent, TabsList, Tabs, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Copy } from 'lucide-react';
import { Loader2 } from "lucide-react"

// Function to generate a complex password
const generatePassword = () => {
  const length = 12;
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=";
  let password = "";
  for (let i = 0, n = charset.length; i < length; ++i) {
    password += charset.charAt(Math.floor(Math.random() * n));
  }
  return password;
};

const mapRolLegible = (rol: string): string => {
  const roles: Record<string, string> = {
    buyer_mandatary: "Mandatario de Compra",
    seller_mandatary: "Mandatario de Venta",
    investor: "Inversor / Family Office",
  };
  return roles[rol] || rol;
};

const AdminDashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [loadingSolicitudes, setLoadingSolicitudes] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [generatedPasswords, setGeneratedPasswords] = useState<Record<number, string>>({});
  const [openRequests, setOpenRequests] = useState<Record<number, boolean>>({});
  const [loadingCrearCuenta, setLoadingCrearCuenta] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (!user) {
        // Si no hay usuario autenticado, redirigir al login
        toast({
          title: 'Acceso no autorizado',
          description: 'Debes iniciar sesión para acceder al dashboard',
          variant: 'destructive',
        });
        navigate('/');
        return;
      }

      setAuthChecked(true); // Marcar que la verificación se completó
    };

    checkAuth();

    // Suscribirse a cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        navigate('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, toast]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();

          if (profileError) {
            console.error('Error fetching profile:', profileError);
          }

          setUserProfile({
            id: user.id,
            role: profile?.role || 'buyer_mandatary',
            registrationDate: user.created_at,
            isApproved: profile?.is_approved || false,
            fullName: profile?.full_name || '',
            email: user.email || '',
            assetsCount: 0,
            requestsCount: 0,
            admin: profile?.admin || false,
          });
          if (profile?.admin) {
            setIsAdmin(true);
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    const fetchSolicitudes = async () => {
      try {
        const { data, error } = await supabase
          .from('solicitudes')
          .select('*')
          .is('estado', null);

        if (error) throw error;

        setSolicitudes(data);
      } catch (error) {
        console.error('Error al obtener solicitudes:', error);
      } finally {
        setLoadingSolicitudes(false);
      }
    };

    fetchSolicitudes();
  }, [isAdmin]);

  const handleAprobar = (id: number) => {
    setOpenRequests(prevOpenRequests => ({
      ...prevOpenRequests,
      [id]: !prevOpenRequests[id],
    }));
  };

  const handleGenerarPassword = (id: number) => {
    const password = generatePassword();
    setGeneratedPasswords(prevPasswords => ({
      ...prevPasswords,
      [id]: password,
    }));
  };

  const handleCopyToClipboard = (password: string) => {
    navigator.clipboard.writeText(password);
    toast({
      title: 'Contraseña copiada',
      description: 'La contraseña ha sido copiada al portapapeles.',
    });
  };

  const handleDenegar = async (id: number) => {
    try {
      const { data, error } = await supabase
        .from('solicitudes')
        .update({ estado: false })
        .eq('id', id);

      if (error) throw error;

      setSolicitudes((prevSolicitudes) =>
        prevSolicitudes.filter((solicitud) => solicitud.id !== id)
      );

      toast({
        title: 'Solicitud denegada',
        description: 'La solicitud ha sido marcada como eliminada.',
        variant: 'destructive',
      });
    } catch (error) {
      console.error('Error al denegar solicitud:', error);
      toast({
        title: 'Error',
        description: 'Hubo un problema al denegar la solicitud.',
        variant: 'destructive',
      });
    }
  };

  const handleCrearCuenta = async (solicitudId: number, setLoadingCrearCuenta: React.Dispatch<React.SetStateAction<boolean>>) => {
    setLoadingCrearCuenta(true);

    const solicitud = solicitudes.find((s) => s.id === solicitudId);
    const password = generatedPasswords[solicitudId];

    if (!solicitud || !password) {
      toast({
        title: 'Error',
        description: 'Faltan datos para crear la cuenta.',
        variant: 'destructive',
      });
      setLoadingCrearCuenta(false);
      return;
    }

    const { correo_electronico, nombre_completo, su_rol } = solicitud;

    const {
      data: { session: adminSession },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !adminSession) {
      toast({
        title: 'Error al obtener sesión del admin',
        description: sessionError?.message || 'No se pudo guardar la sesión del admin.',
        variant: 'destructive',
      });
      setLoadingCrearCuenta(false);
      return;
    }

    const { data: authData, error: signupError } = await supabase.auth.signUp({
      email: correo_electronico,
      password,
      options: {
        data: {
          full_name: nombre_completo,
          role: su_rol,
        },
      },
    });

    const user = authData?.user;

    if (signupError || !user) {
      toast({
        title: 'Error al crear cuenta',
        description: signupError ? signupError.message : 'Error desconocido',
        variant: 'destructive',
      });
      setLoadingCrearCuenta(false);
      return;
    }

    await supabase.auth.signOut();

    const { error: restoreError } = await supabase.auth.setSession({
      access_token: adminSession.access_token,
      refresh_token: adminSession.refresh_token,
    });

    if (restoreError) {
      toast({
        title: 'Error al restaurar sesión del admin',
        description: restoreError.message,
        variant: 'destructive',
      });
      setLoadingCrearCuenta(false);
      return;
    }

    const { error: profileError } = await supabase.from('profiles').insert([
      {
        user_id: user.id,
        solicitud_id: solicitudId,
        admin: false,
        created_at: new Date().toISOString(),
      },
    ]);

    if (profileError) {
      toast({
        title: 'Error al crear perfil',
        description: profileError.message,
        variant: 'destructive',
      });
      setLoadingCrearCuenta(false);
      return;
    }

    const { error: updateSolicitudError } = await supabase
      .from('solicitudes')
      .update({ estado: true })
      .eq('id', solicitudId);

    if (updateSolicitudError) {
      toast({
        title: 'Error al aprobar solicitud',
        description: updateSolicitudError.message,
        variant: 'destructive',
      });
      setLoadingCrearCuenta(false);
      return;
    }

    toast({
      title: 'Cuenta creada y solicitud aprobada',
      description: `Se ha creado una cuenta para ${correo_electronico} y la solicitud ha sido aprobada.`,
    });

    setSolicitudes((prev) => prev.filter((s) => s.id !== solicitudId));

    navigate('/dashboard/admin');
  };

  if (!authChecked) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E1D48A]"></div>
      </div>
    );
  }

  return (
    <>
      {loadingCrearCuenta ? (
        <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-white z-50">
          <Loader2 className="animate-spin h-12 w-12" />
        </div>
      ) : (
        <div className="container mx-auto p-4 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-3">
              {userProfile && <UserProfile user={userProfile} />}
            </div>

            <div className="lg:col-span-3">
              <Tabs defaultValue="admin" className="w-full">
                <TabsList className="grid w-full md:w-auto grid-cols-1 md:inline-flex border-[#E1D48A]">
                  <TabsTrigger value="admin" className="data-[state=active]:border-[#E1D48A] data-[state=active]:border-b-2">
                    Gestión de Solicitudes
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="admin" className="mt-16 md:mt-6 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Gestión de Solicitudes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {loadingSolicitudes ? (
                        <p>Cargando solicitudes...</p>
                      ) : solicitudes.length === 0 ? (
                        <p>No hay solicitudes disponibles.</p>
                      ) : (
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Teléfono</TableHead>
                                <TableHead>Empresa</TableHead>
                                <TableHead>Rol</TableHead>
                                <TableHead>Mensaje</TableHead>
                                <TableHead className="text-left">Acciones</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {solicitudes.map((solicitud) => {
                                const isOpen = openRequests[solicitud.id];
                                const generatedPassword = generatedPasswords[solicitud.id] || '';

                                return [
                                  <TableRow key={solicitud.id} style={{ borderBottomWidth: isOpen ? 0 : undefined }}>
                                    <TableCell>{solicitud.nombre_completo}</TableCell>
                                    <TableCell>{solicitud.correo_electronico}</TableCell>
                                    <TableCell>{solicitud.numero_telefono}</TableCell>
                                    <TableCell>{solicitud.empresa}</TableCell>
                                    <TableCell>{mapRolLegible(solicitud.su_rol)}</TableCell>
                                    <TableCell>{solicitud.mensaje || 'No hay mensaje'}</TableCell>
                                    <TableCell className="text-left">
                                      <div className="flex gap-2">
                                        <Button
                                          size="sm"
                                          variant="default"
                                          onClick={() => handleAprobar(solicitud.id)}
                                        >
                                          {openRequests[solicitud.id] ? 'Cancelar' : 'Aprobar'}
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="destructive"
                                          onClick={() => handleDenegar(solicitud.id)}
                                        >
                                          Denegar
                                        </Button>
                                      </div>
                                    </TableCell>
                                  </TableRow>,

                                  isOpen && (
                                    <TableRow key={`{solicitud.id}-details`}>
                                      <TableCell colSpan={7}>
                                        <div className="flex gap-2 justify-between">
                                          <div className="flex gap-2">
                                            <div className="flex items-center">
                                              <input
                                                type="text"
                                                placeholder="Nueva Contraseña"
                                                className="border p-2 rounded"
                                                value={generatedPassword}
                                                readOnly
                                              />
                                              <Button
                                                size="sm"
                                                variant="default"
                                                onClick={() => handleCopyToClipboard(generatedPassword)}
                                              >
                                                <Copy className="h-4 w-4" />
                                              </Button>
                                            </div>
                                            <div className="flex items-center">
                                              <Button
                                                size="sm"
                                                variant="default"
                                                onClick={() => handleGenerarPassword(solicitud.id)}
                                                className="flex-grow"
                                              >
                                                Generar
                                              </Button>
                                            </div>
                                          </div>
                                          <Button
                                            size="sm"
                                            variant="default"
                                            onClick={() => handleCrearCuenta(solicitud.id, setLoadingCrearCuenta)}
                                          >
                                            Crear Cuenta
                                          </Button>
                                        </div>
                                      </TableCell>
                                    </TableRow>
                                  ),
                                ];
                              })}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminDashboard;
