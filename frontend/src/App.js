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
  const [currentPage, setCurrentPage] = useState(1);


  const searchAndFindLongestReview = async (page = 1) => {
    try {
      const pageNumber = parseInt(page, 10)
      const response = await axios.get(`http://localhost:3001/search?query=${query}&page=${pageNumber}`);
      const reviewText = response.data.longestReview.review;

      // splitting the review text by lines
      const paragraphs = reviewText.split('\n\n');

      setSearchResult(paragraphs);
      setCurrentPage(page);

    } catch (error) {
      console.error('Error:', error.message);
    }
  };

  const handlePagination = () => {
    const updatedPage = currentPage + 3;
    setCurrentPage(updatedPage);
    searchAndFindLongestReview(updatedPage);
  }

  const navigateToHome = () => {
    setSearchResult(null);
    return <Navigate to="/" />;
  };


  return (
    <div className="App">
      <Helmet>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300&family=Inter:wght@300;400;500&display=swap" rel="stylesheet" />
        <link href="https://db.onlinewebfonts.com/c/171d30888ae4dbce3d0224490887fb87?family=TiemposHeadline-Bold" rel="stylesheet"></link>
      </Helmet>
      <Router>
        <header className="App-header">
          <h1>
            <Link to="/" onClick={ navigateToHome}>Letterboxd's Longest Reviews</Link>
          </h1>
          <div className="search-container">
            <input
              type="text"
              placeholder="Search for a movie"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button onClick={() => searchAndFindLongestReview(1)}>Search</button>
          </div>
        </header>
        <main>
          {searchResult ? (
            <ReviewDisplay paragraphs={searchResult} />
          ) : (
            <Routes>
              <Route path="/" element={<Home />} />
            </Routes>
          )}

          {searchResult && (
            <div className='pagination'>
              {/* <button onClick={handlePagination}>Load More Reviews</button> */}
            </div>

          )}
      </main>
      </Router>
    </div>
  );
}

export default App;
