const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');

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


const getLongestReview = async (movieUrl) => {
    try {
        let page = 1;
        let allReviews = [];

        while (page < 8) {
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

        console.log('full review text: ', fullReviewText)
        return { review: fullReviewText, length: fullReviewText.length };
    } catch (error) {
        console.error(`Error fetching full review: ${error.message}`);
        return { review: '', length: 0 };
    }
};







app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
