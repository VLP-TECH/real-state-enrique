
import React, { useState } from 'react';
import { Asset, AssetType } from '@/utils/types';
import AssetCard from './AssetCard';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from '@/components/ui/button';
import { Search, SlidersHorizontal, X } from 'lucide-react';

interface AssetListProps {
  assets: Asset[];
  onRequestInfo: (assetId: string) => void;
}

const AssetList: React.FC<AssetListProps> = ({ assets, onRequestInfo }) => {
  const [filters, setFilters] = useState({
    location: '',
    type: '' as AssetType | '',
    minPrice: 0,
    maxPrice: 50000000,
    minReturn: 0,
    maxReturn: 30,
  });
  
  const [showFilters, setShowFilters] = useState(false);
  
  const maxPriceInData = Math.max(...assets.map(asset => asset.price.amount), 50000000);
  
  const filteredAssets = assets.filter(asset => {
    const matchLocation = !filters.location || 
      asset.location.country.toLowerCase().includes(filters.location.toLowerCase()) ||
      asset.location.city.toLowerCase().includes(filters.location.toLowerCase()) ||
      (asset.location.area && asset.location.area.toLowerCase().includes(filters.location.toLowerCase()));
    
    const matchType = !filters.type || asset.type === filters.type;
    
    const matchPrice = asset.price.amount >= filters.minPrice && asset.price.amount <= filters.maxPrice;
    
    const matchReturn = !asset.expectedReturn || 
      (asset.expectedReturn >= filters.minReturn && asset.expectedReturn <= filters.maxReturn);
    
    return matchLocation && matchType && matchPrice && matchReturn;
  });

  const resetFilters = () => {
    setFilters({
      location: '',
      type: '',
      minPrice: 0,
      maxPrice: maxPriceInData,
      minReturn: 0,
      maxReturn: 30,
    });
  };

  const formatPriceLabel = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value}`;
  };

  const assetTypes: AssetType[] = ['residential', 'commercial', 'greenfield', 'brownfield', 'land', 'hotel', 'industrial', 'mixed'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <h2 className="text-2xl font-semibold text-estate-slate">Asset Listings</h2>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Input
              placeholder="Search by location..."
              value={filters.location}
              onChange={(e) => setFilters({...filters, location: e.target.value})}
              className="pr-8"
            />
            <Search className="absolute right-2 top-2.5 h-4 w-4 text-estate-steel" />
          </div>
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? "bg-estate-navy text-white" : ""}
          >
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {showFilters && (
        <div className="bg-estate-offwhite p-4 rounded-md border border-estate-lightgrey">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium text-estate-slate">Filters</h3>
            <Button variant="ghost" size="sm" onClick={resetFilters} className="text-estate-steel h-8">
              <X className="h-3.5 w-3.5 mr-1" />
              Reset
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label>Asset Type</Label>
              <Select
                value={filters.type}
                onValueChange={(value) => setFilters({...filters, type: value as AssetType})}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All types</SelectItem>
                  {assetTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Price Range</Label>
              <div className="pt-6 px-1">
                <Slider
                  defaultValue={[filters.minPrice, filters.maxPrice]}
                  max={maxPriceInData}
                  step={100000}
                  value={[filters.minPrice, filters.maxPrice]}
                  onValueChange={(value) => setFilters({
                    ...filters,
                    minPrice: value[0],
                    maxPrice: value[1]
                  })}
                />
                <div className="flex justify-between mt-2 text-xs text-estate-steel">
                  <span>{formatPriceLabel(filters.minPrice)}</span>
                  <span>{formatPriceLabel(filters.maxPrice)}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Expected Return (%)</Label>
              <div className="pt-6 px-1">
                <Slider
                  defaultValue={[filters.minReturn, filters.maxReturn]}
                  max={30}
                  step={0.5}
                  value={[filters.minReturn, filters.maxReturn]}
                  onValueChange={(value) => setFilters({
                    ...filters,
                    minReturn: value[0],
                    maxReturn: value[1]
                  })}
                />
                <div className="flex justify-between mt-2 text-xs text-estate-steel">
                  <span>{filters.minReturn}%</span>
                  <span>{filters.maxReturn}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {filteredAssets.length === 0 ? (
        <div className="text-center py-10 bg-estate-offwhite rounded-md">
          <p className="text-estate-steel">No assets found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssets.map(asset => (
            <AssetCard
              key={asset.id}
              asset={asset}
              onRequestInfo={onRequestInfo}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AssetList;
