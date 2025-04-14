import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { ChevronRight, Info } from "lucide-react";
import { Asset } from '@/utils/types';
import { formatCurrency, formatDate, safeDateParser } from '@/utils/formatters';

interface AssetListProps {
    assets: Asset[];
    location?: string;
    profitability?: string;
    assetType?: string;
    price?: string | undefined;
    onRequestInfo?: (assetId: string) => void;
    buttonStyle?: string;
}

const AssetList: React.FC<AssetListProps> = ({ assets, location, profitability, assetType, price, onRequestInfo, buttonStyle = "" }) => {
    const filteredAssets = assets.filter(asset => {
        if (location && !asset.city.toLowerCase().includes(location.toLowerCase()) && 
            !asset.country.toLowerCase().includes(location.toLowerCase())) {
            return false;
        }
    
        if (profitability) {
            const [minStr, maxStr] = profitability.split('-');
            const min = parseFloat(minStr);
            const max = parseFloat(maxStr);
            if (asset.expectedReturn < min || asset.expectedReturn > max) {
                return false;
            }
        }
    
        if (assetType && assetType !== "" && asset.type !== assetType) {
            return false;
        }
    
        if (price) {
            const [minStr, maxStr] = price.split('-');
            const min = parseFloat(minStr);
            const max = parseFloat(maxStr);
            if (asset.priceAmount < min || asset.priceAmount > max) {
                return false;
            }
        }
    
        return true;
    });

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredAssets.map((asset) => (
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
                                <p className="text-lg font-medium">{asset.city}, {asset.country}</p>
                                {asset.area && (
                                    <p className="text-sm text-estate-steel">{asset.area}</p>
                                )}
                            </div>
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-sm text-estate-steel">Precio</p>
                                    {asset.priceAmount && (
                                        <p className="font-medium">{formatCurrency(asset.priceAmount, asset.priceCurrency)}</p>
                                    )}
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
                        <p className="text-xs text-estate-steel">
                            {safeDateParser(asset.creado)?.toLocaleDateString('es-ES') ?? 'Fecha inválida'}
                        </p>
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
