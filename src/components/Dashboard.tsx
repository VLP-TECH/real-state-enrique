import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserProfile from './UserProfile';
import AssetForm from './AssetForm';
import AssetList from './AssetList';
import RequestForm from './RequestForm';
import AssetCard from './AssetCard';
import { Asset, AssetFormData, InformationRequest, User } from '@/utils/types';
import StatusBadge from './StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { FileText, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/supabaseClient';
import checkUserSession from '@/components/AuthManager';

const mockUser: User = {
  id: 'ZX_2301',
  role: 'buyer_mandatary',
  registrationDate: '2023-05-15T12:00:00Z',
  isApproved: true,
  fullName: 'John Doe',
  email: 'john@example.com',
  assetsCount: 3,
  requestsCount: 5,
};

const mockAssets: Asset[] = [
  {
    id: 'AS_1001',
    purpose: 'sale',
    type: 'residential',
    location: {
      country: 'Spain',
      city: 'Madrid',
      area: 'Salamanca',
    },
    expectedReturn: 6.5,
    price: {
      amount: 2500000,
      currency: 'EUR',
    },
    description: 'Luxury residential building with 10 units in prime location.',
    createdAt: '2023-07-10T09:30:00Z',
    ownerId: 'ZX_1123',
  },
  {
    id: 'AS_1002',
    purpose: 'sale',
    type: 'commercial',
    location: {
      country: 'Portugal',
      city: 'Lisbon',
    },
    expectedReturn: 8.2,
    price: {
      amount: 4800000,
      currency: 'EUR',
    },
    description: 'Office building with long-term tenants and stable cash flow.',
    createdAt: '2023-06-22T14:15:00Z',
    ownerId: 'ZX_1124',
  },
  {
    id: 'AS_1003',
    purpose: 'purchase',
    type: 'hotel',
    location: {
      country: 'Italy',
      city: 'Milan',
    },
    expectedReturn: 7.5,
    price: {
      amount: 12000000,
      currency: 'EUR',
    },
    description: 'Looking for a 4-5 star hotel property with at least 100 rooms.',
    createdAt: '2023-08-05T11:45:00Z',
    ownerId: 'ZX_2301',
  },
  {
    id: 'AS_1004',
    purpose: 'sale',
    type: 'land',
    location: {
      country: 'Spain',
      city: 'Barcelona',
      area: 'Metropolitan Area',
    },
    expectedReturn: 15.0,
    price: {
      amount: 8500000,
      currency: 'EUR',
    },
    description: 'Development land with permits for residential complex.',
    createdAt: '2023-08-01T10:20:00Z',
    ownerId: 'ZX_1126',
  },
  {
    id: 'AS_1005',
    purpose: 'need',
    type: 'industrial',
    location: {
      country: 'Germany',
      city: 'Frankfurt',
    },
    price: {
      amount: 7000000,
      currency: 'EUR',
    },
    description: 'Looking for logistics warehouse, minimum 10,000 sqm.',
    createdAt: '2023-07-25T16:30:00Z',
    ownerId: 'ZX_1127',
  },
  {
    id: 'AS_1006',
    purpose: 'sale',
    type: 'greenfield',
    location: {
      country: 'France',
      city: 'Nice',
    },
    expectedReturn: 12.3,
    price: {
      amount: 3200000,
      currency: 'EUR',
    },
    description: 'Development opportunity near tourist attractions.',
    createdAt: '2023-06-15T08:45:00Z',
    ownerId: 'ZX_1128',
  },
];

