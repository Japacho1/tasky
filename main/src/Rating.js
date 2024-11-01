import React, { useState } from "react";

const Rating = ({ providerId }) => {
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      setMessage("Rating must be between 1 and 5");
      return;
    }

    try {
      const response = await fetch(`http://localhost:8081/api/providers/${providerId}/rate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Assuming you have a JWT token saved in localStorage or state
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ rating })
      });

      if (!response.ok) throw new Error(`Error submitting rating: ${response.statusText}`);
      const data = await response.json();
      setMessage(data.message);
      setRating(0); // Reset rating after successful submission
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div>
      <h3>Rate this Provider:</h3>
      <form onSubmit={handleSubmit}>
        <input 
          type="number" 
          min="1" 
          max="5" 
          value={rating} 
          onChange={(e) => setRating(Number(e.target.value))} 
        />
        <button type="submit">Submit Rating</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default Rating;
