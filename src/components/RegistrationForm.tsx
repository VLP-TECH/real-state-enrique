import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RegistrationFormData, UserRole } from '@/utils/types';
import { Check } from 'lucide-react';
import { supabase } from '@/supabaseClient';

interface RegistrationFormProps {
  onSubmit: (data: RegistrationFormData) => void;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<RegistrationFormData>({
    fullName: '',
    email: '',
    phone: '',
    company: '',
    role: 'buyer_mandatary',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleRoleChange = (value: string) => {
    setFormData({
      ...formData,
      role: value as UserRole,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validación básica
    if (!formData.fullName || !formData.email || !formData.phone || !formData.company || !formData.role) {
      return;
    }

    setIsSubmitting(true);

    // Enviar los datos a la tabla 'solicitudes' en Supabase
    try {
      const { data, error } = await supabase
        .from('solicitudes')
        .insert([
          {
            nombre_completo: formData.fullName,
            correo_electronico: formData.email,
            numero_telefono: formData.phone,
            empresa: formData.company,
            su_rol: formData.role,
            mensaje: formData.message || null,
            estado: 'pendiente',
          },
        ]);

      if (error) {
        throw error;
      }

      // Llamar al `onSubmit` y actualizar el estado
      onSubmit(formData);
      setIsSubmitting(false);
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error al enviar la solicitud:', error);
      setIsSubmitting(false);
    }
  };

  const getRoleLabel = (role: UserRole): string => {
    switch (role) {
      case 'seller_mandatary':
        return 'Mandatario de Venta';
      case 'buyer_mandatary':
        return 'Mandatario de Compra';
      case 'investor':
        return 'Inversor / Family Office';
      case 'admin':
        return 'Administrador';
      default:
        return role;
    }
  };

  if (isSubmitted) {
    return (
      <Card className="w-full max-w-5xl mx-auto">
        <CardContent className="pt-6 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-estate-success/20 flex items-center justify-center mb-6">
            <Check className="h-8 w-8 text-estate-success" />
          </div>
          <h2 className="text-2xl font-semibold text-estate-slate mb-2">Solicitud Enviada</h2>
          <p className="text-estate-steel mb-4">
            Gracias por su interés en Club Privado de Inmobiliarias. Su solicitud ha sido recibida y será revisada manualmente por nuestro equipo.
          </p>
          <p className="text-sm text-estate-charcoal mb-6">
            Nos pondremos en contacto pronto con los siguientes pasos. Por razones de seguridad, la aprobación de registro es un proceso manual.
          </p>
          <div className="border border-estate-lightgrey rounded-md p-4 bg-estate-offwhite w-full">
            <p className="text-sm text-estate-steel mb-1">Referencia de Registro:</p>
            <p className="font-mono text-estate-navy">{`REG-${Math.floor(100000 + Math.random() * 900000)}`}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-5xl mx-auto">
      <CardHeader>
        <CardTitle>Únase al Club Privado de Inmobiliarias</CardTitle>
        <CardDescription>
          Solicite membresía para acceder a oportunidades inmobiliarias exclusivas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nombre Completo <span className="text-estate-error">*</span></Label>
                <Input
                  id="fullName"
                  name="fullName"
                  placeholder="Ingrese su nombre completo"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico <span className="text-estate-error">*</span></Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Ingrese su correo electrónico"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Número de Teléfono <span className="text-estate-error">*</span></Label>
                <Input
                  id="phone"
                  name="phone"
                  placeholder="Ingrese su número de teléfono"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company">Empresa <span className="text-estate-error">*</span></Label>
                <Input
                  id="company"
                  name="company"
                  placeholder="Ingrese el nombre de su empresa"
                  value={formData.company}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Su Rol <span className="text-estate-error">*</span></Label>
                <Select value={formData.role} onValueChange={handleRoleChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione su rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="buyer_mandatary">{getRoleLabel('buyer_mandatary')}</SelectItem>
                    <SelectItem value="seller_mandatary">{getRoleLabel('seller_mandatary')}</SelectItem>
                    <SelectItem value="investor">{getRoleLabel('investor')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Mensaje (Opcional)</Label>
                <Textarea
                  id="message"
                  name="message"
                  placeholder="Cuéntenos sobre sus intereses inmobiliarios o experiencia..."
                  rows={3}
                  value={formData.message}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="pt-4">
            <p className="text-xs text-estate-steel mb-4">
              Al enviar este formulario, acepta nuestras estrictas políticas de confidencialidad. Todos los miembros deben firmar un NDA antes de acceder a información detallada. Su solicitud será revisada manualmente por motivos de seguridad.
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Enviando...' : 'Enviar Solicitud'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default RegistrationForm;
