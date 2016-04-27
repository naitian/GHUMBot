var login = require('facebook-chat-api');
var prompt = require('prompt');
var fs = require('fs');
var dict = require('dictcc-js');


//where credentials is the user's credentials as an object, fields `email` and `password
function authenticate(credentials){
  'use strict';
  login(credentials, function(err, api) {

    if(err) return console.error(err);

    if(credentials.email)
      fs.writeFileSync('appstate.json', JSON.stringify(api.getAppState()));

    console.log('Logged in'); //we've authenticated

    api.setOptions({
      logLevel: 'silent',
      selfListen: false,
      listenEvents: true
    });

    api.listen(function(err, message) {//this function is called whenever we get a message
      if(err)
        return console.log(err);


      if(message.type === 'typ') {
        api.getUserInfo(message.from, (err, res) => {
          if (err) {
            console.log(err);
          }
          else {
            console.log(res[message.from].name + ' was typing in thread ' + message.threadID);
          }
        });
      }


      if(message.type !== 'message' || !message.body)
        return;
      console.log('Got a message from', message.senderID, ':', message.body);


      if(message.body.indexOf('!wquote') === 0) {
        let data = fs.readFileSync('quotes.txt', 'utf8');
        const re = /\n\d+\./;
        let split = data.split(re);
        api.sendMessage(split[Math.floor(Math.random() * (split.length - 1))], 
          message.threadID,
          (err) => {
            if(err)
              return console.log(err);
          });
      }


      if(message.body.toLowerCase().indexOf('!dict') === 0){

        var dictAr = message.body.toLowerCase().split(' ');
        dictAr.shift();
        if(dictAr.length < 3) {
          api.sendMessage('Oh no! An error occurred!',
            message.threadID,
            (err) => {
              if(err)
                return console.log(err);
            });
          return;
        }
        dict.translate(dictAr.shift(), dictAr.shift(), dictAr.join('+'), (data, err) => {
          if(err) {
            console.log(err);
            api.sendMessage('Oh no! An error occurred!',
              message.threadID,
              (err) => {
                if(err)
                  return console.log(err);
              });
            return;
          }
          if(data !== null && data.length > 0){
            let msg = {
              body: 'Top definition: ' + data[0].from + ' = ' + data[0].to,
            };
            api.sendMessage(msg, message.threadID, (err) => {console.log(err);});
          }
          else
            api.sendMessage('Oh no! No definitions found.',
              message.threadID,
              (err) => {
                if(err)
                  return console.log(err);
              });
        }); 
      }


      if(message.body.toLowerCase().indexOf('!ship') === 0){
        let args = message.body.split(' ').slice(1);
        if(args.length >= 2) {
          api.sendMessage(args[0] + ' and ' + args[1] + 
            '\nsittin\' in a tree,' + 
            '\nK-I-S-S-I-N-G.' + 
            '\nFirst comes love,' + 
            '\nThen comes marriage,' + 
            '\nThen comes a baby' + 
            '\nIn a baby carriage.', 
            message.threadID,
            (err) => {
              if(err)
                return console.log(err);
            });
        }
        else
          api.sendMessage('────(ღ)(ღ)(ღ)────(ღ)(ღ)(ღ) __ ɪƒ ƴσυ\'ʀє αʟσηє,' + 
            '\n──(ღ)██████(ღ)(ღ)██████(ღ) ɪ\'ʟʟ ɓє ƴσυʀ ѕɧα∂σѡ.' + 
            '\n─(ღ)████████(ღ)████████(ღ) ɪƒ ƴσυ ѡαηт тσ cʀƴ,' + 
            '\n─(ღ)██████████████████(ღ) ɪ\'ʟʟ ɓє ƴσυʀ ѕɧσυʟ∂єʀ.' + 
            '\n──(ღ)████████████████(ღ) ɪƒ ƴσυ ѡαηт α ɧυɢ,' + 
            '\n────(ღ)████████████(ღ) __ ɪ\'ʟʟ ɓє ƴσυʀ ρɪʟʟσѡ.' + 
            '\n──────(ღ)████████(ღ) ɪƒ ƴσυ ηєє∂ тσ ɓє ɧαρρƴ,' + 
            '\n────────(ღ)████(ღ) __ ɪ\'ʟʟ ɓє ƴσυʀ ѕɱɪʟє.' + 
            '\n─────────(ღ)██(ღ) ɓυт αηƴтɪɱє ƴσυ ηєє∂ α ƒʀɪєη∂,' + 
            '\n───────────(ღ) __ ɪ\'ʟʟ ʝυѕт ɓє ɱє.\n',
            message.threadID,
            (err) => {
              if(err)
                return console.log(err);
            });
      }

      if(message.body.indexOf('!note') === 0) {
        let args = message.body.split(' ');
        console.log(args);
        if(args.length < 0) {
          api.sendMessage('Oh no, an error occurred!',
            message.threadID,
            (err) => {
              if(err)
                return console.log(err);
            });
        }
        else {
          let name = args[1];
          console.log(name);
          api.getThreadInfo(message.threadID, (err, res) => {
            if(err)
              return console.log(err);
            else {
              let pid = res.participantIDs;
              for (var i = 0; i < pid.length; i++) {
                api.getUserInfo(pid[i], (err, res) => {
                  if(err)
                    return console.log(err);
                  else {
                    let id = Object.keys(res)[0];
                    res = res[Object.keys(res)[0]];

                    if(res.name.toLowerCase().indexOf(name.toLowerCase()) > -1) {
                      console.log('Best match for ' + name  + ' is ' + res.name + '. ID: ' +
                       id);
                      
                    }
                  }
                });
              }
            }
          });
        }
      }


      if(message.body.toLowerCase().indexOf('!help') === 0){
        api.sendMessage('GHUM Bot Help!' + 
          '\nAll commands are preceded by a \'!\'' +
          '\nCommands:' + 
          '\n\tdict <from> <to> <term>' + 
          '\n\twquote' + 
          '\n\tship [name1 name2]' + 
          '\n\thelp',
          message.threadID,
          (err) => {
            if(err)
              return console.log(err);
          });
      }


      // if(message.body.toLowerCase().indexOf('!deutsch') === 0){
      //   api.changeThreadColor('#000',
      //     message.threadID, 
      //     (err) => {if(err) console.log(err);});
      // }          
    });
  });

}

try {
  authenticate({appState: JSON.parse(fs.readFileSync('appstate.json', 'utf8'))});
}
catch (err) {
  console.log('Enter your Facebook credentials - ' + 
  'your password will not be visible as you type it in');
  prompt.start();
  prompt.get([{
    name: 'email',
    required: true
  }, {
    name: 'password',
      hidden: true,//so we don't see the user's password when they type it in
      conform: function (value) {
        'use strict';
        return true;
      }
    }], function (err, result) {
      'use strict';
      authenticate(result); //pass credentials to authenticate function
    }
  );
}

