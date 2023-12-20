import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import axios from 'axios';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import ReviewDisplay from './components/ReviewDisplay';
import Home from './components/Home';

import './App.css';

function App() {
  const [query, setQuery] = useState('');
  const [searchResult, setSearchResult] = useState(null);

  const searchAndFindLongestReview = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/search?query=${query}`);
      const reviewText = response.data.longestReview.review;

      // splitting the review text by lines
      const paragraphs = reviewText.split('\n\n');

      setSearchResult(paragraphs);
    } catch (error) {
      console.error('Error:', error.message);
    }
  };

  const navigateToHome = () => {
    setSearchResult(null);
    // Use the Navigate component to navigate to the home route
    return <Navigate to="/" />;
  };

  return (
    <div className="App">
      <Helmet>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300&family=Inter:wght@300;400;500&display=swap" rel="stylesheet" />
      </Helmet>
      <Router>
        <header className="App-header">
          <h1>
            {/* Link to the home page */}
            <Link to="/" onClick={ navigateToHome}>Letterboxd's Longest Reviews</Link>
          </h1>
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
  {searchResult ? (
    // Render search results when a query is present
    <ReviewDisplay paragraphs={searchResult} />
  ) : (
    // Render the home page when no query is present
    <Routes>
      <Route path="/" element={<Home />} />
    </Routes>
  )}
</main>


        
      </Router>
    </div>
  );
}

export default App;
