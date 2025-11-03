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
      { name: "Coliving o vivienda con servicios", subcategories2: [{ name: "Senior / General" }] }
    ],
  },
  {
    name: "Edificio Terciario",
    subcategories1: [
      { name: "Oficinas", subcategories2: [{ name: "Corporativo / Coworking" }] },
      { name: "Comercial", subcategories2: [{ name: "Centro comercial / Galería / Flagship" }] },
      { name: "Hotelero", subcategories2: [{ name: "Hotel / Aparthotel / Hostal" }] },
      { name: "Restauración y ocio", subcategories2: [{ name: "Club / Restaurante / Casino" }] },
      { name: "Educativo", subcategories2: [{ name: "Escuela / Academia / Universidad" }] },
      { name: "Sanitario", subcategories2: [{ name: "Clínica / Estética / Dental" }] }
    ],
  },
  {
    name: "Edificio Industrial",
    subcategories1: [
      { name: "Nave industrial", subcategories2: [{ name: "Aislada / Complejo industrial" }] },
      { name: "Plataforma logística", subcategories2: [{ name: "Última milla / Cross-docking" }] },
      { name: "Productivo", subcategories2: [{ name: "Taller / Fábrica ligera" }] }
    ],
  },
  {
    name: "Edificio Dotacional",
    subcategories1: [
      { name: "Residencia de mayores", subcategories2: [{ name: "Asistida / No asistida" }] },
      { name: "Centro de día", subcategories2: [{ name: "Dependencia / Salud mental" }] },
      { name: "Salud privada", subcategories2: [{ name: "Centro de rehabilitación / Mixto" }] }
    ],
  },
  {
    name: "Edificio Turístico",
    subcategories1: [
      { name: "Resort", subcategories2: [{ name: "Todo incluido / Villas" }] },
      { name: "Rural", subcategories2: [{ name: "Agroturismo / Hotel rural" }] },
      { name: "Balneario / Wellness", subcategories2: [{ name: "Spa / Termal" }] },
      { name: "Albergue o hostel", subcategories2: [{ name: "Urbano / Natural" }] }
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
      { name: "Centro de datos o torre técnica", subcategories2: [{ name: "Telecom / Servidores" }] }
    ],
  },
  {
    name: "Vivienda",
    subcategories1: [
      { name: "Libre", subcategories2: [{ name: "Piso / Ático / Bajo con jardín" }] },
      { name: "Protegida (VPO)", subcategories2: [{ name: "Oficial / Autonómica" }] },
      { name: "Turística", subcategories2: [{ name: "Licencia VT / En trámite" }] }
    ],
  },
  {
    name: "Local Comercial",
    subcategories1: [
      { name: "A pie de calle", subcategories2: [{ name: "Esquina / Interior de galería" }] },
      { name: "En edificio", subcategories2: [{ name: "Oficinas / Retail" }] }
    ],
  },
  {
    name: "Oficina",
    subcategories1: [
      { name: "En edificio terciario", subcategories2: [{ name: "Diáfana / Compartmentada" }] },
      { name: "Coworking unitario", subcategories2: [{ name: "Mesa / Despacho" }] }
    ],
  },
  {
    name: "Activo Logístico",
    subcategories1: [
      { name: "Nave pequeña", subcategories2: [{ name: "Box / Trastero industrial" }] },
      { name: "Módulo en nave mayor", subcategories2: [{ name: "Separado / Común" }] }
    ],
  },
  {
    name: "Plaza de Garaje",
    subcategories1: [
      { name: "Subterránea", subcategories2: [{ name: "Con trastero / Sin trastero" }] },
      { name: "Exterior", subcategories2: [{ name: "Cubierta / Descubierta" }] }
    ],
  },
  {
    name: "Trastero",
    subcategories1: [
      { name: "En finca", subcategories2: [{ name: "Vinculado a vivienda / Independiente" }] },
      { name: "Independiente", subcategories2: [{ name: "Acceso privado / Acceso común" }] }
    ],
  },
  {
    name: "Solar Urbano",
    subcategories1: [
      { name: "Consolidado", subcategories2: [{ name: "Con licencia / Sin licencia" }] },
      { name: "No consolidado", subcategories2: [{ name: "Requiere urbanización / Cesiones" }] }
    ],
  },
  {
    name: "Suelo Urbanizable",
    subcategories1: [
      { name: "Sectorizado", subcategories2: [{ name: "Plan parcial aprobado / En tramitación" }] },
      { name: "No sectorizado", subcategories2: [{ name: "Planeamiento no iniciado / estratégico" }] }
    ],
  },
  {
    name: "Suelo Rústico",
    subcategories1: [
      { name: "Agrícola", subcategories2: [{ name: "En producción / Secano" }] },
      { name: "Posible reconversión", subcategories2: [{ name: "Cerca de núcleo / Proyecto turístico" }] }
    ],
  },
  {
    name: "Solar con Proyecto",
    subcategories1: [
      { name: "Con proyecto visado", subcategories2: [{ name: "Con licencia / Sin licencia" }] },
      { name: "Promoción iniciada", subcategories2: [{ name: "Excavación hecha / No iniciada" }] }
    ],
  },
  {
    name: "Suelo Industrial",
    subcategories1: [
      { name: "Parcela en polígono", subcategories2: [{ name: "Media / Gran superficie" }] },
      { name: "Suelo logístico", subcategories2: [{ name: "Plataforma / Última milla" }] }
    ],
  },
];

