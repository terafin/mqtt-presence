// Requirements
const url = require('url')
const express = require('express')
const mqtt = require('mqtt')
const logging = require('./homeautomation-js-lib/logging.js')
require('./homeautomation-js-lib/mqtt_helpers.js')


// Config
const host = process.env.MQTT_HOST
const listening_port = process.env.LISTENING_PORT
const topic_prefix = process.env.TOPIC_PREFIX


// Setup MQTT
const client = mqtt.connect(host)

// MQTT Observation

client.on('connect', () => {
    logging.log('Reconnecting...\n')
        // client.subscribe('#')
})

client.on('disconnect', () => {
    logging.log('Reconnecting...\n')
    client.connect(host)
})

client.on('message', (topic, message) => {

})


// HS Web API
const app = express()

app.get('/geofence/*', function(req, res) {
    const url_info = url.parse(req.url, true)
    var topic = url_info.pathname
    var value = url_info.query.value

    topic = topic_prefix + topic


    logging.log('publishing geofence status', {
        action: 'geofence-update',
        name: name,
        topic: topic,
        value: value
    })
    client.publish(topic, value)
    res.send('topic: ' + topic + ' value: ' + value)
})

app.listen(listening_port, function() {
    logging.info('MQTT Presence Monitor listening on port: ' + listening_port, {
        event: 'presence-startup'
    })
})