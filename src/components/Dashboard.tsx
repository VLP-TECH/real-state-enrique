import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserProfile from './UserProfile';
import AssetForm from './AssetForm';
import RequestForm from './RequestForm';
import AssetCard from './AssetCard';
import AssetList from './AssetList';
import { Asset, InformationRequest, User } from '@/utils/types';
import StatusBadge from './StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from "@/components/ui/button";
import { FileText, Info, List, LayoutGrid, Eye } from 'lucide-react'; // Import Eye icon
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/supabaseClient';
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

  const mainCategories = [
    "Edificio Residencial", "Edificio Terciario", "Edificio Industrial",
    "Edificio Sociosanitario", "Edificio Turístico", "Activo Singular",
    "Vivienda", "Local Comercial", "Oficina", "Activo Logístico",
    "Plaza de Garaje", "Trastero", "Solar Urbano", "Suelo Urbanizable",
    "Suelo Rústico", "Solar con Proyecto", "Suelo Industrial"
  ];

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
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (profile) {
          const { count } = await supabase
            .from('activos')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);

          // Fetch request count
          const { count: requestsCount } = await supabase
            .from('infoactivo')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);

          setUserProfile({
            id: user.id,
            role: profile.role || 'buyer_mandatary',
            registrationDate: user.created_at,
            isApproved: profile.is_approved || false,
            fullName: profile.full_name || '',
            email: user.email || '',
            assetsCount: count || 0,
            requestsCount: requestsCount || 0 // Use fetched count
          });
          if (profile.admin) setIsAdmin(true);
        }
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: 'Acceso no autorizado',
          description: 'Debes iniciar sesión para acceder al dashboard',
          variant: 'destructive',
        });
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
        const { data: assets } = await supabase
          .from('activos')
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
          .from('activos')
          .select('id, purpose, category, subcategory1, subcategory2, country, city, area, expectedReturn, priceAmount, priceCurrency, description, creado, user_id')
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
          setAllAssets(assets || []);
        }
      }
    };

    fetchAllAssets();
  }, []); // Keep dependencies empty to fetch only once

  // Fetch user's specific requests
  useEffect(() => {
    const fetchUserRequests = async () => {
      if (userProfile?.id) { // Ensure we have the user ID
        const { data: requests, error } = await supabase
          .from('infoactivo')
          .select('*') // Select all columns for the request
          .eq('user_id', userProfile.id)
          .order('created_at', { ascending: false }); // Optional: order by creation date

        if (error) {
          console.error("Error fetching user requests:", error);
          toast({
            title: "Error al cargar solicitudes",
            description: `No se pudieron cargar sus solicitudes: ${error.message}`,
            variant: "destructive",
          });
        } else {
          // Map Supabase columns to InformationRequest type fields
          const formattedRequests: InformationRequest[] = (requests || []).map(req => ({
            id: req.id,
            assetId: req.activo_id,
            requesterId: req.user_id, // Map user_id to requesterId
            status: req.estado || 'pending', // Map estado to status
            creado: req.created_at, // Map created_at to creado
            updatedAt: req.updated_at || req.created_at, // Map updated_at (or fallback to created_at)
            notes: req.mensaje, // Map mensaje to notes
            // Optional fields like ndaLink etc. are not directly available in infoactivo,
            // they would need to be fetched or handled differently if required later.
          }));
          setUserRequests(formattedRequests);
        }
      }
    };

    fetchUserRequests();
  }, [userProfile, toast]); // Re-run if userProfile changes

  const handleRequestInfo = (asset: Asset) => {
    setSelectedAsset(asset);
    setIsRequestFormOpen(true);
  };

  // Renamed and updated to increment count
  const handleRequestSuccess = () => {
    setIsRequestFormOpen(false);
    // Re-fetch requests to update the list after submission
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
                 // Also update the count in the profile
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

  const handleSignNda = async (requestId: string) => {
    console.log("Attempting to sign NDA for request:", requestId);
    try {
      // Update Supabase: set estado to 'nda_received' and nda_firmado to true
      const { error } = await supabase
        .from('infoactivo')
        .update({ estado: 'nda_received', nda_firmado: true }) // Assuming 'nda_firmado' column exists
        .eq('id', requestId);

      if (error) {
        // Check if the error is due to the column not existing
        if (error.message.includes('column "nda_firmado" does not exist')) {
           console.warn("Column 'nda_firmado' does not exist in 'infoactivo'. Skipping update for this column.");
           // Attempt update without nda_firmado
           const { error: fallbackError } = await supabase
             .from('infoactivo')
             .update({ estado: 'nda_received' })
             .eq('id', requestId);
           if (fallbackError) throw fallbackError; // Throw if the fallback also fails
        } else {
          throw error; // Throw other errors
        }
      }

      // Update local state
      setUserRequests(prevRequests =>
        prevRequests.map(req =>
          req.id === requestId ? { ...req, status: 'nda_received' } : req // Update status locally
        )
      );

      toast({
        title: 'NDA Firmado (Simulado)',
        description: 'El estado de la solicitud se ha actualizado a NDA Recibido.',
        // Add actual NDA signing/verification logic here
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
    // Placeholder for actual file viewing logic
    toast({ title: "Funcionalidad no implementada", description: "La visualización de archivos aún no está conectada." });
  };

  const getAssetById = (id: string) => {
    // Look in both userAssets and allAssets
    return userAssets.find(asset => asset.id === id) || allAssets.find(asset => asset.id === id);
  };

  const mockAssets = filteredAssets; // Keep using filteredAssets for discovery tab

  if (!isAdmin && authChecked) {
    return (
      <div className="container mx-auto p-4 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-3">
            {userProfile && <UserProfile user={userProfile} />}
          </div>

          <div className="lg:col-span-3 ">
            <Tabs defaultValue="discover" className="w-full">
              <div className="flex justify-between items-center">
                <TabsList className="grid w-full md:w-auto grid-cols-3 md:inline-flex border-[#E1D48A]">
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
                <div className="flex items-center gap-2">
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

              <TabsContent value="discover" className="mt-16 md:mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div>
                    <label htmlFor="location">Localización:</label>
                    <input
                      type="text"
                      id="location"
                      className="border rounded px-2 py-1 w-full h-9"
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="profitability">Rentabilidad:</label>
                    <select
                      id="profitability"
                      className="border rounded px-2 py-1 w-full h-9"
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
                      <option value="all">Todos</option>
                      <option value="0-5">0% - 5%</option>
                      <option value="5-10">5% - 10%</option>
                      <option value="10-15">10% - 15%</option>
                      <option value="15-20">15% - 20%</option>
                      <option value="20-25">20% - 25%</option>
                      <option value="25-100">Más de 25%</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="category">Categoría:</label>
                    <select
                      id="category"
                      className="border rounded px-2 py-1 w-full h-9"
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                      <option value="">Todas</option>
                      {mainCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="price">Precio:</label>
                    <select
                      id="price"
                      className="border rounded px-2 py-1 w-full h-9"
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
                      <option value="all">Todos</option>
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
                  onSuccess={handleRequestSuccess} // Changed prop name
                  buttonStyle="bg-[#E1D48A] hover:bg-[#E1D48A]/90 text-estate-navy"
                />
              </TabsContent>

              <TabsContent value="my-assets" className="mt-16 md:mt-6 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Mis Activos Enviados</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {userAssets.length === 0 ? (
                      <div className="text-center py-8 bg-estate-offwhite rounded-md">
                        <p className="text-estate-steel">Aún no ha enviado ningún activo.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {userAssets.map(asset => (
                          <AssetCard key={asset.id} asset={asset} />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="requests" className="mt-16 md:mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Solicitudes de Información</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {userRequests.length === 0 ? (
                      <div className="text-center py-8 bg-estate-offwhite rounded-md">
                        <p className="text-estate-steel">Aún no ha realizado ninguna solicitud de información.</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>ID de Solicitud</TableHead>
                              <TableHead>Activo</TableHead>
                              <TableHead>Fecha</TableHead>
                              <TableHead>Estado</TableHead>
                              <TableHead className="text-left">Acción</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {userRequests.map(request => {
                              const asset = getAssetById(request.assetId); // Use updated getAssetById
                              return (
                                <TableRow key={request.id}>
                                  <TableCell className="font-medium text-xs">{request.id}</TableCell> {/* Use request ID */}
                                  <TableCell>
                                    <div className="flex flex-col">
                                      {/* Display asset details if found, otherwise just the ID */}
                                      <span>ID: {request.assetId}</span>
                                      {asset && (
                                        <span className="text-xs text-estate-steel">
                                          {asset.category} {asset.city && `en ${asset.city}`}
                                        </span>
                                      )}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    {/* Use creado from the request object */}
                                    {safeDateParser(request.creado)?.toLocaleDateString('es-ES') ?? 'Fecha inválida'}
                                  </TableCell>
                                  <TableCell>
                                    <StatusBadge status={request.status} /> {/* Use status from request */}
                                  </TableCell>
                                  <TableCell className="text-left">
                                    {/* Conditional Actions based on status */}
                                    {request.status === 'approved' && (
                                      <span className="text-sm text-gray-500 italic">Esperando acción del administrador</span>
                                    )}
                                    {request.status === 'nda_requested' && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleSignNda(request.id)}
                                        className="flex items-center gap-1 w-full hover:bg-gray-100"
                                      >
                                        <FileText className="h-3 w-3 mr-1" />
                                        <span>Firmar NDA</span>
                                      </Button>
                                    )}
                                    {request.status === 'nda_received' && (
                                      // Display message after user signs NDA
                                      <span className="text-sm text-gray-500 italic">Esperando acción del administrador</span>
                                    )}
                                    {request.status === 'information_shared' && (
                                      <Button
                                        size="sm"
                                        variant="outline" // Using outline for consistency, adjust if needed
                                        onClick={() => handleViewFiles(request.id)}
                                        className="flex items-center gap-1 w-full border-gray-300 hover:bg-gray-600 hover:text-white" // Added darker hover
                                      >
                                        <Eye className="h-3 w-3 mr-1" />
                                        <span>Ver Archivos</span>
                                      </Button>
                                    )}
                                    {request.status === 'rejected' && (
                                      <span className="text-sm text-red-600 font-medium">Solicitud rechazada</span>
                                    )}
                                     {request.status === 'pending' && (
                                      <span className="text-sm text-gray-500 italic">Pendiente de revisión</span>
                                    )}
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="new-asset" className="mt-16 md:mt-6 space-y-6">
                <AssetForm onSubmit={handleAssetSubmit} />
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
