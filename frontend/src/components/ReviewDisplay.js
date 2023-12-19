import React from 'react';

const ReviewDisplay = ({ paragraphs }) => {
  return (
    <div className="review-container">
      {paragraphs.map((paragraph, index) => (
        <p key={index}>{paragraph}</p>
      ))}
    </div>
  );
};

export default ReviewDisplay;
