import React, { useState } from 'react';
import { useDelivery } from '../contexts/DeliveryContext';
import { useAuth } from '../contexts/AuthContext';
import type { Delivery } from '../types/delivery';
import {
  BarChart3,
  Users,
  ClipboardList,
  LogOut,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight,
  Plus,
  User,
  Package,
  MapPin,
  Home,
} from 'lucide-react';

// --- Types ---
type AdminScreen = 'dashboard' | 'staff' | 'deliveries';

interface StatusItem {
  key: string;
  label: string;
  count: number;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: string; // Tailwind class base color
}

interface StaffMember {
  id: string;
  name: string;
  email: string;
  active: boolean;
}

interface AdminDeliveryItem {
  id: string | number;
  status: string;
  description: string;
  from: string;
  to: string;
  student?: string;
  deliveryStaff?: string;
  timestamp: string;
}

// --- Small status card used in grid ---
const StatusCard: React.FC<{ item: StatusItem }> = ({ item }) => {
  const Icon = item.icon;
  const baseColor = item.color; // e.g., 'yellow', 'blue', 'green'
  const bgColor = `bg-${baseColor}-100`;
  const iconColor = `text-${baseColor}-700`;

  return (
    <div className={`p-4 rounded-xl shadow-md ${bgColor} h-32 flex flex-col justify-between`}>
      <div className="flex justify-between items-center">
        <Icon className={`w-8 h-8 ${iconColor}`} />
      </div>
      <div>
        <div className={`text-3xl font-bold text-gray-900`}>{item.count}</div>
        <div className="text-sm font-semibold text-gray-700">{item.label}</div>
      </div>
    </div>
  );
};

// Quick action button
const QuickActionButton: React.FC<{ title: string; icon: React.ComponentType<React.SVGProps<SVGSVGElement>>; onClick: () => void }> = ({ title, icon: Icon, onClick }) => (
  <button
    onClick={onClick}
    className="w-full bg-white p-5 rounded-2xl shadow-lg border border-gray-100 flex items-center justify-between hover:bg-gray-50 transition duration-150 mb-4"
  >
    <div className="flex items-center">
      <Icon className="w-6 h-6 text-red-600 mr-4" />
      <span className="text-lg font-semibold text-gray-800">{title}</span>
    </div>
    <ArrowRight className="w-5 h-5 text-gray-400" />
  </button>
);

// Staff member card
const StaffMemberCard: React.FC<{ member: StaffMember }> = ({ member }) => (
  <div className="bg-white p-5 rounded-2xl shadow-lg border border-gray-100 mb-4 flex justify-between items-center">
    <div>
      <h3 className="text-lg font-bold text-gray-800">{member.name}</h3>
      <p className="text-sm text-gray-600">{member.email}</p>
    </div>
    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${member.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
      {member.active ? 'Active' : 'Inactive'}
    </span>
  </div>
);

// Admin delivery card
const AdminDeliveryCard: React.FC<{ item: AdminDeliveryItem }> = ({ item }) => {
  const getStatusProps = (status: string) => {
    switch (status) {
      case 'Requested':
      case 'Pending':
        return { color: 'yellow', text: 'Pending' };
      case 'Delivered':
        return { color: 'green', text: 'Delivered' };
      case 'Rejected':
      case 'Canceled':
        return { color: 'red', text: 'Canceled' };
      default:
        return { color: 'gray', text: status };
    }
  };

  const statusProps = getStatusProps(item.status);
  const statusColor = `bg-${statusProps.color}-100 text-${statusProps.color}-700 border-${statusProps.color}-300`;

  return (
    <div className="bg-white p-5 rounded-2xl shadow-lg border border-gray-100 mb-4">
      <div className="flex justify-between items-start mb-3">
        <span className={`text-sm font-semibold px-3 py-1 rounded-full border ${statusColor}`}>{statusProps.text}</span>
        <span className="text-xs text-gray-500">{item.timestamp}</span>
      </div>

      <div className="space-y-3">
        <div className="flex items-center text-gray-900 font-medium">
          <Package className="text-gray-500 mr-3 w-5 h-5" />
          {item.description}
        </div>
        <div className="flex items-center text-gray-700">
          <MapPin className="text-green-500 mr-3 w-4 h-4" />
          <span className="text-sm">From: <span className="font-medium">{item.from}</span></span>
        </div>
        <div className="flex items-center text-gray-700">
          <Home className="text-red-500 mr-3 w-4 h-4" />
          <span className="text-sm">To: <span className="font-medium">{item.to}</span></span>
        </div>

        <div className="pt-2 border-t border-gray-100 mt-3 flex items-center text-gray-600 text-sm">
          <User className="text-blue-500 mr-3 w-4 h-4" />
          Student: <span className="font-medium ml-1">{item.student || '—'}</span>
        </div>

        {item.deliveryStaff && (
          <div className="flex items-center text-gray-600 text-sm mt-2">
            <Truck className="text-red-500 mr-3 w-4 h-4" />
            Delivery: <span className="font-medium ml-1">{item.deliveryStaff}</span>
          </div>
        )}
      </div>
    </div>
  );
};

// Bottom nav
const BottomNavigationAdmin: React.FC<{ activeScreen: AdminScreen; onNavigate: (s: AdminScreen) => void }> = ({ activeScreen, onNavigate }) => {
  const navItemClass = (screen: AdminScreen) => `flex flex-col items-center justify-center p-2 transition duration-150 ${activeScreen === screen ? 'text-red-600' : 'text-gray-500 hover:text-red-600'}`;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-40 h-20">
      <div className="max-w-md mx-auto h-full flex justify-around items-center">
        <button onClick={() => onNavigate('dashboard')} className={navItemClass('dashboard')}>
          <BarChart3 className="w-6 h-6" />
          <span className="text-xs mt-1">Dashboard</span>
        </button>
        <button onClick={() => onNavigate('staff')} className={navItemClass('staff')}>
          <Users className="w-6 h-6" />
          <span className="text-xs mt-1">Staff</span>
        </button>
        <button onClick={() => onNavigate('deliveries')} className={navItemClass('deliveries')}>
          <ClipboardList className="w-6 h-6" />
          <span className="text-xs mt-1">All Deliveries</span>
        </button>
      </div>
      <div className="h-6 w-full bg-white absolute bottom-0" />
    </div>
  );
};

