const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const redis = require('redis');

//set port
const PORT = process.env.PORT || 3000;

//init express
const app = express();

//create redis client
let client = redis.createClient();

client.on('connect', () => {
    console.log('connected to redis');
});

//body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'public')));

app.post('/url', (req, res, next) => {

    let url = req.body.url;
    console.log(url);
    let key;

    //get keys
    client.keys('*', (err, keys) => {
        if (err) {
            throw err;
        } else {
            console.log(keys);
            //generate random keys until unique
            do {
                key = Math.random().toString(36).substring(2, 15);
                console.log(key);
            } while (keys.includes(key));

            //set the key:url in redis
            client.set(key, url, 'EX', 60 * 60 * 2, err => {
                if (err) {
                    throw err;
                } else {
                    //get to confirm it exists
                    client.get(key, (err, val) => {
                        if (err) {
                            throw err;
                        } else {
                            console.log(val);
                            res.json({ redirect: `${req.protocol}://${req.get('host')}/${key}` });
                        }
                    });
                }
            });
        }
    });
});

//handle receiving key
app.get('/:key', (req, res) => {
    console.log(req.params.key);
    //if no key, the key will be favicon.ico so do nothing
    if (req.params.key != 'favicon.ico') {
        //get url from redis
        client.get(req.params.key, (err, val) => {
            if (err) {
                console.log(err);
                throw err;
            } else {
                //if key is invalid (no entry in redis) redirect to index
                if (val == null) {
                    res.redirect(`${req.protocol}://${req.get('host')}`);
                } else { //else redirect to stored url
                    console.log(val);
                    res.redirect(val);
                }
            }
        });
    }
});

//generate a unique key
const generateKey = () => {
    let newKey;
    //get keys

    return newKey;
}

app.listen(PORT, () => console.log('listening on port: ' + PORT));