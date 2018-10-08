const axios = require('axios');
const express = require('express');
const redis = require('redis');
const responseTime = require('response-time');

const app = express();

app.use(responseTime());

const redisClient = redis.createClient();

redisClient.on('error', (err) => {
    console.log('Error' + err);
});

app.get('/todos', (req, res) => {

    // const query = (req.query.query).trim();

    const searchUrl = `https://jsonplaceholder.typicode.com/todos/`

    redisClient.get(`${searchUrl}`, (err, result) =>{

        if(result){
            console.time(`from redis`);
            console.log(`From the redis store`,result);
            res.status(200).send(`data is in the redis store`);
            console.timeEnd(`from redis`);
        }else{

            console.log(`Data not found in redis store`);
            console.time(`from the internet`);
            axios.get(searchUrl)
            .then(response => {
                console.log(response.data);
                redisClient.setex(`${searchUrl}`, 3600, JSON.stringify({ source: 'Redis Cache', ...response.data, }));
                res.status(200).send(`Not found in redis store`);
                console.timeEnd(`from the internet`);
            }).catch(err => {
                console.log(err);
            });
    

        }

    });

   

});


app.listen(3000, () => {
    console.log(`Sever listening on port 3000`);
});