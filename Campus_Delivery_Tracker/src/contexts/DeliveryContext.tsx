import React, { createContext, useContext, useState } from 'react';
import { Delivery, DeliveryStatus } from '../types/delivery';
import { useAuth } from './AuthContext';

interface DeliveryContextType {
  deliveries: Delivery[];
  createDelivery: (source: string, destination: string, notes?: string, contactPhone?: string) => void;
  updateDeliveryStatus: (deliveryId: string, status: DeliveryStatus, personnelId?: string) => void;
  acceptDelivery: (deliveryId: string, personnelId: string) => void;
  rejectDelivery: (deliveryId: string) => void;
}

const DeliveryContext = createContext<DeliveryContextType | undefined>(undefined);

// Mock initial deliveries
const initialDeliveries: Delivery[] = [
  {
    id: '1',
    studentId: '1',
    studentName: 'John Student',
    personnelId: '2',
    personnelName: 'Jane Personnel',
    source: 'Main Gate',
    destination: 'Bethel Hostel',
    status: 'En Route',
    requestedAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 1800000).toISOString(),
    notes: 'Fragile package',
  },
  {
    id: '2',
    studentId: '1',
    studentName: 'John Student',
    source: 'MSQ Gate',
    destination: 'Computer Science Department',
    status: 'Requested',
    requestedAt: new Date(Date.now() - 600000).toISOString(),
    updatedAt: new Date(Date.now() - 600000).toISOString(),
  },
];

export const DeliveryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [deliveries, setDeliveries] = useState<Delivery[]>(initialDeliveries);
  const { user } = useAuth();

  const createDelivery = (source: string, destination: string, notes?: string, contactPhone?: string) => {
    if (!user) return;

    const newDelivery: Delivery = {
      id: String(deliveries.length + 1),
      studentId: user.id,
      studentName: user.name,
      source,
      destination,
      status: 'Requested',
      requestedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes,
      contactPhone,
    };

    setDeliveries([...deliveries, newDelivery]);
  };

  const updateDeliveryStatus = (deliveryId: string, status: DeliveryStatus, personnelId?: string) => {
    setDeliveries(deliveries.map(delivery => 
      delivery.id === deliveryId
        ? {
            ...delivery,
            status,
            updatedAt: new Date().toISOString(),
            ...(personnelId && { personnelId }),
          }
        : delivery
    ));
  };

  const acceptDelivery = (deliveryId: string, personnelId: string) => {
    setDeliveries(deliveries.map(delivery => 
      delivery.id === deliveryId
        ? {
            ...delivery,
            status: 'Accepted' as DeliveryStatus,
            personnelId,
            personnelName: user?.name,
            updatedAt: new Date().toISOString(),
          }
        : delivery
    ));
  };

  const rejectDelivery = (deliveryId: string) => {
    updateDeliveryStatus(deliveryId, 'Rejected');
  };

  return (
    <DeliveryContext.Provider
      value={{
        deliveries,
        createDelivery,
        updateDeliveryStatus,
        acceptDelivery,
        rejectDelivery,
      }}
    >
      {children}
    </DeliveryContext.Provider>
  );
};

export const useDelivery = () => {
  const context = useContext(DeliveryContext);
  if (!context) {
    throw new Error('useDelivery must be used within DeliveryProvider');
  }
  return context;
};
