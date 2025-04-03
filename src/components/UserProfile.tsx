
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { User, UserRole } from "@/utils/types";
import { Button } from "./ui/button";
import { supabase } from '@/supabaseClient';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface UserProfileProps {
  user: User;
}

const UserProfile: React.FC<UserProfileProps> = ({ user }) => {
  const { toast } = useToast();
    const navigate = useNavigate();

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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: 'Sesión Cerrada',
      description: 'Has cerrado sesión correctamente.',
    });
    navigate('/');
  };

  return (
    <Card className="w-full shadow-sm border-estate-lightgrey">
      <CardHeader className="bg-estate-navy text-white py-4 px-6 flex flex-row items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">ID Anónimo: {user.id}</h3>
          <p className="text-estate-lightgrey text-sm">Miembro desde {new Date(user.registrationDate).toLocaleDateString()}</p>
        </div>
        <div className="flex items-center gap-5">
          <div className="bg-estate-steel text-white text-sm py-1 px-3 rounded-full">
            {getRoleDisplay(user.role)}
          </div>
          <Button
            variant="outline" 
            className="border-[#E1D48A] text-[#E1D48A] hover:bg-[#E1D48A] hover:text-estate-navy"
            onClick={handleLogout}
          >
            Cerrar Sesión
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-estate-steel">Activos</p>
            <p className="text-2xl font-semibold text-estate-slate">{user.assetsCount || 0}</p>
          </div>
          <div>
            <p className="text-sm text-estate-steel">Solicitudes</p>
            <p className="text-2xl font-semibold text-estate-slate">{user.requestsCount || 0}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserProfile;
