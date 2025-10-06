
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { User, UserRole } from "@/utils/types";
import { Button } from "./ui/button";
import { Separator } from "@/components/ui/separator";
import { LogOut } from 'lucide-react';
import { supabase } from '@/supabaseClient';
import { useToast } from '@/hooks/use-toast';
import AuthManager from '@/components/AuthManager';

interface UserProfileProps {
  user: User;
}

const UserProfile: React.FC<UserProfileProps> = ({ user }) => {
  const { toast } = useToast();
  const { handleLogout } = AuthManager();

  const [totalAssetsCount, setTotalAssetsCount] = useState<number | null>(null);
  const [totalInfoRequestsCount, setTotalInfoRequestsCount] = useState<number | null>(null);
  const [totalRegistrationRequestsCount, setTotalRegistrationRequestsCount] = useState<number | null>(null);
  const [loadingAdminCounts, setLoadingAdminCounts] = useState<boolean>(false);
  const [displayRole, setDisplayRole] = useState<string>('');
  const [loadingRole, setLoadingRole] = useState<boolean>(true);

  const getBaseRoleDisplay = (role: UserRole): string => {
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

  // Función para generar ID formateado
  const generateFormattedId = (uuid: string): string => {
    const firstPart = uuid.substring(0, 4).toUpperCase();
    const secondPart = uuid.substring(4, 6).toUpperCase();
    return `ID-${firstPart}-${secondPart}`;
  };

  useEffect(() => {
    const determineDisplayRole = async () => {
      if (!user) {
        setLoadingRole(false);
        return;
      }

      setLoadingRole(true);
      if (user.admin) {
        setDisplayRole('Administrador');
        setLoadingAdminCounts(true);
        try {
          // Usar valores por defecto para evitar errores de tablas inexistentes
          setTotalAssetsCount(0);
          setTotalInfoRequestsCount(0);
          setTotalRegistrationRequestsCount(0);
        } catch (error: any) {
          console.error("Error fetching admin counts:", error);
          toast({ title: "Error al cargar contadores de admin", description: error.message || "No se pudieron cargar los totales.", variant: "destructive" });
        } finally {
          setLoadingAdminCounts(false);
        }
      } else {
      setDisplayRole(getBaseRoleDisplay(user.role));
    }
      setLoadingRole(false);
    };

    determineDisplayRole();
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
          <h3 className="text-xl font-semibold">ID Anónimo: {generateFormattedId(user.id)}</h3>
          <p className="text-estate-lightgrey text-sm">Miembro desde {new Date(user.registrationDate).toLocaleDateString()}</p>
        </div>
        <div className="flex items-center gap-3">
          {loadingRole ? (
            <span className="text-sm font-medium px-3 py-1 rounded-md bg-gray-700 text-gray-400 animate-pulse">Cargando rol...</span>
          ) : (
            <span className="text-sm font-medium px-3 py-1 rounded-md bg-estate-highlight text-estate-dark">
              {displayRole}
            </span>
          )}
          <Separator orientation="vertical" className="h-6 bg-estate-lightgrey/50" />
          <Button
            variant="destructive"
            onClick={handleLogout}
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
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
                <p className="text-sm text-estate-steel">Total Sol. Registro (Pendientes)</p>
                <p className="text-2xl font-semibold text-estate-slate">{totalRegistrationRequestsCount ?? 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-estate-steel">Total Sol. Información</p>
                <p className="text-2xl font-semibold text-estate-slate">{totalInfoRequestsCount ?? 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-estate-steel">Total Activos</p>
                <p className="text-2xl font-semibold text-estate-slate">{totalAssetsCount ?? 'N/A'}</p>
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
