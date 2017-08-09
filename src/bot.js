const recastai = require('recastai').default
const client = new recastai(process.env.REQUEST_TOKEN)
const request = require('request')

const weatherApiKey = "&appid=" + process.env.WEATHER_APIKEY
const weatherUrl = "http://api.openweathermap.org/data/2.5/weather?q="

const replyMessage = function(message, text, res) {

    console.log(" replyMessage in"); 
    console.log(" replyMessage in message: "  + JSON.stringify(message)); console.log(" replyMessage in message m: " + getMethods(message).join("\n"))
    console.log(" replyMessage in text: "     + JSON.stringify(text));    console.log(" replyMessage in text m: "    + getMethods(text).join("\n"))
    console.log(" replyMessage in res: "      + JSON.stringify(res));     console.log(" replyMessage in  res m: "     + getMethods(res).join("\n"))

    // Get senderId to catch unique conversation_token
    const senderId = message.senderId

    const recastaiReq = new recastai.request(process.env.REQUEST_TOKEN, process.env.LANGUAGE)
    const content = (message ? message.content : text)
  
    if(message) {
      // Request came in via the bot connector

      recastaiReq.converseText(content, { conversationToken: senderId }).then(converseResult => {

          console.log("converseText callback in cr: "      + JSON.stringify(converseResult));     console.log(" converseText callback in  cr m: "     + getMethods(converseResult).join("\n"))

          const intent = converseResult.intents[0];

          var toReturn = ""

          console.log("intent", JSON.stringify(intent));
 
          if (intent && intent.slug === 'weather') {
              toReturn = concat(toReturn, " location " + JSON.stringify(converseResult.entities.location))
           
              makeWeatherRequest(converseResult.entities.location[0].formatted, function(_err, _res, body) {
                  toReturn = concat(toReturn, "http response callback body: " + JSON.stringify(body))

                  var bodyObject = JSON.parse(body)

                  const desc = bodyObject.weather[0].description
                  toReturn = concat(toReturn, "response callback desc" + JSON.stringify(desc))
                  toReturn = concat(toReturn, message ? "message true" : "message false")
                  //return message ? message.reply({ type: 'text', content }).then() : res.send({ reply: content })
                  //return message ? message.reply({ type: 'text', desc }).then() : res.succeed({ reply: desc })
                 
                  converseResult.replies.push({ type: 'text', desc })
                  wrapUp(message, converseResult)
                  // message.reply({ type: 'text', content });
                  return
              })
          }
      })
    } else {
      // HTTP request
      return res.succeed({ reply: "http req response string" })
    }

    // recastaiReq.analyseText(content).then(recastaiRes => {
    //     const intent = recastaiRes.intent()

    //     var toReturn = ""

        // toReturn = concat(toReturn, JSON.stringify(intent));

        // if (intent && intent.slug === 'weather') {
        //    toReturn = concat(toReturn, " location " + JSON.stringify(recastaiRes.entities.location))
           
        //    makeWeatherRequest(recastaiRes.entities.location[0].formatted, function(_err, _res, body) {
        //        toReturn = concat(toReturn, "http response callback body: " + JSON.stringify(body))

        //        var bodyObject = JSON.parse(body)

        //         const desc = bodyObject.weather[0].description
        //         toReturn = concat(toReturn, "response callback desc" + JSON.stringify(desc))
        //         toReturn = concat(toReturn, message ? "message true" : "message false")
        //         //return message ? message.reply({ type: 'text', content }).then() : res.send({ reply: content })
        //       //return message ? message.reply({ type: 'text', desc }).then() : res.succeed({ reply: desc })
        //         if(message) {
        //             message.reply({ type: 'text', content });
        //             return
        //         } else {
        //           return res.succeed({ reply: desc })
        //         }
        //     })
           
        // }

        // if (intent && intent.slug === 'greetings') {
        //     const reply = {
        //         type: 'quickReplies',
        //         content: {
        //             title: 'Hi! What can I do for you?',
        //             buttons: [
        //                 { title: 'Chuck Norris fact', value: 'Tell me a joke' },
        //                 { title: 'Goodbye', value: 'Goodbye' },
        //             ],
        //         },
        //     }

        //     return message ? message.reply([reply]) : res.json({ reply: 'Hi, what can I do for you? :-)' })
        // }
    //})
}

export const bot = function(request, response, callback) {
  
  console.log(" bot in"); 
  console.log(" bot in request: "  + JSON.stringify(request));    console.log(" bot in request m: "    + getMethods(request).join("\n"))
  console.log(" bot in response: " + JSON.stringify(response));   console.log(" bot in response m: "   + getMethods(response).join("\n"))
  console.log(" bot in callback: " + JSON.stringify(callback));   console.log(" bot in callback m: "   + getMethods(callback).join("\n"))

  if (request.message) {
    request.body = request.message;
    request.body.message = new Object()
    request.body.message.attachment = request.message.attachment
    request.body.message.conversation = request.message.conversation
    console.log(" bot " + JSON.stringify(request.message) + " - request.message")
    client.connect.handleMessage({body : request}, response, replyMessage)
    callback(null, { result: 'Bot answered :)' })
  } else if (request.text) {
    console.log(" bot " + JSON.stringify(request.text) + " - request.text")
    replyMessage(null, request.text, response)
  } else {
    console.log(" bot " + request + " - else")
    callback('No text provided')
  }

  console.log(" bot out")
}

function concat(head, tail) {
  console.log(tail);
  return head + "\n" + tail;
}

function getMethods(obj) {
  var result = [];
  for (var id in obj) {
    try {
      if (typeof(obj[id]) == "function") {
        result.push(id + ": " + obj[id].toString());
      }
    } catch (err) {
      result.push(id + ": inaccessible");
    }
  }
  return result;
}

function makeWeatherRequest(location, callback) {
    const weatherQuery =  weatherUrl + location +  weatherApiKey;
    concat("", "weatherQuery: " + weatherQuery) 
          
    request(weatherQuery, callback)
}

function wrapUp(message, result) {
    if (result.action) {
        console.log('The conversation action is: ', result.action.slug)
    } else {
      console.log('No conversation action set')
    }

    // If there is not any message return by Recast.AI for this current conversation
    if (!result.replies.length) {
        message.addReply({ type: 'text', content: 'I don\'t have the reply to this yet :)' })
    } else {
        // Add each reply received from API to replies stack
        result.replies.forEach(replyContent => message.addReply({ type: 'text', content: replyContent }))
    }

    // Send all replies
    message.reply();
}