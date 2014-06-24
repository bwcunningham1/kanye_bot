var express = require("express");
var logfmt = require("logfmt");
var unirest = require('unirest');
var app = express();

app.use(logfmt.requestLogger());

app.get('/', function(req, res) {
  res.send('Kanye West Bot');
});

var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
  console.log("Listening on " + port);
});

var GroupMe = require('./lib/groupme');
var API = GroupMe.Stateless;

var BOT_LISTENS_FOR = "Kanye";

/************************************************************************
 * Read the access token from the command line.
 ***********************************************************************/

var ACCESS_TOKEN = process.argv[2];

/************************************************************************
 * Getting the bot configured and set up:
 ***********************************************************************/

var USER_ID  = process.argv[3];
var BOT_NAME = 'Kanye West';
// var BOT_NAME = 'TEST BOT';

/************************************************************************
 * Kanye Self-Confidence Compliments
 ***********************************************************************/

var kanye_fidence = [
    "Jay is Kweli's favorite rapper, 50 is Eminem's favorite rapper, and I'm my favorite rapper.", 
    "I'm like a vessel, and god has chosen me to be the voice and the connector.", 
    "My music isn't just music -- it's medicine.", 
    "Don't ask me what I think the best song of last year was, because my opinion is the same as most of America's. It was \"Gold Digger\".",
    "Everything I'm not made me everything I am. In my humble opinion, that's a prophetic statement. Gandhi would have said something like that.",
    "Come on now! How could you be me and want to be someone else?",
    "When I think of competition it's like I try to create against the past. I think about Michelangelo and Picasso. You know, the pyramids.",
    "I am so credible and so influential and so relevant that I will change things.",
    "I'm the no. 1 living and breathing rock star.",
    "When someone comes up and says something like \"I am a god,\" everybody says \"Who does he think he is?\" I just told you who I thought I was. A god. I just told you. That's who I think I am.",
    "For me to say I wasn't a genius, I would just be lying to you and to myself.",
    "I feel like a little bit, like I'm the braveheart of creativity.",
    "I am Warhol! I am the number one most impactful artist of our generation. I am Shakespeare in the flesh. Walt Disney, Nike, Google.",
    "Visiting my mind is like visiting the Hermés factory.",
    "I'm doing pretty good as far as geniuses go...I'm like a machine, I'm a robot.",
    "I'm going down as a legend, whether or not you like me or not. Ia m the new Jim Morrison. I am the new Kurt Cobain.",
    "The Bible had 20, 30, 40, 50 characters in it. You don't think that I would be one of the characters of today's modern Bible?",
    "My greatest pain in life is that I will never be able to see myself perform live.",
    "You can't look at a glass half full or empty if it's overflowing.",
    "I have, like, nuclear power, like a superhero, like cyclops when he puts his glasses on.",
    "Yeah. I'm rich and I'm famous, but I try not to be extra with it.",
    "A lot of people were wondering what I was going to do if I didn't win anything. I guess we'll never know",
    "I'm a creative genius and there's no other way to word it."
];

/************************************************************************
 * Set up the message-based IncomingStream and the HTTP push
 ***********************************************************************/

var bot_id = null;

var retryCount = 3;

// Constructs the IncomingStream, identified by the access token and 
var incoming = new GroupMe.IncomingStream(ACCESS_TOKEN, USER_ID, null);

// This logs the status of the IncomingStream
incoming.on('status', function() {
    var args = Array.prototype.slice.call(arguments);
    var str = args.shift();
    console.log("[IncomingStream 'status']", str, args);
});

// This waits for the IncomingStream to complete its handshake and start listening.
// We then get the bot id of a specific bot.
incoming.on('connected', function() {
    console.log("[IncomingStream 'connected']");

    API.Bots.index(ACCESS_TOKEN, function(err,ret) {
        if (!err) {
            var botdeets;
            for (var i = 0; i < ret.length; i++) {
                if (ret[i].name == BOT_NAME) {
                    bot_id = ret[i].bot_id;
                }
            }
            console.log("[API.Bots.index return] Firing up bot!", bot_id);
        }
    });

});

