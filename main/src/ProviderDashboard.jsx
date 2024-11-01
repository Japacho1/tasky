import React, { useEffect, useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';
import ServiceTable from './ServiceTable'; // Import the ServiceTable component

const ProviderDashboard = () => {
    const [user, setUser] = useState(null); // State to hold the user details
    const [location, setLocation] = useState({ latitude: '', longitude: '', locationName: '' });
    const [services, setServices] = useState([]); // State to hold all available services
    const [selectedServices, setSelectedServices] = useState([]); // State to hold provider's selected services
    const navigate = useNavigate();

    // Fetch and decode the user token to get user information
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            const decoded = jwtDecode(token);
            setUser(decoded); // Set the decoded user object
        } catch (error) {
            console.error('Failed to decode token:', error);
            navigate('/login');
        }
    }, [navigate]);

    // Fetch all services and the services selected by the provider
    useEffect(() => {
        const fetchServices = async () => {
            try {
                const response = await fetch('http://localhost:8081/api/services', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                const data = await response.json();
                setServices(data); // Store the available services in state
            } catch (error) {
                console.error('Error fetching services:', error);
            }
        };

        // Fetch selected services for the logged-in provider
        const fetchSelectedServices = async () => {
            if (!user) return; // Ensure user is defined before making the request
            try {
                const response = await fetch(`http://localhost:8081/api/provider-services`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                const data = await response.json();

                // Set the state with only the IDs of the services selected by the provider
                setSelectedServices(data.map(service => service.id));
            } catch (error) {
                console.error('Error fetching selected services:', error);
            }
        };

        fetchServices(); // Fetch all services when the component loads

        if (user) {
            fetchSelectedServices(); // Fetch selected services only when `user` is set
        }
    }, [user]); // Dependency array to ensure `user` is defined before fetching selected services

    // Fetch location once the user is set
    useEffect(() => {
        if (user) {
            handleLocationUpdate(); // Automatically update the location on component mount or when user is defined
        }
    }, [user]); // Dependency array ensures this effect runs only when the user is set

    // Function to handle updating the location
    const handleLocationUpdate = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const { latitude, longitude } = position.coords;
                setLocation((prevLocation) => ({ ...prevLocation, latitude, longitude }));
                updateLocationInBackend(latitude, longitude);
                getLocationName(latitude, longitude);
            }, (error) => {
                console.error('Error fetching location:', error);
                alert('Unable to fetch location. Please check your browser settings.');
            }, { enableHighAccuracy: true }); // Request high-accuracy location
        } else {
            alert('Geolocation is not supported by your browser.');
        }
    };

    // Function to send updated location to backend
    const updateLocationInBackend = async (latitude, longitude) => {
        try {
            const response = await fetch('http://localhost:8081/api/update-location', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ latitude, longitude })
            });
            const result = await response.json();
            console.log("Backend Response:", result); // Log the response
            if (response.ok) {
                alert('Location updated successfully!');
            } else {
                console.error('Error updating location:', result);
            }
        } catch (error) {
            console.error('Error updating location:', error);
        }
    };

    // Function to get location name based on latitude and longitude
    const getLocationName = async (latitude, longitude) => {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            const data = await response.json();
            console.log("Reverse Geocoding Data:", data); // Log the response for debugging
            const locationName = data?.display_name || 'Unknown Location';
            setLocation((prevLocation) => ({ ...prevLocation, locationName }));
        } catch (error) {
            console.error('Error fetching location name:', error);
        }
    };

    // Function to handle updating the selected services
    const handleServiceUpdate = async (updatedServices) => {
        setSelectedServices(updatedServices); // Update the state locally
        try {
            const response = await fetch('http://localhost:8081/api/provider-services', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ serviceIds: updatedServices }) // Removed `providerId` since it's extracted from the token
            });
            if (response.ok) {
                alert('Services updated successfully!');
            } else {
                console.error('Error updating services:', await response.json());
            }
        } catch (error) {
            console.error('Error updating services:', error);
        }
    };

    return (
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" padding={3}>
            <Typography variant="h4">Provider Dashboard</Typography>
            <Typography variant="h6">Welcome, {user ? `${user.f_name} ${user.l_name}` : 'User'}!</Typography>

            <Box marginTop={2} width="80%">
                <Typography variant="h6">Manage Your Services</Typography>
                <ServiceTable
                    services={services}
                    selectedServices={selectedServices}
                    onUpdateServices={handleServiceUpdate} // Pass the update function as a prop
                />
            </Box>

            <Box marginTop={2}>
                <Typography variant="h6">Your Current Location</Typography>
                <Typography variant="body1">Latitude: {location.latitude}</Typography>
                <Typography variant="body1">Longitude: {location.longitude}</Typography>
                <Typography variant="body1">Location Name: {location.locationName}</Typography>
                <Button variant="contained" onClick={handleLocationUpdate} style={{ marginTop: 16 }}>
                    Update Location
                </Button>
            </Box>
        </Box>
    );
};

export default ProviderDashboard;
