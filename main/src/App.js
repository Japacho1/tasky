import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Container } from '@mui/material';

// Import components (ensure they match the export type in each component file)
import Home from './Home';
import Login from './Login';
import Signup from './Signup';
import Homepage from './HomePage'; // Requester Homepage
import ProviderDashboard from './ProviderDashboard'; // Provider Dashboard
import Map from './Map'; // Map Component
import Navbar from './Navbar'; // Navigation bar component
import ProviderProfile from './ProviderProfile'; // Provider Profile Component
import NotFound from './NotFound'; // 404 Component (create this for better styling)

function App() {
  return (
    <Router>
      <Container>
        <Navbar /> {/* Render the navigation bar */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/homepage" element={<Homepage />} /> {/* Requester Homepage */}
          <Route path="/provider-dashboard" element={<ProviderDashboard />} />
          <Route path="/provider-profile/:providerId" element={<ProviderProfile />} /> {/* Use :providerId to match with useParams */}
          <Route path="/map" element={<Map />} />
          {/* 404 Page Not Found Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;
