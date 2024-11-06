import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Button,
    CircularProgress,
    Avatar,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Divider,
    Alert
} from '@mui/material';
import { useLocation } from 'react-router-dom';
import backgroundImage from "./images/duplo24.jpg";
import Navbar from './Navbar';
import Rating from '@mui/material/Rating';

const ProviderProfile = () => {
    const location = useLocation();
    const provider = location.state?.provider; // Safely access provider from location state
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedRating, setSelectedRating] = useState(0); // Store selected rating value
    const [isSubmitting, setIsSubmitting] = useState(false); // To handle submission state
    const [averageRating, setAverageRating] = useState(null); // To store the average rating

    const sectionStyle = {
        width: '100%',
        height: '100vh',
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: '#333', // Set a dark color for text
    };

    useEffect(() => {
        const fetchServices = async () => {
            if (provider) {
                try {
                    const response = await fetch(`http://localhost:8081/api/providers/${provider.id}/services`, {
                        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                    });

                    if (response.ok) {
                        const data = await response.json();
                        setServices(data);
                    } else {
                        setError('Failed to fetch services');
                    }
                } catch (error) {
                    setError('Error fetching services');
                } finally {
                    setLoading(false); // Set loading to false after attempting to fetch services
                }
            } else {
                setLoading(false); // Handle case where provider is not available
            }
        };

        const fetchAverageRating = async () => {
            if (provider) {
                try {
                    const response = await fetch(`http://localhost:8081/api/providers/${provider.id}/average-rating`);
                    const data = await response.json();
                    setAverageRating(data.avgRating);
                } catch (error) {
                    console.error("Error fetching average rating:", error);
                }
            }
        };

        fetchServices();
        fetchAverageRating(); // Fetch average rating when the component mounts
    }, [provider]);

    const handleMakeRequest = async (serviceId) => {
        try {
            const response = await fetch(`http://localhost:8081/api/requests`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ serviceId, providerId: provider.id }),
            });

            if (response.ok) {
                const result = await response.json();
                alert(`Request sent successfully: ${result.message}`);
            } else {
                const errorData = await response.json();
                alert(`Failed to send request: ${errorData.message || 'Unknown error'}`);
            }
        } catch (error) {
            alert('Error sending request');
        }
    };

    const handleRatingSubmit = async () => {
        if (isSubmitting) return; // Prevent multiple submissions
        setIsSubmitting(true);
        try {
            const response = await fetch(`http://localhost:8081/api/ratings`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ providerId: provider.id, rating: selectedRating }),
            });

            if (response.ok) {
                alert("Rating submitted successfully");
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.message}`);
            }
        } catch (error) {
            alert("Error submitting rating");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return <CircularProgress sx={{ display: 'block', margin: 'auto', mt: 4 }} />;
    }

    if (!provider) {
        return <Typography variant="h6" color="error" align="center">No provider details available</Typography>;
    }

    return (
        <Box style={sectionStyle}>
            <Navbar />
            <Box sx={{ maxWidth: 800, mx: 'auto', p: 3, mt: 4, borderRadius: 2, boxShadow: 3 }}>
                <Box display="flex" alignItems="center" mb={3}>
                    <Avatar sx={{ width: 70, height: 70, mr: 3 }}>{provider.username[0]}</Avatar>
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#333' }}>{provider.username}'s Profile</Typography>
                        <Typography variant="subtitle1" sx={{ color: '#333' }}>{provider.f_name} {provider.l_name}</Typography>
                        <Typography variant="body1" sx={{ color: '#555' }}>Email: {provider.email}</Typography>

                        {/* Displaying Average Rating */}
                        <Typography variant="body2" sx={{ color: '#555' }}>
                            Average Rating: {averageRating !== null ? averageRating.toFixed(1) : "No ratings yet"}
                        </Typography>
                    </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Typography variant="h5" gutterBottom sx={{ color: '#333' }}>Services Offered:</Typography>
                {error && <Alert severity="error">{error}</Alert>}
                {services.length > 0 ? (
                    <List>
                        {services.map((service) => (
                            <React.Fragment key={service.id}>
                                <ListItem>
                                    <ListItemText
                                        primary={service.name}
                                        secondary="Click to request this service"
                                        primaryTypographyProps={{ sx: { color: '#333' } }} // Dark text for primary
                                        secondaryTypographyProps={{ sx: { color: '#777' } }} // Lighter gray for secondary
                                    />
                                    <ListItemSecondaryAction>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={() => handleMakeRequest(service.id)}
                                        >
                                            Make Request
                                        </Button>
                                    </ListItemSecondaryAction>
                                </ListItem>
                                <Divider />
                            </React.Fragment>
                        ))}
                    </List>
                ) : (
                    <Typography variant="body1" sx={{ color: '#555' }}>No services available</Typography>
                )}

                <Divider sx={{ my: 2 }} />

                <Typography variant="h6" sx={{ color: '#333' }}>Rate this Provider:</Typography>
                <Rating
                    value={selectedRating}
                    onChange={(event, newValue) => {
                        setSelectedRating(newValue);
                    }}
                    max={5}
                />
                <Button
                    variant="contained"
                    color="secondary"
                    onClick={handleRatingSubmit}
                    disabled={isSubmitting || selectedRating === 0}
                    sx={{ mt: 2 }}
                >
                    {isSubmitting ? "Submitting..." : "Submit Rating"}
                </Button>
            </Box>
        </Box>
    );
};

export default ProviderProfile;
