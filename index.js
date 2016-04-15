var login = require('facebook-chat-api');
var prompt = require('prompt');
var fs = require('fs');
var cp = require('child_process');
var dict = require('../dictcc-js/index.js');
console.log("Enter your Facebook credentials - your password will not be visible as you type it in");

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
		authenticate(result); //pass credentials to authenticate function
	}
);

function authenticate(credentials){//where credentials is the user's credentials as an object, fields `email` and `password
	login(credentials, function(err, api) {

		if(err) return console.error(err);

		console.log("Logged in as " + credentials.email); //we've authenticated

		api.setOptions({
			logLevel: "silent",
			selfListen: true //uncomment this line if you want messages from yourself to be passed to the `api.listen` function - defaults to false so we don't get caught in a painful loop
		});

		api.listen(function(err, message) {//this function is called whenever we get a message
			"use strict";
			if(err)
				return console.log(err);

			if(message.type != "message")
				return;
           /* var responseAr = ["just stop.", "no", "can you not?", "you are dead to me."]
			//put your message handling code here
        
		    if(message.senderName == "Kamrin Stone")	
                api.sendMessage("Kamrin, " + responseAr[Math.floor(Math.random() * (responseAr.length - 1))], message.threadID)
           */
			console.log("Got a message from",message.senderName,":",message.body);
            if(message.body.indexOf("!wquote") > -1) {
                var data = fs.readFileSync("quotes.txt", "utf8");
                var re = /\n\d+\./;
                var split = data.split(re);
                api.sendMessage(split[Math.floor(Math.random() * (split.length - 1))], message.threadID);
            }
            if(message.body.toLowerCase().indexOf("!dict") > -1){
                var dictAr = message.body.toLowerCase().split(" ");
                dictAr.shift();
                var url = `http://${dictAr[0] + dictAr[1]}.dict.cc/?s=`;
                dict.translate(dictAr.shift(), dictAr.shift(), dictAr.join("+"), (data) => {
       				if(data !== null){
       					let msg = {
       						body: "Top definition: " + data[0].to + " = " + data[0].from,
       						url: url + dictAr.join("+")
       					};
                    	api.sendMessage(msg, message.threadID, (err, api) => {console.log(err);});
                	}
                	else
                		api.sendMessage("Oh no! No definitions found.");
                }); 
            }
            if(message.body.toLowerCase().indexOf("!ship") > -1){
           		api.sendMessage("────(ღ)(ღ)(ღ)────(ღ)(ღ)(ღ) __ ɪƒ ƴσυ'ʀє αʟσηє,\n──(ღ)██████(ღ)(ღ)██████(ღ) ɪ'ʟʟ ɓє ƴσυʀ ѕɧα∂σѡ.\n─(ღ)████████(ღ)████████(ღ) ɪƒ ƴσυ ѡαηт тσ cʀƴ,\n─(ღ)██████████████████(ღ) ɪ'ʟʟ ɓє ƴσυʀ ѕɧσυʟ∂єʀ.\n──(ღ)████████████████(ღ) ɪƒ ƴσυ ѡαηт α ɧυɢ,\n────(ღ)████████████(ღ) __ ɪ'ʟʟ ɓє ƴσυʀ ρɪʟʟσѡ.\n──────(ღ)████████(ღ) ɪƒ ƴσυ ηєє∂ тσ ɓє ɧαρρƴ,\n────────(ღ)████(ღ) __ ɪ'ʟʟ ɓє ƴσυʀ ѕɱɪʟє.\n─────────(ღ)██(ღ) ɓυт αηƴтɪɱє ƴσυ ηєє∂ α ƒʀɪєη∂,\n───────────(ღ) __ ɪ'ʟʟ ʝυѕт ɓє ɱє.\n", message.threadID, (err, api) => {console.log(err);});

            }

		});

	});

}

