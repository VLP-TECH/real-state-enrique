
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Asset } from '@/utils/types';
import { useToast } from '@/hooks/use-toast';

interface RequestFormProps {
  asset: Asset | null;
  open: boolean;
  onClose: () => void;
  onSubmit: (assetId: string, notes: string) => void;
  buttonStyle?: string;
}

const RequestForm: React.FC<RequestFormProps> = ({ asset, open, onClose, onSubmit, buttonStyle = "" }) => {
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const handleSubmit = () => {
    if (!asset) return;
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      onSubmit(asset.id, notes);
      setIsSubmitting(false);
      setNotes('');
      toast({
        title: "Solicitud enviada",
        description: "Su solicitud de información ha sido enviada al administrador para su revisión.",
      });
      onClose();
    }, 1000);
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
            <div className="flex justify-between mt-1">
              <span className="text-estate-steel">Tipo:</span>
              <span className="font-medium capitalize">{asset.type}</span>
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-estate-steel">Ubicación:</span>
              <span className="font-medium">{asset.location.city}, {asset.location.country}</span>
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
