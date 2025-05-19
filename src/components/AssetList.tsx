import React from 'react';
import { Asset } from '@/utils/types';
import AssetCard from './AssetCard'; // Import AssetCard

interface AssetListProps {
    assets: Asset[];
    location?: string;
    profitability?: string;
    price?: string | undefined;
    onRequestInfo?: (assetId: string) => void;
    onDeleteAsset?: (assetId: string) => void; // Add onDeleteAsset prop
    buttonStyle?: string; // This might become redundant if AssetCard handles its own styling
    // Consider if userRole is needed to conditionally show delete button if AssetList is used by non-admins
}

const AssetList: React.FC<AssetListProps> = ({ assets, location, profitability, price, onRequestInfo, onDeleteAsset }) => {
    const filteredAssets = assets.filter(asset => {
        if (location && asset.city && asset.country &&
            !asset.city.toLowerCase().includes(location.toLowerCase()) &&
            !asset.country.toLowerCase().includes(location.toLowerCase())) {
            return false;
        }
    
        if (profitability) {
            const [minStr, maxStr] = profitability.split('-');
            const min = parseFloat(minStr);
            const max = parseFloat(maxStr);
            if (asset.expectedReturn === null || asset.expectedReturn === undefined || asset.expectedReturn < min || asset.expectedReturn > max) {
                return false;
            }
        }

        if (price) {
            const [minStr, maxStr] = price.split('-');
            const min = parseFloat(minStr);
            const max = parseFloat(maxStr);
            if (asset.priceAmount === null || asset.priceAmount === undefined || asset.priceAmount < min || asset.priceAmount > max) {
                return false;
            }
        }
    
        return true;
    });

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAssets.map((asset) => (
                <AssetCard
                    key={asset.id}
                    asset={asset}
                    onRequestInfo={onRequestInfo}
                    onDeleteAsset={onDeleteAsset} // Pass the onDeleteAsset prop to AssetCard
                />
            ))}
        </div>
    );
};

export default AssetList;
