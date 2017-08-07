
const recastai = require('recastai').default
const client = new recastai(process.env.REQUEST_TOKEN)
const request = require('request')

const weatherApiKey = "&appid=" + process.env.WEATHER_TOKEN
const weatherUrl = "http://api.openweathermap.org/data/2.5/weather?q="

const replyMessage = (message, text, res) => {
    const recastaiReq = new recastai.request(process.env.REQUEST_TOKEN, process.env.LANGUAGE)
    const content = (message ? message.content : text)

    recastaiReq.analyseText(content).then(recastaiRes => {
        const intent = recastaiRes.intent()
        console.log(intent)

        if (intent && intent.slug === 'weather') {
            request( weatherUrl + recastaiRes.entities.hasOwnProperty('location') +  weatherApiKey, (_err, _res, body) => {
                body = JSON.parse(body)
                const content = body.value

                return message ? message.reply({ type: 'text', content }).then() : res.send({ reply: content })
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

export const bot = (body, response, callback) => {
  console.log(body)

  if (body.message) {
    client.connect.handleMessage({ body }, response, replyMessage)
    callback(null, { result: 'Bot answered :)' })
  } else if (body.text) {
    replyMessage(null, body.text, response)
  } else {
    callback('No text provided')
  }
}
