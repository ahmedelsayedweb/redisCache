const redis = require('redis')
const redisClient = redis.createClient()
const moment = require('moment')
redisClient.on("ready", function () {
    console.log("Redis connection ready 2");
});
const rateLimiter = (req, res, next) => {
    redisClient.exists(req.ip, (err, reply) => {
        if (err) {
            console.log("Redis not working...")
            system.exit(0)
        }
        if (reply === 1) {
            // user exists
            // check time interval
            redisClient.get(req.ip, (err, reply) => {
                let data = JSON.parse(reply)
                let currentTime = moment().unix()
                let difference = (currentTime - data.startTime) / 60
                if (difference >= 1) {
                    let body = {
                        'count': 1,
                        'startTime': moment().unix()
                    }
                    redisClient.set(req.ip, JSON.stringify(body))
                    // allow the request
                    next()
                }
                if (difference < 1) {
                    if (data.count > 2) {
                        // res.status(429).send('Too Many Requests');
                        return res.status(429).json({ "error": 1, "message": "Too Many Requests..." })
                    }
                    // update the count and allow the request
                    data.count++
                    redisClient.set(req.ip, JSON.stringify(data))
                    // allow request
                    next()
                }
            })
        } else {
            // add new user
            let body = {
                'count': 1,
                'startTime': moment().unix()
            }
            redisClient.set(req.ip, JSON.stringify(body))
            // allow request
            next()
        }
    })
}
module.exports = rateLimiter