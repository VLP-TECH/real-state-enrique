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
import { FileText, Info, List, LayoutGrid } from 'lucide-react';
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
  const [assetTypeFilter, setAssetTypeFilter] = useState('');
  const [priceRangeFilter, setPriceRangeFilter] = useState<{min: number | undefined, max: number | undefined}>({min: undefined, max: undefined});

  // Filtrar los activos usando tanto la ciudad como el país
  const filteredAssets = allAssets.filter((asset) => {
    const lowercasedFilter = locationFilter.toLowerCase();
    const priceMatch = priceRangeFilter.min === undefined || 
                     (asset.priceAmount >= (priceRangeFilter.min || 0) && 
                      asset.priceAmount <= (priceRangeFilter.max || Infinity));
    
    const profitabilityMatch = profitabilityRangeFilter.min === undefined || 
                             (asset.expectedReturn >= (profitabilityRangeFilter.min || 0) && 
                              asset.expectedReturn <= (profitabilityRangeFilter.max || Infinity));
                              
    const assetTypeMatch = assetTypeFilter === '' || asset.type === assetTypeFilter;

    return (
      (asset.city?.toLowerCase().includes(lowercasedFilter) ||
       asset.country?.toLowerCase().includes(lowercasedFilter)) &&
      priceMatch &&
      profitabilityMatch &&
      assetTypeMatch // Add the asset type check here
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

          setUserProfile({
            id: user.id,
            role: profile.role || 'buyer_mandatary',
            registrationDate: user.created_at,
            isApproved: profile.is_approved || false,
            fullName: profile.full_name || '',
            email: user.email || '',
            assetsCount: count || 0,
            requestsCount: 0
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
        const { data: assets } = await supabase
          .from('activos')
          .select('*')
          .neq('user_id', user.id);
        setAllAssets(assets || []);
      }
    };

    fetchAllAssets();
  }, []);

  const handleRequestInfo = (asset: Asset) => {
    setSelectedAsset(asset);
    setIsRequestFormOpen(true);
  };

  const handleRequestSubmit = () => {
    setIsRequestFormOpen(false);
    // Aquí puedes agregar lógica para actualizar solicitudes después del envío
  };

  const handleAssetSubmit = () => {
    // Lógica post-envío de activo
  };

  const handleSignNda = (requestId: string) => {
    // Aquí va la lógica para firmar NDA
  };

  const getAssetById = (id: string) => {
    return allAssets.find(asset => asset.id === id);
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
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setViewMode(prev => prev === 'card' ? 'list' : 'card')}
                  >
                    {viewMode === 'card' ? <List className="h-4 w-4 mr-2" /> : <LayoutGrid className="h-4 w-4 mr-2" />}
                    {viewMode === 'card' ? 'Vista Lista' : 'Vista Tarjeta'}
                  </Button>
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
                    <label htmlFor="assetType">Tipo de Activo:</label>
                    <select
                      id="assetType"
                      className="border rounded px-2 py-1 w-full h-9"
                      value={assetTypeFilter}
                      onChange={(e) => setAssetTypeFilter(e.target.value)}
                    >
                      <option value="">Todos</option>
                      <option value="residential">Residencial</option>
                      <option value="commercial">Comercial</option>
                      <option value="greenfield">Greenfield</option>
                      <option value="brownfield">Brownfield</option>
                      <option value="land">Terreno</option>
                      <option value="hotel">Hotel</option>
                      <option value="industrial">Industrial</option>
                      <option value="mixed">Mixto</option>
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
                    assetType={assetTypeFilter}
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
                              <TableHead>Tipo</TableHead>
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
                                  <TableCell className="capitalize">{asset.type}</TableCell>
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
                  onSubmit={handleRequestSubmit}
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
                              const asset = getAssetById(request.assetId);
                              return (
                                <TableRow key={request.id}>
                                  <TableCell className="font-medium">{request.id}</TableCell>
                                  <TableCell>
                                    <div className="flex flex-col">
                                      <span>{asset?.id}</span>
                                      <span className="text-xs text-estate-steel">{asset?.type} en {asset?.city}</span>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    {safeDateParser(asset.creado)?.toLocaleDateString('es-ES') ?? 'Fecha inválida'}
                                  </TableCell>
                                  <TableCell>
                                    <StatusBadge status={request.status} />
                                  </TableCell>
                                  <TableCell className="text-left">
                                    {request.status === 'nda_requested' && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleSignNda(request.id)}
                                        className="flex items-center gap-1 w-full"
                                      >
                                        <FileText className="h-3 w-3" />
                                        <span>Firmar NDA</span>
                                      </Button>
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
