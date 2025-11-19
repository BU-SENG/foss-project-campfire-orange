import React from 'react';
import { AppBar, Toolbar, Typography, Button, Container, Box } from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
interface LayoutProps {
  children: React.ReactNode;
}
const Layout: React.FC<LayoutProps> = ({
  children
}) => {
  const {
    user,
    logout
  } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  return <Box sx={{
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh'
  }}>
      <AppBar position="static" sx={{
      bgcolor: 'hsl(var(--primary))'
    }}>
        <Toolbar>
          <LocalShippingIcon sx={{
          mr: 2
        }} />
          <Typography variant="h6" component="div" sx={{
          flexGrow: 1,
          display: {
            xs: 'none',
            sm: 'block'
          }
        }}>
            Campus Delivery Tracker
          </Typography>
          {user && <>
              <Typography variant="body1" sx={{
            mr: 2
          }}>
                {user.name} ({user.role})
              </Typography>
              <Button color="inherit" onClick={handleLogout} className="my-px py-0 px-[11px] mx-[54px]">
                Logout
              </Button>
            </>}
        </Toolbar>
      </AppBar>
      <Container maxWidth="xl" sx={{
      mt: 4,
      mb: 4,
      flex: 1
    }}>
        {children}
      </Container>
    </Box>;
};
export default Layout;