
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Asset } from '@/utils/types';
import { Building2, MapPin, LineChart, DollarSign } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface AssetCardProps {
  asset: Asset;
  onRequestInfo?: (assetId: string) => void;
}

const AssetCard: React.FC<AssetCardProps> = ({ asset, onRequestInfo }) => {
  const formatCurrency = (amount: number, currency: string) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M ${currency}`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}K ${currency}`;
    }
    return `${amount} ${currency}`;
  };

  const getAssetTypeLabel = (type: string): string => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const getAssetPurposeLabel = (purpose: string): string => {
    switch (purpose) {
      case 'sale': return 'For Sale';
      case 'purchase': return 'For Purchase';
      case 'need': return 'Need';
      default: return purpose;
    }
  };

  return (
    <Card className="w-full shadow-sm border-estate-lightgrey card-hover">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <span className="inline-block bg-estate-navy text-white text-xs px-2 py-1 rounded mb-2">
              {getAssetPurposeLabel(asset.purpose)}
            </span>
            <h3 className="font-semibold text-lg text-estate-slate">
              {getAssetTypeLabel(asset.type)} in {asset.location.city}
            </h3>
          </div>
          <div className="text-right">
            <p className="text-sm text-estate-steel">ID: {asset.id}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-estate-steel" />
            <span className="text-sm">
              {asset.location.country}, {asset.location.city}
              {asset.location.area && `, ${asset.location.area}`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-estate-steel" />
            <span className="text-sm">{getAssetTypeLabel(asset.type)}</span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-estate-steel" />
            <span className="text-sm">{formatCurrency(asset.price.amount, asset.price.currency)}</span>
          </div>
          {asset.expectedReturn && (
            <div className="flex items-center gap-2">
              <LineChart className="h-4 w-4 text-estate-steel" />
              <span className="text-sm">{asset.expectedReturn}% Return</span>
            </div>
          )}
        </div>
        {asset.description && (
          <p className="text-sm text-estate-charcoal line-clamp-2 mb-2">{asset.description}</p>
        )}
      </CardContent>
      <CardFooter className="pt-0">
        {onRequestInfo && (
          <Button 
            onClick={() => onRequestInfo(asset.id)} 
            className="w-full button-primary"
          >
            Request Information
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default AssetCard;
