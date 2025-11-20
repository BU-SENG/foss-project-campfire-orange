import React, { useState } from 'react';
import { useDelivery } from '../contexts/DeliveryContext';
import { useAuth } from '../contexts/AuthContext';
import type { Delivery } from '../types/delivery';

// Icons from lucide-react (kept inline SVG wrappers for simple classes)
import { Package, MapPin, Home, User, LogOut, CheckCircle, Clock, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PackageIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Package {...props} className="w-5 h-5" />
);
const LocationIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <MapPin {...props} className="w-5 h-5" />
);
const DropoffIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Home {...props} className="w-5 h-5" />
);
const StaffIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <User {...props} className="w-5 h-5" />
);

// Reusable request field
interface FieldProps {
  title: string;
  description?: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  placeholder?: string;
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
}

const RequestField: React.FC<FieldProps> = ({ title, description, icon: Icon, placeholder, value, onChange, readOnly = false }) => (
  <div className="mb-6 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
    <div className="flex items-center mb-2">
      <Icon className="text-indigo-600 mr-2" />
      <h3 className="text-base font-semibold text-gray-800">{title}</h3>
    </div>

    {readOnly ? (
      <div className="text-gray-900 font-medium text-lg pt-1">{value}</div>
    ) : (
      <input
        type="text"
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        placeholder={placeholder}
        readOnly={readOnly}
        className="w-full text-gray-900 font-medium text-lg pt-1 border-b border-gray-200 focus:border-indigo-500 focus:outline-none transition duration-150"
      />
    )}

    {description && <p className="text-sm text-gray-500 mt-2">{description}</p>}
  </div>
);

// Delivery card component
interface DeliveryItem {
  id: string;
  status: string;
  description: string;
  from: string;
  to: string;
  deliveryStaff?: string | null;
  timestamp: string;
}

const DeliveryCard: React.FC<{ item: DeliveryItem }> = ({ item }) => {
  const isDelivered = item.status === 'Delivered';
  const statusColor = isDelivered ? 'bg-green-100 text-green-700 border-green-300' : 'bg-yellow-100 text-yellow-700 border-yellow-300';
  const StatusIcon = isDelivered ? CheckCircle : Clock;

  return (
    <div className="bg-white p-5 rounded-2xl shadow-lg border border-gray-100 mb-4">
      <div className="flex justify-between items-start mb-3">
        <div className={`flex items-center text-sm font-semibold px-3 py-1 rounded-full border ${statusColor}`}>
          <StatusIcon className="w-4 h-4 mr-1" />
          {item.status}
        </div>
        <span className="text-xs text-gray-500">{item.timestamp}</span>
      </div>

      <div className="space-y-3">
        <div className="flex items-center text-gray-900 font-medium">
          <PackageIcon className="text-gray-500 mr-3" />
          {item.description}
        </div>
        <div className="flex items-center text-gray-700">
          <LocationIcon className="text-green-500 mr-3 w-4 h-4" />
          <span className="text-sm">From: <span className="font-medium">{item.from}</span></span>
        </div>
        <div className="flex items-center text-gray-700">
          <MapPin className="text-red-500 mr-3 w-4 h-4" />
          <span className="text-sm">To: <span className="font-medium">{item.to}</span></span>
        </div>

        {item.deliveryStaff && (
          <div className="pt-2 border-t border-gray-100 mt-3 flex items-center text-gray-600 text-sm">
            <StaffIcon className="text-indigo-500 mr-3 w-4 h-4" />
            Delivery by: <span className="font-medium ml-1">{item.deliveryStaff}</span>
          </div>
        )}
      </div>
    </div>
  );
};

