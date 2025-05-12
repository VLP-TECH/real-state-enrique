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
import { Copy, Check, X, Send, Share2 } from 'lucide-react'; // Import Check, X, Send, and Share2 icons
import { Loader2 } from "lucide-react"
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import StatusBadge from './StatusBadge'; // Import StatusBadge

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
  const [infoRequests, setInfoRequests] = useState<any[]>([]); 
  const [loadingInfoRequests, setLoadingInfoRequests] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [generatedPasswords, setGeneratedPasswords] = useState<Record<number, string>>({});
  const [openRequests, setOpenRequests] = useState<Record<number, boolean>>({});
  const [loadingCrearCuenta, setLoadingCrearCuenta] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (!user) {
        // Removed the toast notification for unauthorized access
        navigate('/');
        return;
      }

      setAuthChecked(true); 
    };

    checkAuth();

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

  useEffect(() => {
    const fetchInfoRequests = async () => {
      if (!isAdmin) return; 
      setLoadingInfoRequests(true);
      try {
        
        const { data, error } = await supabase
          .from('infoactivo')
          .select(`
            id,
            created_at,
            mensaje,
            activo_id,
            user_id,
            estado,
            activos:activo_id ( id, category, subcategory1, subcategory2, city, country ),
            profiles:user_id ( user_id )
          `)
          .order('created_at', { ascending: false });

        if (error) {
           throw error;
         }
         
         
         console.log('Raw data from infoactivo fetch:', data); 

         
         setInfoRequests(data || []); 
 
       } catch (error: any) {
        
        console.error('Error fetching info requests:', error);

        let errorMessage = "Ocurrió un error desconocido al cargar las solicitudes de información.";
        if (error && error.message) {
            errorMessage = error.message;
        } else if (typeof error === 'string') {
            errorMessage = error;
        }
        
        if (error && error.details) {
            errorMessage += ` Detalles: ${error.details}`;
        }
        if (error && error.hint) {
            errorMessage += ` Pista: ${error.hint}`;
        }
         
        if (error && (error.code?.includes('PGRST') || error.message?.includes('400'))) {
             errorMessage += " (Sugerencia: Verifica la sintaxis de la consulta SELECT, los nombres de las columnas y las relaciones entre tablas.)";
        }

        toast({
          title: 'Error al Cargar Solicitudes de Info',
          description: errorMessage,
          variant: 'destructive',
        });
      } finally {
        setLoadingInfoRequests(false);
      }
    };

    if (isAdmin) { 
        fetchInfoRequests();
    }
  }, [isAdmin, toast]); 


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
      const { error } = await supabase
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

    try {
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
    } catch (error: any) {
      toast({
        title: 'Error al restaurar sesión del admin',
        description: error.message || 'Error desconocido al restaurar la sesión.',
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
    setLoadingCrearCuenta(false); // Ensure loading state is reset
  };

  // --- New Handlers for Info Requests ---
  const handleApproveInfoRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('infoactivo')
        .update({ estado: 'approved' }) // Set status to approved
        .eq('id', requestId);

      if (error) throw error;

      // Update local state to reflect the change immediately
      setInfoRequests(prevRequests =>
        prevRequests.map(req =>
          req.id === requestId ? { ...req, estado: 'approved' } : req
        )
      );

      toast({
        title: 'Solicitud Aprobada',
        description: 'La solicitud de información ha sido aprobada.',
      });
    } catch (error: any) {
      console.error('Error approving info request:', error);
      toast({
        title: 'Error al Aprobar',
        description: error.message || 'Hubo un problema al aprobar la solicitud.',
        variant: 'destructive',
      });
    }
  };

  const handleDenyInfoRequest = async (requestId: string) => {
     try {
      const { error } = await supabase
        .from('infoactivo')
        .update({ estado: 'rejected' }) // Set status to rejected
        .eq('id', requestId);

      if (error) throw error;

      // Update local state
      setInfoRequests(prevRequests =>
        prevRequests.map(req =>
          req.id === requestId ? { ...req, estado: 'rejected' } : req
        )
      );

      toast({
        title: 'Solicitud Denegada',
        description: 'La solicitud de información ha sido denegada.',
        variant: 'destructive',
      });
    } catch (error: any) {
      console.error('Error denying info request:', error);
      toast({
        title: 'Error al Denegar',
        description: error.message || 'Hubo un problema al denegar la solicitud.',
        variant: 'destructive',
      });
    }
  }; // Correctly close handleDenyInfoRequest

  const handleSendNda = async (requestId: string) => { // Define handleSendNda correctly
    console.log("Attempting to send NDA for request:", requestId);
    try {
      // Update status in Supabase to 'nda_requested'
      const { error } = await supabase
        .from('infoactivo')
        .update({ estado: 'nda_requested' })
        .eq('id', requestId);

      if (error) throw error;

      // Update local state
      setInfoRequests(prevRequests =>
        prevRequests.map(req =>
          req.id === requestId ? { ...req, estado: 'nda_requested' } : req
        )
      );

      toast({
        title: 'NDA Enviado (Simulado)',
        description: 'El estado de la solicitud se ha actualizado a NDA Solicitado.',
        // Add actual NDA sending logic here in a real implementation
      });

    } catch (error: any) {
      console.error('Error sending NDA (updating status):', error);
      toast({
        title: 'Error al Enviar NDA',
        description: error.message || 'Hubo un problema al actualizar el estado de la solicitud.',
        variant: 'destructive',
      });
    }
  };

  const handleShareInformation = async (requestId: string) => {
    console.log("Attempting to share information for request:", requestId);
    // Placeholder for actual information sharing logic (e.g., updating status, sending links)
    // For now, let's just update the status to 'information_shared' as an example
     try {
      const { error } = await supabase
        .from('infoactivo')
        .update({ estado: 'information_shared' })
        .eq('id', requestId);

      if (error) throw error;

      // Update local state
      setInfoRequests(prevRequests =>
        prevRequests.map(req =>
          req.id === requestId ? { ...req, estado: 'information_shared' } : req
        )
      );

      toast({
        title: 'Información Compartida (Simulado)',
        description: 'El estado de la solicitud se ha actualizado.',
      });

    } catch (error: any) {
      console.error('Error sharing information (updating status):', error);
      toast({
        title: 'Error al Compartir Información',
        description: error.message || 'Hubo un problema al actualizar el estado.',
        variant: 'destructive',
      });
    }
  };
  // --- End New Handlers ---


  const formatRelativeTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: es });
    } catch (e) {
      console.error("Error formatting date:", e);
      return dateString; 
    }
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
                
                <TabsList className="inline-flex border-[#E1D48A]"> 
                  <TabsTrigger value="admin" className="data-[state=active]:border-[#E1D48A] data-[state=active]:border-b-2">
                    Gestión de Registros
                  </TabsTrigger>
                  <TabsTrigger value="info-requests" className="data-[state=active]:border-[#E1D48A] data-[state=active]:border-b-2">
                    Solicitudes de Información
                  </TabsTrigger>
                </TabsList>

                
                <TabsContent value="admin" className="mt-16 md:mt-6 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Gestión de Solicitudes de Registro</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {loadingSolicitudes ? (
                        <div className="flex justify-center items-center p-4">
                           <Loader2 className="animate-spin h-8 w-8 text-[#E1D48A]" />
                        </div>
                      ) : solicitudes.length === 0 ? (
                        <p>No hay solicitudes de registro pendientes.</p>
                      ) : (
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              
                              <TableRow><TableHead>Nombre</TableHead><TableHead>Email</TableHead><TableHead>Teléfono</TableHead><TableHead>Empresa</TableHead><TableHead>Rol Solicitado</TableHead><TableHead>Mensaje Registro</TableHead><TableHead className="text-left">Acciones Registro</TableHead></TableRow>
                            </TableHeader>
                            <TableBody>
                              
                              {solicitudes.flatMap((solicitud) => {
                                const isOpen = openRequests[solicitud.id];
                                const generatedPassword = generatedPasswords[solicitud.id] || '';
                                const rows = [];

                                
                                rows.push(
                                  <TableRow key={solicitud.id} style={{ borderBottomWidth: isOpen ? 0 : undefined }}>
                                    <TableCell className="font-medium">{solicitud.nombre_completo}</TableCell>
                                    <TableCell>{solicitud.correo_electronico}</TableCell>
                                    <TableCell>{solicitud.numero_telefono || '-'}</TableCell>
                                    <TableCell>{solicitud.empresa || '-'}</TableCell>
                                    <TableCell>{mapRolLegible(solicitud.su_rol)}</TableCell>
                                    <TableCell className="max-w-[200px] truncate">{solicitud.mensaje || '-'}</TableCell>
                                    <TableCell className="text-left">
                                      <div className="flex gap-2">
                                        <Button
                                          aria-label={openRequests[solicitud.id] ? 'Cancelar aprobación' : 'Aprobar solicitud'}
                                          size="sm"
                                          variant="outline" 
                                          onClick={() => handleAprobar(solicitud.id)}
                                          className="border-green-500 text-green-700 hover:bg-green-600 hover:text-white" 
                                        >
                                          {openRequests[solicitud.id] ? 'Cancelar' : 'Aprobar'}
                                        </Button>
                                        <Button
                                          aria-label="Denegar solicitud"
                                          size="sm"
                                          variant="outline" // Change variant
                                          onClick={() => handleDenegar(solicitud.id)}
                                          className="border-red-500 text-red-700 hover:bg-red-600 hover:text-white" // Add custom classes
                                        >
                                          Denegar
                                        </Button>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                );

                                
                                if (isOpen) {
                                  rows.push(
                                    <TableRow key={`${solicitud.id}-details`} className="bg-gray-50">
                                      <TableCell colSpan={7} className="p-4">
                                        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                                          <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                                              <div className="flex items-center border rounded">
                                                <input
                                                  type="text"
                                                  placeholder="Generar contraseña"
                                                  className="p-2 rounded-l focus:outline-none focus:ring-1 focus:ring-[#E1D48A]"
                                                  value={generatedPassword}
                                                  readOnly
                                                  aria-label="Contraseña generada"
                                                />
                                                <Button
                                                  size="icon"
                                                  variant="ghost"
                                                  onClick={() => handleCopyToClipboard(generatedPassword)}
                                                  disabled={!generatedPassword}
                                                  className="rounded-l-none"
                                                  aria-label="Copiar contraseña"
                                                >
                                                  <Copy className="h-4 w-4" />
                                                </Button>
                                              </div>
                                              <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleGenerarPassword(solicitud.id)}
                                                aria-label="Generar nueva contraseña"
                                              >
                                                Generar
                                              </Button>
                                            </div>
                                            <Button
                                              size="sm"
                                              variant="default"
                                              onClick={() => handleCrearCuenta(solicitud.id, setLoadingCrearCuenta)}
                                              disabled={!generatedPassword || loadingCrearCuenta}
                                              className="bg-green-600 hover:bg-green-700"
                                              aria-label="Crear cuenta de usuario"
                                            >
                                              {loadingCrearCuenta ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                              Crear Cuenta
                                          </Button>
                                        </div>
                                      </TableCell>
                                    </TableRow>
                                  );
                                }
                                
                                return rows; 
                              })}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                
                <TabsContent value="info-requests" className="mt-16 md:mt-6 space-y-6">
                   <Card>
                     <CardHeader>
                       <CardTitle>Solicitudes de Información de Activos</CardTitle>
                     </CardHeader>
                     <CardContent>
                       {loadingInfoRequests ? (
                         <div className="flex justify-center items-center p-4">
                           <Loader2 className="animate-spin h-8 w-8 text-[#E1D48A]" />
                         </div>
                       ) : infoRequests.length === 0 ? (
                         <p>No hay solicitudes de información disponibles.</p>
                       ) : (
                         <div className="overflow-x-auto">
                           <Table>
                             <TableHeader>
                               <TableRow>
                                 <TableHead>Usuario (ID)</TableHead>
                                 <TableHead>Activo (ID/Cat)</TableHead>
                                 <TableHead>Ubicación Activo</TableHead>
                                 <TableHead>Mensaje Solicitud</TableHead>
                                 <TableHead>Fecha Solicitud</TableHead>
                                 <TableHead>Estado</TableHead> {/* Add Estado column header */}
                                 <TableHead className="text-left">Acciones</TableHead> {/* Add Acciones column header */}
                               </TableRow>
                             </TableHeader>
                             <TableBody>
                               {infoRequests.map((req) => (
                              <TableRow key={req.id}>
                                <TableCell className="font-medium text-xs text-gray-600" title={req.user_id}>{req.user_id?.substring(0, 8) || 'N/A'}...</TableCell>
                                <TableCell>
                                  <div className="flex flex-col">
                                     <span className="text-xs text-gray-500 truncate" title={req.activo_id}>ID: {req.activo_id.substring(0, 8)}...</span>
                                        <span>{req.activos?.category || 'N/A'}</span>
                                     </div>
                                   </TableCell>
                                   <TableCell>{req.activos ? `${req.activos.city}, ${req.activos.country}` : 'N/A'}</TableCell>
                                   <TableCell className="max-w-[250px] truncate" title={req.mensaje || ''}>{req.mensaje || '-'}</TableCell>
                                   <TableCell>{formatRelativeTime(req.created_at)}</TableCell>
                                   <TableCell>
                                     {/* Display status using StatusBadge */}
                                     <StatusBadge status={req.estado || 'pending'} />
                                   </TableCell>
                                   <TableCell className="text-left">
                                     {/* Conditional Actions */}
                                     {req.estado === 'pending' ? (
                                       <div className="flex gap-2">
                                         <Button
                                           size="sm"
                                           variant="outline" // Keep outline for consistency with registration 'Aprobar'
                                           onClick={() => handleApproveInfoRequest(req.id)}
                                           className="border-green-500 text-green-700 hover:bg-green-600 hover:text-white" // Match registration 'Aprobar' style
                                           aria-label="Aprobar solicitud de información"
                                         >
                                           Aprobar
                                         </Button>
                                         <Button
                                           size="sm"
                                           variant="outline" // Change variant
                                           onClick={() => handleDenyInfoRequest(req.id)}
                                           className="border-red-500 text-red-700 hover:bg-red-600 hover:text-white" // Add custom classes
                                           aria-label="Denegar solicitud de información"
                                         >
                                           Denegar
                                         </Button>
                                       </div>
                                     ) : req.estado === 'rejected' ? (
                                       // Display specific message for rejected status
                                       <span className="text-sm text-red-600 font-medium">Solicitud rechazada</span>
                                     ) : req.estado === 'approved' ? (
                                       // Display "Enviar NDA" button for approved status in Admin view
                                       <Button
                                         size="sm"
                                         variant="outline"
                                         onClick={() => handleSendNda(req.id)} // Correctly call handleSendNda
                                         className="border-blue-500 text-blue-700 hover:bg-blue-600 hover:text-white px-2 py-1" // Darker hover bg, white text
                                         aria-label="Enviar NDA"
                                       >
                                         <Send className="h-4 w-4 mr-1" /> Enviar Documentación de Confidencialidad
                                       </Button>
                                     ) : req.estado === 'nda_requested' ? (
                                        // Display message when NDA has been requested/sent by admin
                                        <span className="text-sm text-gray-500 italic">Esperando acción del usuario</span>
                                     ) : req.estado === 'nda_received' ? (
                                        // Display "Compartir Información" button when NDA is received
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => handleShareInformation(req.id)}
                                          className="border-purple-500 text-purple-700 hover:bg-purple-600 hover:text-white px-2 py-1" // Darker hover bg, white text
                                          aria-label="Compartir Información"
                                        >
                                          <Share2 className="h-4 w-4 mr-1" /> Enviar Documentación del Activo
                                        </Button>
                                     ) : req.estado === 'information_shared' ? (
                                        // Display message after information has been shared
                                        <span className="text-sm text-green-600 font-medium"></span>
                                     ) : (
                                       // Default message for other statuses
                                       <span className="text-sm text-gray-500 italic">Acción realizada</span>
                                     )}
                                   </TableCell>
                                 </TableRow>
                               ))}
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
