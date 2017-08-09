/*
 * server.js
 * This file is the core of your bot
 *
 * It creates a little server using express
 * So, your bot can be triggered throught "/" route
 *
 * This file was made for locally testing your bot
 * You can test it by running this command
 * curl -X "POST" "http://localhost:5000" -d '{"text": "YOUR_TEXT"}' -H "Content-Type: application/json; charset=utf-8"
 * You might modify the server port ^^^^  depending on your configuration in config.js file
 */

const express = require('express')
const bodyParser = require('body-parser')

// Load configuration
require('./config')
const bot = require('./bot').bot

// Start Express server
const app = express()                     // Express web server instance
app.set('port', process.env.PORT || 5000) // listen on 5000 unless overridden
app.use(bodyParser.json())                // JSON body expected

// Handle / route
app.post('/', function (request, response) {
  handlePost(request, response);
})

if (!process.env.REQUEST_TOKEN.length) {
  console.log('ERROR: process.env.REQUEST_TOKEN variable in src/config.js file is empty ! You must fill this field with the request_token of your bot before launching your bot locally')

  process.exit(0)
} else {
  // Run Express server, on right port
  app.listen(app.get('port'), function() {
    console.log('Our bot is running on port', app.get('port'))
  })
}

function handlePost(request, response) {
  console.log("post: request " + JSON.stringify(request));
  console.log("post: response " + JSON.stringify(response));

  // Call bot main function
  bot(request, response, function (param1, param2, param3) {

    console.log("bot callback: param1 " + JSON.stringify(param1));
    console.log("bot callback: param2 " + JSON.stringify(param2));
    console.log("bot callback: param3 " + JSON.stringify(param3));

    if (error) {
      console.log('Error in your bot:', error)
      if (!response.headersSent) { response.sendStatus(400) }
    } else if (success) {
      console.log(success)
      if (!response.headersSent) { response.status(200).json(success) }
    }
  })
}

function onMessage (message) {


  }
