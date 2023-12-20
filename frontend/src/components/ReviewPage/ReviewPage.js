import React from 'react';
import './ReviewPage.css';

function ReviewPage(result) {
    return (
        <div>
<<<<<<< HEAD
            <div className='review'> 
            <h2 className='movie-title'>{result.title}</h2> 
=======
            
            <div className='review'>
                
            <h2 className='movie-title'>{result.title}</h2>
            
>>>>>>> origin/main
                    {result.review.split('\n\n').map((paragraph, index) => (
        <p key={index}>{paragraph}</p>
      ))}
            </div>
        </div>
        );
    };
  
  export default ReviewPage;
  