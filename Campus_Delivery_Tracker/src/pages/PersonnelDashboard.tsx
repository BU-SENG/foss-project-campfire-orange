import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  ButtonGroup,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import Layout from '@/components/Layout';
import StatusChip from '@/components/StatusChip';
import { useDelivery } from '@/contexts/DeliveryContext';
import { useAuth } from '@/contexts/AuthContext';
import { DeliveryStatus } from '@/types/delivery';

const PersonnelDashboard: React.FC = () => {
  const { deliveries, acceptDelivery, rejectDelivery, updateDeliveryStatus } = useDelivery();
  const { user } = useAuth();

  const newRequests = deliveries.filter(d => d.status === 'Requested');
  const myDeliveries = deliveries.filter(d => d.personnelId === user?.id);
  const activeDeliveries = myDeliveries.filter(d => 
    !['Delivered', 'Rejected'].includes(d.status)
  );

  const handleAccept = (deliveryId: string) => {
    if (user) {
      acceptDelivery(deliveryId, user.id);
    }
  };

  const handleReject = (deliveryId: string) => {
    rejectDelivery(deliveryId);
  };

  const handleStatusUpdate = (deliveryId: string, status: DeliveryStatus) => {
    updateDeliveryStatus(deliveryId, status);
  };

  return (
    <Layout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Personnel Dashboard
        </Typography>
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid xs={12} sm={4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  New Requests
                </Typography>
                <Typography variant="h3">{newRequests.length}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid xs={12} sm={4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Active Deliveries
                </Typography>
                <Typography variant="h3">{activeDeliveries.length}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid xs={12} sm={4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Completed
                </Typography>
                <Typography variant="h3">
                  {myDeliveries.filter(d => d.status === 'Delivered').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      <Typography variant="h5" sx={{ mb: 2 }}>
        New Delivery Requests
      </Typography>
      <TableContainer component={Paper} sx={{ mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>ID</strong></TableCell>
              <TableCell><strong>Student</strong></TableCell>
              <TableCell><strong>Source</strong></TableCell>
              <TableCell><strong>Destination</strong></TableCell>
              <TableCell><strong>Notes</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {newRequests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No new requests
                </TableCell>
              </TableRow>
            ) : (
              newRequests.map((delivery) => (
                <TableRow key={delivery.id}>
                  <TableCell>#{delivery.id}</TableCell>
                  <TableCell>{delivery.studentName}</TableCell>
                  <TableCell>{delivery.source}</TableCell>
                  <TableCell>{delivery.destination}</TableCell>
                  <TableCell>{delivery.notes || '-'}</TableCell>
                  <TableCell>
                    <ButtonGroup size="small">
                      <Button
                        startIcon={<CheckCircleIcon />}
                        onClick={() => handleAccept(delivery.id)}
                        sx={{ color: 'hsl(var(--status-accepted))' }}
                      >
                        Accept
                      </Button>
                      <Button
                        startIcon={<CancelIcon />}
                        onClick={() => handleReject(delivery.id)}
                        sx={{ color: 'hsl(var(--status-rejected))' }}
                      >
                        Reject
                      </Button>
                    </ButtonGroup>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="h5" sx={{ mb: 2 }}>
        My Active Deliveries
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>ID</strong></TableCell>
              <TableCell><strong>Student</strong></TableCell>
              <TableCell><strong>Route</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {activeDeliveries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No active deliveries
                </TableCell>
              </TableRow>
            ) : (
              activeDeliveries.map((delivery) => (
                <TableRow key={delivery.id}>
                  <TableCell>#{delivery.id}</TableCell>
                  <TableCell>{delivery.studentName}</TableCell>
                  <TableCell>
                    {delivery.source} → {delivery.destination}
                  </TableCell>
                  <TableCell>
                    <StatusChip status={delivery.status} />
                  </TableCell>
                  <TableCell>
                    <ButtonGroup size="small" orientation="vertical">
                      {delivery.status === 'Accepted' && (
                        <Button onClick={() => handleStatusUpdate(delivery.id, 'Picked Up')}>
                          Mark Picked Up
                        </Button>
                      )}
                      {delivery.status === 'Picked Up' && (
                        <Button onClick={() => handleStatusUpdate(delivery.id, 'En Route')}>
                          Mark En Route
                        </Button>
                      )}
                      {delivery.status === 'En Route' && (
                        <Button onClick={() => handleStatusUpdate(delivery.id, 'Delivered')}>
                          Mark Delivered
                        </Button>
                      )}
                    </ButtonGroup>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Layout>
  );
};

export default PersonnelDashboard;
