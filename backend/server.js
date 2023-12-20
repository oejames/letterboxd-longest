const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const cron = require('node-cron');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(cors());

app.get('/search', async (req, res) => {
    const query = req.query.query;

    try {
        const movieUrl = await searchMovie(query);
        const longestReview = await getLongestReview(movieUrl);
        res.json({ longestReview });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

const searchMovie = async (query) => {
    try {
        // const searchUrl = `https://letterboxd.com/search/${encodeURIComponent(query)}/`;
        // const response = await axios.get(searchUrl);
        // const $ = cheerio.load(response.data);

        // const movieLink = $('.film-poster a').first().attr('href');
        // if (!movieLink) {
        //     throw new Error('Movie not found');
        // }
        
        const formattedQuery = query.toLowerCase().replace(/\s+/g, '-').replace(/'/g, '');

        const movieUrl = `https://letterboxd.com/film/${encodeURIComponent(formattedQuery)}/reviews/`;
        console.log(movieUrl)
        return movieUrl;
    } catch (error) {
        throw new Error(`Error searching for the movie: ${error.message}`);
    }
};

// getting the longest review for a user-specified movie:
const getLongestReview = async (movieUrl) => {
    try {
        let page = 1;
        let allReviews = [];

        while (page < 40) {
            const response = await axios.get(`${movieUrl}/by/activity/page/${page}`);
            const $ = cheerio.load(response.data);

            const reviewPromises = [];

            const length = allReviews.length;

            for (const element of $('.film-detail-content .body-text.-prose.collapsible-text')) {
                const reviewText = $(element).text().trim();
                const dateElement = $(element).closest('.film-detail-content').find('.date a');
                // console.log('date element: ', dateElement)
                console.log(reviewText)

                if (reviewText.endsWith('...') || reviewText.endsWith('…')) {
                    console.log('The string ends with "..."');
                    // if the review ends with '...', fetch the full review text using the date's href
                    const reviewUrl = dateElement.attr('href');
                    const fullReview = await fetchFullReview(reviewUrl);
                    reviewPromises.push(fullReview);

                } else {
                    console.log('no button found')
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

        const longestReview = allReviews.reduce((max, review) =>
            review.length > max.length ? review : max
        );

        return longestReview;
    } catch (error) {
        throw new Error(`Error getting reviews: ${error.message}`);
    }
};









//if there was a 'more' button for the review, navigate to the full review url and get the review from there
const fetchFullReview = async (reviewUrl) => {
    try {
        console.log('fetching full')
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




// Simulated scraped data
let scrapedData = [];

// getting the reviews that display on the home page
const scrapeAndUpdateData = async () => {
  try {
    
        let page = 20;
        let allReviews = [];

        while (page < 90) {
            const response = await axios.get(`https://letterboxd.com/reviews/popular/this/week/page/${page}`);
            const $ = cheerio.load(response.data);

            const reviewPromises = [];

            const length = allReviews.length;

            for (const element of $('.film-detail-content .body-text.-prose.collapsible-text')) {
                const reviewText = $(element).text().trim();
                const dateElement = $(element).closest('.film-detail-content').find('.date a');
                const movieTitleElement = $(element).closest('.film-detail-content').find('.headline-2.prettify a')
                const movieTitle = movieTitleElement.text().trim().slice(0, movieTitleElement.text().trim().length-4);
        
                // console.log('date element: ', dateElement)
                console.log(reviewText)

                if (reviewText.endsWith('...') || reviewText.endsWith('…')) {
                    console.log('The string ends with "..."');
                    // if the review ends with '...', fetch the full review text using the date's href
                    
                    
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

        const longestReviews = allReviews
        .sort((a, b) => b.length - a.length) // Sort reviews in descending order by length
        .slice(0, 20);

        return longestReviews;
    } catch (error) {
        throw new Error(`Error getting reviews: ${error.message}`);
    }


};

// Schedule the job to run every minute for demonstration purposes
// cron.schedule('* * * * *', () => {
//   scrapedData=scrapeAndUpdateData();
// // });

// API endpoint to get the latest scraped data
app.get('/api/latest-results', async (req, res) => {
    try {
      // Wait for the scraping to finish
      scrapedData = await scrapeAndUpdateData();
      console.log('done scraping main');
      console.log('scraped data: ', scrapedData);
      res.json(scrapedData);
    } catch (error) {
      console.error('Error in route handler:', error.message);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