const mockRequests: InformationRequest[] = [
  {
    id: 'RQ_3001',
    assetId: 'AS_1001',
    requesterId: 'ZX_2301',
    status: 'approved',
    createdAt: '2023-08-10T11:20:00Z',
    updatedAt: '2023-08-11T09:15:00Z',
  },
  {
    id: 'RQ_3002',
    assetId: 'AS_1002',
    requesterId: 'ZX_2301',
    status: 'nda_requested',
    createdAt: '2023-08-12T14:30:00Z',
    updatedAt: '2023-08-13T08:45:00Z',
    ndaLink: 'https://example.com/nda-document.pdf',
  },
  {
    id: 'RQ_3003',
    assetId: 'AS_1004',
    requesterId: 'ZX_2301',
    status: 'nda_received',
    createdAt: '2023-08-05T09:10:00Z',
    updatedAt: '2023-08-07T16:20:00Z',
    ndaSignedDate: '2023-08-07T16:15:00Z',
  },
  {
    id: 'RQ_3004',
    assetId: 'AS_1006',
    requesterId: 'ZX_2301',
    status: 'information_shared',
    createdAt: '2023-07-28T10:45:00Z',
    updatedAt: '2023-08-02T14:30:00Z',
    ndaSignedDate: '2023-07-30T11:20:00Z',
    sharedInfoLink: 'https://dropbox.com/shared-link-12345',
  },
  {
    id: 'RQ_3005',
    assetId: 'AS_1005',
    requesterId: 'ZX_2301',
    status: 'rejected',
    createdAt: '2023-08-08T13:15:00Z',
    updatedAt: '2023-08-09T10:30:00Z',
    notes: 'Outside of investment criteria.',
  },
];

const Dashboard: React.FC = () => {
  const { toast } = useToast();
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [isRequestFormOpen, setIsRequestFormOpen] = useState(false);
  const [userAssets, setUserAssets] = useState<Asset[]>(mockAssets.filter(asset => asset.ownerId === mockUser.id));
  const [userRequests, setUserRequests] = useState<InformationRequest[]>(mockRequests);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
  
      if (user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
          
        if (profile) {
          // Actualiza el estado del perfil del usuario
          setUserProfile({
            id: user.id,
            role: profile.role || 'buyer_mandatary', // valor por defecto
            registrationDate: user.created_at,
            isApproved: profile.is_approved || false,
            fullName: profile.full_name || '',
            email: user.email || '',
            assetsCount: 0, // puedes obtener esto de otra consulta
            requestsCount: 0 // puedes obtener esto de otra consulta
          });
          
          if (profile.admin) {
            setIsAdmin(true);
          }
        }
      } else {
        console.log('No user is authenticated');
      }
    };
  
    fetchProfile();
  }, []); 

  const handleRequestInfo = (assetId: string) => {
    const asset = mockAssets.find(a => a.id === assetId);
    if (asset) {
      setSelectedAsset(asset);
      setIsRequestFormOpen(true);
    }
  };

  const handleRequestSubmit = (assetId: string, notes: string) => {
    // Lógica para manejar el envío de solicitudes
  };

  const handleSignNda = (requestId: string) => {
    // Lógica para manejar la firma de NDA
  };

  const handleAssetSubmit = (data: AssetFormData) => {
    // Lógica para manejar el envío de activos
  };  

  const getAssetById = (assetId: string) => {
    return mockAssets.find(asset => asset.id === assetId) || null;
  };  

  if (!userProfile) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4 space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-3">
          <UserProfile user={mockUser} />
        </div>
        
        <div className="lg:col-span-3">
          <Tabs defaultValue="discover" className="w-full">
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

              {/* Este TabsTrigger es para los Admins */}
              {isAdmin && (
                <TabsTrigger value="admin" className="data-[state=active]:border-[#E1D48A] data-[state=active]:border-b-2">
                  Panel de Admin
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="discover" className="mt-16 md:mt-6">
              <AssetList 
                assets={mockAssets.filter(asset => asset.ownerId !== mockUser.id)} 
                onRequestInfo={handleRequestInfo} 
                buttonStyle="bg-[#E1D48A] hover:bg-[#E1D48A]/90 text-estate-navy" 
              />
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
                                    <span className="text-xs text-estate-steel">{asset?.type} en {asset?.location.city}</span>
                                  </div>
                                </TableCell>
                                <TableCell>{new Date(request.createdAt).toLocaleDateString()}</TableCell>
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

            {/* Panel de Admin */}
            {isAdmin && (
              <TabsContent value="admin" className="mt-16 md:mt-6 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Gestión de Usuarios</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Aquí puedes agregar cualquier funcionalidad para el administrador, por ejemplo */}
                    <Button size="sm" variant="outline">Gestionar usuarios</Button>
                    <Button size="sm" variant="outline">Ver Logs de Actividad</Button>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
