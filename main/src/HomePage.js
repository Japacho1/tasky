import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Checkbox,
    FormControlLabel,
    FormGroup,
    Button,
    Paper,
    Divider,
    Avatar,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import ProviderTable from './ProviderTable';
import Navbar from './Navbar';
import { motion } from 'framer-motion';

const Homepage = () => {
    const [user, setUser] = useState(null);
    const [providers, setProviders] = useState([]);
    const [services, setServices] = useState([]);
    const [selectedServices, setSelectedServices] = useState([]);
    const [locationName, setLocationName] = useState('');
    const [currentCity, setCurrentCity] = useState('');
    const navigate = useNavigate();

    const sectionStyle = {
        width: '100%',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#f4f6f8', // Light background color
        color: '#333',
        padding: '24px',
    };

    const containerStyle = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        overflowY: 'auto',
        maxWidth: '1200px',
        margin: '0 auto',
    };

    const sectionPaperStyle = {
        padding: 3,
        width: '100%',
        maxWidth: 800,
        borderRadius: 2,
        marginBottom: 2,
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
        const fetchServices = async () => {
            try {
                const response = await fetch('http://localhost:8081/api/services', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                });
                const data = await response.json();
                setServices(data);
            } catch (error) {
                console.error('Error fetching services:', error);
            }
        };
        fetchServices();
    }, []);

    useEffect(() => {
        const getLocation = () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        const { latitude, longitude } = position.coords;

                        try {
                            const response = await fetch(
                                `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
                            );
                            const data = await response.json();
                            if (data && data.address) {
                                const city = data.address.city || data.address.town || data.address.village || 'City not found';
                                setCurrentCity(city);
                                setLocationName(data.display_name);
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
                        setLocationName('Location not available');
                    }
                );
            } else {
                setLocationName('Geolocation is not supported by this browser.');
            }
        };
        getLocation();
    }, []);

    const fetchProviders = async () => {
        if (selectedServices.length === 0) {
            console.warn('No services selected to fetch providers.');
            return;
        }

        try {
            const response = await fetch('http://localhost:8081/api/providers-by-service', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({ serviceIds: selectedServices, city: currentCity }),
            });

            if (response.ok) {
                const providersData = await response.json();
                setProviders(providersData);
            } else {
                throw new Error(`Failed to fetch providers. Server responded with status: ${response.status}`);
            }
        } catch (error) {
            console.error('Error fetching providers:', error);
        }
    };

    const handleServiceChange = (serviceId) => {
        setSelectedServices((prevSelected) =>
            prevSelected.includes(serviceId)
                ? prevSelected.filter((id) => id !== serviceId)
                : [...prevSelected, serviceId]
        );
    };

    const handleMyRequests = () => {
        navigate('/my_requests');
    };

    return (
        <Box style={sectionStyle}>
            {/* Animated Navbar */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
                <Navbar />
            </motion.div>

            <Box sx={containerStyle}>
                {/* Animated Paper for User Info */}
                <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 1 }}>
                    <Paper elevation={3} sx={sectionPaperStyle}>
                        <Box display="flex" alignItems="center" mb={2}>
                            <Avatar sx={{ marginRight: 2 }} />
                            <Typography variant="h5">{user ? `${user.f_name} ${user.l_name}` : 'User'}!</Typography>
                        </Box>

                        <Typography variant="h6" sx={{ color: '#555', fontWeight: 600, marginBottom: 2 }}>
                            Current City: {currentCity}
                        </Typography>
                    </Paper>
                </motion.div>

                {/* Animated Services Section */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
                    <Box width="100%" mt={4}>
                        <Typography variant="h5" sx={{ color: '#555' }}>
                            AVAILABLE SERVICES
                        </Typography>
                        <FormGroup row>
                            {services.map((service) => (
                                <FormControlLabel
                                    key={service.id}
                                    control={
                                        <Checkbox
                                            checked={selectedServices.includes(service.id)}
                                            onChange={() => handleServiceChange(service.id)}
                                        />
                                    }
                                    sx={{ color: '#555' }}
                                    label={service.name}
                                />
                            ))}
                        </FormGroup>
                        <Box mt={2}>
                            <Button variant="contained" color="primary" onClick={fetchProviders} sx={{ marginRight: 2 }}>
                                Fetch Providers
                            </Button>
                            <Button variant="contained" color="secondary" onClick={handleMyRequests}>
                                My Requests...
                            </Button>
                        </Box>
                    </Box>
                </motion.div>

                <Divider sx={{ my: 3 }} />

                {/* Animated Providers Table Section */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
                    <Box width="100%" flex={1}>
                        <Typography variant="h5" sx={{ color: '#555' }}>
                            Available Service Providers
                        </Typography>
                        <ProviderTable providers={providers} />
                    </Box>
                </motion.div>
            </Box>
        </Box>
    );
};

export default Homepage;
