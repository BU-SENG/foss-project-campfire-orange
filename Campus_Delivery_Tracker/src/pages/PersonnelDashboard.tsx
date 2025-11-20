import React from 'react';
import { useDelivery } from '../contexts/DeliveryContext';
import { useAuth } from '../contexts/AuthContext';
import type { Delivery, DeliveryStatus } from '../types/delivery';
import {
  Package,
  MapPin,
  Home,
  User,
  CheckCircle,
  X as XIcon,
  Truck,
  Clock,
  LogOut,
} from 'lucide-react';

// Small icon wrappers
const PackageIcon: React.FC<React.SVGProps<SVGSVGElement>> = (p) => <Package {...p} className="w-5 h-5" />;
const LocationIcon: React.FC<React.SVGProps<SVGSVGElement>> = (p) => <MapPin {...p} className="w-5 h-5" />;
const DropoffIcon: React.FC<React.SVGProps<SVGSVGElement>> = (p) => <Home {...p} className="w-5 h-5" />;
const StaffIcon: React.FC<React.SVGProps<SVGSVGElement>> = (p) => <User {...p} className="w-5 h-5" />;

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const isDelivered = status === 'Delivered';
  const color = isDelivered ? 'bg-green-100 text-green-700 border-green-300' : 'bg-yellow-100 text-yellow-700 border-yellow-300';
  return <span className={`text-sm font-semibold px-3 py-1 rounded-full border ${color}`}>{status}</span>;
};

const PersonnelDashboard: React.FC = () => {
  const { deliveries, acceptDelivery, rejectDelivery, updateDeliveryStatus } = useDelivery();
  const { user } = useAuth();

  if (user?.role !== 'personnel') {
    return (
      <div className="p-8">
        <h2 className="text-lg font-semibold">Access Denied: Personnel only.</h2>
      </div>
    );
  }

  const newRequests = deliveries.filter((d: Delivery) => d.status === 'Requested');
  const myDeliveries = deliveries.filter((d: Delivery) => d.personnelId === user?.id);
  const activeDeliveries = myDeliveries.filter((d: Delivery) => !['Delivered', 'Rejected'].includes(d.status));

  const handleAccept = (deliveryId: string) => {
    if (user) acceptDelivery(deliveryId, user.id);
  };
  const handleReject = (deliveryId: string) => rejectDelivery(deliveryId);
  const handleStatusUpdate = (deliveryId: string, status: DeliveryStatus) => updateDeliveryStatus(deliveryId, status);

  return (
    <div className="relative min-h-screen bg-gray-50 pb-24 font-sans">
      <div className="bg-indigo-700 pt-16 pb-8 px-6 rounded-b-3xl flex justify-between items-center shadow-lg">
        <div className="text-white">
          <h1 className="text-3xl font-extrabold mb-1">Personnel Dashboard</h1>
          <p className="text-sm text-white opacity-90">Manage requests and update delivery progress</p>
        </div>
        <button onClick={() => console.log('Logout (mock)')} className="flex items-center text-indigo-600 bg-white px-4 py-2 rounded-full font-semibold hover:bg-gray-100 transition duration-150 shadow-md">
          <LogOut className="w-5 h-5 mr-1" /> Logout
        </button>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-2xl shadow-md">
            <p className="text-gray-500 font-medium">New Requests</p>
            <div className="text-3xl font-extrabold text-gray-900">{newRequests.length}</div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-md">
            <p className="text-gray-500 font-medium">Active Deliveries</p>
            <div className="text-3xl font-extrabold text-gray-900">{activeDeliveries.length}</div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-md">
            <p className="text-gray-500 font-medium">Total Completed</p>
            <div className="text-3xl font-extrabold text-gray-900">{myDeliveries.filter(d => d.status === 'Delivered').length}</div>
          </div>
        </div>

        <section className="mt-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">New Delivery Requests</h2>
          {newRequests.length === 0 ? (
            <div className="bg-white p-6 rounded-2xl shadow-md text-center text-gray-600">No new requests</div>
          ) : (
            <div className="space-y-4">
              {newRequests.map((delivery: Delivery) => (
                <div key={delivery.id} className="bg-white p-5 rounded-2xl shadow-lg border border-gray-100">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="text-sm text-gray-500">#{delivery.id} • {new Date(delivery.requestedAt).toLocaleString()}</div>
                      <div className="text-lg font-semibold text-gray-900">{delivery.studentName || 'Student'}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={delivery.status} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                    <div className="text-gray-700"><LocationIcon className="text-indigo-600 mr-2 inline-block"/> <span className="font-medium">From:</span> {delivery.source}</div>
                    <div className="text-gray-700"><DropoffIcon className="text-red-500 mr-2 inline-block"/> <span className="font-medium">To:</span> {delivery.destination}</div>
                    <div className="text-gray-700"><PackageIcon className="text-gray-500 mr-2 inline-block"/> <span className="font-medium">Notes:</span> {delivery.notes || '—'}</div>
                  </div>

                  {delivery.contactPhone && (
                    <div className="text-sm text-gray-700 mt-2">
                      <User className="inline-block mr-2 w-4 h-4 text-indigo-600" />
                      Contact: <span className="font-medium">{delivery.contactPhone}</span>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button onClick={() => handleAccept(delivery.id)} className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700">Accept</button>
                    <button onClick={() => handleReject(delivery.id)} className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-semibold hover:bg-red-200">Reject</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-bold text-gray-800 mb-4">My Active Deliveries</h2>
          {activeDeliveries.length === 0 ? (
            <div className="bg-white p-6 rounded-2xl shadow-md text-center text-gray-600">No active deliveries</div>
          ) : (
            <div className="space-y-4">
              {activeDeliveries.map((delivery: Delivery) => (
                <div key={delivery.id} className="bg-white p-5 rounded-2xl shadow-lg border border-gray-100 flex flex-col sm:flex-row justify-between items-start">
                  <div>
                    <div className="text-sm text-gray-500">#{delivery.id} • {new Date(delivery.requestedAt).toLocaleString()}</div>
                    <div className="text-lg font-semibold text-gray-900">{delivery.studentName || 'Student'}</div>
                    <div className="text-gray-700 mt-2">{delivery.source} → {delivery.destination}</div>
                    {delivery.contactPhone && <div className="text-sm text-gray-700 mt-1">Contact: <span className="font-medium">{delivery.contactPhone}</span></div>}
                    {delivery.personnelName && <div className="text-sm text-gray-600 mt-1">Assigned: {delivery.personnelName}</div>}
                  </div>

                  <div className="mt-4 sm:mt-0 sm:ml-6 flex flex-col items-end gap-2">
                    <StatusBadge status={delivery.status} />
                    <div className="flex flex-col w-full sm:w-auto">
                      {delivery.status === 'Accepted' && (
                        <button onClick={() => handleStatusUpdate(delivery.id, 'Picked Up')} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700">Mark Picked Up</button>
                      )}
                      {delivery.status === 'Picked Up' && (
                        <button onClick={() => handleStatusUpdate(delivery.id, 'En Route')} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700">Mark En Route</button>
                      )}
                      {delivery.status === 'En Route' && (
                        <button onClick={() => handleStatusUpdate(delivery.id, 'Delivered')} className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700">Mark Delivered</button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default PersonnelDashboard;
