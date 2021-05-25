const redis = require('redis');
const { RateLimiterRedis } = require('rate-limiter-flexible');

// Create redis client
// const redisClient = redis.createClient({
//     host: 'redis',
// });
const redisClient = redis.createClient();
redisClient.on('error', err => {
    console.log('Error ' + err);
});
redisClient.on("end", function () {
    console.log("Redis connection closed");
});
redisClient.on("ready", function () {
    console.log("Redis connection ready");
});
// Setup Rate Limiter
const rateLimiter = new RateLimiterRedis({
    redis: redisClient, // redis client instance
    keyPrefix: 'appname:rl', // prefix your keys with some name
    points: 1, // 10 requests
    duration: 1, // per 1 second by IP
});

// Setup the middleware using the rate limiter config
const rateLimiterMiddleware = (req, res, next) => {
    // On the basis of ip address, but can be modified according to your needs
    console.log(req.ip)
    rateLimiter
        .consume(req.ip)
        .then(() => {
            next();
        })
        .catch(() => {
            res.status(429).send('Too Many Requests');
        });
};

module.exports = rateLimiterMiddleware;