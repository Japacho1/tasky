import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Checkbox,
    FormControlLabel,
    FormGroup,
    Button,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import ProviderTable from './ProviderTable';

const Homepage = () => {
    const [user, setUser] = useState(null);
    const [providers, setProviders] = useState([]);
    const [providerRatings, setProviderRatings] = useState({});
    const [services, setServices] = useState([]);
    const [selectedServices, setSelectedServices] = useState([]);
    const navigate = useNavigate();

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
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                const data = await response.json();
                setServices(data);
            } catch (error) {
                console.error('Error fetching services:', error);
            }
        };

        fetchServices();
    }, []);

    const handleServiceChange = (serviceId) => {
        setSelectedServices((prevSelected) =>
            prevSelected.includes(serviceId)
                ? prevSelected.filter((id) => id !== serviceId)
                : [...prevSelected, serviceId]
        );
    };

    const fetchProviders = async () => {
        if (selectedServices.length === 0) {
            console.warn('No services selected to fetch providers.');
            return;
        }
    
        try {
            console.log("Selected Service IDs:", selectedServices);
            console.log("Request Body:", { serviceIds: selectedServices });
    
            const response = await fetch('http://localhost:8081/api/providers-by-service', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({ serviceIds: selectedServices }),
            });
    
            if (response.ok) {
                const providersData = await response.json();
                console.log('Providers:', providersData);
                setProviders(providersData);
            } else {
                throw new Error(`Failed to fetch providers. Server responded with status: ${response.status}`);
            }
        } catch (error) {
            console.error("Error fetching providers:", error);
        }
    };

    // Function to navigate to My Requests
    const handleMyRequests = () => {
        navigate('/my_requests');
    };

    return (
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" padding={3}>
            <Typography variant="h4">Welcome, {user ? `${user.f_name} ${user.l_name}` : 'User'}!</Typography>
            <Box marginTop={2} width="80%">
                <Typography variant="h6">Available Services</Typography>
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
                            label={service.name}
                        />
                    ))}
                </FormGroup>
                <Box marginTop={2}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={fetchProviders}
                        sx={{ marginBottom: 2 }}
                    >
                        Fetch Providers
                    </Button>
                    {/* Button to navigate to My Requests */}
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={handleMyRequests}
                    >
                        My Requests
                    </Button>
                </Box>
                <Box>
                    <Typography variant="h6">Available Service Providers</Typography>
                    <ProviderTable providers={providers} setProviderRatings={setProviderRatings} />
                </Box>
            </Box>
        </Box>
    );
};

export default Homepage;