const AdminDashboard: React.FC = () => {
  const { deliveries } = useDelivery();
  const { user } = useAuth();

  // hooks (always declared)
  type Personnel = StaffMember;
  const [personnelList, setPersonnelList] = useState<Personnel[]>(() => {
    const map = new Map<string, Personnel>();
    deliveries.forEach((d: Delivery) => {
      if (d.personnelName && !map.has(d.personnelName)) {
        map.set(d.personnelName, {
          id: `p-${map.size + 1}`,
          name: d.personnelName!,
          email: '',
          active: true,
        });
      }
    });
    return Array.from(map.values());
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState({ name: '', email: '' });
  const [activeScreen, setActiveScreen] = useState<AdminScreen>('dashboard');

  const saveEdit = () => {
    if (!editingId) return;
    setPersonnelList((p) => p.map((x) => (x.id === editingId ? { ...x, name: editValues.name, email: editValues.email } : x)));
    setEditingId(null);
    setEditValues({ name: '', email: '' });
  };
  const cancelEdit = () => {
    setEditingId(null);
    setEditValues({ name: '', email: '' });
  };

  if (user?.role !== 'admin') {
    return (
      <div className="p-8">
        <h2 className="text-lg font-semibold">Access Denied: Admins only.</h2>
      </div>
    );
  }

  // derive status counts from deliveries
  const statusCountsMap: Record<string, number> = {};
  deliveries.forEach((d: Delivery) => {
    statusCountsMap[d.status] = (statusCountsMap[d.status] || 0) + 1;
  });

  const statusData: StatusItem[] = [
    { key: 'pending', label: 'Pending', count: statusCountsMap['Requested'] || statusCountsMap['Pending'] || 0, icon: Clock, color: 'yellow' },
    { key: 'accepted', label: 'Accepted', count: statusCountsMap['Accepted'] || 0, icon: Truck, color: 'blue' },
    { key: 'pickedUp', label: 'Picked Up', count: statusCountsMap['Picked Up'] || 0, icon: Truck, color: 'purple' },
    { key: 'enRoute', label: 'En Route', count: statusCountsMap['En Route'] || 0, icon: Truck, color: 'blue' },
    { key: 'delivered', label: 'Delivered', count: statusCountsMap['Delivered'] || 0, icon: CheckCircle, color: 'green' },
    { key: 'canceled', label: 'Canceled', count: statusCountsMap['Rejected'] || statusCountsMap['Canceled'] || 0, icon: XCircle, color: 'red' },
  ];

  const totalRequests = deliveries.length;
  const handleLogout = () => {
    console.log('Admin logout');
    alert('Logged out (mock)');
  };

  // Screens
  const DashboardScreen: React.FC = () => (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-red-600 pt-16 pb-8 px-6 rounded-b-3xl flex justify-between items-center shadow-lg">
        <div className="text-white">
          <h1 className="text-3xl font-extrabold mb-1">Admin Dashboard</h1>
          <p className="text-lg text-white opacity-90">Welcome back, Admin User</p>
        </div>
        <button onClick={handleLogout} className="flex items-center text-red-600 bg-white px-4 py-2 rounded-full font-semibold hover:bg-gray-100 transition duration-150 shadow-md">
          <LogOut className="w-5 h-5 mr-1" /> Logout
        </button>
      </div>

      <div className="p-6">
        <div className="bg-white p-6 rounded-2xl shadow-xl mb-6 flex items-center justify-between">
          <div>
            <p className="text-gray-500 font-medium text-lg mb-1">Total Requests</p>
            <h2 className="text-5xl font-extrabold text-gray-900">{totalRequests}</h2>
          </div>
          <BarChart3 className="w-16 h-16 text-red-400" />
        </div>

        <h2 className="text-xl font-bold text-gray-800 mb-4 mt-6">Status Overview</h2>
        <div className="grid grid-cols-2 gap-4">
          {statusData.map((item) => (
            <StatusCard key={item.key} item={item} />
          ))}
        </div>

        <h2 className="text-xl font-bold text-gray-800 mb-4 mt-8">Quick Actions</h2>
  <QuickActionButton title="Manage Staff" icon={Users} onClick={() => setActiveScreen('staff')} />
  <QuickActionButton title="View All Deliveries" icon={ClipboardList} onClick={() => setActiveScreen('deliveries')} />

        <div className="mt-8 pt-4 border-t border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 flex items-center">
            <BarChart3 className="w-5 h-5 text-red-500 mr-2" />
            System Status
          </h3>
          <p className="text-sm text-gray-500 mt-1">Dashboard updates every 10 seconds. Pull down to refresh manually.</p>
        </div>
      </div>
    </div>
  );

  const StaffScreen: React.FC = () => (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-red-600 pt-16 pb-8 px-6 rounded-b-3xl flex justify-between items-center shadow-lg">
        <div className="text-white">
          <h1 className="text-3xl font-extrabold mb-1">Staff Management</h1>
          <p className="text-sm text-white opacity-80">{personnelList.length} delivery person{personnelList.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => {
          const id = `p-${Date.now()}`;
          setPersonnelList((prev) => [...prev, { id, name: 'New Staff', email: '', active: true }]);
        }} className="flex items-center text-red-600 bg-white px-4 py-2 rounded-full font-semibold hover:bg-gray-100 transition duration-150 shadow-md">
          <Plus className="w-5 h-5 mr-1" /> Add
        </button>
      </div>

      <div className="p-4 pt-6">
        {personnelList.map((m) => (
          <div key={m.id} className="bg-white p-5 rounded-2xl shadow-lg border border-gray-100 mb-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-lg font-bold text-gray-800">{m.name}</h3>
                <p className="text-sm text-gray-600">{m.email || '—'}</p>
                <p className="text-xs text-gray-500 mt-1">ID: {m.id}</p>
              </div>

              <div className="flex items-start gap-2">
                <button onClick={() => {
                  setEditingId(m.id);
                  setEditValues({ name: m.name, email: m.email });
                }} className="text-sm text-indigo-600 font-semibold">Edit</button>
                <button onClick={() => setPersonnelList((p) => p.filter(x => x.id !== m.id))} className="text-sm text-red-600">Remove</button>
              </div>
            </div>

            {editingId === m.id && (
              <div className="mt-3">
                <input className="w-full mb-2 p-3 border rounded-lg" value={editValues.name} onChange={(e) => setEditValues(v => ({ ...v, name: e.target.value }))} />
                <input className="w-full mb-2 p-3 border rounded-lg" value={editValues.email} onChange={(e) => setEditValues(v => ({ ...v, email: e.target.value }))} />
                <div className="flex gap-2">
                  <button onClick={saveEdit} className="px-4 py-2 bg-green-600 text-white rounded-lg">Save</button>
                  <button onClick={cancelEdit} className="px-4 py-2 bg-gray-200 rounded-lg">Cancel</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const AllDeliveriesScreen: React.FC = () => {
    const list: AdminDeliveryItem[] = deliveries.map((d: Delivery) => ({
      id: d.id,
      status: d.status,
      description: d.notes || 'Package',
      from: d.source,
      to: d.destination,
      student: d.studentName,
      deliveryStaff: d.personnelName || undefined,
      timestamp: new Date(d.requestedAt).toLocaleString(),
    }));

    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="bg-red-600 pt-16 pb-8 px-6 rounded-b-3xl shadow-lg">
          <div className="text-white">
            <h1 className="text-3xl font-extrabold mb-1">All Deliveries</h1>
            <p className="text-sm text-white opacity-80">{list.length} total deliveries</p>
          </div>
        </div>

        <div className="p-4 pt-6">
          {list.map((item) => <AdminDeliveryCard key={item.id} item={item} />)}
        </div>
      </div>
    );
  };

  const renderScreen = () => {
    switch (activeScreen) {
      case 'dashboard':
        return <DashboardScreen />;
      case 'staff':
        return <StaffScreen />;
      case 'deliveries':
        return <AllDeliveriesScreen />;
      default:
        return <DashboardScreen />;
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-50 pb-24 font-sans">
      {renderScreen()}
      <BottomNavigationAdmin activeScreen={activeScreen} onNavigate={setActiveScreen} />
    </div>
  );
};

export default AdminDashboard;
