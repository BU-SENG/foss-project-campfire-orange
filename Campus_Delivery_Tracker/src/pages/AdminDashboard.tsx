import React, { useState } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  TextField,
  MenuItem,
  Tabs,
  Tab,
} from '@mui/material';
import Layout from '../components/Layout';
import StatusChip from '../components/StatusChip';
import { useDelivery } from '../contexts/DeliveryContext';
import type { Delivery } from '../types/delivery';
import { useAuth } from '../contexts/AuthContext';

const AdminDashboard: React.FC = () => {
  const [tab, setTab] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { deliveries } = useDelivery();
  const { user } = useAuth();
  // --- Local state/hooks for Personnel (moved to top-level component scope) ---
  type Personnel = { id: string; name: string; email: string; active: boolean };

  const [personnelList, setPersonnelList] = React.useState<Personnel[]>(() => {
    const map = new Map<string, Personnel>();
    deliveries.forEach((d) => {
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

  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editValues, setEditValues] = React.useState({ name: '', email: '' });

  const saveEdit = () => {
    if (!editingId) return;
    setPersonnelList((p) =>
      p.map((x) => (x.id === editingId ? { ...x, name: editValues.name, email: editValues.email } : x)),
    );
    setEditingId(null);
    setEditValues({ name: '', email: '' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValues({ name: '', email: '' });
  };
  if (user?.role !== 'admin') {
    return <Layout><Typography variant="h6">Access Denied: Admins only.</Typography></Layout>;
  }

  const activeDeliveries = deliveries.filter((d: Delivery) => 
    !['Delivered', 'Rejected'].includes(d.status)
  );

  const filteredDeliveries = statusFilter === 'all' 
    ? deliveries 
    : deliveries.filter(d => d.status === statusFilter);

  const statusCounts = deliveries.reduce((acc, d) => {
    acc[d.status] = (acc[d.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  

  return (
    <Layout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Admin Dashboard
        </Typography>
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Deliveries
                </Typography>
                <Typography variant="h3">{deliveries.length}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Active
                </Typography>
                <Typography variant="h3">{activeDeliveries.length}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Completed
                </Typography>
                <Typography variant="h3">
                  {deliveries.filter(d => d.status === 'Delivered').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Pending Requests
                </Typography>
                <Typography variant="h3">
                  {deliveries.filter(d => d.status === 'Requested').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      <Paper sx={{ mb: 4 }}>
        <Tabs value={tab} onChange={(_, newValue) => setTab(newValue)}>
          <Tab label="All Deliveries" />
          <Tab label="Staff Management" />
        </Tabs>
      </Paper>

      {tab === 0 && (
        <>
          <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
            <TextField
              select
              label="Filter by Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="Requested">Requested</MenuItem>
              <MenuItem value="Accepted">Accepted</MenuItem>
              <MenuItem value="Picked Up">Picked Up</MenuItem>
              <MenuItem value="En Route">En Route</MenuItem>
              <MenuItem value="Delivered">Delivered</MenuItem>
              <MenuItem value="Rejected">Rejected</MenuItem>
            </TextField>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>ID</strong></TableCell>
                  <TableCell><strong>Student</strong></TableCell>
                  <TableCell><strong>Personnel</strong></TableCell>
                  <TableCell><strong>Route</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Requested</strong></TableCell>
                  <TableCell><strong>Updated</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredDeliveries.map((delivery) => (
                  <TableRow key={delivery.id}>
                    <TableCell>#{delivery.id}</TableCell>
                    <TableCell>{delivery.studentName}</TableCell>
                    <TableCell>{delivery.personnelName || 'Not assigned'}</TableCell>
                    <TableCell>
                      {delivery.source} → {delivery.destination}
                    </TableCell>
                    <TableCell>
                      <StatusChip status={delivery.status} />
                    </TableCell>
                    <TableCell>{new Date(delivery.requestedAt).toLocaleString()}</TableCell>
                    <TableCell>{new Date(delivery.updatedAt).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {tab === 1 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Staff Management
            </Typography>

            {/* Add Personnel Form (press Enter to add) */}
            <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
              <TextField
          label="Name"
          size="small"
          value={''}
          onChange={() => {}}
          placeholder="Type name and press Enter"
          onKeyDown={(e) => {
            // simple inline add handler: Enter to add
            if (e.key === 'Enter') {
              const target = e.target as HTMLInputElement;
              const name = target.value.trim();
              if (!name) return;
              // push new personnel into local list
              setPersonnelList(prev => {
                const next = [
            ...prev,
            {
              id: `p-${Date.now()}`,
              name,
              email: '',
              active: true,
            },
                ];
                return next;
              });
              target.value = '';
            }
          }}
          sx={{ minWidth: 240 }}
              />
              <Typography color="textSecondary" variant="body2">
          Press Enter to add new personnel
              </Typography>
            </Box>

            {/* Personnel Table */}
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell><strong>ID</strong></TableCell>
              <TableCell><strong>Name</strong></TableCell>
              <TableCell><strong>Email</strong></TableCell>
              <TableCell><strong>Active</strong></TableCell>
              <TableCell><strong>Assigned</strong></TableCell>
              <TableCell><strong>Completed</strong></TableCell>
              <TableCell><strong>Last Assigned</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {personnelList.map((p) => {
              const assigned = deliveries.filter(d => d.personnelName === p.name);
              const assignedCount = assigned.length;
              const completedCount = assigned.filter(d => d.status === 'Delivered').length;
              const lastAssigned = assigned
                .map(d => new Date(d.requestedAt).getTime())
                .filter(Boolean)
                .sort((a, b) => b - a)[0];
              return (
                <TableRow key={p.id} hover>
            <TableCell>{p.id}</TableCell>
            <TableCell>
              {editingId === p.id ? (
                <TextField
                  size="small"
                  value={editValues.name}
                  onChange={(e) => setEditValues(v => ({ ...v, name: e.target.value }))}
                  onKeyDown={(e) => {
              if (e.key === 'Enter') saveEdit();
              if (e.key === 'Escape') cancelEdit();
                  }}
                />
              ) : (
                <Box
                  onDoubleClick={() => {
              setEditingId(p.id);
              setEditValues({ name: p.name, email: p.email });
                  }}
                  sx={{ cursor: 'pointer' }}
                  title="Double-click to edit"
                >
                  {p.name}
                </Box>
              )}
            </TableCell>
            <TableCell>
              {editingId === p.id ? (
                <TextField
                  size="small"
                  value={editValues.email}
                  onChange={(e) => setEditValues(v => ({ ...v, email: e.target.value }))}
                  onKeyDown={(e) => {
              if (e.key === 'Enter') saveEdit();
              if (e.key === 'Escape') cancelEdit();
                  }}
                />
              ) : (
                p.email || '—'
              )}
            </TableCell>
            <TableCell>
              <TextField
                select
                size="small"
                value={p.active ? 'active' : 'inactive'}
                onChange={(e) => {
                  const val = e.target.value === 'active';
                  setPersonnelList(prev => prev.map(x => x.id === p.id ? { ...x, active: val } : x));
                }}
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </TextField>
            </TableCell>
            <TableCell>{assignedCount}</TableCell>
            <TableCell>{completedCount}</TableCell>
            <TableCell>
              {lastAssigned ? new Date(lastAssigned).toLocaleString() : '—'}
            </TableCell>
                </TableRow>
              );
            })}
            {personnelList.length === 0 && (
              <TableRow>
                <TableCell colSpan={7}>
            <Typography color="textSecondary">No personnel found. Add staff using the form above.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
              </Table>
            </TableContainer>

            {/* Helper note */}
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Double-click a name to edit. Change Active dropdown to activate/deactivate.
            </Typography>
          </CardContent>
        </Card>

        
      )}
    </Layout>
  );
};

export default AdminDashboard;
