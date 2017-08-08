const recastai = require('recastai').default
const client = new recastai(process.env.REQUEST_TOKEN)
const request = require('request')

const weatherApiKey = "&appid=" + process.env.WEATHER_APIKEY
const weatherUrl = "http://api.openweathermap.org/data/2.5/weather?q="

const replyMessage = (message, text, res) => {
    const recastaiReq = new recastai.request(process.env.REQUEST_TOKEN, process.env.LANGUAGE)
    const content = (message ? message.content : text)
  
    recastaiReq.analyseText(content).then(recastaiRes => {
        const intent = recastaiRes.intent()

        var toReturn = ""

        toReturn = concat(toReturn, JSON.stringify(intent));

        if (intent && intent.slug === 'weather') {
           toReturn = concat(toReturn, " location " + JSON.stringify(recastaiRes.entities.location))
           const weatherQuery =  weatherUrl + recastaiRes.entities.location[0].formatted +  weatherApiKey;
           toReturn = concat(toReturn, "weatherQuery: " + weatherQuery) 
            request(weatherQuery, function(_err, _res, body) {
               toReturn = concat(toReturn, "response callback body: " + JSON.stringify(body))

                var bodyObject = JSON.parse(body)

                const desc = bodyObject.weather[0].description
                toReturn = concat(toReturn, "response callback desc" + JSON.stringify(desc))
                toReturn = concat(toReturn, message ? "message true" : "message false")
                //return message ? message.reply({ type: 'text', content }).then() : res.send({ reply: content })
              //return message ? message.reply({ type: 'text', desc }).then() : res.succeed({ reply: desc })
                if(message) {
                    message.reply({ type: 'text', content });
                    return
                } else {
                  return res.succeed({ reply: desc })
                }

                
            })
        }

        if (intent && intent.slug === 'greetings') {
            const reply = {
                type: 'quickReplies',
                content: {
                    title: 'Hi! What can I do for you?',
                    buttons: [
                        { title: 'Chuck Norris fact', value: 'Tell me a joke' },
                        { title: 'Goodbye', value: 'Goodbye' },
                    ],
                },
            }

            return message ? message.reply([reply]) : res.json({ reply: 'Hi, what can I do for you? :-)' })
        }
    })
}

export const bot = (request, response, callback) => {
  
  var body  request.bod

  console.log(" bot in"); console.log(" bot in body: " + JSON.stringify(body))
    console.log(" bot in body: " + getMethods(body).join("\n"))
  console.log(" bot in response: " + JSON.stringify(response)); console.log(" bot in response: " + getMethods(response).join("\n"))
  console.log(" bot in callback: " + JSON.stringify(callback)); console.log(" bot in callback: " + getMethods(callback).join("\n"))

  if (body.message) {
    console.log(" bot " + JSON.stringify(body.message) + " - body.message")
    client.connect.handleMessage(request, response, replyMessage)
    callback(null, { result: 'Bot answered :)' })
  } else if (body.text) {
    console.log(" bot " + JSON.stringify(body.text) + " - body.text")
    replyMessage(null, body.text, response)
  } else {
    console.log(" bot " + body + " - else")
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