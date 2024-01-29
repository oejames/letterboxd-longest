const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(cors());


// Endpoint to search for a movie's longest review
app.get('/search', async (req, res) => {
    const query = req.query.query;
    const page = req.query.page; 
    console.log("page: ", page)

    try {
        const movieUrl = await searchMovie(query);
        const longestReview = await getLongestReview(movieUrl, page);
        res.json({ longestReview });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// Provides the correct url for a user's search, to be used to obtain the longest review
const searchMovie = async (query) => {
    try {        
        const formattedQuery = query.toLowerCase().replace(/\s+/g, '-').replace(/'/g, '');
        const movieUrl = `https://letterboxd.com/film/${encodeURIComponent(formattedQuery)}/reviews/`;
        console.log(movieUrl)
        return movieUrl;
    } catch (error) {
        throw new Error(`Error searching for the movie: ${error.message}`);
    }
};

// Gets the longest review for a user-specified movie
const getLongestReview = async (movieUrl, page) => {
    try {
        
        let allReviews = [];
        console.log("page: ", page);

        // Loop through pages of user reviews
        for (i = 1; i < 3; i++) {
            const response = await axios.get(`${movieUrl}/by/activity/page/${page}`);
            const $ = cheerio.load(response.data);

            const reviewPromises = [];

            const length = allReviews.length;

            for (const element of $('.film-detail-content .body-text.-prose.collapsible-text')) {
                const reviewText = $(element).text().trim();
                const dateElement = $(element).closest('.film-detail-content').find('.date a');
                console.log(reviewText)

                // if the review ends with '...', fetch the full review text using the date's href
                if (reviewText.endsWith('...') || reviewText.endsWith('…')) {
                    console.log('The string ends with "..."');
                    
                    const reviewUrl = dateElement.attr('href');
                    const fullReview = await fetchFullReview(reviewUrl);
                    reviewPromises.push(fullReview);

                } else {
                    console.log('No "more" button found')
                    allReviews.push({ review: reviewText, length: reviewText.length });
                    
                }
            };

            const newLength = allReviews.length;
            const reviews = await Promise.all(reviewPromises);
            allReviews = allReviews.concat(reviews);

            if (length == newLength) {
                console.log('No reviews or no more reviews found: ', page);
                break;
            }

            page++;
        }

        if (allReviews.length === 0) {
            throw new Error('No reviews found');
        }

        // Find the longest review
        const longestReview = allReviews.reduce((max, review) =>
            review.length > max.length ? review : max
        );

        return longestReview;
    } catch (error) {
        throw new Error(`Error getting reviews: ${error.message}`);
    }
};


// Fetch the full review text if there was a 'more' button in the review by going to the full review url
const fetchFullReview = async (reviewUrl) => {
    try {
        console.log('fetching full review')
        const fullReviewUrl = `https://letterboxd.com${reviewUrl}`;
        console.log(fullReviewUrl)
        const response = await axios.get(fullReviewUrl);
        const $ = cheerio.load(response.data);

         // select all <p> elements within .review element
        const paragraphs = $('.review p').map((_, element) => $(element).text().trim()).get();

        const fullReviewText = paragraphs.join('\n\n');
        const movieTitleElement = $('.headline-2.prettify a')
        const movieTitle = movieTitleElement.text().trim().slice(0, movieTitleElement.text().trim().length-4);
        console.log('movie title element: ', movieTitleElement)
        console.log('movie title: ', movieTitle)
        console.log('full review text: ', fullReviewText)

        return { review: fullReviewText, length: fullReviewText.length, title: movieTitle };
    } catch (error) {
        console.error(`Error fetching full review: ${error.message}`);
        return { review: '', length: 0 };
    }
};



// Endpoint to get the latest scraped data from the homepage
app.get('/api/latest-results', async (req, res) => {
    const page = req.query.page;
    
    try {      
      scrapedData = await scrapeAndUpdateData(page);
      console.log('scraped data: ', scrapedData);
      res.json(scrapedData);
    } catch (error) {
      console.error('Error in route handler:', error.message);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });


// Updates the reviews to display on the home page
const scrapeAndUpdateData = async (page) => {
  try {
        let allReviews = [];

        
        for (i = 1; i < 3; i++) {
            const response = await axios.get(`https://letterboxd.com/reviews/popular/this/week/page/${page}`);
            const $ = cheerio.load(response.data);
            const reviewPromises = [];

            const length = allReviews.length;

           // Iterate through review elements 
            for (const element of $('.film-detail-content .body-text.-prose.collapsible-text')) {
                const reviewText = $(element).text().trim();
                const dateElement = $(element).closest('.film-detail-content').find('.date a');
                const movieTitleElement = $(element).closest('.film-detail-content').find('.headline-2.prettify a')
                const movieTitle = movieTitleElement.text().trim().slice(0, movieTitleElement.text().trim().length-4);
                console.log(reviewText)

                // if the review ends with '...', fetch the full review text using the date's href
                if (reviewText.endsWith('...') || reviewText.endsWith('…')) {
                    console.log('The string ends with "..."');

                    console.log('movie title: ', movieTitle)
                    const reviewUrl = dateElement.attr('href');
                    const fullReview = await fetchFullReview(reviewUrl);
                    reviewPromises.push(fullReview);

                } else {
                    console.log('no button found')
                    allReviews.push({ review: reviewText, length: reviewText.length, title: movieTitle});
                    
                }
            };

            const newLength = allReviews.length;
            const reviews = await Promise.all(reviewPromises);
            allReviews = allReviews.concat(reviews);

            if (length == newLength) {
                console.log('No reviews or no more reviews found: ', page);
                break;
            }

            page++;
        }

        if (allReviews.length === 0) {
            throw new Error('No reviews found');
        }

        // Sort reviews in descending order by length and return the 5 longest
        const longestReviews = allReviews
        .sort((a, b) => b.length - a.length) 
        .slice(0, 5);

        return longestReviews;
    } catch (error) {
        throw new Error(`Error getting reviews: ${error.message}`);
    }
};




app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
