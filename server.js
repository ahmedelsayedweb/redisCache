// Import the installed modules.
const express = require('express');
const axios = require('axios');
const redis = require('redis');

const client = redis.createClient();

const app = express();
app.get('/api/search', (req, res) => {
    // Extract the query from url and trim trailing spaces
    const query = (req.query.query).trim();
    // Build the Wikipedia API url
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=parse&format=json&section=0&page=${query}`;

    // Try fetching the result from Redis first in case we have it cached
    return client.get(`wikipedia:${query}`, (err, result) => {
        // If that key exist in Redis store
        if (result) {
            const resultJSON = JSON.parse(result);
            return res.status(200).json(resultJSON);
        } else {
            // Key does not exist in Redis store
            // Fetch directly from Wikipedia API
            return axios.get(searchUrl)
                .then(response => {
                    const responseJSON = response.data;
                    // Save the Wikipedia API response in Redis store
                    client.set(`wikipedia:${query}`, JSON.stringify({ source: 'Redis Cache', ...responseJSON, }), 'EX', 60);
                    // Send JSON response to client
                    return res.status(200).json({ source: 'Wikipedia API', ...responseJSON, });
                })
                .catch(err => {
                    return res.json(err);
                });
        }
    });
});
app.listen(4000, () => {
    console.log('Server listening on port: ', 4000);
});