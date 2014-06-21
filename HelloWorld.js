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
    "Bros before hoes", 
    "A Bro will not talk about something lame in front of a woman",
    "Bros don't date their bro ex girlfriends",
    "Bros buy porn for all the bros",
    "A bro never sends a greeting card to another bro",
    "Bros do not share dessert",
    "Poorly-planned-mediocre-social-media-practical-jokes before honesty",
    "A Bro shall always alert another Bro of any girl fight",
    "Bros cannot make eye contact during a devil's threeway",
    "A Bro will, whenever possible, provide a bro with protection",
    "A bro saves a bro from his ex",
    "A bro saves a bro from the friend zone",
    "A Bro shall at all times say \"yes\"",
    "The mom of a Bro is always off-limits. But the step-mom of a Bro is fair game if she initiates it and/or is wearing at least one article of leopards print clothing",
    "A bro pretends to like cigars",
    "A bro never dates a bro's ex-girlfriend (unless granted permission)",
    "A bro that calls \"dibs\" first, has dibs",
    "No leaving a Bro hanging",
    "A Bro always likes the new profile picture of another bro",
    "A true Bro will never be \"Necklace Guy\".",
    "A bro shall not have a weird moment with another bro's fiance",
];

/************************************************************************
 * Play Book
 ***********************************************************************/

var play_book = [ 
    "Bros before hoes", 
    "A Bro will not talk about something lame in front of a woman",
    "Bros don't date their bro ex girlfriends",
    "Bros buy porn for all the bros",
    "A bro never sends a greeting card to another bro",
    "Bros do not share dessert",
    "Poorly-planned-mediocre-social-media-practical-jokes before honesty",
    "A Bro shall always alert another Bro of any girl fight",
    "Bros cannot make eye contact during a devil's threeway",
    "A Bro will, whenever possible, provide a bro with protection",
    "A bro saves a bro from his ex",
    "A bro saves a bro from the friend zone",
    "A Bro shall at all times say \"yes\"",
    "The mom of a Bro is always off-limits. But the step-mom of a Bro is fair game if she initiates it and/or is wearing at least one article of leopards print clothing",
    "A bro pretends to like cigars",
    "A bro never dates a bro's ex-girlfriend (unless granted permission)",
    "A bro that calls \"dibs\" first, has dibs",
    "No leaving a Bro hanging",
    "A Bro always likes the new profile picture of another bro",
    "A true Bro will never be \"Necklace Guy\".",
    "A bro shall not have a weird moment with another bro's fiance",
];

/************************************************************************
 * Set up the message-based IncomingStream and the HTTP push
 ***********************************************************************/

var bot_id = null;

var retryCount = 3;

// Constructs the IncomingStream, identified by the access token and 
var incoming = new GroupMe.IncomingStream(ACCESS_TOKEN, USER_ID, null);

/*
// This logs the status of the IncomingStream
incoming.on('status', function() {
    var args = Array.prototype.slice.call(arguments);
    var str = args.shift();
    console.log("[IncomingStream 'status']", str, args);
});
*/

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
            var ipAddr = req.headers["x-forwarded-for"];
            if (ipAddr){
              var list = ipAddr.split(",");
              ipAddr = list[list.length-1];
            } else {
              ipAddr = req.connection.remoteAddress;
            }

            var url = 'http://freegeoip.net/json/' + ipAddr;
            var loc = null;
            var Request = unirest.get(url)
              .end(function (response) {
                loc = response.body;
                console.dir(response);
            });

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
             * Kanye-fidence Compliment Generator
             ***********************************************************************/
            else if(txt.search("bro code") != -1 || txt.search("Bro code") != -1) {
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

            /************************************************************************
             * Default BRODA responses
             ***********************************************************************/
            else if(msg["data"]["subject"]["name"] != BOT_NAME && txt.indexOf("Broda") != -1) {
              var url = "http://brospeak.com/?api=yeah&input=" + txt;
              txt = txt.replace("Broda ", "")
              var Request = unirest.get(url)
                .end(function (response) {
                  console.dir("Text: " + txt + "\nBroSpeak: " + response.body);
                  txt = response.body;

                  var Request = unirest.get("https://yoda.p.mashape.com/yoda?sentence=" + txt)
                  .headers({ 
                    "X-Mashape-Authorization": "iR2g3eyxXH6tK1tZELkkVJikSMeafCWC"
                  })
                  .end(function (response) {
                    console.log(response.body);

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
                  });
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
