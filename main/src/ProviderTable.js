import React, { useEffect, useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    Rating,
    CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const ProviderTable = ({ providers = [], setProviderRatings, selectedServices }) => {
    const navigate = useNavigate();
    const [loadingRequest, setLoadingRequest] = useState({}); // Track loading state for service requests per provider

    const handleViewProvider = (providerId) => {
        navigate(`/provider-profile/${providerId}`);
    };

    const handleRequestService = async (providerId) => {
        setLoadingRequest((prev) => ({ ...prev, [providerId]: true }));
        try {
            // Ensure there's a selected service for the provider
            if (!selectedServices || selectedServices.length === 0) {
                alert("Please select a service before requesting.");
                setLoadingRequest((prev) => ({ ...prev, [providerId]: false }));
                return;
            }

            const serviceId = selectedServices[0]; // Assuming the first selected service is used for the request

            const response = await fetch(`http://localhost:8081/api/service-requests`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({ providerId, serviceId }),
            });

            if (response.ok) {
                const data = await response.json();
                alert(`Service requested successfully: ${data.message}`);
            } else {
                alert("Failed to request service. Please try again.");
            }
        } catch (error) {
            console.error('Error requesting service:', error);
        } finally {
            setLoadingRequest((prev) => ({ ...prev, [providerId]: false }));
        }
    };

    const fetchProviderRatings = async (providerIds) => {
        try {
            const ratings = await Promise.all(
                providerIds.map(async (id) => {
                    const response = await fetch(`http://localhost:8081/api/provider-ratings/${id}`, {
                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                    });
                    const data = await response.json();
                    return { providerId: id, rating: data.average_rating || 0 };
                })
            );

            const ratingsMap = ratings.reduce((acc, curr) => {
                acc[curr.providerId] = curr.rating;
                return acc;
            }, {});
            setProviderRatings(ratingsMap);
        } catch (error) {
            console.error('Error fetching provider ratings:', error);
        }
    };

    useEffect(() => {
        const fetchProviderRatingsAndServices = async (providerIds) => {
            try {
                await fetchProviderRatings(providerIds);
            } catch (error) {
                console.error('Error in fetching ratings:', error);
            }
        };

        if (providers.length > 0) {
            fetchProviderRatingsAndServices(providers.map((provider) => provider.id));
        }
    }, [providers, setProviderRatings]);

    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Provider Name</TableCell>
                        <TableCell>Rating</TableCell>
                        <TableCell>Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {providers.map((provider) => (
                        <TableRow key={provider.id}>
                            <TableCell>{`${provider.f_name} ${provider.l_name}`}</TableCell>
                            <TableCell>
                                <Rating name={`rating-${provider.id}`} value={provider.rating || 0} readOnly />
                            </TableCell>
                            <TableCell>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => handleViewProvider(provider.id)}
                                    sx={{ marginRight: 1 }}
                                >
                                    View Profile
                                </Button>
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    onClick={() => handleRequestService(provider.id)}
                                    disabled={loadingRequest[provider.id]}
                                >
                                    {loadingRequest[provider.id] ? <CircularProgress size={24} /> : 'Request Service'}
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default ProviderTable;
