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
import Navbar from './Navbar'; 
import backgroundImage from "./images/duplo24.jpg";

const Homepage = () => {
    const [user, setUser] = useState(null);
    const [providers, setProviders] = useState([]);
    const [providerRatings, setProviderRatings] = useState({});
    const [services, setServices] = useState([]);
    const [selectedServices, setSelectedServices] = useState([]);
    const [location, setLocation] = useState(''); // State to store user's location coordinates
    const [locationName, setLocationName] = useState(''); // State to store user's location name
    const [currentCity, setCurrentCity] = useState(''); // State to store current city
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

    useEffect(() => {
        // Get user's location
        const getLocation = () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        const { latitude, longitude } = position.coords;
                        setLocation(`Latitude: ${latitude}, Longitude: ${longitude}`);

                        // Fetch the location name using reverse geocoding
                        try {
                            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
                            const data = await response.json();
                            if (data && data.address) {
                                // Extract city name from address
                                const city = data.address.city || data.address.town || data.address.village || 'City not found';
                                setCurrentCity(city); // Set the city name
                                setLocationName(data.display_name); // Set the full address

                                // Log city, latitude, and longitude before updating
                                console.log("City:", city, "Latitude:", latitude, "Longitude:", longitude);

                                // Update the user's city in the database
                                await updateUserCity(city, latitude, longitude);
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

    const updateUserCity = async (city, latitude, longitude) => {
        if (latitude === undefined || longitude === undefined) {
            console.error("Latitude or longitude is undefined. Check geolocation permissions and implementation.");
            return;
        }
    
        try {
            const response = await fetch('http://localhost:8081/api/update-requester-location', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({ city, latitude, longitude }),
            });
    
            if (!response.ok) {
                throw new Error(`Failed to update city. Server responded with status: ${response.status}`);
            }
    
            console.log('City and location updated successfully:', { city, latitude, longitude });
        } catch (error) {
            console.error('Error updating city:', error);
        }
    };
    
    useEffect(() => {
        const fetchProvidersWithLocation = async () => {
            try {
                const response = await fetch('http://localhost:8081/api/providers-with-location', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });
                const data = await response.json();
                console.log("Providers Data:", data); // Log the data to verify it's an array
                setProviders(data); // Set providers state
            } catch (error) {
                console.error('Error fetching provider data:', error);
            }
        };
    
        fetchProvidersWithLocation();
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
            console.log("Request Body:", { serviceIds: selectedServices, city: currentCity });
    
            const response = await fetch('http://localhost:8081/api/providers-by-service', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({ serviceIds: selectedServices, city: currentCity }), // Include city
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
        <Box style={sectionStyle} display="flex" flexDirection="column" alignItems="left" justifyContent="center" padding={3}>
            <Navbar />
            <Box display="flex" flexDirection="column" alignItems="left" justifyContent="center" padding={3}>
                <Typography variant="h4" sx={{ fontFamily: "'Roboto', sans-serif", marginTop: 1, marginBottom: 2, color: "secondary", }} color="secondary" gutterBottom>{user ? `${user.f_name} ${user.l_name}` : 'User'}!</Typography>
                {/* Display User Location Coordinates and Name */}
                <Typography variant="h6" marginTop={2} sx={{ color: '#555' }}>Your Location: {location}</Typography>
                <Typography variant="h6" marginTop={2} sx={{ color: '#555' }}>Current Location: {locationName}</Typography>
                <Typography variant="h6" marginTop={2} sx={{ color: '#555' }}>Current City: {currentCity}</Typography> {/* Display Current City */}
                <Box marginTop={2} width="80%">
                    <Typography variant="h6" sx={{ color: '#555' }}>AVAILABLE SERVICES</Typography>
                    <Typography sx={{ color: '#555' }}>Check on a service and click on fetch providers to see the providers available around you</Typography>
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
                                sx={{ color: '#555' }} label={service.name}
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
                            sx={{ marginBottom: 2, marginLeft: 2 }}
                        >
                            My Requests...
                        </Button>
                    </Box>
                    <Box>
                        <Typography variant="h6">Available Service Providers</Typography>
                        <ProviderTable providers={providers} setProviderRatings={setProviderRatings} />
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default Homepage;
