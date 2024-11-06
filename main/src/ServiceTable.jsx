import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, Button } from '@mui/material';

const ServiceTable = ({ services, selectedServices, onUpdateServices, providerId }) => {
    // Function to handle adding/removing a service
    const handleServiceToggle = async (serviceId) => {
        // Determine if the service is being added or removed
        const isRemoving = selectedServices.includes(serviceId);

        // Update selected services locally
        const updatedServices = isRemoving
            ? selectedServices.filter(id => id !== serviceId) // Remove if exists
            : [...selectedServices, serviceId]; // Add if not exists

        // Log the action
        console.log(`${isRemoving ? 'Removing' : 'Adding'} service with ID: ${serviceId}`);

        // Call onUpdateServices to update in parent component
        await onUpdateServices(updatedServices);

        if (isRemoving) {
            // If the service is being removed, make a DELETE request to the backend
            try {
                console.log('Removing service:', serviceId, 'for provider:', providerId);

                if (!providerId) {
                    console.error('Provider ID is missing!');
                    return;
                }

                // Make the DELETE request to the backend
                const response = await fetch(`http://localhost:8081/api/provider-services/${providerId}/${serviceId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    },
                });

                if (response.ok) {
                    console.log(`Service with ID: ${serviceId} removed from provider.`);
                } else {
                    console.error('Failed to remove service from the backend.');
                }
            } catch (error) {
                console.error('Error while removing service:', error);
            }
        } else {
            // If the service is being added, make a POST request to add it
            try {
                console.log('Adding service:', serviceId, 'for provider:', providerId);

                if (!providerId) {
                    console.error('Provider ID is missing!');
                    return;
                }

                // Prepare request data for the POST request
                const requestData = {
                    provider_id: providerId,
                    service_id: serviceId,
                };

                // Make the POST request to add the service
                const response = await fetch('http://localhost:8081/api/provider-services-add', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    },
                    body: JSON.stringify(requestData),
                });

                if (response.ok) {
                    console.log(`Service with ID: ${serviceId} added to provider.`);
                } else {
                    const errorData = await response.json();
                    console.error('Failed to add service:', errorData);
                }
            } catch (error) {
                console.error('Error while adding service:', error);
            }
        }
    };

    return (
        <Table>
            <TableHead>
                <TableRow>
                    <TableCell>Service Name</TableCell>
                    <TableCell align="center">Action</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {services.map((service) => (
                    <TableRow key={service.id}>
                        <TableCell>{service.name}</TableCell>
                        <TableCell align="center">
                            <Button
                                variant={selectedServices.includes(service.id) ? 'contained' : 'outlined'}
                                color={selectedServices.includes(service.id) ? 'secondary' : 'primary'}
                                onClick={() => handleServiceToggle(service.id)}
                            >
                                {selectedServices.includes(service.id) ? 'Remove' : 'Add'}
                            </Button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};

export default ServiceTable;
