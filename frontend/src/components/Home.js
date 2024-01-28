import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReviewPage from './ReviewPage/ReviewPage';

const Home = () => {
  const [allResults, setAllResults] = useState([]);
  const [currentPage, setCurrentPage] = useState(15);
  const [loading, setLoading] = useState(true);

  const fetchLatestResults = async (page) => {
    try {
      const response = await axios.get(`http://localhost:3001/api/latest-results?page=${page}`);
      const newResults = response.data;

      setAllResults((prevResults) => [...prevResults, ...newResults]);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching latest results:', error.message);
    }
  };

  useEffect(() => {
    fetchLatestResults(currentPage);
  }, [currentPage]);

  const handlePagination = () => {
    console.log("handle pagination");
    const updatedPage = currentPage + 2;
    setCurrentPage(updatedPage);
  };

  return (
    <div>
      <h2 className='weeklong'>This week's longest reviews</h2>
      {loading ? (
        <p className='loading-home'>Loading...</p>
      ) : (
        <div className='week-reviews'>
          {allResults.map((result, index) => (
            <div key={index}>{ReviewPage(result)}</div>
          ))}
          <button className="next-button" onClick={handlePagination}>Next</button>
        </div>
      )}
    </div>
  );
};

export default Home;
