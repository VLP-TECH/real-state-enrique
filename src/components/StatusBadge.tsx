
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
          label: 'Pendiente',
          color: 'bg-amber-100 border-amber-200 text-amber-800',
          icon: <Clock className="h-3.5 w-3.5" />,
        };
      case 'approved':
        return {
          label: 'Aprobado',
          color: 'bg-green-100 border-green-200 text-green-800',
          icon: <Check className="h-3.5 w-3.5" />,
        };
      case 'rejected':
        return {
          label: 'Rechazado',
          color: 'bg-red-100 border-red-200 text-red-800',
          icon: <X className="h-3.5 w-3.5" />,
        };
      case 'nda_requested':
        return {
          label: 'Documentación de Confidencialidad Pendiente',
          color: 'bg-blue-100 border-blue-200 text-blue-800',
          icon: <FileText className="h-3.5 w-3.5" />,
        };
      case 'nda_received':
        return {
          label: 'Documentación de Confidencialidad Recibida',
          color: 'bg-indigo-100 border-indigo-200 text-indigo-800',
          icon: <Check className="h-3.5 w-3.5" />,
        };
      case 'information_shared':
        return {
          label: 'Documentación del Activo Enviada',
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

  return (
    <Badge variant="outline" className={`px-2 gap-1 py-1 ${color} border`}>
      {icon}
      <span>{label}</span>
    </Badge>
  );
};

export default StatusBadge;
