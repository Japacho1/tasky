import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, AppBar, Toolbar } from '@mui/material';
import { Link } from 'react-router-dom';
import backgroundImage from './images/duplo24.jpg';
import { jwtDecode } from 'jwt-decode';
import ServiceTable from './ServiceTable';
import { useNavigate } from 'react-router-dom';

const ProviderDashboard = () => {
    const [user, setUser] = useState(null);
    const [location, setLocation] = useState(''); // State to store user's location coordinates
    const [locationName, setLocationName] = useState('');
    const [services, setServices] = useState([]);
    const [selectedServices, setSelectedServices] = useState([]);
    const navigate = useNavigate();

    const sectionStyle = {
        width: '100%',
        height: '100vh',
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: '#fff',
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

                        // Fetch the location name using reverse geocoding
                        try {
                            const response = await fetch(
                                `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
                            );
                            const data = await response.json();
                            if (data && data.display_name) {
                                setLocationName(data.display_name);
                                // Update the location in the database
                                await updateLocationInDatabase(latitude, longitude, data.address.city || 'Unknown City');
                            } else {
                                setLocationName('Unable to retrieve location name');
                            }
                        } catch (error) {
                            console.error('Error fetching location name:', error);
                            setLocationName('Error retrieving location name');
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
        navigate('/my-requests'); // Replace with the path you want to navigate to
    };

    return (
        <Box display="flex" flexDirection="column" justifyContent="center" padding={3} style={sectionStyle}>
            <AppBar position="static" sx={{ backgroundColor: '#2E3B55' }}>
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Tasky
                    </Typography>
                    <Button color="inherit" component={Link} to="/about">About Us</Button>
                    <Button color="inherit" component={Link} to="/login">Login</Button>
                    <Button color="inherit" component={Link} to="/signup">Sign Up</Button>
                </Toolbar>
            </AppBar>
            
            <Typography variant="h6" marginTop={2} sx={{ color: '#fff' }}>
                Current Location: {locationName || 'Loading...'}
            </Typography>

            <Typography variant="h4" sx={{ color: '#fff', marginTop: 1 }}>My Dashboard</Typography>
            <Typography variant="h6" sx={{ color: '#ddd' }}>
                {user ? `${user.f_name} ${user.l_name}` : 'User'}
            </Typography>

            <Box marginTop={2} width="80%">
                <Typography variant="h6" sx={{ color: '#fff' }}>Manage Your Services</Typography>
                {/* Pass providerId to the ServiceTable component */}
                <ServiceTable
                    services={services}
                    selectedServices={selectedServices}
                    onUpdateServices={setSelectedServices} // Update function as a prop
                    providerId={user ? user.id : null}  // Pass providerId here
                />
            </Box>

            <Box marginTop={4} width="80%">
                <Button
                    variant="contained"
                    color="primary"
                    onClick={goToNewPage}
                    sx={{ marginTop: 2 }}
                >
                    My Requests
                </Button>
            </Box>
        </Box>
    );
};

export default ProviderDashboard;
