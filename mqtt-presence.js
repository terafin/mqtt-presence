// Requirements
const url = require('url')
const express = require('express')
const bodyParser = require('body-parser')
const mqtt = require('mqtt')
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
	const components = topic.split('/')
	const person = _.last(components)

	const id = body.id
	const wifiBSSID = body.wifiBSSID
	const radius = body.radius
	const entry = body.entry
	const motion = body.motion
	const longitude = body.longitude
	const wifiSSID = body.wifiSSID
	const latitude = body.latitude
	const date = body.date
	const address = body.address
	const currentLatitude = body.currentLatitude
	const device = body.device
	const currentLongitude = body.currentLongitude
	const name = body.name
	const action = body.action // geofence-update

	if (_.isNil(body)) {
		res.send('empty body')
		return
	}

	if (_.isNil(person)) {
		res.send('missing person')
		return
	}

	if (_.isNil(name)) {
		res.send('missing location body')
		return
	}

	topic = topic_prefix + '/geofence/' + name.toLowerCase() + '/' + person

	logging.debug('body: ' + JSON.stringify(body))
	logging.info('publishing geofence status', Object.assign(body, {
		action: 'geofence-update',
		topic: topic,
		value: entry
	}))

	if (!_.isNil(topic) && !_.isNil(entry)) {
		client.publish(topic, entry, {retain: true, qos: 2})
	}

	res.send('topic: ' + topic + ' value: ' + entry)
})

app.listen(listening_port, function() {
	logging.info('MQTT Presence Monitor listening on port: ' + listening_port, {
		event: 'presence-startup'
	})
})
