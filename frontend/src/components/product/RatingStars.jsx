import React from 'react';

const RatingStars = ({ rating = 0, numReviews, showScore = true }) => {
  const numericRating = Number(rating) || 0;
  const stars = [];

  for (let i = 1; i <= 5; i++) {
    if (numericRating >= i) {
      stars.push(<i key={i} className="bi bi-star-fill text-warning"></i>);
    } else if (numericRating >= i - 0.5) {
      stars.push(<i key={i} className="bi bi-star-half text-warning"></i>);
    } else {
      stars.push(<i key={i} className="bi bi-star text-warning"></i>);
    }
  }

  return (
    <div className="d-inline-flex align-items-center gap-1">
      <span className="rating-stars">{stars}</span>
      {showScore && (
        <span className="fw-bold small text-dark ms-1">
          {numericRating.toFixed(1)}
        </span>
      )}
      {numReviews !== undefined && (
        <span className="text-muted small">({numReviews})</span>
      )}
    </div>
  );
};

export default RatingStars;
