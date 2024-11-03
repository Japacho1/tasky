import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const ProviderProfile = () => {
    const location = useLocation();
    const provider = location.state?.provider;
    const [services, setServices] = useState([]); // State to hold services
    const [loading, setLoading] = useState(true); // State to manage loading
    const [error, setError] = useState(null); // State to hold error messages

    useEffect(() => {
        const fetchServices = async () => {
            if (provider) {
                try {
                    const response = await fetch(`http://localhost:8081/api/providers/${provider.id}/services`, {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        },
                    });

                    if (response.ok) {
                        const data = await response.json();
                        setServices(data); // Set the services in state
                    } else {
                        console.error('Failed to fetch services');
                        setError('Failed to fetch services');
                    }
                } catch (error) {
                    console.error('Error fetching services:', error);
                    setError('Error fetching services');
                } finally {
                    setLoading(false); // Set loading to false after fetch
                }
            }
        };

        fetchServices(); // Call the function to fetch services
    }, [provider]);

    // Function to handle making a request to the provider
    const handleMakeRequest = async (serviceId) => {
        try {
            const response = await fetch(`http://localhost:8081/api/requests`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ serviceId, providerId: provider.id }), // Pass service and provider ID
            });

            if (response.ok) {
                const result = await response.json();
                alert(`Request sent successfully: ${result.message}`);
            } else {
                const errorData = await response.json();
                alert(`Failed to send request: ${errorData.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error sending request:', error);
            alert('Error sending request');
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!provider) {
        return <div>No provider details available</div>;
    }

    return (
        <div>
            <h2>{provider.username}'s Profile</h2>
            <p>Name: {provider.f_name} {provider.l_name}</p>
            <p>Email: {provider.email}</p>
            <p>Average Rating: {provider.rating ? provider.rating.toFixed(1) : "N/A"}</p>
            <h3>Services Offered:</h3>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {services.length > 0 ? (
                <ul>
                    {services.map((service) => (
                        <li key={service.id}>
                            {service.name} 
                            <button onClick={() => handleMakeRequest(service.id)}>Make Request</button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No services available</p>
                
            )}
            
        </div>
    );
};

export default ProviderProfile;