// New Request Screen (uses createDelivery)
const NewRequestScreen: React.FC<{ onDeliveryRequested: () => void; createDelivery: (source: string, destination: string, notes?: string, contactPhone?: string) => void; userId?: string | null; onLogout: () => void }> = ({ onDeliveryRequested, createDelivery, userId, onLogout }) => {
  const [packageDesc, setPackageDesc] = useState('');
  const [dropoffLocation, setDropoffLocation] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const pickupLocation = 'School Gate';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const nextErrors: string[] = [];
    if (!packageDesc.trim()) nextErrors.push('Package description is required.');
    if (!dropoffLocation.trim()) nextErrors.push('Drop-off location is required.');
    if (!contactPhone.trim()) nextErrors.push('Contact phone is required.');
    if (pickupLocation.trim() && dropoffLocation.trim() && pickupLocation.trim().toLowerCase() === dropoffLocation.trim().toLowerCase()) nextErrors.push('Pickup and drop-off locations must be different.');

    if (nextErrors.length > 0) {
      setErrors(nextErrors);
      return;
    }

    // map to domain createDelivery (contactPhone added)
    createDelivery(pickupLocation, dropoffLocation, packageDesc, contactPhone);
    setErrors([]);
    setPackageDesc('');
    setDropoffLocation('');
    setContactPhone('');
    onDeliveryRequested();
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-indigo-700 pt-16 pb-12 px-6 rounded-b-3xl flex justify-between items-start">
        <div className="text-white">
          <h2 className="text-xl font-bold text-white mb-4">New Request</h2>
          <h1 className="text-3xl font-extrabold mb-2">Welcome{userId ? ',' : ''} {userId ? ' student' : ''} 👋</h1>
          <p className="text-lg text-white opacity-80">Request a delivery from the gate to your location</p>
        </div>
        <div className="pt-6">
          <button onClick={onLogout} className="flex items-center text-indigo-600 bg-white px-4 py-2 rounded-full font-semibold hover:bg-gray-100 transition duration-150 shadow-md">
            <LogOut className="w-5 h-5 mr-1" /> Logout
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 -mt-8 relative z-10">
        <div className="bg-white p-6 rounded-3xl shadow-xl">
          <RequestField title="Package Description" icon={PackageIcon} placeholder="e.g.,  Package, food delivery, documents..." value={packageDesc} onChange={setPackageDesc} />
          <RequestField title="Pickup Location" icon={LocationIcon} description="Default pickup point" value={pickupLocation} readOnly />
          <RequestField title="Drop-off Location" icon={DropoffIcon} description="Use my default" value={dropoffLocation} onChange={setDropoffLocation} />
          <RequestField title="Contact Phone" icon={(props) => <Phone {...props} className="w-5 h-5" />} placeholder="e.g., +1234567890" value={contactPhone} onChange={setContactPhone} />

          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md mt-2 mb-2">
              <ul className="list-disc pl-5">
                {errors.map((err, idx) => <li key={idx}>{err}</li>)}
              </ul>
            </div>
          )}

          <button type="submit" className="w-full mt-4 py-4 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition duration-300 text-lg">Request Delivery</button>
        </div>
      </form>

      <div className="px-6 mt-6 pb-24">
        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
          <div className="flex items-center mb-3">
            <PackageIcon className="text-amber-700 mr-2" />
            <h3 className="text-lg font-bold text-gray-800">How it works</h3>
          </div>
          <ol className="list-none space-y-2 text-gray-700 pl-0">
            <li className="flex items-start text-base"><span className="text-indigo-600 font-semibold mr-2">1.</span> Submit your delivery request</li>
            <li className="flex items-start text-base"><span className="text-indigo-600 font-semibold mr-2">2.</span> A delivery staff will accept it</li>
            <li className="flex items-start text-base"><span className="text-indigo-600 font-semibold mr-2">3.</span> Track the status in "My Requests"</li>
            <li className="flex items-start text-base"><span className="text-indigo-600 font-semibold mr-2">4.</span> Receive your package at the drop-off location</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

// My Requests Screen
  const MyRequestsScreen: React.FC<{ deliveries: Delivery[]; onLogout: () => void }> = ({ deliveries, onLogout }) => {
  const list = deliveries.map(d => ({
    id: String(d.id),
    status: d.status,
    description: d.notes || 'Package',
    from: d.source,
    to: d.destination,
    deliveryStaff: d.personnelName || undefined,
    timestamp: new Date(d.requestedAt).toLocaleString(),
  }));

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-indigo-700 pt-16 pb-8 px-6 rounded-b-3xl flex justify-between items-center shadow-lg">
        <div className="text-white">
          <h1 className="text-3xl font-extrabold mb-1">My Requests</h1>
          <p className="text-sm text-white opacity-80">{list.length} total deliveries</p>
        </div>
        <button onClick={onLogout} className="flex items-center text-white bg-indigo-600 px-4 py-2 rounded-full font-semibold hover:bg-indigo-500 transition duration-150 shadow-md">
          <LogOut className="w-5 h-5 mr-1" /> Logout
        </button>
      </div>

      <div className="p-4 pt-6">
        {list.map(item => <DeliveryCard key={item.id} item={item} />)}
      </div>
    </div>
  );
};

