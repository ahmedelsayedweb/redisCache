var rateLimiter = require('redis-rate-limiter');

var middleware = rateLimiter.middleware({
    redis: client,
    key: 'ip',
    rate: '100/minute'
});

app.use(middleware);