import React, { useState } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import Layout from '../components/Layout';
import StatusChip from '../components/StatusChip';
import { useDelivery } from '../contexts/DeliveryContext';
import { useAuth } from '../contexts/AuthContext';

const StudentDashboard: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [notes, setNotes] = useState('');
  const { deliveries, createDelivery } = useDelivery();
  const { user } = useAuth();
  if (user?.role !== 'student') {
    return <Layout><Typography variant="h6">Access Denied: Students only.</Typography></Layout>;
  }

  const myDeliveries = deliveries.filter(d => d.studentId === user?.id);

  const handleSubmit = () => {
    if (source && destination) {
      createDelivery(source, destination, notes);
      setSource('');
      setDestination('');
      setNotes('');
      setOpen(false);
    }
  };

  const activeDeliveries = myDeliveries.filter(d => 
    !['Delivered', 'Rejected'].includes(d.status)
  ).length;

  return (
    <Layout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          My Deliveries
        </Typography>
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Requests
                </Typography>
                <Typography variant="h3">{myDeliveries.length}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Active Deliveries
                </Typography>
                <Typography variant="h3">{activeDeliveries}</Typography>
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
                  {myDeliveries.filter(d => d.status === 'Delivered').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setOpen(true)}
                  sx={{ bgcolor: 'hsl(var(--primary))', height: '100%' }}
                >
                  New Request
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>ID</strong></TableCell>
              <TableCell><strong>Source</strong></TableCell>
              <TableCell><strong>Destination</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Personnel</strong></TableCell>
              <TableCell><strong>Requested</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {myDeliveries.map((delivery) => (
              <TableRow key={delivery.id}>
                <TableCell>#{delivery.id}</TableCell>
                <TableCell>{delivery.source}</TableCell>
                <TableCell>{delivery.destination}</TableCell>
                <TableCell>
                  <StatusChip status={delivery.status} />
                </TableCell>
                <TableCell>{delivery.personnelName || 'Not assigned'}</TableCell>
                <TableCell>{new Date(delivery.requestedAt).toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Request New Delivery</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Pickup Location (Gate)"
            fullWidth
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder="e.g., Main Gate, West Gate"
          />
          <TextField
            margin="dense"
            label="Delivery Destination"
            fullWidth
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="e.g., Hostel A - Room 201, CS Department"
          />
          <TextField
            margin="dense"
            label="Notes (Optional)"
            fullWidth
            multiline
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any special instructions..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            sx={{ bgcolor: 'hsl(var(--primary))' }}
          >
            Submit Request
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default StudentDashboard;