// Success modal
const SuccessModal: React.FC<{ isVisible: boolean; onViewRequests: () => void; onCreateAnother: () => void }> = ({ isVisible, onViewRequests, onCreateAnother }) => {
  if (!isVisible) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 p-6 rounded-2xl shadow-2xl w-full max-w-sm text-center">
        <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-white mb-2">Success</h3>
        <p className="text-white opacity-90 mb-6">Delivery request created successfully!</p>
        <div className="space-y-3">
          <button onClick={onViewRequests} className="w-full py-3 text-lg font-semibold rounded-xl bg-indigo-600 text-white shadow-md hover:bg-indigo-700 transition duration-150">View Requests</button>
          <button onClick={onCreateAnother} className="w-full py-3 text-lg font-semibold rounded-xl border border-gray-600 text-white hover:bg-gray-700 transition duration-150">Create Another</button>
        </div>
      </div>
    </div>
  );
};

// Bottom nav
const BottomNavigation: React.FC<{ activeScreen: 'new' | 'requests'; onNavigate: (s: 'new' | 'requests') => void }> = ({ activeScreen, onNavigate }) => {
  const navItemClass = (screen: 'new' | 'requests') => `flex flex-col items-center justify-center p-2 transition duration-150 ${activeScreen === screen ? 'text-indigo-600' : 'text-gray-500 hover:text-indigo-600'}`;
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-40 h-20">
      <div className="max-w-md mx-auto h-full flex justify-around items-center">
        <button onClick={() => onNavigate('new')} className={navItemClass('new')}>
          <PackageIcon className="w-6 h-6" />
          <span className="text-xs mt-1">New Request</span>
        </button>
        <button onClick={() => onNavigate('requests')} className={navItemClass('requests')}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="8" y1="13" x2="16" y2="13" />
            <line x1="8" y1="17" x2="16" y2="17" />
            <line x1="10" y1="9" x2="14" y2="9" />
          </svg>
          <span className="text-xs mt-1">My Requests</span>
        </button>
      </div>
      <div className="h-6 w-full bg-white absolute bottom-0"></div>
    </div>
  );
};

const StudentDashboard: React.FC = () => {
  const { deliveries, createDelivery } = useDelivery();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeScreen, setActiveScreen] = useState<'new' | 'requests'>('new');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  if (user?.role !== 'student') {
    return (
      <div className="p-8">
        <h2 className="text-lg font-semibold">Access Denied: Students only.</h2>
      </div>
    );
  }

  const myDeliveries = deliveries.filter((d: Delivery) => d.studentId === user?.id);

  const handleDeliveryRequested = () => setShowSuccessModal(true);
  const handleViewRequests = () => {
    setShowSuccessModal(false);
    setActiveScreen('requests');
  };
  const handleCreateAnother = () => {
    setShowSuccessModal(false);
    setActiveScreen('new');
  };

  const handleLogout = () => {
    // perform logout via context and navigate to login
    logout();
    navigate('/');
  };

  return (
    <div className="relative min-h-screen bg-gray-50 pb-24 font-sans">
      {activeScreen === 'new' ? (
        <NewRequestScreen onDeliveryRequested={handleDeliveryRequested} createDelivery={createDelivery} userId={user?.id} onLogout={handleLogout} />
      ) : (
        <MyRequestsScreen deliveries={myDeliveries} onLogout={handleLogout} />
      )}

      <BottomNavigation activeScreen={activeScreen} onNavigate={setActiveScreen} />

      <SuccessModal isVisible={showSuccessModal} onViewRequests={handleViewRequests} onCreateAnother={handleCreateAnother} />
    </div>
  );
};

export default StudentDashboard;
