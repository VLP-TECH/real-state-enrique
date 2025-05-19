import React from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Asset } from '@/utils/types';
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, TrendingUp, Info, Trash2 } from 'lucide-react';
import { formatCurrency, safeDateParser } from '@/utils/formatters';
import { deleteAsset } from '@/supabaseClient'; // Import deleteAsset

interface AssetCardProps {
  asset: Asset;
  onRequestInfo?: (assetId: string) => void;
  onDeleteAsset?: (assetId: string) => void; // Add onDeleteAsset prop
}

const AssetCard: React.FC<AssetCardProps> = ({ asset, onRequestInfo, onDeleteAsset }) => {
  const formattedPrice = formatCurrency(asset.priceAmount, asset.priceCurrency);
  const formattedDate = safeDateParser(asset.creado)?.toLocaleDateString('es-ES') ?? 'Fecha inválida';

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
        return 'En Venta';
      case 'purchase':
        return 'En Compra';
      case 'need':
        return 'Necesidad';
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
            <span className="font-semibold text-estate-navy truncate" title={asset.id}>{asset.id}</span>
            <span className={`text-xs px-2 py-1 rounded-full ${getPurposeColor()}`}>
              {getPurposeLabel()}
            </span>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-estate-steel">
              <MapPin className="h-4 w-4" />
              <span>
                {asset.city}, {asset.country}
                {asset.area && ` - ${asset.area}`}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm text-estate-steel">
              <Calendar className="h-4 w-4" />
              <span>Publicado el {formattedDate}</span>
            </div>
          </div>
          
          <div className="bg-estate-offwhite rounded p-3 space-y-1">
            {asset.category && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-estate-steel">Categoría</span>
                <span className="font-medium text-right">{asset.category}</span>
              </div>
            )}
            {asset.subcategory1 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-estate-steel">Subcategoría 1</span>
                <span className="font-medium text-right">{asset.subcategory1}</span>
              </div>
            )}
            {asset.subcategory2 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-estate-steel">Subcategoría 2</span>
                <span className="font-medium text-right">{asset.subcategory2}</span>
              </div>
            )}
            
            <div className="flex justify-between items-center pt-1"> 
              <span className="text-sm text-estate-steel">Precio</span>
              <span className="font-medium">{formattedPrice}</span>
            </div>
            
            {asset.expectedReturn && (
              <div className="flex justify-between items-center mt-1">
                <span className="text-sm text-estate-steel">Retorno Esperado</span>
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
      
      <CardFooter className="bg-estate-offwhite py-3 px-5 flex gap-2">
        {onRequestInfo && (
          <Button
            className="flex-1"
            size="sm"
            variant="outline"
            onClick={() => onRequestInfo(asset.id)}
          >
            <Info className="h-4 w-4 mr-2" />
            Solicitar Información
          </Button>
        )}
        {onDeleteAsset && (
          <Button
            className="flex-1"
            size="sm"
            variant="destructive"
            onClick={async () => {
              if (window.confirm('¿Estás seguro de que quieres borrar este activo?')) {
                try {
                  await deleteAsset(asset.id);
                  onDeleteAsset(asset.id); // Notify parent component
                } catch (error) {
                  console.error("Failed to delete asset:", error);
                  // Optionally, show a toast notification for the error
                }
              }
            }}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Borrar Activo
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default AssetCard;
