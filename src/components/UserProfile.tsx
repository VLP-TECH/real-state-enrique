
import React, { useState, useEffect } from 'react'; // Import useState and useEffect
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { User, UserRole } from "@/utils/types";
import { Button } from "./ui/button";
import { supabase } from '@/supabaseClient';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import AuthManager from '@/components/AuthManager';

interface UserProfileProps {
  user: User;
}

const UserProfile: React.FC<UserProfileProps> = ({ user }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { handleLogout } = AuthManager();

  // State for admin counts
  const [totalAssetsCount, setTotalAssetsCount] = useState<number | null>(null);
  const [totalInfoRequestsCount, setTotalInfoRequestsCount] = useState<number | null>(null);
  const [totalRegistrationRequestsCount, setTotalRegistrationRequestsCount] = useState<number | null>(null);
  const [loadingAdminCounts, setLoadingAdminCounts] = useState<boolean>(false);

  useEffect(() => {
    const fetchAdminCounts = async () => {
      if (user && user.admin) {
        setLoadingAdminCounts(true);
        try {
          // Fetch total assets
          const { count: assetsCount, error: assetsError } = await supabase
            .from('activos')
            .select('*', { count: 'exact', head: true });
          if (assetsError) throw assetsError;
          setTotalAssetsCount(assetsCount);

          // Fetch total info requests
          const { count: infoRequestsCount, error: infoRequestsError } = await supabase
            .from('infoactivo')
            .select('*', { count: 'exact', head: true });
          if (infoRequestsError) throw infoRequestsError;
          setTotalInfoRequestsCount(infoRequestsCount);

          // Fetch total registration requests (pending)
          const { count: registrationRequestsCount, error: registrationRequestsError } = await supabase
            .from('solicitudes')
            .select('*', { count: 'exact', head: true })
            .is('estado', null); // Assuming pending requests have estado as null
          if (registrationRequestsError) throw registrationRequestsError;
          setTotalRegistrationRequestsCount(registrationRequestsCount);

        } catch (error: any) {
          console.error("Error fetching admin counts:", error);
          toast({
            title: "Error al cargar contadores de admin",
            description: error.message || "No se pudieron cargar los totales.",
            variant: "destructive",
          });
        } finally {
          setLoadingAdminCounts(false);
        }
      }
    };

    fetchAdminCounts();
  }, [user, toast]);

  const getRoleDisplay = (role: UserRole): string => {
    switch (role) {
      case 'seller_mandatary':
        return 'Mandatario de Venta';
      case 'buyer_mandatary':
        return 'Mandatario de Compra';
      case 'investor':
        return 'Inversor / Family Office';
      case 'admin':
        return 'Administrador';
      default:
        return role;
    }
  };

  return (
    <Card className="w-full shadow-sm border-estate-lightgrey">
      <CardHeader className="bg-estate-navy text-white py-4 px-6 flex flex-row items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">ID Anónimo: {user.id}</h3>
          <p className="text-estate-lightgrey text-sm">Miembro desde {new Date(user.registrationDate).toLocaleDateString()}</p>
        </div>
        <div className="flex items-center gap-5">
          <Button
            variant="destructive"
            onClick={handleLogout}
          >
            Cerrar Sesión
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {user.admin ? (
          // Admin View
          loadingAdminCounts ? (
            <div className="flex justify-center items-center p-4">
              <p>Cargando estadísticas...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-estate-steel">Total Activos</p>
                <p className="text-2xl font-semibold text-estate-slate">{totalAssetsCount ?? 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-estate-steel">Total Sol. Información</p>
                <p className="text-2xl font-semibold text-estate-slate">{totalInfoRequestsCount ?? 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-estate-steel">Total Sol. Registro (Pendientes)</p>
                <p className="text-2xl font-semibold text-estate-slate">{totalRegistrationRequestsCount ?? 'N/A'}</p>
              </div>
            </div>
          )
        ) : (
          // Regular User View
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-estate-steel">Mis Activos</p>
              <p className="text-2xl font-semibold text-estate-slate">{user.assetsCount || 0}</p>
            </div>
            <div>
              <p className="text-sm text-estate-steel">Mis Solicitudes</p>
              <p className="text-2xl font-semibold text-estate-slate">{user.requestsCount || 0}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserProfile;
