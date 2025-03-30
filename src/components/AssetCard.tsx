
import React from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Asset } from '@/utils/types';
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, TrendingUp, Info } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';

interface AssetCardProps {
  asset: Asset;
  onRequestInfo?: (assetId: string) => void;
}

const AssetCard: React.FC<AssetCardProps> = ({ asset, onRequestInfo }) => {
  const formattedPrice = formatCurrency(asset.price.amount, asset.price.currency);
  const formattedDate = new Date(asset.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  
  const getTypeLabel = () => {
    return asset.type.charAt(0).toUpperCase() + asset.type.slice(1);
  };
  
  const getPurposeColor = () => {
    switch (asset.purpose) {
      case 'sale':
        return 'bg-green-100 text-green-800';
      case 'purchase':
        return 'bg-blue-100 text-blue-800';
      case 'need':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getPurposeLabel = () => {
    switch (asset.purpose) {
      case 'sale':
        return 'For Sale';
      case 'purchase':
        return 'For Purchase';
      case 'need':
        return 'Need';
      default:
        return asset.purpose;
    }
  };
  
  return (
    <Card className="overflow-hidden border border-estate-lightgrey hover:shadow-md transition-shadow">
      <div className="h-2 bg-estate-navy" />
      <CardContent className="p-5">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <span className="font-semibold text-estate-navy">{asset.id}</span>
            <span className={`text-xs px-2 py-1 rounded-full ${getPurposeColor()}`}>
              {getPurposeLabel()}
            </span>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-estate-steel">
              <MapPin className="h-4 w-4" />
              <span>
                {asset.location.city}, {asset.location.country}
                {asset.location.area && ` - ${asset.location.area}`}
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-estate-steel">
              <Calendar className="h-4 w-4" />
              <span>Listed on {formattedDate}</span>
            </div>
          </div>
          
          <div className="bg-estate-offwhite rounded p-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-estate-steel">Asset Type</span>
              <span className="font-medium">{getTypeLabel()}</span>
            </div>
            
            <div className="flex justify-between items-center mt-1">
              <span className="text-sm text-estate-steel">Price</span>
              <span className="font-medium">{formattedPrice}</span>
            </div>
            
            {asset.expectedReturn && (
              <div className="flex justify-between items-center mt-1">
                <span className="text-sm text-estate-steel">Expected Return</span>
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-3.5 w-3.5 text-green-600" />
                  <span className="font-medium">{asset.expectedReturn}%</span>
                </div>
              </div>
            )}
          </div>
          
          {asset.description && (
            <div className="text-sm text-estate-slate line-clamp-3">
              {asset.description}
            </div>
          )}
        </div>
      </CardContent>
      
      {onRequestInfo && (
        <CardFooter className="bg-estate-offwhite py-3 px-5">
          <Button 
            className="w-full"
            size="sm"
            variant="outline"
            onClick={() => onRequestInfo(asset.id)}
          >
            <Info className="h-4 w-4 mr-2" />
            Request Information
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default AssetCard;
