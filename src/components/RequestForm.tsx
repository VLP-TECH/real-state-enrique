import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from '@/supabaseClient'; 
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Asset } from '@/utils/types';
import { useToast } from '@/hooks/use-toast';

interface RequestFormProps {
  asset: Asset | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void; // Changed prop name from onSubmit
  buttonStyle?: string;
}

const RequestForm: React.FC<RequestFormProps> = ({ asset, open, onClose, onSuccess, buttonStyle = "" }) => { // Changed prop name
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null); 
  const { toast } = useToast();

  
  useEffect(() => {
    if (open) {
      const fetchUser = async () => {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
          console.error("Error fetching user:", error);
          toast({
            title: "Error de Autenticación",
            description: "No se pudo obtener la información del usuario.",
            variant: "destructive",
          });
          setUserId(null);
        } else if (user) {
          setUserId(user.id);
        } else {
          setUserId(null); 
          toast({
            title: "No Autenticado",
            description: "Debes iniciar sesión para solicitar información.",
            variant: "destructive",
          });
          onClose(); 
        }
      };
      fetchUser();
    }
  }, [open, toast, onClose]);

  const handleSubmit = async () => { 
    console.log('handleSubmit called with userId:', userId, 'asset:', asset?.id);
    
    if (!asset || !userId) {
      console.error('Missing required data:', { asset: !!asset, userId: !!userId });
      toast({
        title: "Error",
        description: "Falta información del activo o del usuario. Intenta de nuevo.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const requestData = {
      activo_id: asset.id,
      user_id: userId,
      requester_id: userId, // Agregar requester_id que es requerido
      mensaje: notes || null,
      estado: 'pending',
      status: 'pending' // Agregar status también
    };

    console.log('Sending request data:', requestData);

    try {
      const { error } = await supabase
        .from('infoactivo') 
        .insert([requestData]);

      if (error) {
        throw error;
      }

      onSuccess(); // Call the new prop

      setIsSubmitting(false);
      setNotes('');
      toast({
        title: "Solicitud enviada",
        description: "Su solicitud de información ha sido registrada correctamente.",
      });
      onClose();

    } catch (error: any) {
      console.error('Error inserting request:', error);

      let errorMessage = "Ocurrió un error desconocido al registrar la solicitud.";
      if (error && error.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      if (error && error.details) {
         errorMessage += ` Detalles: ${error.details}`;
      }
      if (error && error.hint) {
         errorMessage += ` Pista: ${error.hint}`;
      }

      if (error && error.code === 'PGRST116' || (error.message && error.message.includes('404'))) {
         errorMessage += " (Sugerencia: Verifica las políticas de seguridad RLS en Supabase para la tabla 'infoActivo'. Es posible que los usuarios autenticados no tengan permiso para insertar.)";
      }

      toast({
        title: "Error al Enviar Solicitud",
        description: errorMessage,
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  if (!asset) return null;
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Solicitar Información del Activo</DialogTitle>
          <DialogDescription>
            Su solicitud será enviada al administrador para su revisión. Se le notificará cualquier actualización.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="bg-estate-offwhite p-3 rounded text-sm">
            <div className="flex justify-between">
              <span className="text-estate-steel">ID del Activo:</span>
              <span className="font-medium">{asset.id}</span>
            </div>
            {asset.category && (
              <div className="flex justify-between mt-1">
                <span className="text-estate-steel">Categoría:</span>
                <span className="font-medium capitalize text-right">{asset.category}</span>
              </div>
            )}
            {asset.subcategory1 && (
              <div className="flex justify-between mt-1">
                <span className="text-estate-steel">Subcategoría 1:</span>
                <span className="font-medium capitalize text-right">{asset.subcategory1}</span>
              </div>
            )}
            {asset.subcategory2 && (
              <div className="flex justify-between mt-1">
                <span className="text-estate-steel">Subcategoría 2:</span>
                <span className="font-medium capitalize text-right">{asset.subcategory2}</span>
              </div>
            )}
            <div className="flex justify-between mt-1">
              <span className="text-estate-steel">Ubicación:</span>
              <span className="font-medium">{asset.city}, {asset.country}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-estate-slate" htmlFor="notes">
              Notas adicionales (opcional)
            </label>
            <Textarea 
              id="notes"
              placeholder="Explique por qué está interesado en este activo..."
              className="resize-none"
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancelar</Button>
          <Button 
            type="submit" 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            className={buttonStyle}
          >
            {isSubmitting ? "Enviando..." : "Enviar Solicitud"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RequestForm;
