var login = require('facebook-chat-api');
var prompt = require('prompt');
var fs = require('fs');
var dict = require('dictcc-js');
var Bot = require('./bot.js');


function sendMessage(message, api, threadID, callback) {
  'use strict';
  api.sendMessage(message, threadID, (err) => {
    if(err)
      return console.log(err);
    else if(callback)
      return callback(err);
  });
}

function wquote(args, api, message) {
  'use strict';
  let data = fs.readFileSync('quotes.txt', 'utf8');
  const re = /\n\d+\./;
  let split = data.split(re).slice(1);
  let index = Math.floor(Math.random() * (split.length - 1));
  if (args.length > 0) {
    let number = parseInt(args[0]);
    if(!isNaN(number) && number >= 1 && number <= split.length)
      index = number - 1;
  }
  sendMessage(index + 1 + '. ' + split[index], api, message.threadID);
}

function dictcc(args, api, message) {
  'use strict';
  if (args < 3) 
    return sendMessage('Oh no! Check your arguments.', message.threadID);

  //Translates the text using the dictionary.
  dict.translate(args.shift(), args.shift(), args.join('+'), (data, err) => {
    if (err) {
      console.log(err);
      return sendMessage('Oh no! An error occurred!', message.threadID);
    }
    if(data !== null && data.length > 0){
      let msg = {
        body: 'Top definition: ' + data[0].from + ' = ' + data[0].to,
      };
      return sendMessage(msg, api, message.threadID);
    }
    else
      return sendMessage('Oh no! No definitions found.', api, message.threadID);
  }); 
}

function ship(args, api, message) {
  'use strict';
  //Filters out "and"s from the arguments. Note: determine if this is a good idea.
  args = args.filter((value) => {return value !== 'and';});

  //Checks if there are still 2 names to ship
  if(args.length >= 2) {
    sendMessage(args[0] + ' and ' + args[1] + 
      '\nsittin\' in a tree,' + 
      '\nK-I-S-S-I-N-G.' + 
      '\nFirst comes love,' + 
      '\nThen comes marriage,' + 
      '\nThen comes a baby' + 
      '\nIn a baby carriage.', 
      api,
      message.threadID);
  }
  else

    //Sends a generic heart
    sendMessage('────(ღ)(ღ)(ღ)────(ღ)(ღ)(ღ) __ ɪƒ ƴσυ\'ʀє αʟσηє,' + 
      '\n──(ღ)██████(ღ)(ღ)██████(ღ) ɪ\'ʟʟ ɓє ƴσυʀ ѕɧα∂σѡ.' + 
      '\n─(ღ)████████(ღ)████████(ღ) ɪƒ ƴσυ ѡαηт тσ cʀƴ,' + 
      '\n─(ღ)██████████████████(ღ) ɪ\'ʟʟ ɓє ƴσυʀ ѕɧσυʟ∂єʀ.' + 
      '\n──(ღ)████████████████(ღ) ɪƒ ƴσυ ѡαηт α ɧυɢ,' + 
      '\n────(ღ)████████████(ღ) __ ɪ\'ʟʟ ɓє ƴσυʀ ρɪʟʟσѡ.' + 
      '\n──────(ღ)████████(ღ) ɪƒ ƴσυ ηєє∂ тσ ɓє ɧαρρƴ,' + 
      '\n────────(ღ)████(ღ) __ ɪ\'ʟʟ ɓє ƴσυʀ ѕɱɪʟє.' + 
      '\n─────────(ღ)██(ღ) ɓυт αηƴтɪɱє ƴσυ ηєє∂ α ƒʀɪєη∂,' + 
      '\n───────────(ღ) __ ɪ\'ʟʟ ʝυѕт ɓє ɱє.\n',
      api,
      message.threadID);
}

function note(args, api, message) {
  'use strict';
  if(args.length < 0) {
    sendMessage('Oh no, an error occurred!',
      api,
      message.threadID);
  }
  else {
    let name = args[0];
    let note = args.slice(1).join(' ');
    if (!note) {
      sendMessage('No note specified!',
        api,
        message.threadID);
    }
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
                try {
                  let notes = JSON.parse(fs.readFileSync('notes.json', 'utf8'));
                  if (notes[id]) {
                    notes[id].push(note);
                  }
                  else {
                    notes[id] = [note];
                  }
                  fs.writeFileSync('notes.json', JSON.stringify(notes));
                } catch (err) {
                  let notes = {};
                  notes[id] = [note];
                  fs.writeFileSync('notes.json', JSON.stringify(notes));
                }

                api.sendMessage('Note for ' + res.name + ' set.',
                  message.threadID,
                  (err) => {
                    if(err)
                      return console.log(err);
                  });
              }
            }
          });
        }
      }
    });
  }
}



//where credentials is the user's credentials as an object, fields `email` and `password
function authenticate(credentials){
  'use strict';
  login(credentials, function(err, api) {


    let gb = new Bot('GHUM Bot');
    gb.command('!wquote', wquote, '!wquote')
      .command('!dict', dictcc, '!dict <from> <to> <text>')
      .command('!ship', ship, '!ship OR !ship <name 1> <name 2>')
      .command('!note', note, '!note <name> <note>');

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
            try {
              let notes = JSON.parse(fs.readFileSync('notes.json', 'utf8'));
              if (notes[message.from].length > 0) {
                let response = 'Hey, ' + res[message.from].name + '! Here are some notes for you!\n';
                while (notes[message.from][0]) {
                  response += '\t"'  + notes[message.from][0] + '"\n';
                  notes[message.from].shift();
                }
               api.sendMessage(response,
                message.from,
                (err) => {
                  if(err)
                    return console.log(err);
                });
               fs.writeFileSync('notes.json', JSON.stringify(notes));
              }
            } catch (err) {
              console.log(err);
            }
           
          }
          
        });

      }


      if(message.type !== 'message' || !message.body)
        return;
      console.log('Got a message from', message.senderID, ':', message.body);

      gb.run(message.body, api, message);
         
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

