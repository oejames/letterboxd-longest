import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReviewPage from './ReviewPage/ReviewPage';

const Home = () => {
  const [latestResults, setLatestResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestResults = async () => {
        try {
          console.log('starting');
          const response = await axios.get('http://localhost:3001/api/latest-results');
          console.log('set response');
          console.log('response: ', response);
          console.log('response data: ', response.data);
      
          // Assuming response.data is an object with a property like 'results'
          const latestResultsArray = response.data.results || [];
      
          setLatestResults(response.data);
          console.log('latest results array: ', latestResultsArray)
          setLoading(false);
        } catch (error) {
          console.error('Error fetching latest results:', error.message);
        }
      };

    fetchLatestResults();
  }, []);

  return (
    <div>
      <h2 className='weeklong'>This week's longest reviews</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className='week-reviews'>
          {/* <h3>This week's longest reviews</h3> */}
          
            {/* Display some basic information for debugging */}
            {latestResults.map((result, index) => (
              <div>{ReviewPage(result)}</div>
            ))}
          
        </div>
      )}
    </div>
  );
};

export default Home;
