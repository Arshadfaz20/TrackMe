const mongoose = require('mongoose');
const Device = require('./models/device');
const User = require('./models/user'); 
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const port =process.env.PORT ||5000;

mongoose.connect('mongodb+srv://A_faz:1234@cluster0.cfzke.mongodb.net', { useNewUrlParser: true,
    useUnifiedTopology: true });

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(express.static('public'));

app.use((req, res, next) => {
 res.header("Access-Control-Allow-Origin", "*");
 res.header("Access-Control-Allow-Headers", "Origin, X-RequestedWith, Content-Type, Accept");
 next();
});

app.use(express.static(`${__dirname}/public/generated-docs`));

app.get('/docs', (req, res) => {
    res.sendFile(`${__dirname}/public/generated-docs/index.html`);
});

app.get('/api/test', (req, res) => {
 res.send('The API is working!');
});


/**
* @api {get} /api/devices AllDevices An array of all devices
* @apiGroup Device
* @apiSuccessExample {json} Success-Response:
* [
* {
* "_id": "dsohsdohsdofhsofhosfhsofh",
* "name": "Mary's iPhone",
* "user": "mary",
* "sensorData": [
* {
* "ts": "1529542230",
* "temp": 12,
* "loc": {
* "lat": -37.84674,
* "lon": 145.115113
* }
* },
* {
* "ts": "1529572230",
* "temp": 17,
* "loc": {
* "lat": -37.850026,
* "lon": 145.117683
* }
* }
* ]
* }
* ]
* @apiErrorExample {json} Error-Response:
* {
* "User does not exist"
* }
*/

app.get('/api/devices', (req, res) => {
    Device.find({}, (err, devices) => {
    if (err == true) {
    return res.send(err);
    } else {
    return res.send(devices);
    }
    });

});

app.get('/api/users/:user/devices', (req, res) => {
    const { user } = req.params;
    Device.find({ "user": user }, (err, devices) => {
    return err
    ? res.send(err)
    : res.send(devices);
    });
   });

app.get('/api/devices/:deviceId/device-history', (req, res) => {
    const { deviceId } = req.params;
    Device.findOne({"_id": deviceId }, (err, devices) => {
        const { sensorData } = devices;
        return err
        ? res.send(err)
        : res.send(sensorData);
    });
});


/**
 * @api {post} /api/devices/ Posting Devices
 * @apiName PostDevice
 * @apiGroup Devices
 *
 * @apiParam {String} name         Name of Device.
 * @apiParam {String} user         Name of user.
 * @apiParam {JSON} sensorData     sensor data.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 * {"Successfully posted devices"}
 *
 */
app.post('/api/devices', (req, res) => {
    const { name, user, sensorData } = req.body;
    const newDevice = new Device({
    name,
    user,
    sensorData
    });
    newDevice.save(err => {
    });
    });

app.post('/api/authenticate', (req, res) => {
    const { user, password } = req.body;
    User.findOne({ user, password }, (error, user) => {
        if (user == null) {
            return res.json({ error: "Incorrect username or password", user: user })
        } else {
            return res.json({
                success: true,
                message: 'Authenticated successfully',
                isAdmin: user.isAdmin
            });
        }
    })
})

app.post('/api/registration', (req, res) => {
    const { user, password, isAdmin } = req.body;
    User.findOne({ user: user }, (error, username) => {
        if (username == null) {
        	const newUser = new User({
			 user,
			 password,
			 isAdmin
			});
			newUser.save(err => {
 				return err
 				? res.send(err)
 				: res.json({
 					success: true,
 					message: 'Created new user'
 				});
			});
        } else {
            return res.json({ error:"User already exists"})
        }
    })
})


app.listen(port, () => {
 console.log(`listening on port ${port}`);
}); 
