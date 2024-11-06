import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Container } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';

// Import components
import Home from './Home';
import Login from './Login';
import Signup from './Signup';
import Homepage from './HomePage';
import ProviderDashboard from './ProviderDashboard';
import Map from './Map';
import Navbar from './Navbar';
import ProviderProfile from './ProviderProfile';
import NotFound from './NotFound';
import ProviderRequests from './ProviderRequests';
import MyRequests from './MyRequests';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Container>
          {/* Render the navigation bar */}
         
          
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/homepage" element={<Homepage />} /> {/* Requester Homepage */}
            <Route path="/provider-dashboard" element={<ProviderDashboard />} />
            <Route path="/provider-profile/:providerId" element={<ProviderProfile />} /> {/* Use :providerId to match with useParams */}
            <Route path="/map" element={<Map />} />
            <Route path="/my-requests" element={<ProviderRequests />} />
            <Route path="/my_requests" element={<MyRequests />} />
            {/* 404 Page Not Found Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Container>
      </Router>
    </ThemeProvider>
  );
}

export default App;
