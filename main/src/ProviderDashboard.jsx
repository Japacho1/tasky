import React, { useEffect, useState } from 'react';
import { Box, Typography, Button } from '@mui/material';


import {jwtDecode} from 'jwt-decode';
import ServiceTable from './ServiceTable';
import { useNavigate } from 'react-router-dom';
 // Import the new ProviderRequests component

const ProviderDashboard = () => {
    const [user, setUser] = useState(null);
    const [location, setLocation] = useState({ latitude: '', longitude: '', locationName: '' });
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
    const goToNewPage = () => {
        navigate('/my-requests'); // Replace '/new-page' with the path you want to navigate to
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

    return (
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" padding={3}>
            <Typography variant="h4">Provider Dashboard</Typography>
            <Typography variant="h6">Welcome, {user ? `${user.f_name} ${user.l_name}` : 'User'}!</Typography>

            <Box marginTop={2} width="80%">
                <Typography variant="h6">Manage Your Services</Typography>
                <ServiceTable
                    services={services}
                    selectedServices={selectedServices}
                    onUpdateServices={setSelectedServices} // Update function as a prop
                />
            </Box>

            <Box marginTop={4} width="80%">
            <Button
                variant="contained"
                color="primary"
                onClick={goToNewPage} // Call the function on button click
                style={{ marginTop: '20px' }}
            >
                Go to New Page
            </Button>
            </Box>
        </Box>
    );
};

export default ProviderDashboard;
