import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import axios from 'axios';
import ReviewDisplay from './components/ReviewDisplay';

import './App.css'; // Import the CSS file for styling

function App() {
  const [query, setQuery] = useState('');
  const [longestReview, setLongestReview] = useState('');

  const searchAndFindLongestReview = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/search?query=${query}`);
      const reviewText = response.data.longestReview.review;

      // Split the review text by lines
      const paragraphs = reviewText.split('\n\n');

      setLongestReview(paragraphs);
    } catch (error) {
      console.error('Error:', error.message);
    }
  };

  return (
    <div className="App">
       <Helmet>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
          <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300&family=Inter:wght@300;400;500&display=swap" rel="stylesheet" />
      
      </Helmet>
      <header className="App-header">
        <h1>Letterboxd's Longest Reviews</h1>
        <div className="search-container">
          <input
            type="text"
            placeholder="Search for a movie"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button onClick={searchAndFindLongestReview}>Search</button>
        </div>
      </header>
      <main>
        

        {longestReview && <ReviewDisplay paragraphs={longestReview} />}
      </main>
    </div>
  );
}

export default App;
