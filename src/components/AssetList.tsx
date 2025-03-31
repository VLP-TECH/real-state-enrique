
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { ChevronRight, Info } from "lucide-react";
import { Asset } from '@/utils/types';
import { formatCurrency } from '@/utils/formatters';

interface AssetListProps {
  assets: Asset[];
  onRequestInfo: (assetId: string) => void;
  buttonStyle?: string;
}

const AssetList: React.FC<AssetListProps> = ({ assets, onRequestInfo, buttonStyle = "" }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {assets.map((asset) => (
        <Card key={asset.id} className="overflow-hidden card-hover">
          <CardHeader className="bg-estate-navy text-white px-4 py-3">
            <div className="flex justify-between items-center">
              <p className="text-sm font-medium flex items-center gap-1">
                <span className="capitalize">{asset.type}</span>
                <span className="text-estate-lightgrey">•</span>
                <span className="capitalize">{asset.purpose}</span>
              </p>
              <p className="text-estate-highlight text-xs font-semibold bg-estate-slate/50 px-2 py-1 rounded">
                {asset.id}
              </p>
            </div>
          </CardHeader>
          
          <CardContent className="pt-4">
            <div className="space-y-4">
              <div>
                <p className="text-lg font-medium">{asset.location.city}, {asset.location.country}</p>
                {asset.location.area && (
                  <p className="text-sm text-estate-steel">{asset.location.area}</p>
                )}
              </div>
              
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-estate-steel">Precio</p>
                  <p className="font-medium">{formatCurrency(asset.price.amount, asset.price.currency)}</p>
                </div>
                
                {asset.expectedReturn && (
                  <div className="text-right">
                    <p className="text-sm text-estate-steel">Retorno esperado</p>
                    <p className="font-medium text-estate-success">{asset.expectedReturn}%</p>
                  </div>
                )}
              </div>
              
              <p className="text-sm text-estate-charcoal line-clamp-2">{asset.description}</p>
            </div>
          </CardContent>
          
          <CardFooter className="pb-4 pt-2 flex justify-between items-center">
            <p className="text-xs text-estate-steel">{new Date(asset.createdAt).toLocaleDateString()}</p>
            <Button 
              size="sm" 
              className={`flex items-center gap-1 ${buttonStyle}`}
              onClick={() => onRequestInfo(asset.id)}
            >
              <Info className="h-3 w-3" />
              <span>Solicitar información</span>
              <ChevronRight className="h-3 w-3" />
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default AssetList;
