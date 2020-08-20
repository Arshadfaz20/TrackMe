const mqtt = require('mqtt');
const express = require('express');
const mongoose = require('mongoose');
const Device = require('./models/device');
const bodyParser = require('body-parser');
const app = express();
const randomCoordinates = require('random-coordinates');
const rand = require('random-int');

const port = process.env.PORT || 5001;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
 extended: true
}));

mongoose.connect('mongodb+srv://A_faz:1234@cluster0.cfzke.mongodb.net', { useNewUrlParser: true,
    useUnifiedTopology: true });

app.use(express.static('public'));
app.use((req, res, next) => {
 res.header("Access-Control-Allow-Origin", "*");
 res.header("Access-Control-Allow-Headers", "Origin, X-RequestedWith, Content-Type, Accept");
 next();
});

const client = mqtt.connect("mqtt://broker.hivemq.com:1883");
client.on('connect', () => {
 console.log('mqtt connected');
 client.subscribe('/sensorData');
});

client.on('message', (topic, message) => {
    if (topic == '/sensorData') {
        const data = JSON.parse(message);
   
        Device.findOne({"name": data.deviceId }, (err, device) => {
        if (err) {
            console.log(err)
        }
   
        const { sensorData } = device;
        const { ts, loc, temp } = data;
        sensorData.push({ ts, loc, temp });
        device.sensorData = sensorData;
        device.save(err => {
            if (err) {
                console.log(err)
            }
        });
        });
    }
});
   
   

app.post('/send-command', (req, res) => {
    const { deviceId, command } = req.body;
    const topic = `/myid/command/${deviceId}`;
    client.publish(topic, command, () => {
        res.send('published new message');
    });
   });

/**
* @api {put} /sensor-data Creates random sensor data
* @apiGroup Sensor Data
* @apiSuccessExample {json} Success-Response:
* {
*   'published new message'
* }
* @apiErrorExample {json} Error-Response:
* {
*   'message not published'
* }
*/

app.put('/sensor-data', (req, res) => {
    const { deviceId } = req.body;
    const [lat, lon] = randomCoordinates().split(", ");
    const ts = new Date().getTime();
    const loc = { lat, lon };
    const temp = rand(20, 50);
    const topic = `/sensorData`;
    const message = JSON.stringify({ deviceId, ts, loc, temp });
    client.publish(topic, message, () => {
        res.send('published new message');
    });
   });
   
   
   
app.listen(port, () => {
 console.log(`listening on port ${port}`);
});
