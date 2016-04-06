var login = require('facebook-chat-api')
var prompt = require('prompt')
var fs = require('fs')
var cp = require('child_process');
var dict = require('../dictcc-js/index.js')
console.log("Enter your Facebook credentials - your password will not be visible as you type it in")

prompt.start();
prompt.get([{
		name: 'email',
		required: true
	}, {
		name: 'password',
		hidden: true,//so we don't see the user's password when they type it in
		conform: function (value) {
			return true;
		}
	}], function (err, result) {
		authenticate(result)//pass credentials to authenticate function
	}
);

function authenticate(credentials){//where credentials is the user's credentials as an object, fields `email` and `password
	login(credentials, function(err, api) {

		if(err) return console.error(err);

		console.log("Logged in as " + credentials.email)//we've authenticated

		api.setOptions({
			logLevel: "silent",
			selfListen: true //uncomment this line if you want messages from yourself to be passed to the `api.listen` function - defaults to false so we don't get caught in a painful loop
		})

		api.listen(function(err, message) {//this function is called whenever we get a message
			if(err)
				return console.log(err)

			if(message.type != "message")
				return
           /* var responseAr = ["just stop.", "no", "can you not?", "you are dead to me."]
			//put your message handling code here
        
		    if(message.senderName == "Kamrin Stone")	
                api.sendMessage("Kamrin, " + responseAr[Math.floor(Math.random() * (responseAr.length - 1))], message.threadID)
           */
			console.log("Got a message from",message.senderName,":",message.body)
            if(message.body.indexOf("wquote") > -1) {
                var data = fs.readFileSync("quotes.txt", "utf8");
                var re = /\n\d+\./;
                var split = data.split(re);
                api.sendMessage(split[Math.floor(Math.random() * (split.length - 1))], message.threadID)       
            }
            if(message.body.toLowerCase().indexOf("!dict") > -1){
                var dictAr = message.body.toLowerCase().split(" ")
                dict.translate(dictAr[1], dictAr[2], dictAr[3], (data) => {
                    var url = dictAr[1] + dictAr[2] + ".dict.cc/?s=" + dictAr[3]
                    api.sendMessage("Top definition: " + data[0].to + " = " + data[0].from + "\nView more definitions at: " + url, message.threadID, (err, api) => {console.log(err)})
                }) 
               
            }

		})

		//use the api object to use any of the functions in the facebook-chat-api docs
		//https://github.com/Schmavery/facebook-chat-api#documentation


	})

}

