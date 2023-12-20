import React from 'react';
import './ReviewPage.css';

function ReviewPage(result) {
    return (
        <div>
            <div className='review'>
                
                    {/* {result.review.split('\n\n')} */}
                    {result.review.split('\n\n').map((paragraph, index) => (
        <p key={index}>{paragraph}</p>
      ))}

            </div>
        </div>
        );
    };
  
  export default ReviewPage;
  