interface AssetFormProps {
  onSubmit: (data: AssetFormData) => void;
  userId: string;
  userName: string;
}

const AssetForm: React.FC<AssetFormProps> = ({ onSubmit, userId, userName }): JSX.Element => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<AssetFormData>({
    purpose: 'sale' as AssetPurpose,
    country: '',
    city: '',
    area: '',
    expectedReturn: undefined,
    priceAmount: 0,
    priceCurrency: 'EUR',
    description: '',
    files: [],
    category: '',
    subcategory1: '',
    subcategory2: '',
    type: 'asset',
  });

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [availableSubcategories1, setAvailableSubcategories1] = useState<Subcategory1[]>([]);
  const [availableSubcategories2, setAvailableSubcategories2] = useState<Subcategory2[]>([]);

  useEffect(() => {
    const initialize = async () => {
      console.log('🔍 AssetForm: Starting initialization...');
      
      try {
        const { error, count } = await supabase
          .from('assets')
          .select('*', { count: 'exact', head: true });

        if (error) {
          console.error("❌ AssetForm: Error connecting to 'assets' table:", error);
          toast({
            title: "Error de Conexión",
            description: `No se pudo conectar a la tabla de activos: ${error.message}`,
            variant: "destructive",
          });
        } else {
          console.log("✅ AssetForm: Successfully connected to 'assets' table. Count:", count);
        }
      } catch (err) {
        console.error("💥 AssetForm: Exception during connection test:", err);
        toast({
          title: "Error Inesperado",
          description: "Ocurrió una excepción al probar la conexión.",
          variant: "destructive",
        });
      }

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error("❌ AssetForm: Error fetching user:", userError);
        toast({
          title: "Error de Autenticación",
          description: `Error al obtener usuario: ${userError.message}`,
          variant: "destructive",
        });
      } else if (user) {
        console.log("✅ AssetForm: User ID set:", user.id);
      } else {
        console.error("❌ AssetForm: User not logged in");
        toast({
          title: "Error de Autenticación",
          description: "Debes iniciar sesión para subir un activo.",
          variant: "destructive",
        });
      }
    };

    initialize();
  }, [toast, userId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    if (type === 'number') {
      const parsedValue = value.startsWith('0') && value.length > 1 ? value.substring(1) : value;
      setFormData({
        ...formData,
        [name]: parseFloat(parsedValue) || undefined
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

    if (!formData.country || !formData.city || !formData.priceAmount || formData.priceAmount <= 0) {
      toast({
        title: "Error de Validación",
        description: "Por favor, completa todos los campos obligatorios y asegúrate de que el precio sea mayor a 0.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Enviar archivos a n8n si hay (opcional, no crítico)
      if (uploadedFiles.length > 0) {
        // Ejecutar en paralelo sin bloquear
        submitToN8n(userId, userName, formData, uploadedFiles)
          .then(() => console.log("Files sent to n8n successfully"))
          .catch((n8nError) => {
            console.warn("n8n webhook failed (non-critical):", n8nError);
          });
      }

      // 2. Adaptar datos para la tabla assets (solo campos que existen)
      const assetData = {
        user_id: userId,
        title: `${formData.category} en ${formData.city}`,
        description: formData.description,
        price: formData.priceAmount,
        location: `${formData.city}, ${formData.country}`,
        property_type: formData.category,
        status: 'available'
      };

      // Agregar campos opcionales solo si existen en la tabla
      if (formData.area) {
        assetData.area = formData.area;
      }
      if (formData.priceCurrency) {
        assetData.price_currency = formData.priceCurrency;
      }
      if (formData.subcategory1) {
        assetData.subcategory1 = formData.subcategory1;
      }
      if (formData.subcategory2) {
        assetData.subcategory2 = formData.subcategory2;
      }
      if (formData.purpose) {
        assetData.purpose = formData.purpose;
      }
      if (formData.expectedReturn) {
        assetData.expected_return = formData.expectedReturn;
      }

      // Cambiar de 'activos' a 'assets'
      const { data, error } = await supabase
        .from('assets')
        .insert([assetData])
        .select();

      if (error) {
        throw error;
      }

      console.log('Asset inserted:', data);
      toast({
        title: "Activo Creado",
        description: uploadedFiles.length > 0 
          ? "El activo ha sido registrado correctamente. Los archivos se enviaron a n8n."
          : "El activo ha sido registrado correctamente.",
      });

      // Reset form
      setFormData({
        purpose: 'sale' as AssetPurpose,
        country: '',
        city: '',
        area: '',
        expectedReturn: undefined,
        priceAmount: 0,
        priceCurrency: 'EUR',
        description: '',
        files: [],
        category: '',
        subcategory1: '',
        subcategory2: '',
        type: 'asset',
      });
      setUploadedFiles([]);

      if (onSubmit) {
        onSubmit(data[0]);
      }

    } catch (error: any) {
      console.error('Error creating asset:', error);
      toast({
        title: "Error al Crear Activo",
        description: error.message || "Ocurrió un error al crear el activo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const assetPurposes: AssetPurpose[] = ['sale', 'purchase', 'need'];

  async function sendEmailNotification(
    userIdProp: string,
    userNameProp: string,
    formData: AssetFormData,
    files: File[]
  ) {
    try {
      // Crear un enlace de correo con toda la información
      const subject = encodeURIComponent(`Nuevo activo con documentos - ${formData.category} en ${formData.city}`);
      const body = encodeURIComponent(`
Nuevo activo subido con documentos adjuntos

Usuario: ${userNameProp} (ID: ${userIdProp})
Categoría: ${formData.category}
Subcategoría 1: ${formData.subcategory1 || 'No especificada'}
Subcategoría 2: ${formData.subcategory2 || 'No especificada'}
Ubicación: ${formData.city}, ${formData.country}
Precio: ${formData.priceAmount} ${formData.priceCurrency}
Descripción: ${formData.description}
Archivos adjuntos: ${files.length} archivo(s)
${files.map(file => `- ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`).join('\n')}
Fecha: ${new Date().toLocaleString('es-ES')}

Nota: Los archivos adjuntos deben ser enviados por separado ya que este es un enlace de correo automático.
      `);

      // Abrir cliente de correo con la información
      const mailtoLink = `mailto:chaume@vlptech.es?subject=${subject}&body=${body}`;
      window.open(mailtoLink, '_blank');
      console.log("Email notification opened in default email client");

    } catch (error) {
      console.error("Error sending email notification:", error);
      // No lanzar error para no interrumpir el flujo principal
    }
  }

  async function submitToN8n(
    userIdProp: string, 
    userNameProp: string,
    formData: AssetFormData,
    files: File[]
  ) {
    const form = new FormData();
    
    // Añadir datos del formulario
    form.append("userId", userIdProp);
    form.append("userName", userNameProp);
    form.append("purpose", formData.purpose);
    form.append("country", formData.country);
    form.append("city", formData.city);
    form.append("area", formData.area || "");
    form.append("priceAmount", formData.priceAmount?.toString() || "");
    form.append("priceCurrency", formData.priceCurrency);
    form.append("description", formData.description);
    form.append("category", formData.category);
    form.append("subcategory1", formData.subcategory1 || "");
    form.append("subcategory2", formData.subcategory2 || "");
    form.append("expectedReturn", formData.expectedReturn?.toString() || "");
    form.append("type", formData.type);

    // Añadir archivos con el nombre que espera n8n (data)
    files.forEach((file, index) => {
      form.append("data", file, file.name); // Cambiar de "files" a "data"
      form.append(`file_${index}_name`, file.name);
      form.append(`file_${index}_size`, file.size.toString());
      form.append(`file_${index}_type`, file.type);
    });

    // Añadir metadatos adicionales
    form.append("totalFiles", files.length.toString());
    form.append("timestamp", new Date().toISOString());

    try {
      console.log("Sending to n8n webhook:", {
        userId: userIdProp,
        userName: userNameProp,
        category: formData.category,
        filesCount: files.length,
        files: files.map(f => ({ name: f.name, size: f.size, type: f.type }))
      });

      // Usar timeout para evitar bloqueos
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos timeout

      const response = await fetch("https://ia-tools-n8n.rzd02y.easypanel.host/webhook-test/b70ae63c-8836-455b-9e60-87abfc9cf811", {
        method: "POST",
        body: form,
        signal: controller.signal,
        mode: 'cors', // Intentar CORS
        credentials: 'omit' // No enviar cookies
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("n8n webhook success:", result);
      
      return result;
    } catch (error) {
      if (error.name === 'AbortError') {
        console.warn("n8n webhook timeout - continuing without it");
      } else {
        console.warn("n8n webhook failed:", error.message);
      }
      throw error;
    }
  }

  const currencies = ['USD', 'EUR', 'GBP', 'CHF'];

  const getAssetPurposeLabel = (purpose: AssetPurpose): string => {
    switch (purpose) {
      case 'sale': return 'En Venta';
      case 'purchase': return 'Para Compra';
      case 'need': return 'Necesidad';
      default: return '';
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
                  type="text"
                  placeholder="ej. 7.5"
                  value={formData.expectedReturn === undefined ? '' : formData.expectedReturn}
                  onChange={handleChange}
                  required
                  onKeyPress={(event) => {
                    if (!/[0-9.]/.test(event.key)) {
                      event.preventDefault();
                    }
                  }}
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
                <Label htmlFor="country">País</Label>
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
                <Label htmlFor="city">Ciudad</Label>
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
                <Label htmlFor="priceAmount">Precio</Label>
                <Input
                  id="priceAmount"
                  name="priceAmount"
                  type="text"
                  placeholder="Importe"
                  value={formData.priceAmount || ''}
                  onChange={handleChange}
                  required
                  onKeyPress={(event) => {
                    if (!/[0-9.]/.test(event.key)) {
                      event.preventDefault();
                    }
                  }}
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
