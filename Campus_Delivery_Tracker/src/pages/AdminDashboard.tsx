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
import Layout from '@/components/Layout';
import StatusChip from '@/components/StatusChip';
import { useDelivery } from '@/contexts/DeliveryContext';
import { DeliveryStatus } from '@/types/delivery';

const AdminDashboard: React.FC = () => {
  const [tab, setTab] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { deliveries } = useDelivery();

  const activeDeliveries = deliveries.filter(d => 
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
            <Typography color="textSecondary">
              Staff management functionality would be implemented here. This would include:
            </Typography>
            <ul>
              <li>Add new delivery personnel accounts</li>
              <li>Edit personnel details</li>
              <li>Deactivate/activate personnel accounts</li>
              <li>View personnel performance metrics</li>
            </ul>
          </CardContent>
        </Card>
      )}
    </Layout>
  );
};

export default AdminDashboard;
