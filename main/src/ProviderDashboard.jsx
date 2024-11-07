import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, AppBar, Toolbar, Container, Paper, Divider, List, ListItem, ListItemText } from '@mui/material';
import { Link } from 'react-router-dom';
import backgroundImage from './images/duplo24.jpg';
import {jwtDecode} from 'jwt-decode';
import ServiceTable from './ServiceTable';
import { useNavigate } from 'react-router-dom';

const ProviderDashboard = () => {
    const [user, setUser] = useState(null);
    const [location, setLocation] = useState('');
    const [locationName, setLocationName] = useState('');
    const [services, setServices] = useState([]);
    const [selectedServices, setSelectedServices] = useState([]);
    const navigate = useNavigate();

    const sectionStyle = {
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: '#e9ebee', // Facebook-like background color
        color: '#333',
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        try {
            const decoded = jwtDecode(token);
            setUser(decoded);
        } catch (error) {
            console.error('Failed to decode token:', error);
            navigate('/login');
        }
    }, [navigate]);

    useEffect(() => {
        const getLocation = () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        const { latitude, longitude } = position.coords;
                        setLocation(`Latitude: ${latitude}, Longitude: ${longitude}`);

                        try {
                            const response = await fetch(
                                `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
                            );
                            const data = await response.json();
                            if (data && data.address && data.address.city) {
                                setLocationName(data.address.city); // Display only the city/town
                                await updateLocationInDatabase(latitude, longitude, data.address.city);
                            } else {
                                setLocationName('City not found');
                            }
                        } catch (error) {
                            console.error('Error fetching location name:', error);
                            setLocationName('Error retrieving location');
                        }
                    },
                    (error) => {
                        console.error('Error getting location:', error);
                        setLocation('Location not available');
                    }
                );
            } else {
                setLocation('Geolocation is not supported by this browser.');
            }
        };

        getLocation();
    }, []);

    const updateLocationInDatabase = async (latitude, longitude, currentTown) => {
        try {
            const response = await fetch('http://localhost:8081/api/update-location', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ latitude, longitude, current_town: currentTown })
            });

            if (!response.ok) {
                console.error('Failed to update location:', response.statusText);
            } else {
                const data = await response.json();
                console.log('Location update response:', data);
            }
        } catch (error) {
            console.error('Error updating location:', error.message);
        }
    };

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const response = await fetch('http://localhost:8081/api/services', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                const data = await response.json();
                setServices(data);
            } catch (error) {
                console.error('Error fetching services:', error);
            }
        };

        const fetchSelectedServices = async () => {
            if (!user) return;
            try {
                const response = await fetch('http://localhost:8081/api/provider-services', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                const data = await response.json();
                setSelectedServices(data.map(service => service.id));
            } catch (error) {
                console.error('Error fetching selected services:', error);
            }
        };

        fetchServices();
        if (user) {
            fetchSelectedServices();
        }
    }, [user]);

    const goToNewPage = () => {
        navigate('/my-requests');
    };

    return (
        <Box sx={sectionStyle}>
            {/* Left Sidebar */}
            <Box sx={{ width: '20%', padding: 2 }}>
                <List component="nav">
                    <ListItem button component={Link} to="/profile">
                        <ListItemText primary="Profile" />
                    </ListItem>
                    <ListItem button component={Link} to="/settings">
                        <ListItemText primary="Settings" />
                    </ListItem>
                    <ListItem button component={Link} to="/notifications">
                        <ListItemText primary="Notifications" />
                    </ListItem>
                    <Divider />
                    <ListItem button component={Link} to="/logout">
                        <ListItemText primary="Logout" />
                    </ListItem>
                </List>
            </Box>

            {/* Main Content Area */}
            <Box sx={{ flexGrow: 1 }}>
                {/* Top Bar */}
                <AppBar position="fixed" sx={{ backgroundColor: '#4267B2', zIndex: 1300 }}>
                    <Toolbar>
                        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
                            Tasky
                        </Typography>
                        <Typography variant="h6" sx={{ mr: 2 }}>
                            My Dashboard
                        </Typography>
                        <Button color="inherit" component={Link} to="/about">About Us</Button>
                        <Button color="inherit" component={Link} to="/login">Login</Button>
                        <Button color="inherit" component={Link} to="/signup">Sign Up</Button>
                    </Toolbar>
                </AppBar>

                {/* Profile and Services Section */}
                <Container maxWidth="md" sx={{ marginTop: '80px', padding: 2 }}>
                    <Paper sx={{ padding: 3, backgroundColor: '#fff', borderRadius: 2, boxShadow: 1 }}>
                        <Typography variant="h6" sx={{ color: '#666', marginBottom: 1 }}>
                            Current Location: {locationName || 'Loading...'}
                        </Typography>
                        <Typography variant="h5" sx={{ color: '#333', fontWeight: 'bold' }}>
                            {user ? `${user.f_name} ${user.l_name}` : 'User'}
                        </Typography>
                        <Divider sx={{ my: 2 }} />

                        {/* Manage Services Section */}
                        <Typography variant="h6" sx={{ color: '#666', marginBottom: 1 }}>
                            Manage Your Services
                        </Typography>
                        <ServiceTable
                            services={services}
                            selectedServices={selectedServices}
                            onUpdateServices={setSelectedServices}
                            providerId={user ? user.id : null}
                        />
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={goToNewPage}
                            sx={{ marginTop: 3, backgroundColor: '#4267B2' }}
                        >
                            My Requests
                        </Button>
                    </Paper>
                </Container>
            </Box>
        </Box>
    );
};

export default ProviderDashboard;
