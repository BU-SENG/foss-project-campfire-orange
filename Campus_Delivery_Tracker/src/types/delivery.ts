export type DeliveryStatus = 
  | 'Requested' 
  | 'Accepted' 
  | 'Picked Up' 
  | 'En Route' 
  | 'Delivered' 
  | 'Rejected';

export interface Delivery {
  id: string;
  studentId: string;
  studentName: string;
  personnelId?: string;
  personnelName?: string;
  source: string;
  destination: string;
  status: DeliveryStatus;
  requestedAt: string;
  updatedAt: string;
  notes?: string;
  contactPhone?: string;
}
