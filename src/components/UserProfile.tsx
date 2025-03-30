
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { User, UserRole } from "@/utils/types";

interface UserProfileProps {
  user: User;
}

const UserProfile: React.FC<UserProfileProps> = ({ user }) => {
  const getRoleDisplay = (role: UserRole): string => {
    switch (role) {
      case 'seller_mandatary':
        return 'Seller Mandatary';
      case 'buyer_mandatary':
        return 'Buyer Mandatary';
      case 'investor':
        return 'Investor / Family Office';
      case 'admin':
        return 'Administrator';
      default:
        return role;
    }
  };

  return (
    <Card className="w-full shadow-sm border-estate-lightgrey">
      <CardHeader className="bg-estate-navy text-white py-4 px-6 flex flex-row items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">Anonymous ID: {user.id}</h3>
          <p className="text-estate-lightgrey text-sm">Member since {new Date(user.registrationDate).toLocaleDateString()}</p>
        </div>
        <div className="bg-estate-steel text-white text-sm py-1 px-3 rounded-full">
          {getRoleDisplay(user.role)}
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-estate-steel">Assets</p>
            <p className="text-2xl font-semibold text-estate-slate">{user.assetsCount || 0}</p>
          </div>
          <div>
            <p className="text-sm text-estate-steel">Requests</p>
            <p className="text-2xl font-semibold text-estate-slate">{user.requestsCount || 0}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserProfile;
