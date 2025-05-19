import React, { useState, useEffect } from 'react';
import { supabase } from '@/supabaseClient';
import UserProfile from './UserProfile';
import { User, Asset, RequestStatus } from '@/utils/types'; // Import Asset type and RequestStatus
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
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
import AssetList from './AssetList'; // Re-import AssetList for card view
import { formatCurrency, safeDateParser } from '@/utils/formatters'; // Import formatters
import { Eye, List, LayoutGrid } from 'lucide-react'; // Import Eye, List, LayoutGrid icons

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
  const [assets, setAssets] = useState<Asset[]>([]); // State for assets
  const [loadingAssets, setLoadingAssets] = useState(true); // Loading state for assets
  const [isAdmin, setIsAdmin] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [generatedPasswords, setGeneratedPasswords] = useState<Record<number, string>>({});
  const [openRequests, setOpenRequests] = useState<Record<number, boolean>>({});
  const [loadingCrearCuenta, setLoadingCrearCuenta] = useState(false);
  const [adminViewMode, setAdminViewMode] = useState<'card' | 'list'>('list'); // Renamed for global scope
  const [registroFilter, setRegistroFilter] = useState<'all' | 'pending' | 'approved' | 'denied'>('pending'); // Filter for registration requests
  const [infoRequestFilter, setInfoRequestFilter] = useState<RequestStatus | 'all'>('all'); // Filter for info requests, RequestStatus is from types.ts

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
            role: profile?.admin ? 'admin' : (profile?.role || 'buyer_mandatary'), // Explicitly set role to 'admin' if user.admin is true
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
      setLoadingSolicitudes(true);
      try {
        const { data, error } = await supabase
          .from('solicitudes')
          .select('*')
          .order('creado', { ascending: false }); // Corrected to 'creado'

        if (error) throw error;

        setSolicitudes(data || []);
      } catch (error) {
        console.error('Error al obtener solicitudes:', error);
        toast({
          title: 'Error al Cargar Solicitudes de Registro',
          description: (error as Error).message || 'Ocurrió un error desconocido.',
          variant: 'destructive',
        });
      } finally {
        setLoadingSolicitudes(false);
      }
    };

    if (isAdmin) {
      fetchSolicitudes();
    } else {
      // If not admin (or not yet determined), ensure loading stops and data is clear
      setSolicitudes([]);
      setLoadingSolicitudes(false);
    }
  }, [isAdmin, toast]);

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

  useEffect(() => {
    const fetchAssets = async () => {
      if (!isAdmin) return;
      setLoadingAssets(true);
      try {
        const { data, error } = await supabase
          .from('activos')
          .select('*');

        if (error) throw error;
        setAssets(data || []);
      } catch (error: any) {
        console.error('Error fetching assets:', error);
        toast({
          title: 'Error al Cargar Activos',
          description: error.message || 'Ocurrió un error desconocido al cargar los activos.',
          variant: 'destructive',
        });
      } finally {
        setLoadingAssets(false);
      }
    };

    if (isAdmin) {
      fetchAssets();
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

      // Update local state instead of filtering
      setSolicitudes((prevSolicitudes) =>
        prevSolicitudes.map((s) =>
          s.id === id ? { ...s, estado: false } : s
        )
      );

      toast({
        title: 'Solicitud Denegada',
        description: 'La solicitud ha sido marcada como denegada.',
        // variant: 'destructive', // Keep it neutral or success-like for the action itself
      });
    } catch (error: any) {
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

    // Placeholder & conceptual call for invoking Supabase Edge Function to send welcome email
    console.log(`INFO: Aquí se invocaría la Supabase Edge Function 'send-welcome-email' para ${correo_electronico} con la contraseña generada.`);
    // try {
    //   const { data: functionData, error: functionError } = await supabase.functions.invoke('send-welcome-email', {
    //     body: { email: correo_electronico, password: password, fullName: nombre_completo }
    //   });
    //   if (functionError) throw functionError;
    //   toast({
    //     title: 'Correo de Bienvenida Enviado',
    //     description: `Se ha enviado un correo de bienvenida a ${correo_electronico}.`,
    //   });
    // } catch (error: any) {
    //   console.error("Error invoking send-welcome-email function:", error);
    //   toast({
    //     title: 'Error al Enviar Correo',
    //     description: `No se pudo enviar el correo de bienvenida a ${correo_electronico}. Por favor, envíalo manualmente. Error: ${error.message}`,
    //     variant: 'destructive',
    //     duration: 9000, // Longer duration for error messages
    //   });
    // }
    toast({ // Current placeholder until Edge Function is implemented
      title: 'Notificación: Envío de Correo (Simulado)',
      description: `Un correo de bienvenida con la contraseña generada para ${correo_electronico} debería ser enviado mediante una Supabase Edge Function ('send-welcome-email').`,
      duration: 7000,
    });

    // Update local state instead of filtering
    setSolicitudes((prevSolicitudes) =>
      prevSolicitudes.map((s) =>
        s.id === solicitudId ? { ...s, estado: true, user_id: user.id } : s // Mark as approved and associate user_id if available
      )
    );
    // No navigation needed if we are keeping them in the list
    // navigate('/dashboard/admin'); 
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
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                  <TabsList className="grid w-full sm:w-auto grid-cols-1 sm:grid-cols-3 md:inline-flex border-[#E1D48A] mb-2 sm:mb-0">
                    <TabsTrigger value="admin" className="data-[state=active]:border-[#E1D48A] data-[state=active]:border-b-2">
                      Gestión de Registros
                    </TabsTrigger>
                    <TabsTrigger value="info-requests" className="data-[state=active]:border-[#E1D48A] data-[state=active]:border-b-2">
                      Solicitudes de Información
                    </TabsTrigger>
                    <TabsTrigger value="asset-management" className="data-[state=active]:border-[#E1D48A] data-[state=active]:border-b-2">
                      Gestión de Activos
                    </TabsTrigger>
                  </TabsList>
                  <div className="flex items-center gap-2 self-start sm:self-center">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setAdminViewMode('card')}
                      className={adminViewMode === 'card' ? 'bg-[#2A3928]/90 text-white border-[#E1D48A]' : ''}
                      aria-label="Vista Tarjeta"
                    >
                      <LayoutGrid className="h-4 w-4 mr-2" />
                      Tarjeta
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setAdminViewMode('list')}
                      className={adminViewMode === 'list' ? 'bg-[#2A3928]/90 text-white border-[#E1D48A]' : ''}
                      aria-label="Vista Lista"
                    >
                      <List className="h-4 w-4 mr-2" />
                      Lista
                    </Button>
                  </div>
                </div>

                {/* Gestión de Registros Tab */}
                <TabsContent value="admin" className="mt-6 space-y-6">
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle>Gestión de Solicitudes de Registro</CardTitle>
                        <div className="flex gap-2">
                          {(['pending', 'approved', 'denied', 'all'] as const).map((filter) => (
                            <Button
                              key={filter}
                              size="sm"
                              variant={registroFilter === filter ? 'default' : 'outline'}
                              onClick={() => setRegistroFilter(filter)}
                              className={registroFilter === filter ? 'bg-[#2A3928]/90 text-white border-[#E1D48A]' : 'border-gray-300'}
                            >
                              {filter === 'pending' && 'Pendientes'}
                              {filter === 'approved' && 'Aprobadas'}
                              {filter === 'denied' && 'Denegadas'}
                              {filter === 'all' && 'Todas'}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {loadingSolicitudes ? (
                        <div className="flex justify-center items-center p-4">
                          <Loader2 className="animate-spin h-8 w-8 text-[#E1D48A]" />
                        </div>
                      ) : (() => {
                        const filteredSolicitudes = solicitudes.filter(s => {
                          if (registroFilter === 'all') return true;
                          if (registroFilter === 'pending') return s.estado === null;
                          if (registroFilter === 'approved') return s.estado === true;
                          if (registroFilter === 'denied') return s.estado === false;
                          return true;
                        });

                        if (filteredSolicitudes.length === 0) {
                          return <p>No hay solicitudes de registro que coincidan con el filtro.</p>;
                        }
                        
                        return adminViewMode === 'list' ? (
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Nombre</TableHead>
                                  <TableHead>Email</TableHead>
                                  <TableHead>Rol Solicitado</TableHead>
                                  <TableHead>Estado</TableHead>
                                  <TableHead className="text-left">Acciones</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {filteredSolicitudes.flatMap((solicitud) => {
                                  const isOpen = openRequests[solicitud.id];
                                  const generatedPassword = generatedPasswords[solicitud.id] || '';
                                  const rows = [];
                                  rows.push(
                                    <TableRow key={solicitud.id} style={{ borderBottomWidth: (isOpen && solicitud.estado === null) ? 0 : undefined }}>
                                      <TableCell className="font-medium">{solicitud.nombre_completo}</TableCell>
                                      <TableCell>{solicitud.correo_electronico}</TableCell>
                                      <TableCell>{mapRolLegible(solicitud.su_rol)}</TableCell>
                                      <TableCell>
                                        <StatusBadge 
                                          status={solicitud.estado === null ? 'pending' : solicitud.estado === true ? 'approved' : 'rejected'} 
                                        />
                                      </TableCell>
                                      <TableCell className="text-left">
                                        {solicitud.estado === null && ( // Only show actions for pending
                                          <div className="flex gap-2">
                                            <Button
                                              aria-label={isOpen ? 'Cancelar aprobación' : 'Aprobar solicitud'}
                                              size="sm" variant="outline" onClick={() => handleAprobar(solicitud.id)}
                                              className="border-green-500 text-green-700 hover:bg-green-600 hover:text-white"
                                            >
                                              {isOpen ? 'Cancelar' : 'Aprobar'}
                                            </Button>
                                            <Button
                                              aria-label="Denegar solicitud" size="sm" variant="outline"
                                              onClick={() => handleDenegar(solicitud.id)}
                                              className="border-red-500 text-red-700 hover:bg-red-600 hover:text-white"
                                            >
                                              Denegar
                                            </Button>
                                          </div>
                                        )}
                                        {solicitud.estado === true && <span className="text-green-600">Aprobada</span>}
                                        {solicitud.estado === false && <span className="text-red-600">Denegada</span>}
                                      </TableCell>
                                    </TableRow>
                                  );
                                  if (isOpen && solicitud.estado === null) { // Only show details for pending and open
                                    rows.push(
                                      <TableRow key={`${solicitud.id}-details`} className="bg-gray-50">
                                        <TableCell colSpan={5} className="p-4"> {/* Adjusted colSpan */}
                                          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                                            <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                                              <div className="flex items-center border rounded">
                                                <input type="text" placeholder="Generar contraseña"
                                                  className="p-2 rounded-l focus:outline-none focus:ring-1 focus:ring-[#E1D48A]"
                                                  value={generatedPassword} readOnly aria-label="Contraseña generada" />
                                                <Button size="icon" variant="ghost" onClick={() => handleCopyToClipboard(generatedPassword)}
                                                  disabled={!generatedPassword} className="rounded-l-none" aria-label="Copiar contraseña">
                                                  <Copy className="h-4 w-4" />
                                                </Button>
                                              </div>
                                              <Button size="sm" variant="outline" onClick={() => handleGenerarPassword(solicitud.id)} aria-label="Generar nueva contraseña">
                                                Generar
                                              </Button>
                                            </div>
                                            <Button size="sm" variant="default" onClick={() => handleCrearCuenta(solicitud.id, setLoadingCrearCuenta)}
                                              disabled={!generatedPassword || loadingCrearCuenta} className="bg-green-600 hover:bg-green-700"
                                              aria-label="Crear cuenta de usuario">
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
                        ) : ( // adminViewMode === 'card' for "Gestión de Registros"
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredSolicitudes.map((solicitud) => (
                              <Card key={solicitud.id} className="flex flex-col">
                                <CardHeader>
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <CardTitle className="text-base">{solicitud.nombre_completo}</CardTitle>
                                      <p className="text-xs text-gray-500">{solicitud.correo_electronico}</p>
                                    </div>
                                    <StatusBadge status={solicitud.estado === null ? 'pending' : solicitud.estado === true ? 'approved' : 'rejected'} />
                                  </div>
                                </CardHeader>
                                <CardContent className="flex-grow space-y-2">
                                  <p className="text-sm"><strong>Rol:</strong> {mapRolLegible(solicitud.su_rol)}</p>
                                  {solicitud.empresa && <p className="text-sm"><strong>Empresa:</strong> {solicitud.empresa}</p>}
                                  {solicitud.numero_telefono && <p className="text-sm"><strong>Teléfono:</strong> {solicitud.numero_telefono}</p>}
                                  {solicitud.mensaje && <p className="text-sm truncate" title={solicitud.mensaje}><strong>Mensaje:</strong> {solicitud.mensaje}</p>}
                                </CardContent>
                                {solicitud.estado === null && ( // Only show actions for pending
                                  <CardFooter className="flex gap-2 justify-end pt-4">
                                    <Button
                                      aria-label={openRequests[solicitud.id] ? 'Cancelar aprobación' : 'Aprobar solicitud'}
                                      size="sm" variant="outline" onClick={() => handleAprobar(solicitud.id)}
                                      className="border-green-500 text-green-700 hover:bg-green-600 hover:text-white"
                                    >
                                      {openRequests[solicitud.id] ? 'Cancelar' : 'Aprobar'}
                                    </Button>
                                    <Button
                                      aria-label="Denegar solicitud" size="sm" variant="outline"
                                      onClick={() => handleDenegar(solicitud.id)}
                                      className="border-red-500 text-red-700 hover:bg-red-600 hover:text-white"
                                    >
                                      Denegar
                                    </Button>
                                  </CardFooter>
                                )}
                                {openRequests[solicitud.id] && solicitud.estado === null && ( // Only show details for pending and open
                                  <div className="p-4 border-t bg-gray-50">
                                     <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                                        <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                                          <div className="flex items-center border rounded">
                                            <input type="text" placeholder="Generar contraseña"
                                              className="p-2 rounded-l focus:outline-none focus:ring-1 focus:ring-[#E1D48A]"
                                              value={generatedPasswords[solicitud.id] || ''} readOnly aria-label="Contraseña generada" />
                                            <Button size="icon" variant="ghost" onClick={() => handleCopyToClipboard(generatedPasswords[solicitud.id] || '')}
                                              disabled={!generatedPasswords[solicitud.id]} className="rounded-l-none" aria-label="Copiar contraseña">
                                              <Copy className="h-4 w-4" />
                                            </Button>
                                          </div>
                                          <Button size="sm" variant="outline" onClick={() => handleGenerarPassword(solicitud.id)} aria-label="Generar nueva contraseña">
                                            Generar
                                          </Button>
                                        </div>
                                        <Button size="sm" variant="default" onClick={() => handleCrearCuenta(solicitud.id, setLoadingCrearCuenta)}
                                          disabled={!generatedPasswords[solicitud.id] || loadingCrearCuenta} className="bg-green-600 hover:bg-green-700"
                                          aria-label="Crear cuenta de usuario">
                                          {loadingCrearCuenta ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                          Crear Cuenta
                                        </Button>
                                      </div>
                                  </div>
                                )}
                              </Card>
                            ))}
                          </div>
                        )
                      })()}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Solicitudes de Información Tab */}
                <TabsContent value="info-requests" className="mt-6 space-y-6">
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle>Solicitudes de Información de Activos</CardTitle>
                        <div className="flex gap-1 flex-wrap justify-end">
                          {(['all', 'pending', 'approved', 'rejected', 'nda_requested', 'nda_received', 'information_shared'] as const).map((filterValue: RequestStatus | 'all') => (
                            <Button
                              key={filterValue}
                              size="sm"
                              variant={infoRequestFilter === filterValue ? 'default' : 'outline'}
                              onClick={() => setInfoRequestFilter(filterValue)}
                              className={`text-xs px-2 py-1 ${infoRequestFilter === filterValue ? 'bg-[#2A3928]/90 text-white border-[#E1D48A]' : 'border-gray-300'}`}
                            >
                              {filterValue === 'all' && 'Todas'}
                              {filterValue === 'pending' && 'Pendientes'}
                              {filterValue === 'approved' && 'Aprobadas'}
                              {filterValue === 'rejected' && 'Rechazadas'}
                              {filterValue === 'nda_requested' && 'NDA Solicitado'}
                              {filterValue === 'nda_received' && 'NDA Recibido'}
                              {filterValue === 'information_shared' && 'Info Compartida'}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {loadingInfoRequests ? (
                        <div className="flex justify-center items-center p-4">
                          <Loader2 className="animate-spin h-8 w-8 text-[#E1D48A]" />
                        </div>
                      ) : (
                        (() => {
                          const filteredInfoRequests = infoRequests.filter(req => {
                            if (infoRequestFilter === 'all') return true;
                            return (req.estado || 'pending') === infoRequestFilter;
                          });

                          if (filteredInfoRequests.length === 0) {
                            return <p>No hay solicitudes de información que coincidan con el filtro.</p>;
                          }

                          if (adminViewMode === 'list') {
                            return (
                              <div className="overflow-x-auto">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Usuario (ID)</TableHead>
                                      <TableHead>Activo (ID/Cat)</TableHead>
                                      <TableHead>Ubicación Activo</TableHead>
                                      <TableHead>Mensaje Solicitud</TableHead>
                                      <TableHead>Fecha Solicitud</TableHead>
                                      <TableHead>Estado</TableHead>
                                      <TableHead className="text-left">Acciones</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {filteredInfoRequests.map((req) => (
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
                                        <TableCell><StatusBadge status={req.estado || 'pending'} /></TableCell>
                                        <TableCell className="text-left">
                                          {req.estado === 'pending' ? (
                                            <div className="flex gap-2">
                                              <Button size="sm" variant="outline" onClick={() => handleApproveInfoRequest(req.id)}
                                                className="border-green-500 text-green-700 hover:bg-green-600 hover:text-white" aria-label="Aprobar solicitud de información">
                                                Aprobar
                                              </Button>
                                              <Button size="sm" variant="outline" onClick={() => handleDenyInfoRequest(req.id)}
                                                className="border-red-500 text-red-700 hover:bg-red-600 hover:text-white" aria-label="Denegar solicitud de información">
                                                Denegar
                                              </Button>
                                            </div>
                                          ) : req.estado === 'rejected' ? (
                                            <span className="text-sm text-red-600 font-medium">Solicitud rechazada</span>
                                          ) : req.estado === 'approved' ? (
                                            <Button size="sm" variant="outline" onClick={() => handleSendNda(req.id)}
                                              className="border-blue-500 text-blue-700 hover:bg-blue-600 hover:text-white px-2 py-1" aria-label="Enviar NDA">
                                              <Send className="h-4 w-4 mr-1" /> Enviar Documentación de Confidencialidad
                                            </Button>
                                          ) : req.estado === 'nda_requested' ? (
                                            <span className="text-sm text-gray-500 italic">Esperando acción del usuario</span>
                                          ) : req.estado === 'nda_received' ? (
                                            <Button size="sm" variant="outline" onClick={() => handleShareInformation(req.id)}
                                              className="border-purple-500 text-purple-700 hover:bg-purple-600 hover:text-white px-2 py-1" aria-label="Compartir Información">
                                              <Share2 className="h-4 w-4 mr-1" /> Enviar Documentación del Activo
                                            </Button>
                                          ) : req.estado === 'information_shared' ? (
                                            <span className="text-sm text-green-600 font-medium"></span>
                                          ) : (
                                            <span className="text-sm text-gray-500 italic">Acción realizada</span>
                                          )}
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            );
                          } else { // adminViewMode === 'card'
                            return (
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredInfoRequests.map((req) => (
                                  <Card key={req.id} className="flex flex-col">
                                    <CardHeader>
                                      <CardTitle className="text-sm">Solicitud de: <span className="font-normal text-xs text-gray-600" title={req.user_id}>{req.user_id?.substring(0,8) || 'N/A'}...</span></CardTitle>
                                      <p className="text-xs text-gray-500">Activo ID: <span title={req.activo_id}>{req.activo_id.substring(0,8)}...</span> ({req.activos?.category || 'N/A'})</p>
                                    </CardHeader>
                                    <CardContent className="flex-grow space-y-1">
                                      <p className="text-xs"><strong>Ubicación:</strong> {req.activos ? `${req.activos.city}, ${req.activos.country}` : 'N/A'}</p>
                                      <p className="text-xs"><strong>Fecha:</strong> {formatRelativeTime(req.created_at)}</p>
                                      <p className="text-xs truncate" title={req.mensaje || ''}><strong>Mensaje:</strong> {req.mensaje || '-'}</p>
                                      <div className="flex items-center"><strong>Estado:</strong> <StatusBadge status={req.estado || 'pending'} /></div>
                                    </CardContent>
                                    <CardFooter className="flex flex-wrap gap-2 justify-end pt-2">
                                      {req.estado === 'pending' && (
                                        <>
                                          <Button size="sm" variant="outline" onClick={() => handleApproveInfoRequest(req.id)} className="border-green-500 text-green-700 hover:bg-green-600 hover:text-white text-xs px-2 py-1" aria-label="Aprobar">Aprobar</Button>
                                          <Button size="sm" variant="outline" onClick={() => handleDenyInfoRequest(req.id)} className="border-red-500 text-red-700 hover:bg-red-600 hover:text-white text-xs px-2 py-1" aria-label="Denegar">Denegar</Button>
                                        </>
                                      )}
                                  {req.estado === 'approved' && (
                                    <Button size="sm" variant="outline" onClick={() => handleSendNda(req.id)} className="border-blue-500 text-blue-700 hover:bg-blue-600 hover:text-white text-xs px-2 py-1" aria-label="Enviar NDA"><Send className="h-4 w-4 mr-1" />Enviar NDA</Button>
                                  )}
                                  {req.estado === 'nda_received' && (
                                    <Button size="sm" variant="outline" onClick={() => handleShareInformation(req.id)} className="border-purple-500 text-purple-700 hover:bg-purple-600 hover:text-white text-xs px-2 py-1" aria-label="Compartir Info"><Share2 className="h-4 w-4 mr-1" />Compartir Info</Button>
                                  )}
                                  {(req.estado === 'rejected' || req.estado === 'nda_requested' || req.estado === 'information_shared') && (
                                        <span className="text-xs text-gray-500 italic">
                                          {req.estado === 'rejected' && 'Solicitud rechazada'}
                                          {req.estado === 'nda_requested' && 'Esperando acción del usuario'}
                                          {req.estado === 'information_shared' && 'Información compartida'}
                                        </span>
                                      )}
                                    </CardFooter>
                                  </Card>
                                ))}
                              </div>
                            );
                          }
                        })() // Removed extra parenthesis here that might have caused syntax error
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Gestión de Activos Tab */}
                <TabsContent value="asset-management" className="mt-6 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Listado de Activos</CardTitle>
                      {/* View switcher buttons removed from here, now global */}
                    </CardHeader>
                    <CardContent>
                      {loadingAssets ? (
                        <div className="flex justify-center items-center p-4">
                          <Loader2 className="animate-spin h-8 w-8 text-[#E1D48A]" />
                        </div>
                      ) : assets.length === 0 ? (
                        <p>No hay activos disponibles.</p>
                      ) : adminViewMode === 'list' ? ( // Use global adminViewMode
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Categoría</TableHead>
                                <TableHead>Subcategoría 1</TableHead>
                                <TableHead>Subcategoría 2</TableHead>
                                <TableHead>Ciudad</TableHead>
                                <TableHead>País</TableHead>
                                <TableHead>Precio</TableHead>
                                <TableHead>Retorno Esperado</TableHead>
                                <TableHead>Fecha Creación</TableHead>
                                <TableHead>Acciones</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {assets.map((asset) => (
                                <TableRow key={asset.id}>
                                  <TableCell className="text-xs" title={asset.id}>{asset.id.substring(0, 8)}...</TableCell>
                                  <TableCell>{asset.category}</TableCell>
                                  <TableCell>{asset.subcategory1 || '-'}</TableCell>
                                  <TableCell>{asset.subcategory2 || '-'}</TableCell>
                                  <TableCell>{asset.city}</TableCell>
                                  <TableCell>{asset.country}</TableCell>
                                  <TableCell>{formatCurrency(asset.priceAmount, asset.priceCurrency)}</TableCell>
                                  <TableCell>{asset.expectedReturn ? `${asset.expectedReturn}%` : '-'}</TableCell>
                                  <TableCell>{safeDateParser(asset.creado)?.toLocaleDateString('es-ES') ?? 'Fecha inválida'}</TableCell>
                                  <TableCell>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        console.log(`Admin viewing details for asset: ${asset.id}`);
                                        toast({
                                          title: 'Detalles del Activo',
                                          description: `Visualizando detalles para el activo ID: ${asset.id} (acción no implementada completamente).`,
                                        });
                                      }}
                                      aria-label="Ver detalles del activo"
                                    >
                                      <Eye className="h-4 w-4 mr-1" />
                                      Ver
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      ) : ( // adminViewMode === 'card'
                        <AssetList
                          assets={assets}
                          onRequestInfo={(assetId) => {
                            console.log(`Admin requesting info for asset: ${assetId}`);
                            toast({
                              title: 'Información de Activo',
                              description: `Visualizando detalles para el activo ID: ${assetId} (acción no implementada completamente).`,
                            });
                          }}
                          buttonStyle="bg-[#E1D48A] hover:bg-[#E1D48A]/90 text-estate-navy"
                        />
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
