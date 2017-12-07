// Requirements
const url = require('url')
const express = require('express')
const bodyParser = require('body-parser')
const mqtt = require('mqtt')
const repeat = require('repeat')
const _ = require('lodash')
const logging = require('homeautomation-js-lib/logging.js')
require('homeautomation-js-lib/mqtt_helpers.js')

// Config
const listening_port = process.env.LISTENING_PORT
var topic_prefix = process.env.TOPIC_PREFIX

if (_.isNil(listening_port)) {
    logging.warn('empty listening port, not starting')
    process.abort()
}

if (_.isNil(topic_prefix)) {
    logging.warn('empty topic prefix, using /presence')
    topic_prefix = '/presence'
}

// Setup MQTT
const client = mqtt.setupClient(null, null)

if (_.isNil(client)) {
    logging.warn('MQTT Client Failed to Startup')
    process.abort()
}


// HS Web API
const app = express()

app.use(bodyParser.json())

app.post('/geofence/*', function(req, res) {
    if (_.isNil(req) || _.isNil(req.url)) {
        res.send('bad request')
        return
    }

    const url_info = url.parse(req.url, true)
    var topic = url_info.pathname
    const body = req.body
    const locationName = body.name
    const value = body.entry
    const components = topic.split('/')
    const person = _.last(components)

    if (_.isNil(body)) {
        res.send('empty body')
        return
    }

    if (_.isNil(person)) {
        res.send('missing person')
        return
    }

    if (_.isNil(locationName)) {
        res.send('missing location body')
        return
    }

    topic = topic_prefix + '/geofence/' + locationName.toLowerCase() + '/' + person

    logging.debug('body: ' + JSON.stringify(body))
    logging.info('publishing geofence status', Object.assign(body, {
        action: 'geofence-update',
        topic: topic,
        value: value
    }))

    if (!_.isNil(topic) && !_.isNil(value)) {
        client.publish(topic, value, { retain: true })
    }

    res.send('topic: ' + topic + ' value: ' + value)
})

app.listen(listening_port, function() {
    logging.info('MQTT Presence Monitor listening on port: ' + listening_port, {
        event: 'presence-startup'
    })
})

const findLocalDevices = require('local-devices')

// Find all local network devices.
findLocalDevices().then(devices => {
    logging.debug(devices)
        /*
         [
           { name: '?', ip: '192.168.0.10', mac: '...' },
           { name: '...', ip: '192.168.0.17', mac: '...' },
           { name: '...', ip: '192.168.0.21', mac: '...' },
           { name: '...', ip: '192.168.0.22', mac: '...' }
         ]
         */
})


function scanForDevices() {
    // Find a single device by ip address.
    findLocalDevices('10.0.1.187').then(device => {
        logging.debug(' found my phone: ' + JSON.stringify(device))
            /*
             {
               name: '?',
               ip: '192.168.0.10',
               mac: '...'
             }
             */
    })
}

repeat(scanForDevices).every(1, 's').start.in(1, 'sec')