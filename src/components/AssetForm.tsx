
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AssetFormData, AssetPurpose, AssetType } from '@/utils/types';
import { X, Upload, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AssetFormProps {
  onSubmit: (data: AssetFormData) => void;
}

const AssetForm: React.FC<AssetFormProps> = ({ onSubmit }) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<AssetFormData>({
    purpose: 'sale' as AssetPurpose,
    type: 'residential' as AssetType,
    country: '',
    city: '',
    area: '',
    expectedReturn: undefined,
    priceAmount: 0,
    priceCurrency: 'USD',
    description: '',
    files: [],
  });
  
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      setFormData({
        ...formData,
        [name]: parseFloat(value) || 0
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setUploadedFiles([...uploadedFiles, ...newFiles]);
    }
  };
  
  const removeFile = (index: number) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.country || !formData.city || !formData.priceAmount) {
      toast({
        title: "Error de Validación",
        description: "Por favor, completa todos los campos obligatorios.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Combine form data with files
    const completeFormData = {
      ...formData,
      files: uploadedFiles,
    };
    
    // Simulate API call
    setTimeout(() => {
      onSubmit(completeFormData);
      setIsSubmitting(false);
      toast({
        title: "Activo Enviado",
        description: "Tu activo ha sido enviado para revisión.",
      });

      // Reset form
      setFormData({
        purpose: 'sale' as AssetPurpose,
        type: 'residential' as AssetType,
        country: '',
        city: '',
        area: '',
        expectedReturn: undefined,
        priceAmount: 0,
        priceCurrency: 'USD',
        description: '',
        files: [],
      });
      setUploadedFiles([]);
    }, 1500);
  };
  
  const assetTypes: AssetType[] = ['residential', 'commercial', 'greenfield', 'brownfield', 'land', 'hotel', 'industrial', 'mixed'];
  const assetPurposes: AssetPurpose[] = ['sale', 'purchase', 'need'];
  const currencies = ['USD', 'EUR', 'GBP', 'CHF'];
  
  const getAssetPurposeLabel = (purpose: AssetPurpose): string => {
    switch (purpose) {
      case 'sale': return 'En Venta';
      case 'purchase': return 'Para Compra';
      case 'need': return 'Necesidad';
      default: return purpose;
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Subir Activo</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="purpose">Propósito del Activo</Label>
                <Select
                  value={formData.purpose}
                  onValueChange={(value) => handleSelectChange('purpose', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar propósito" />
                  </SelectTrigger>
                  <SelectContent>
                    {assetPurposes.map(purpose => (
                      <SelectItem key={purpose} value={purpose}>
                        {getAssetPurposeLabel(purpose)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="type">Tipo de Activo</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleSelectChange('type', value as AssetType)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {assetTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="expectedReturn">Retorno Esperado (%)</Label>
                <Input
                  id="expectedReturn"
                  name="expectedReturn"
                  type="number"
                  step="0.1"
                  placeholder="ej. 7.5"
                  value={formData.expectedReturn || ''}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country">País <span className="text-estate-error">*</span></Label>
                <Input
                  id="country"
                  name="country"
                  placeholder="País"
                  value={formData.country}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="city">Ciudad <span className="text-estate-error">*</span></Label>
                <Input
                  id="city"
                  name="city"
                  placeholder="Ciudad"
                  value={formData.city}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="area">Área/Zona (Opcional)</Label>
                <Input
                  id="area"
                  name="area"
                  placeholder="Área o zona"
                  value={formData.area}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="priceAmount">Monto del Precio <span className="text-estate-error">*</span></Label>
                <Input
                  id="priceAmount"
                  name="priceAmount"
                  type="number"
                  placeholder="Monto"
                  value={formData.priceAmount || ''}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="priceCurrency">Moneda</Label>
                <Select
                  value={formData.priceCurrency}
                  onValueChange={(value) => handleSelectChange('priceCurrency', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar moneda" />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map(currency => (
                      <SelectItem key={currency} value={currency}>
                        {currency}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe el activo..."
                rows={5}
                value={formData.description}
                onChange={handleChange}
              />
            </div>
            
            <div className="space-y-3">
              <Label>Documentos y Multimedia</Label>
              
              <div className="border-2 border-dashed border-estate-lightgrey rounded-lg p-6 text-center">
                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center justify-center">
                  <Upload className="h-10 w-10 text-estate-steel mb-2" />
                  <p className="text-estate-slate font-medium">Haz clic para subir o arrastra y suelta</p>
                  <p className="text-sm text-estate-steel">PDF, imágenes o vídeos (máx. 10MB cada uno)</p>
                  <Input
                    id="file-upload"
                    type="file"
                    multiple 
                    className="hidden" 
                    onChange={handleFileChange} 
                    accept=".pdf,image/*,video/*"
                  />
                </label>
              </div>
              
              {uploadedFiles.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-estate-slate mb-2">Archivos subidos:</p>
                  <div className="space-y-2">
                    {uploadedFiles.map((file, index) => (
                      <div
                        key={`${file.name}-${index}`} 
                        className="flex items-center justify-between bg-estate-offwhite p-2 rounded"
                      >
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 text-estate-steel mr-2" />
                          <span className="text-sm text-estate-slate truncate max-w-[250px]">
                            {file.name}
                          </span>
                        </div>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6"
                          onClick={() => removeFile(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <CardFooter className="flex justify-end px-0 pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Enviando...' : 'Enviar Activo'}
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
};

export default AssetForm;