// This waits for messages coming in from the IncomingStream
// If the message contains @BOT, we parrot the message back.
incoming.on('message', function(msg) {
    console.log("[IncomingStream 'message'] Message Received");

    if (msg["data"] 
        && msg["data"]["subject"] 
        && msg["data"]["subject"]["text"]
        /*&& msg["data"]["subject"]["text"].indexOf(BOT_LISTENS_FOR) >= 0*/) {

        if (bot_id && msg["data"]["subject"]["name"] != BOT_NAME) {
            var txt = msg["data"]["subject"]["text"];

            /************************************************************************
             * Get current location of user
             ***********************************************************************/
            // var ipAddr = req.headers["x-forwarded-for"];
            // if (ipAddr){
            //   var list = ipAddr.split(",");
            //   ipAddr = list[list.length-1];
            // } else {
            //   ipAddr = req.connection.remoteAddress;
            // }

            // var url = 'http://freegeoip.net/json/' + ipAddr;
            // var loc = null;
            // var Request = unirest.get(url)
            //   .end(function (response) {
            //     loc = response.body;
            //     console.dir(response);
            // });

            /************************************************************************
             * Weather Responses
             ***********************************************************************/
            if(txt.search("weather") != -1 || txt.search("Weather") != -1) {

                // Require the module
                var Forecast = require('forecast');

                // Initialize
                var forecast = new Forecast({
                  service: 'forecast.io',
                  key: 'f267218743d71c6d486401ad298558fa',
                  units: 'f', // Only the first letter is parsed
                  cache: true,      // Cache API requests?
                  ttl: {           // How long to cache requests. Uses syntax from moment.js: http://momentjs.com/docs/#/durations/creating/
                      minutes: 27,
                      seconds: 45
                    }
                });

                var message = "Nope. Nada. Zilch.";

                // Retrieve weather information from coordinates (Box HQ)
                forecast.get([37.402538, -122.116355], function(err, weather) {
                  if(err) console.dir(err);
                  else  {
                      var temp = weather.currently.temperature;
                      console.dir("Current temp: " + temp);

                      if(temp > 90) {
                        console.log("It's " + temp.toString() + " degrees outside! DAMNN IT'S HOT OUTSIDE!");
                        message = "It's " + temp.toString() + " degrees outside! DAMNN IT'S HOT OUTSIDE!";
                      }
                      else if(temp > 80) {
                        console.log("The weather is fine, fine like Kanye.");
                        message = "The weather is fine, fine like Kanye.";
                      }
                      else {
                        console.log("It's " + temp.toString() + " degrees right now. Damn that's colder than the reception I got after the VMA's");
                        message = "It's " + temp.toString() + " degrees right now. Damn that's colder than the reception I got after the VMA's";
                      }
                    API.Bots.post(
                    ACCESS_TOKEN, // Identify the access token
                    bot_id, // Identify the bot that is sending the message
                    message, // Construct the message
                    {}, // No pictures related to this post
                    function(err,res) {
                        if (err) {
                            console.log("[API.Bots.post] Weather Response Error!");
                        } else {
                            console.log("[API.Bots.post] Weather Response Sent!");
                        }
                    });
                  }
                });
            }

            /************************************************************************
             * Edison response
             ***********************************************************************/
            else if(txt.search("test") != -1 || txt.search("Test") != -1) {
                message = "HAAAAANH?! http://s3.amazonaws.com/rapgenius/tumblr_me2bakjLPb1qlsrn9o1_500.gif"
                API.Bots.post(
                    ACCESS_TOKEN, // Identify the access token
                    bot_id, // Identify the bot that is sending the message
                    response.body, // Construct the message
                    {}, // No pictures related to this post
                    function(err,res) {
                        if (err) {
                            console.log("[API.Bots.post] Reply Message Error!");
                        } else {
                            console.log("[API.Bots.post] Reply Message Sent!");
                        }
                    });
            }

            /************************************************************************
             * Kanye-fidence Compliment Generator
             ***********************************************************************/
            else if(msg["data"]["subject"]["name"] != BOT_NAME && 
                    (txt.search("Kanye") != -1 || txt.search("kanye") != -1)) {
              var message = kanye_fidence[Math.floor(Math.random() * kanye_fidence.length)];
              API.Bots.post(
              ACCESS_TOKEN, // Identify the access token
              bot_id, // Identify the bot that is sending the message
              message, // Construct the message
              {}, // No pictures related to this post
              function(err,res) {
                if (err) {
                    console.log("[API.Bots.post] Reply Message Error!");
                } else {
                    console.log("[API.Bots.post] Reply Message Sent!");
                }
              });
            }
        }
    }

});

// This listens for the bot to disconnect
incoming.on('disconnected', function() {
    console.log("[IncomingStream 'disconnect']");
    if (retryCount > 3) {
        retryCount = retryCount - 1;
        incoming.connect();    
    }
})

// This listens for an error to occur on the Websockets IncomingStream.
incoming.on('error', function() {
    var args = Array.prototype.slice.call(arguments);
    console.log("[IncomingStream 'error']", args);
    if (retryCount > 3) {
        retryCount = retryCount - 1;
        incoming.connect();    
    }
})


// This starts the connection process for the IncomingStream
incoming.connect();
