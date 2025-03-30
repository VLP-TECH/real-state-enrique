
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
}

const RequestForm: React.FC<RequestFormProps> = ({ asset, open, onClose, onSubmit }) => {
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
        title: "Request submitted",
        description: "Your information request has been sent to the administrator for review.",
      });
      onClose();
    }, 1000);
  };
  
  if (!asset) return null;
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Request Asset Information</DialogTitle>
          <DialogDescription>
            Your request will be sent to the administrator for review. You'll be notified of any updates.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="bg-estate-offwhite p-3 rounded text-sm">
            <div className="flex justify-between">
              <span className="text-estate-steel">Asset ID:</span>
              <span className="font-medium">{asset.id}</span>
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-estate-steel">Type:</span>
              <span className="font-medium capitalize">{asset.type}</span>
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-estate-steel">Location:</span>
              <span className="font-medium">{asset.location.city}, {asset.location.country}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-estate-slate" htmlFor="notes">
              Additional notes (optional)
            </label>
            <Textarea 
              id="notes"
              placeholder="Explain why you're interested in this asset..."
              className="resize-none"
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button type="submit" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RequestForm;
