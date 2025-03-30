
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { RequestStatus } from '@/utils/types';

interface StatusBadgeProps {
  status: RequestStatus | 'draft' | 'published' | 'approved';
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'pending':
        return { 
          label: 'Pending', 
          class: 'bg-estate-warning/20 text-estate-warning border border-estate-warning/50'
        };
      case 'approved':
        return { 
          label: 'Approved', 
          class: 'bg-estate-success/20 text-estate-success border border-estate-success/50'
        };
      case 'rejected':
        return { 
          label: 'Rejected', 
          class: 'bg-estate-error/20 text-estate-error border border-estate-error/50'
        };
      case 'nda_requested':
        return { 
          label: 'NDA Requested', 
          class: 'bg-estate-highlight/20 text-estate-highlight border border-estate-highlight/50'
        };
      case 'nda_received':
        return { 
          label: 'NDA Received', 
          class: 'bg-estate-success/20 text-estate-success border border-estate-success/50'
        };
      case 'information_shared':
        return { 
          label: 'Info Shared', 
          class: 'bg-estate-success/20 text-estate-success border border-estate-success/50'
        };
      case 'draft':
        return { 
          label: 'Draft', 
          class: 'bg-estate-steel/20 text-estate-steel border border-estate-steel/50'
        };
      case 'published':
        return { 
          label: 'Published', 
          class: 'bg-estate-highlight/20 text-estate-highlight border border-estate-highlight/50'
        };
      default:
        return { 
          label: status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1), 
          class: 'bg-estate-steel/20 text-estate-steel border border-estate-steel/50'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Badge variant="outline" className={cn("font-normal py-1 px-2 rounded-md capitalize", config.class, className)}>
      {config.label}
    </Badge>
  );
};

export default StatusBadge;
