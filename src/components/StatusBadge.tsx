
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Check, Clock, FileText, Info, X } from "lucide-react";
import { RequestStatus } from '@/utils/types';

interface StatusBadgeProps {
  status: RequestStatus;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusConfig = (status: RequestStatus): { 
    label: string; 
    color: string; 
    icon: React.ReactNode;
  } => {
    switch (status) {
      case 'pending':
        return {
          label: 'Pending',
          color: 'bg-amber-100 border-amber-200 text-amber-800',
          icon: <Clock className="h-3.5 w-3.5" />,
        };
      case 'approved':
        return {
          label: 'Approved',
          color: 'bg-green-100 border-green-200 text-green-800',
          icon: <Check className="h-3.5 w-3.5" />,
        };
      case 'rejected':
        return {
          label: 'Rejected',
          color: 'bg-red-100 border-red-200 text-red-800',
          icon: <X className="h-3.5 w-3.5" />,
        };
      case 'nda_requested':
        return {
          label: 'NDA Requested',
          color: 'bg-blue-100 border-blue-200 text-blue-800',
          icon: <FileText className="h-3.5 w-3.5" />,
        };
      case 'nda_received':
        return {
          label: 'NDA Received',
          color: 'bg-indigo-100 border-indigo-200 text-indigo-800',
          icon: <Check className="h-3.5 w-3.5" />,
        };
      case 'information_shared':
        return {
          label: 'Information Shared',
          color: 'bg-purple-100 border-purple-200 text-purple-800',
          icon: <Info className="h-3.5 w-3.5" />,
        };
      default:
        return {
          label: String(status),
          color: 'bg-gray-100 border-gray-200 text-gray-800',
          icon: <Info className="h-3.5 w-3.5" />,
        };
    }
  };

  const { label, color, icon } = getStatusConfig(status);
  
  // Format label to be more readable
  const formattedLabel = label
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());

  return (
    <Badge variant="outline" className={`px-2 gap-1 py-1 ${color} border`}>
      {icon}
      <span>{formattedLabel}</span>
    </Badge>
  );
};

export default StatusBadge;
