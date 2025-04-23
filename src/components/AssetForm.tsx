import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AssetFormData, AssetPurpose } from '@/utils/types'; 
import { X, Upload, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/supabaseClient';

interface Subcategory2 {
  name: string;
}

interface Subcategory1 {
  name: string;
  subcategories2: Subcategory2[];
}

interface Category {
  name: string;
  subcategories1: Subcategory1[];
}

const categoriesData: Category[] = [
  {
    name: "Edificio Residencial",
    subcategories1: [
      { name: "Plurifamiliar", subcategories2: [{ name: "Con bajos comerciales / Sin bajos" }] },
      { name: "Unifamiliar en hilera", subcategories2: [{ name: "Con jardín / Sin jardín" }] },
      { name: "Residencial turístico", subcategories2: [{ name: "Vacacional / Coliving" }] },
      { name: "Residencia de estudiantes", subcategories2: [{ name: "Internado / Mixto" }] },
      { name: "Coliving o vivienda con servicios", subcategories2: [{ name: "Senior / General" }] },
      { name: "No declarado", subcategories2: [{ name: "-" }] },
    ],
  },
  {
    name: "Edificio Terciario",
    subcategories1: [
      { name: "Oficinas", subcategories2: [{ name: "Corporativo / Coworking" }] },
      { name: "Comercial", subcategories2: [{ name: "Centro comercial / Galería / Flagship" }] },
      { name: "Hotelero", subcategories2: [{ name: "Hotel / Aparthotel / Hostal" }] },
      { name: "Restauración y ocio", subcategories2: [{ name: "Club / Restaurante / Casino" }] },
      { name: "Educativo privado", subcategories2: [{ name: "Escuela / Academia / Universidad" }] },
      { name: "Sanitario privado", subcategories2: [{ name: "Clínica / Estética / Dental" }] },
      { name: "No declarado", subcategories2: [{ name: "-" }] },
    ],
  },
  {
    name: "Edificio Industrial",
    subcategories1: [
      { name: "Nave industrial", subcategories2: [{ name: "Aislada / Complejo industrial" }] },
      { name: "Plataforma logística", subcategories2: [{ name: "Última milla / Cross-docking" }] },
      { name: "Productivo", subcategories2: [{ name: "Taller / Fábrica ligera" }] },
      { name: "No declarado", subcategories2: [{ name: "-" }] },
    ],
  },
  {
    name: "Edificio Sociosanitario",
    subcategories1: [
      { name: "Residencia de mayores", subcategories2: [{ name: "Asistida / No asistida" }] },
      { name: "Centro de día", subcategories2: [{ name: "Dependencia / Salud mental" }] },
      { name: "Salud privada", subcategories2: [{ name: "Centro de rehabilitación / Mixto" }] },
      { name: "No declarado", subcategories2: [{ name: "-" }] },
    ],
  },
  {
    name: "Edificio Turístico",
    subcategories1: [
      { name: "Resort", subcategories2: [{ name: "Todo incluido / Villas" }] },
      { name: "Rural", subcategories2: [{ name: "Agroturismo / Hotel rural" }] },
      { name: "Balneario / Wellness", subcategories2: [{ name: "Spa / Termal" }] },
      { name: "Albergue o hostel", subcategories2: [{ name: "Urbano / Natural" }] },
      { name: "No declarado", subcategories2: [{ name: "-" }] },
    ],
  },
  {
    name: "Activo Singular",
    subcategories1: [
      { name: "Parking", subcategories2: [{ name: "Subterráneo / En altura" }] },
      { name: "Gasolinera", subcategories2: [{ name: "Con tienda / Sin tienda" }] },
      { name: "Convento o iglesia privada", subcategories2: [{ name: "Desafectado / Reconvertido" }] },
      { name: "Centro deportivo privado", subcategories2: [{ name: "Pistas / Gimnasio / Club" }] },
      { name: "Teatro, cine, auditorio privado", subcategories2: [{ name: "En uso / Cerrado" }] },
      { name: "Centro de datos o torre técnica", subcategories2: [{ name: "Telecom / Servidores" }] },
      { name: "No declarado", subcategories2: [{ name: "-" }] },
    ],
  },
  {
    name: "Vivienda",
    subcategories1: [
      { name: "Libre", subcategories2: [{ name: "Piso / Ático / Bajo con jardín" }] },
      { name: "Protegida (VPO)", subcategories2: [{ name: "Oficial / Autonómica" }] },
      { name: "Turística", subcategories2: [{ name: "Licencia VT / En trámite" }] },
      { name: "No declarado", subcategories2: [{ name: "-" }] },
    ],
  },
  {
    name: "Local Comercial",
    subcategories1: [
      { name: "A pie de calle", subcategories2: [{ name: "Esquina / Interior de galería" }] },
      { name: "En edificio", subcategories2: [{ name: "Oficinas / Retail" }] },
      { name: "No declarado", subcategories2: [{ name: "-" }] },
    ],
  },
  {
    name: "Oficina",
    subcategories1: [
      { name: "En edificio terciario", subcategories2: [{ name: "Diáfana / Compartmentada" }] },
      { name: "Coworking unitario", subcategories2: [{ name: "Mesa / Despacho" }] },
      { name: "No declarado", subcategories2: [{ name: "-" }] },
    ],
  },
  {
    name: "Activo Logístico",
    subcategories1: [
      { name: "Nave pequeña", subcategories2: [{ name: "Box / Trastero industrial" }] },
      { name: "Módulo en nave mayor", subcategories2: [{ name: "Separado / Común" }] },
      { name: "No declarado", subcategories2: [{ name: "-" }] },
    ],
  },
  {
    name: "Plaza de Garaje",
    subcategories1: [
      { name: "Subterránea", subcategories2: [{ name: "Con trastero / Sin trastero" }] },
      { name: "Exterior", subcategories2: [{ name: "Cubierta / Descubierta" }] },
      { name: "No declarado", subcategories2: [{ name: "-" }] },
    ],
  },
  {
    name: "Trastero",
    subcategories1: [
      { name: "En finca", subcategories2: [{ name: "Vinculado a vivienda / Independiente" }] },
      { name: "Independiente", subcategories2: [{ name: "Acceso privado / Acceso común" }] },
      { name: "No declarado", subcategories2: [{ name: "-" }] },
    ],
  },
  {
    name: "Solar Urbano",
    subcategories1: [
      { name: "Consolidado", subcategories2: [{ name: "Con licencia / Sin licencia" }] },
      { name: "No consolidado", subcategories2: [{ name: "Requiere urbanización / Cesiones" }] },
      { name: "No declarado", subcategories2: [{ name: "-" }] },
    ],
  },
  {
    name: "Suelo Urbanizable",
    subcategories1: [
      { name: "Sectorizado", subcategories2: [{ name: "Plan parcial aprobado / En tramitación" }] },
      { name: "No sectorizado", subcategories2: [{ name: "Planeamiento no iniciado / estratégico" }] },
      { name: "No declarado", subcategories2: [{ name: "-" }] },
    ],
  },
  {
    name: "Suelo Rústico",
    subcategories1: [
      { name: "Agrícola", subcategories2: [{ name: "En producción / Secano" }] },
      { name: "Posible reconversión", subcategories2: [{ name: "Cerca de núcleo / Proyecto turístico" }] },
      { name: "No declarado", subcategories2: [{ name: "-" }] },
    ],
  },
  {
    name: "Solar con Proyecto",
    subcategories1: [
      { name: "Con proyecto visado", subcategories2: [{ name: "Con licencia / Sin licencia" }] },
      { name: "Promoción iniciada", subcategories2: [{ name: "Excavación hecha / No iniciada" }] },
      { name: "No declarado", subcategories2: [{ name: "-" }] },
    ],
  },
  {
    name: "Suelo Industrial",
    subcategories1: [
      { name: "Parcela en polígono", subcategories2: [{ name: "Media / Gran superficie" }] },
      { name: "Suelo logístico", subcategories2: [{ name: "Plataforma / Última milla" }] },
      { name: "No declarado", subcategories2: [{ name: "-" }] },
    ],
  },
];

interface AssetFormProps {
  onSubmit: (data: AssetFormData) => void;
}

const AssetForm: React.FC<AssetFormProps> = ({ onSubmit }) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null); 
  const [formData, setFormData] = useState<AssetFormData>({
    purpose: 'sale' as AssetPurpose,
    country: '',
    city: '',
    area: '',
    expectedReturn: undefined,
    priceAmount: 0,
    priceCurrency: 'USD',
    description: '',
    files: [],
    category: '',
    subcategory1: '',
    subcategory2: '',
  });

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [availableSubcategories1, setAvailableSubcategories1] = useState<Subcategory1[]>([]);
  const [availableSubcategories2, setAvailableSubcategories2] = useState<Subcategory2[]>([]);

  useEffect(() => {
    const initialize = async () => {
      try {
        const { error, count } = await supabase
          .from('activos') 
          .select('*', { count: 'exact', head: true });

        if (error) {
          console.error("Error connecting to 'activos' table:", error);
          toast({
            title: "Error de Conexión",
            description: `No se pudo conectar a la tabla de activos: ${error.message}`,
            variant: "destructive",
          });
        } else {
          
          console.log("Successfully connected to 'activos' table. Count:", count);
        }
      } catch (err) {
        console.error("Exception during connection test:", err);
        toast({
          title: "Error Inesperado",
          description: "Ocurrió una excepción al probar la conexión.",
          variant: "destructive",
        });
      }

      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error("Error fetching user:", userError);
        toast({
          title: "Error de Autenticación",
          description: `Error al obtener usuario: ${userError.message}`,
          variant: "destructive",
        });
      } else if (user) {
        setUserId(user.id);
        console.log("User ID set:", user.id); 
      } else {
        console.error("User not logged in");
        
        toast({
          title: "Error de Autenticación",
          description: "Debes iniciar sesión para subir un activo.",
          variant: "destructive",
        });
      }
    };
    initialize();
  }, [toast]);

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

  const handleCategoryChange = (value: string) => {
    const selectedCategory = categoriesData.find(cat => cat.name === value);
    setFormData({
      ...formData,
      category: value,
      subcategory1: '', 
      subcategory2: '', 
    });
    setAvailableSubcategories1(selectedCategory ? selectedCategory.subcategories1 : []);

    const allSubcategories2 = selectedCategory
      ? selectedCategory.subcategories1.flatMap(sub1 => sub1.subcategories2)
      : [];

    const uniqueSubcategories2 = Array.from(new Map(allSubcategories2.map(item => [item.name, item])).values());
    setAvailableSubcategories2(uniqueSubcategories2);
  };

  const handleSubcategory1Change = (value: string) => {
    setFormData({
      ...formData,
      subcategory1: value,
      subcategory2: '',
    });
  };

  const handleSubcategory2Change = (value: string) => {
    setFormData({
      ...formData,
      subcategory2: value,
    });
  };

  const handleGenericSelectChange = (name: string, value: string) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) {
      toast({
        title: "Error",
        description: "No se pudo obtener el ID de usuario. Intenta recargar la página.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.country || !formData.city || !formData.priceAmount) {
      toast({
        title: "Error de Validación",
        description: "Por favor, completa todos los campos obligatorios.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const assetData = {
      user_id: userId,
      purpose: formData.purpose,
      
      country: formData.country,
      city: formData.city,
      area: formData.area || null,
      expectedReturn: formData.expectedReturn,
      priceAmount: formData.priceAmount,
      priceCurrency: formData.priceCurrency,
      description: formData.description,
      category: formData.category,
      subcategory1: formData.subcategory1,
      subcategory2: formData.subcategory2,
      url: "https://example.com/placeholder.pdf",
      creado: new Date().toISOString(),
    };

    try {
      const { data, error } = await supabase
        .from('activos')
        .insert([assetData])
        .select();

      if (error) {
        throw error;
      }

      console.log('Asset inserted:', data);
      toast({
        title: "Activo Creado",
        description: "El activo ha sido registrado correctamente.",
      });

      
      setFormData({
        purpose: 'sale' as AssetPurpose,
        
        country: '',
        city: '',
        area: '',
        expectedReturn: undefined,
        priceAmount: 0,
        priceCurrency: 'USD',
        description: '',
        files: [], 
        category: '',
        subcategory1: '',
        subcategory2: '',
      });
      setUploadedFiles([]); 
      setAvailableSubcategories1([]);
      setAvailableSubcategories2([]);

    } catch (error: any) {
      console.error('Error inserting asset:', error);
      let errorMessage = "Ocurrió un error al guardar el activo.";
      if (error && error.message) {
        errorMessage = error.message;
      }
      
      if (error && error.details) {
         errorMessage += ` Detalles: ${error.details}`;
      }
      if (error && error.hint) {
         errorMessage += ` Pista: ${error.hint}`;
      }

      toast({
        title: "Error al Crear Activo",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> 
              <div className="space-y-2">
                <Label htmlFor="purpose">Propósito del Activo</Label>
                <Select
                  value={formData.purpose}
                  onValueChange={(value) => handleGenericSelectChange('purpose', value)}
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
                 <Label htmlFor="category">Categoría</Label>
                 <Select
                   value={formData.category}
                   onValueChange={handleCategoryChange}
                 >
                   <SelectTrigger>
                     <SelectValue placeholder="Seleccionar categoría" />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectGroup>
                       <SelectLabel>Categorías</SelectLabel>
                       {categoriesData.map(cat => (
                         <SelectItem key={cat.name} value={cat.name}>
                           {cat.name}
                         </SelectItem>
                       ))}
                     </SelectGroup>
                   </SelectContent>
                 </Select>
               </div>

               <div className="space-y-2">
                 <Label htmlFor="subcategory1">Subcategoría 1</Label>
                 <Select
                   value={formData.subcategory1}
                   onValueChange={handleSubcategory1Change}
                   disabled={!formData.category || availableSubcategories1.length === 0}
                 >
                   <SelectTrigger>
                     <SelectValue placeholder="Seleccionar subcategoría 1" />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectGroup>
                       <SelectLabel>Subcategorías Nivel 1</SelectLabel>
                       {availableSubcategories1.map(sub1 => (
                         <SelectItem key={sub1.name} value={sub1.name}>
                           {sub1.name}
                         </SelectItem>
                       ))}
                     </SelectGroup>
                   </SelectContent>
                 </Select>
               </div>

               <div className="space-y-2">
                 <Label htmlFor="subcategory2">Subcategoría 2</Label>
                 <Select
                   value={formData.subcategory2}
                   onValueChange={handleSubcategory2Change}
                   disabled={!formData.category || availableSubcategories2.length === 0}
                 >
                   <SelectTrigger>
                     <SelectValue placeholder="Seleccionar subcategoría 2" />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectGroup>
                       <SelectLabel>Subcategorías Nivel 2</SelectLabel>
                       {availableSubcategories2.map(sub2 => (
                         <SelectItem key={sub2.name} value={sub2.name}>
                           {sub2.name}
                         </SelectItem>
                       ))}
                     </SelectGroup>
                   </SelectContent>
                 </Select>
               </div>
             </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country">País<span className="text-estate-error">*</span></Label>
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
                <Label htmlFor="priceAmount">Precio<span className="text-estate-error">*</span></Label>
                <Input
                  id="priceAmount"
                  name="priceAmount"
                  type="number"
                  placeholder="Importe"
                  value={formData.priceAmount || ''}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="priceCurrency">Moneda</Label>
                <Select
                  value={formData.priceCurrency}
                  onValueChange={(value) => handleGenericSelectChange('priceCurrency', value)}
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
