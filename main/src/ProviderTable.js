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

    const handleViewProvider = (provider) => {
        navigate(`/provider-profile/${provider.id}`, { state: { provider } });
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
        if (providers.length > 0) {
            fetchProviderRatings(providers.map((provider) => provider.id));
        }
    }, [providers]);

    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Provider Name</TableCell>
                        <TableCell>Rating</TableCell>
                        <TableCell>Actions</TableCell>
                        <TableCell>Location</TableCell>
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
                                    onClick={() => handleViewProvider(provider)}
                                    sx={{ marginRight: 1 }}
                                >
                                    View Profile
                                </Button>
                               
                            </TableCell>
                            <TableCell>
                                
                               
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default ProviderTable;
