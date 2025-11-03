import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserProfile from './UserProfile';
import AssetForm from './AssetForm';
import RequestForm from './RequestForm';
import AssetCard from './AssetCard';
import AssetList from './AssetList';
import { Asset, InformationRequest, User } from '@/utils/types';
import StatusBadge from './StatusBadge';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'; // Added CardFooter
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from "@/components/ui/button";
import { FileText, Info, List, LayoutGrid, Eye, Trash2 } from 'lucide-react'; // Import Eye and Trash2 icons
import { useToast } from '@/hooks/use-toast';
import { supabase, deleteAsset as deleteAssetFromSupabase } from '@/supabaseClient'; // Import deleteAsset
import { useNavigate } from 'react-router-dom';
import { formatCurrency, safeDateParser } from '@/utils/formatters';

const Dashboard: React.FC = () => {
  const { toast } = useToast();
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [isRequestFormOpen, setIsRequestFormOpen] = useState(false);
  const [userAssets, setUserAssets] = useState<Asset[]>([]);
  const [allAssets, setAllAssets] = useState<Asset[]>([]);
  const [userRequests, setUserRequests] = useState<InformationRequest[]>([]);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');

  const [locationFilter, setLocationFilter] = useState('');
  const [profitabilityRangeFilter, setProfitabilityRangeFilter] = useState<{min: number | undefined, max: number | undefined}>({min: undefined, max: undefined});
  const [categoryFilter, setCategoryFilter] = useState('');
  const [priceRangeFilter, setPriceRangeFilter] = useState<{min: number | undefined, max: number | undefined}>({min: undefined, max: undefined});
  const [purposeFilter, setPurposeFilter] = useState('');

  const mainCategories = [
    "Edificio Residencial", "Edificio Terciario", "Edificio Industrial",
    "Edificio Sociosanitario", "Edificio Turístico", "Activo Singular",
    "Vivienda", "Local Comercial", "Oficina", "Activo Logístico",
    "Plaza de Garaje", "Trastero", "Solar Urbano", "Suelo Urbanizable",
    "Suelo Rústico", "Solar con Proyecto", "Suelo Industrial"
  ];

  // Función para generar ID formateado
  const generateFormattedId = (uuid: string): string => {
    // Tomar los primeros 4 caracteres y los siguientes 2 del UUID
    const firstPart = uuid.substring(0, 4).toUpperCase();
    const secondPart = uuid.substring(4, 6).toUpperCase();
    return `ID-${firstPart}-${secondPart}`;
  };

  // Función para mapear datos de assets a Asset
  const mapAssetsData = (assets: any[]): Asset[] => {
    return assets.map(asset => ({
      id: asset.id,
      purpose: 'sale' as AssetPurpose, // Valor por defecto
      category: asset.property_type,
      subcategory1: asset.property_type,
      subcategory2: asset.property_type,
      country: asset.location?.split(',')[1]?.trim() || 'España',
      city: asset.location?.split(',')[0]?.trim() || asset.location,
      area: '100', // Valor por defecto
      expectedReturn: 7.5, // Valor por defecto
      priceAmount: asset.price,
      priceCurrency: 'EUR',
      description: asset.description,
      creado: asset.created_at,
      user_id: asset.user_id,
      files: [],
      // Añadir el ID formateado para visualización
      displayId: generateFormattedId(asset.id)
    }));
  };

  const filteredAssets = allAssets.filter((asset) => {
    const lowercasedFilter = locationFilter.toLowerCase();
    
    const priceMatch = priceRangeFilter.min === undefined ||
                     (asset.priceAmount >= (priceRangeFilter.min || 0) &&
                      asset.priceAmount <= (priceRangeFilter.max || Infinity));

    const profitabilityMatch = profitabilityRangeFilter.min === undefined ||
                             (asset.expectedReturn >= (profitabilityRangeFilter.min || 0) &&
                              asset.expectedReturn <= (profitabilityRangeFilter.max || Infinity));

    const categoryMatch = categoryFilter === '' || asset.category === categoryFilter;

    return (
      (asset.city?.toLowerCase().includes(lowercasedFilter) ||
       asset.country?.toLowerCase().includes(lowercasedFilter)) &&
      priceMatch &&
      profitabilityMatch &&
      categoryMatch
    );
  });

  useEffect(() => {
    const fetchProfile = async () => {
      console.log('🔍 Starting fetchProfile...');
      
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        console.log('👤 User:', user);
        console.log('❌ User Error:', userError);
        
        if (userError) {
          console.error('Error getting user:', userError);
          return;
        }
        
        if (user) {
          console.log('🔍 Creating basic profile for user:', user.id);
          
          // Crear un perfil básico sin consultar la tabla profiles
          const basicProfile = {
            id: user.id,
            role: 'buyer_mandatary' as const,
            registrationDate: user.created_at,
            isApproved: true,
            fullName: user.email?.split('@')[0] || 'Usuario',
            email: user.email || '',
            assetsCount: 0,
            requestsCount: 0
          };
          
          console.log('✅ Setting basic profile:', basicProfile);
          setUserProfile(basicProfile);
          
          // Verificar si es admin basado en el email
          if (user.email === 'admin@gmail.com') {
            console.log('👑 User is admin');
            setIsAdmin(true);
          }
        } else {
          console.log('❌ No user found');
        }
      } catch (error) {
        console.error('💥 Error in fetchProfile:', error);
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
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
    const fetchUserAssets = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Usar tabla 'assets'
        const { data: assets } = await supabase
          .from('assets')
          .select('*')
          .eq('user_id', user.id);
      setUserAssets(assets || []);
      }
    };

    fetchUserAssets();
  }, []);

  useEffect(() => {
    const fetchAllAssets = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: assets, error } = await supabase
          .from('assets')
          .select('id, title, description, price, location, property_type, status, user_id, created_at')
          .neq('user_id', user.id);

        if (error) {
          console.error("Error fetching all assets:", error);
          toast({
            title: "Error al cargar activos",
            description: `No se pudieron cargar los activos: ${error.message}`,
            variant: "destructive",
          });
        } else {
          console.log("Fetched all assets:", assets);
          // Mapear los datos al tipo Asset
          const mappedAssets = mapAssetsData(assets || []);
          setAllAssets(mappedAssets);
        }
      }
    };

    fetchAllAssets();
  }, []);

  useEffect(() => {
    const fetchUserRequests = async () => {
      if (userProfile?.id) {
        const { data: requests, error } = await supabase
          .from('infoactivo')
          .select('*')
          .eq('user_id', userProfile.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error("Error fetching user requests:", error);
          toast({
            title: "Error al cargar solicitudes",
            description: `No se pudieron cargar sus solicitudes: ${error.message}`,
            variant: "destructive",
          });
        } else {
          const formattedRequests: InformationRequest[] = (requests || []).map(req => ({
            id: req.id,
            assetId: req.activo_id,
            requesterId: req.user_id,
            status: req.estado || 'pending',
            creado: req.created_at,
            updatedAt: req.updated_at || req.created_at,
            notes: req.mensaje,
          }));
          setUserRequests(formattedRequests);
        }
      }
    };

    fetchUserRequests();
  }, [userProfile, toast]);

  const handleRequestInfo = (asset: Asset) => {
    setSelectedAsset(asset);
    setIsRequestFormOpen(true);
  };

  const handleRequestSuccess = () => {
    setIsRequestFormOpen(false);
     if (userProfile?.id) {
        const fetchUserRequests = async () => {
            const { data: requests, error } = await supabase
              .from('infoactivo')
              .select('*')
              .eq('user_id', userProfile.id)
              .order('created_at', { ascending: false });

            if (!error && requests) {
                 const formattedRequests: InformationRequest[] = (requests || []).map(req => ({
                    id: req.id,
                    assetId: req.activo_id,
                    requesterId: req.user_id,
                    status: req.estado || 'pending',
                    creado: req.created_at,
                    updatedAt: req.updated_at || req.created_at,
                    notes: req.mensaje,
                 }));
                 setUserRequests(formattedRequests);
                 setUserProfile(prevProfile => {
                    if (!prevProfile) return null;
                    return { ...prevProfile, requestsCount: formattedRequests.length };
                 });
            }
        };
        fetchUserRequests();
     }
  };


  const handleAssetSubmit = () => {
  };

  const handleDeleteUserAsset = async (assetId: string) => {
    if (!window.confirm('¿Estás seguro de que quieres borrar este activo? Esta acción no se puede deshacer.')) {
      return;
    }
    try {
      await deleteAssetFromSupabase(assetId);
      setUserAssets(prevAssets => prevAssets.filter(asset => asset.id !== assetId));
      if (userProfile) {
        setUserProfile(prevProfile => ({
          ...prevProfile!,
          assetsCount: (prevProfile?.assetsCount || 0) - 1
        }));
      }
      toast({
        title: 'Activo Borrado',
        description: `Tu activo con ID ${assetId.substring(0,8)}... ha sido borrado.`,
      });
    } catch (error: any) {
      console.error('Error deleting user asset:', error);
      toast({
        title: 'Error al Borrar Activo',
        description: error.message || 'Ocurrió un problema al intentar borrar tu activo.',
        variant: 'destructive',
      });
    }
  };

  const handleSignNda = async (requestId: string) => {
    console.log("Attempting to sign NDA for request:", requestId);
    try {
      const { error } = await supabase
        .from('infoactivo')
        .update({ estado: 'nda_received', nda_firmado: true })
        .eq('id', requestId);

      if (error) {
        if (error.message.includes('column "nda_firmado" does not exist')) {
           console.warn("Column 'nda_firmado' does not exist in 'infoactivo'. Skipping update for this column.");
           const { error: fallbackError } = await supabase
             .from('infoactivo')
             .update({ estado: 'nda_received' })
             .eq('id', requestId);
           if (fallbackError) throw fallbackError;
        } else {
          throw error;
        }
      }

      setUserRequests(prevRequests =>
        prevRequests.map(req =>
          req.id === requestId ? { ...req, status: 'nda_received' } : req
        )
      );

      toast({
        title: 'NDA Firmado (Simulado)',
        description: 'El estado de la solicitud se ha actualizado a NDA Recibido.',
      });

    } catch (error: any) {
      console.error('Error signing NDA (updating status):', error);
      toast({
        title: 'Error al Firmar NDA',
        description: error.message || 'Hubo un problema al actualizar el estado de la solicitud.',
        variant: 'destructive',
      });
    }
  };

  const handleViewFiles = (requestId: string) => {
    console.log("Viewing files for request:", requestId);
    toast({ title: "Funcionalidad no implementada", description: "La visualización de archivos aún no está conectada." });
  };

  const getAssetById = (id: string) => {
    return userAssets.find(asset => asset.id === id) || allAssets.find(asset => asset.id === id);
  };

  const mockAssets = filteredAssets;

  if (!isAdmin && authChecked) {
    return (
      <div className="container mx-auto p-4 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-3">
            {userProfile && <UserProfile user={userProfile} />}
          </div>

          <div className="lg:col-span-3 ">
            <Tabs defaultValue="discover" className="w-full">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                <TabsList className="order-2 md:order-1 grid w-full grid-cols-1 sm:grid-cols-2 md:w-auto md:inline-flex border-[#E1D48A] mt-2 md:mt-0">
                  <TabsTrigger value="discover" className="data-[state=active]:border-[#E1D48A] data-[state=active]:border-b-2">
                    Descubrir Activos
                  </TabsTrigger>
                  <TabsTrigger value="my-assets" className="data-[state=active]:border-[#E1D48A] data-[state=active]:border-b-2">
                    Mis Activos
                  </TabsTrigger>
                  <TabsTrigger value="requests" className="data-[state=active]:border-[#E1D48A] data-[state=active]:border-b-2">
                    Mis Solicitudes
                  </TabsTrigger>
                  <TabsTrigger value="new-asset" className="data-[state=active]:border-[#E1D48A] data-[state=active]:border-b-2">
                    Subir Activo
                  </TabsTrigger>
                </TabsList>
                <div className="order-1 md:order-2 grid grid-cols-2 md:flex items-center gap-2 w-full md:w-auto md:self-center mb-2 md:mb-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setViewMode('card')}

                    className={viewMode === 'card' ? 'bg-[#2A3928]/90 text-white border-[#E1D48A]' : ''}
                  >
                    <LayoutGrid className="h-4 w-4 mr-2" />
                    Vista Tarjeta
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setViewMode('list')}

                    className={viewMode === 'list' ? 'bg-[#2A3928]/90 text-white border-[#E1D48A]' : ''}
                  >
                    <List className="h-4 w-4 mr-2" />
                    Vista Lista
                  </Button>
                </div>
              </div>

              <TabsContent value="discover" className="mt-16 md:mt-6 max-h-[calc(100vh-20rem)] overflow-y-auto">
                <div className="flex flex-wrap gap-2 mb-4 items-end"> {/* Changed to flex, added items-end for alignment */}
                  <div className="flex-grow sm:flex-grow-0 sm:w-auto md:w-[calc(20%-0.5rem)]"> {/* Adjusted width for 5 filters */}
                    {/* <label htmlFor="location">Localización:</label> */}
                    <input
                      type="text"
                      id="location"
                      placeholder="Localización..."
                      className="border rounded px-2 py-1 w-full h-9 text-sm"
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                    />
                  </div>
                  <div className="flex-grow sm:flex-grow-0 sm:w-auto md:w-[calc(20%-0.5rem)]">
                    {/* <label htmlFor="profitability">Rentabilidad:</label> */}
                    <select
                      id="profitability"
                      className="border rounded px-2 py-1 w-full h-9 text-sm"
                      value={
                        profitabilityRangeFilter.min === undefined && profitabilityRangeFilter.max === undefined
                          ? 'all'
                          : `${profitabilityRangeFilter.min || 0}-${profitabilityRangeFilter.max || 100}`
                      }
                      onChange={(e) => {
                        if (e.target.value === 'all') {
                          setProfitabilityRangeFilter({min: undefined, max: undefined});
                        } else {
                          const [min, max] = e.target.value.split('-').map(Number);
                          setProfitabilityRangeFilter({min, max});
                        }
                      }}
                    >
                      <option value="all">Rentabilidad</option> {/* Changed placeholder */}
                      <option value="0-5">0% - 5%</option>
                      <option value="5-10">5% - 10%</option>
                      <option value="10-15">10% - 15%</option>
                      <option value="15-20">15% - 20%</option>
                      <option value="20-25">20% - 25%</option>
                      <option value="25-100">Más de 25%</option>
                    </select>
                  </div>
                  <div className="flex-grow sm:flex-grow-0 sm:w-auto md:w-[calc(20%-0.5rem)]">
                    {/* <label htmlFor="category">Categoría:</label> */}
                    <select
                      id="category"
                      className="border rounded px-2 py-1 w-full h-9 text-sm"
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                      <option value="">Categoría</option> {/* Changed placeholder */}
                      {mainCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-grow sm:flex-grow-0 sm:w-auto md:w-[calc(20%-0.5rem)]">
                    {/* <label htmlFor="purpose">Propósito:</label> */}
                    <select
                      id="purpose"
                      className="border rounded px-2 py-1 w-full h-9 text-sm"
                      value={purposeFilter}
                      onChange={(e) => setPurposeFilter(e.target.value)}
                    >
                      <option value="">Propósito</option> {/* Changed placeholder */}
                      <option value="sale">En Venta</option>
                      <option value="purchase">Para Compra</option>
                      <option value="need">Necesidad</option>
                    </select>
                  </div>
                  <div className="flex-grow sm:flex-grow-0 sm:w-auto md:w-[calc(20%-0.5rem)]">
                    {/* <label htmlFor="price">Precio:</label> */}
                    <select
                      id="price"
                      className="border rounded px-2 py-1 w-full h-9 text-sm"
                      value={
                        priceRangeFilter.min === undefined && priceRangeFilter.max === undefined
                          ? 'all'
                          : `${priceRangeFilter.min || 0}-${priceRangeFilter.max || 99999999}`
                      }
                      onChange={(e) => {
                        if (e.target.value === 'all') {
                          setPriceRangeFilter({min: undefined, max: undefined});
                        } else {
                          const [min, max] = e.target.value.split('-').map(Number);
                          setPriceRangeFilter({min, max});
                        }
                      }}
                    >
                      <option value="all">Precio</option> {/* Changed placeholder */}
                      <option value="0-100000">$0 - $100,000</option>
                      <option value="100000-500000">$100,000 - $500,000</option>
                      <option value="500000-1000000">$500,000 - $1,000,000</option>
                      <option value="1000000-3000000">$1,000,000 - $3,000,000</option>
                      <option value="3000000-5000000">$3,000,000 - $5,000,000</option>
                      <option value="5000000-10000000">$5,000,000 - $10,000,000</option>
                      <option value="10000000-99999999">Más de $10,000,000</option>
                    </select>
                  </div>
                </div>
                {viewMode === 'card' ? (
                  <AssetList
                    assets={mockAssets}
                    location={locationFilter}
                    profitability={profitabilityRangeFilter.min !== undefined ? `${profitabilityRangeFilter.min}-${profitabilityRangeFilter.max}` : ''}
                    price={priceRangeFilter.min !== undefined ? `${priceRangeFilter.min}-${priceRangeFilter.max}` : ''}
                    purpose={purposeFilter}
                    onRequestInfo={(assetId) => handleRequestInfo(getAssetById(assetId))}
                    buttonStyle="bg-[#E1D48A] hover:bg-[#E1D48A]/90 text-estate-navy"
                  />
                ) : (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>ID</TableHead>
                              <TableHead>Categoría</TableHead>
                              <TableHead>Localización</TableHead>
                              <TableHead>Precio</TableHead>
                              <TableHead>Retorno</TableHead>
                              <TableHead className="text-right">Acción</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {mockAssets.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-estate-steel">
                                  No se encontraron activos con los filtros seleccionados.
                                </TableCell>
                              </TableRow>
                            ) : (
                              mockAssets.map(asset => (
                              <TableRow key={asset.id}>
                                  <TableCell className="font-medium text-xs">{asset.id}</TableCell>
                                  <TableCell>
                                    {asset.category}
                                    {asset.subcategory1 && ` > ${asset.subcategory1}`}
                                    {asset.subcategory2 && ` > ${asset.subcategory2}`}
                                  </TableCell>
                                  <TableCell>{asset.city}, {asset.country}</TableCell>
                                  <TableCell>{formatCurrency(asset.priceAmount, asset.priceCurrency)}</TableCell>
                                  <TableCell>{asset.expectedReturn ? `${asset.expectedReturn}%` : '-'}</TableCell>
                                  <TableCell className="text-right">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleRequestInfo(asset)}
                                      className="flex items-center gap-1 bg-[#E1D48A] hover:bg-[#E1D48A]/90 text-estate-navy"
                                    >
                                      <Info className="h-3 w-3" />
                                      <span>Solicitar</span>
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                )}
                <RequestForm
                  asset={selectedAsset}
                  open={isRequestFormOpen}
                  onClose={() => setIsRequestFormOpen(false)}
                  onSuccess={handleRequestSuccess}
                  buttonStyle="bg-[#E1D48A] hover:bg-[#E1D48A]/90 text-estate-navy"
                />
              </TabsContent>

              <TabsContent value="my-assets" className="mt-16 md:mt-6 space-y-6 max-h-[calc(100vh-20rem)] overflow-y-auto">
                <Card>
                  <CardHeader>
                    <CardTitle>Mis Activos Enviados</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {userAssets.length === 0 ? (
                      <div className="text-center py-8 bg-estate-offwhite rounded-md">
                        <p className="text-estate-steel">Aún no ha enviado ningún activo.</p>
                      </div>
                    ) : viewMode === 'card' ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {userAssets.map(asset => (
                          <AssetCard
                            key={asset.id}
                            asset={asset}
                            onDeleteAsset={handleDeleteUserAsset}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>ID</TableHead>
                              <TableHead>Categoría</TableHead>
                              <TableHead>Localización</TableHead>
                              <TableHead>Precio</TableHead>
                              <TableHead>Retorno</TableHead>
                              <TableHead>Fecha Creación</TableHead>
                              <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {userAssets.map(asset => (
                              <TableRow key={asset.id}>
                                <TableCell className="font-medium text-xs truncate" title={asset.id}>{asset.id.substring(0,8)}...</TableCell>
                                <TableCell>
                                  {asset.category}
                                  {asset.subcategory1 && ` > ${asset.subcategory1}`}
                                  {asset.subcategory2 && ` > ${asset.subcategory2}`}
                                </TableCell>
                                <TableCell>{asset.city}, {asset.country}</TableCell>
                                <TableCell>{formatCurrency(asset.priceAmount, asset.priceCurrency)}</TableCell>
                                <TableCell>{asset.expectedReturn ? `${asset.expectedReturn}%` : '-'}</TableCell>
                                <TableCell>{safeDateParser(asset.creado)?.toLocaleDateString('es-ES') ?? 'Fecha inválida'}</TableCell>
                                <TableCell className="text-right">
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleDeleteUserAsset(asset.id)}
                                    className="flex items-center gap-1"
                                  >
                                    <Trash2 className="h-3 w-3 mr-1" />
                                    Borrar
                                  </Button>
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

              <TabsContent value="requests" className="mt-16 md:mt-6 max-h-[calc(100vh-20rem)] overflow-y-auto">
                <Card>
                  <CardHeader>
                    <CardTitle>Solicitudes de Información</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {userRequests.length === 0 ? (
                      <div className="text-center py-8 bg-estate-offwhite rounded-md">
                        <p className="text-estate-steel">Aún no ha realizado ninguna solicitud de información.</p>
                      </div>
                    ) : viewMode === 'list' ? (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>ID Solicitud</TableHead>
                              <TableHead>Activo (ID/Cat)</TableHead>
                              <TableHead>Fecha Solicitud</TableHead>
                              <TableHead>Estado</TableHead>
                              <TableHead className="text-left">Acción</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {userRequests.map(request => {
                              const asset = getAssetById(request.assetId);
                              return (
                                <TableRow key={request.id}>
                                  <TableCell className="font-medium text-xs truncate" title={request.id}>{request.id.substring(0,8)}...</TableCell>
                                  <TableCell>
                                    <div className="flex flex-col">
                                      <span className="text-xs text-gray-500 truncate" title={request.assetId}>ID: {request.assetId.substring(0,8)}...</span>
                                      <span>{asset?.category || 'N/A'}</span>
                                    </div>
                                  </TableCell>
                                  <TableCell>{safeDateParser(request.creado)?.toLocaleDateString('es-ES') ?? 'Fecha inválida'}</TableCell>
                                  <TableCell><StatusBadge status={request.status} /></TableCell>
                                  <TableCell className="text-left">
                                    {request.status === 'approved' && <span className="text-sm text-gray-500 italic">Esperando acción del admin</span>}
                                    {request.status === 'nda_requested' && (
                                      <Button size="sm" variant="outline" onClick={() => handleSignNda(request.id)} className="flex items-center gap-1 w-full border-gray-300 hover:bg-gray-600 hover:text-white">
                                        <FileText className="h-3 w-3 mr-1" /> Firmar NDA
                                      </Button>
                                    )}
                                    {request.status === 'nda_received' && <span className="text-sm text-gray-500 italic">Esperando acción del admin</span>}
                                    {request.status === 'information_shared' && (
                                      <Button size="sm" variant="outline" onClick={() => handleViewFiles(request.id)} className="flex items-center gap-1 w-full border-gray-300 hover:bg-gray-600 hover:text-white">
                                        <Eye className="h-3 w-3 mr-1" /> Ver Documentación
                                      </Button>
                                    )}
                                    {request.status === 'rejected' && <span className="text-sm text-red-600 font-medium">Rechazada</span>}
                                    {request.status === 'pending' && <span className="text-sm text-gray-500 italic">Pendiente</span>}
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {userRequests.map(request => {
                                const asset = getAssetById(request.assetId);
                                return (
                                    <Card key={request.id} className="flex flex-col">
                                        <CardHeader>
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <CardTitle className="text-sm">Solicitud ID: <span className="font-normal text-xs text-gray-600 truncate" title={request.id}>{request.id.substring(0,8)}...</span></CardTitle>
                                                    <p className="text-xs text-gray-500">Activo ID: <span title={request.assetId}>{request.assetId.substring(0,8)}...</span> ({asset?.category || 'N/A'})</p>
                                                </div>
                                                <StatusBadge status={request.status} />
                                            </div>
                                        </CardHeader>
                                        <CardContent className="flex-grow space-y-1 text-xs">
                                            <p><strong>Ubicación Activo:</strong> {asset ? `${asset.city}, ${asset.country}` : 'N/A'}</p>
                                            <p><strong>Fecha Solicitud:</strong> {safeDateParser(request.creado)?.toLocaleDateString('es-ES') ?? 'Fecha inválida'}</p>
                                            {request.notes && <p className="truncate" title={request.notes}><strong>Mensaje:</strong> {request.notes}</p>}
                                        </CardContent>
                                        <CardFooter className="pt-2 flex justify-end">
                                            {request.status === 'approved' && <span className="text-xs text-gray-500 italic">Esperando acción del admin</span>}
                                            {request.status === 'nda_requested' && (
                                              <Button size="sm" variant="outline" onClick={() => handleSignNda(request.id)} className="flex items-center gap-1 w-full text-xs border-gray-300 hover:bg-gray-600 hover:text-white">
                                                <FileText className="h-3 w-3 mr-1" /> Firmar NDA
                                              </Button>
                                            )}
                                            {request.status === 'nda_received' && <span className="text-xs text-gray-500 italic">Esperando acción del admin</span>}
                                            {request.status === 'information_shared' && (
                                              <Button size="sm" variant="outline" onClick={() => handleViewFiles(request.id)} className="flex items-center gap-1 w-full text-xs border-gray-300 hover:bg-gray-600 hover:text-white">
                                                <Eye className="h-3 w-3 mr-1" /> Ver Documentación
                                              </Button>
                                            )}
                                            {request.status === 'rejected' && <span className="text-xs text-red-600 font-medium">Rechazada</span>}
                                            {request.status === 'pending' && <span className="text-xs text-gray-500 italic">Pendiente</span>}
                                        </CardFooter>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="new-asset" className="mt-16 md:mt-6 space-y-6 max-h-[calc(100vh-20rem)] overflow-y-auto">
                {userProfile ? (
                  <AssetForm
                    onSubmit={handleAssetSubmit}
                    userId={userProfile.id}
                    userName={userProfile.fullName}
                  />
                ) : (
                  <div className="flex items-center justify-center p-8">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-estate-navy mx-auto mb-4"></div>
                      <p className="text-estate-steel">Cargando formulario...</p>
                      <p className="text-sm text-estate-steel mt-2">userProfile: {userProfile ? 'Loaded' : 'Loading...'}</p>
                      <p className="text-xs text-estate-steel mt-1">Revisa la consola para más detalles</p>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default Dashboard;
