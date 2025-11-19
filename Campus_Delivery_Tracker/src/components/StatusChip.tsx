import React from 'react';
import { Chip } from '@mui/material';
import { DeliveryStatus } from '@/types/delivery';

interface StatusChipProps {
  status: DeliveryStatus;
}

const statusColors: Record<DeliveryStatus, string> = {
  'Requested': 'hsl(var(--status-requested))',
  'Accepted': 'hsl(var(--status-accepted))',
  'Picked Up': 'hsl(var(--status-picked-up))',
  'En Route': 'hsl(var(--status-en-route))',
  'Delivered': 'hsl(var(--status-delivered))',
  'Rejected': 'hsl(var(--status-rejected))',
};

const StatusChip: React.FC<StatusChipProps> = ({ status }) => {
  return (
    <Chip
      label={status}
      sx={{
        bgcolor: statusColors[status],
        color: 'white',
        fontWeight: 'bold',
      }}
    />
  );
};

export default StatusChip;
