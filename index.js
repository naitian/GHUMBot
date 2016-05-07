var login = require('facebook-chat-api');
var prompt = require('prompt');
var fs = require('fs');
var dict = require('dictcc-js');
var urlify = require('urlify').create({
  'addEToUmlauts': true,
  'szToSS': true,
  'spaces': '+'
});
var Bot = require('./bot.js');



function wquote(args, botAPI, message) {
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
  botAPI.sendMessage(index + 1 + '. ' + split[index], message.threadID);
}

function dictcc(args, botAPI, message) {
  'use strict';
  if (args < 3) 
    return botAPI.sendMessage('Oh no! Check your arguments.', message.threadID);

  //Translates the text using the dictionary.
  let fromLang = args.shift();
  let toLang = args.shift();
  let endpoint = urlify(args.join(' '));

  dict.translate(fromLang, toLang, endpoint, (data, err) => {
    if (err) {
      console.log(err);
      return botAPI.sendMessage('Oh no! An error occurred!', message.threadID);
    }
    if(data !== null && data.length > 0){
      let msg = {
        body: 'Top definition: ' + data[0].from + ' = ' + data[0].to,
      };
      return botAPI.sendMessage(msg, message.threadID);
    }
    else
      return botAPI.sendMessage('Oh no! No definitions found.', message.threadID);
  }); 
}

function ship(args, botAPI, message) {
  'use strict';
  //Filters out "and"s from the arguments. Note: determine if this is a good idea.
  args = args.filter((value) => {return value !== 'and';});

  //Checks if there are still 2 names to ship
  if(args.length >= 2) {
    botAPI.sendMessage(args.splice(0, args.length - 1).join(', ') + ' and ' + args[args.length - 1] + 
      '\nsittin\' in a tree,' + 
      '\nK-I-S-S-I-N-G.' + 
      '\nFirst comes love,' + 
      '\nThen comes marriage,' + 
      '\nThen comes a baby' + 
      '\nIn a baby carriage.',
      message.threadID);
  }
  else

    //Sends a generic heart
    botAPI.sendMessage('────(ღ)(ღ)(ღ)────(ღ)(ღ)(ღ) __ ɪƒ ƴσυ\'ʀє αʟσηє,' + 
      '\n──(ღ)██████(ღ)(ღ)██████(ღ) ɪ\'ʟʟ ɓє ƴσυʀ ѕɧα∂σѡ.' + 
      '\n─(ღ)████████(ღ)████████(ღ) ɪƒ ƴσυ ѡαηт тσ cʀƴ,' + 
      '\n─(ღ)██████████████████(ღ) ɪ\'ʟʟ ɓє ƴσυʀ ѕɧσυʟ∂єʀ.' + 
      '\n──(ღ)████████████████(ღ) ɪƒ ƴσυ ѡαηт α ɧυɢ,' + 
      '\n────(ღ)████████████(ღ) __ ɪ\'ʟʟ ɓє ƴσυʀ ρɪʟʟσѡ.' + 
      '\n──────(ღ)████████(ღ) ɪƒ ƴσυ ηєє∂ тσ ɓє ɧαρρƴ,' + 
      '\n────────(ღ)████(ღ) __ ɪ\'ʟʟ ɓє ƴσυʀ ѕɱɪʟє.' + 
      '\n─────────(ღ)██(ღ) ɓυт αηƴтɪɱє ƴσυ ηєє∂ α ƒʀɪєη∂,' + 
      '\n───────────(ღ) __ ɪ\'ʟʟ ʝυѕт ɓє ɱє.\n',
      message.threadID);
}

function note(args, botAPI, message) {
  'use strict';
  // Make sure correct number of arguments
  if(args.length < 2) {
    botAPI.sendMessage('Oh no, an error occurred!',
      message.threadID);
  }
  else {
    let name = args[0];
    let note = args.slice(1).join(' ');
    if (!note) {
      botAPI.sendMessage('No note specified!',
        message.threadID);
    }
    botAPI.getUserByName(name, message.threadID, (res) => {
      let id = res.id;  
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

      botAPI.sendMessage('Note for ' + res.name + ' set.', message.threadID);
    });
  }
}

function sendNote (botAPI, message) {
  'use strict';
  botAPI.api.getUserInfo(message.senderID, (err, res) => {

    if (err) {
      console.log(err);
    }
    else {
      try {
        let notes = JSON.parse(fs.readFileSync('notes.json', 'utf8'));
        if (notes[message.senderID].length > 0) {
          let response = 'Hey, ' + res[message.senderID].name + '! Here are some notes for you!\n';
          while (notes[message.senderID][0]) {
            response += '\t"'  + notes[message.senderID][0] + '"\n';
            notes[message.senderID].shift();
          }
         botAPI.sendMessage(response, message.senderID);
         fs.writeFileSync('notes.json', JSON.stringify(notes));
        }
      } catch (err) {
        console.log(err);
      }
     
    }
    
  });
}


//where credentials is the user's credentials as an object, fields `email` and `password
function authenticate(credentials){
  'use strict';
  login(credentials, function(err, api) {
    if(err) return console.error(err);

    if(credentials.email)
      fs.writeFileSync('appstate.json', JSON.stringify(api.getAppState()));

    console.log('Logged in'); //we've authenticated

    let tests = {
      '!wquote-no-arg': {
        'message':'!wquote',
        'event':{
          'type': 'message',
          'senderID': '100008188842131',
          'body': '!wquote',
          'threadID': '100008188842131',
          'messageID': 'mid.1462455891719:f316e8c3c1f98e1c27',
          'attachments': [],
          'timestamp': '1462455891725',
          'isGroup': false
        }
      },
      '!wquote-1-arg': {
        'message':'!wquote 15',
        'event':{
          'type': 'message',
          'senderID': '100008188842131',
          'body': '!wquote 15',
          'threadID': '100008188842131',
          'messageID': 'mid.1462455930968:864e2bb2fabb893766',
          'attachments': [],
          'timestamp': '1462455930975',
          'isGroup': false
        }
      },
      '!wquote-extra-arg': {
        'message':'!wquote 15 hi',
        'event':{
          'type': 'message',
          'senderID': '100008188842131',
          'body': '!wquote 15 hi',
          'threadID': '100008188842131',
          'messageID': 'mid.1462456064474:3d0dcceb2a8367b761',
          'attachments': [],
          'timestamp': '1462456064478',
          'isGroup': false
        }
      },
      '!ship-no-arg': {
        'message':'!wquote 15',
        'event':{
          'type': 'message',
          'senderID': '100008188842131',
          'body': '!wquote 15',
          'threadID': '100008188842131',
          'messageID': 'mid.1462455930968:864e2bb2fabb893766',
          'attachments': [],
          'timestamp': '1462455930975',
          'isGroup': false
        }
      },
      '!ship-1-arg': {
        'message':'!ship hi',
        'event':{
          'type': 'message',
          'senderID': '100008188842131',
          'body': '!ship hi',
          'threadID': '100008188842131',
          'messageID': 'mid.1462456017548:488d0bc7fafcb77405',
          'attachments': [],
          'timestamp': '1462456017554',
          'isGroup': false
        }
      },
      '!ship-2-arg': {
        'message':'!ship Me You',
        'event':{
          'type': 'message',
          'senderID': '100008188842131',
          'body': '!ship Me You',
          'threadID': '100008188842131',
          'messageID': 'mid.1462456136188:e939b116f6fe8b8512',
          'attachments': [],
          'timestamp': '1462456136199',
          'isGroup': false
        }
      },
      '!ship-multiple-arg': {
        'message':'!ship Me You Them',
        'event':{
          'type': 'message',
          'senderID': '100008188842131',
          'body': '!ship Me You Them',
          'threadID': '100008188842131',
          'messageID': 'mid.1462456180272:7f84ca93e05397f698',
          'attachments': [],
          'timestamp': '1462456180279',
          'isGroup': false
        }
      }
    };

    let gb = new Bot('GHUM Bot', api, tests);
    gb.command('!wquote', wquote, '!wquote')
      .command('!dict', dictcc, '!dict <from> <to> <text>')
      .command('!ship', ship, '!ship OR !ship <name 1> <name 2>')
      .command('!note', note, '!note <name> <note>')
      .event(sendNote, 'message');
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
      conform: function () {
        'use strict';
        return true;
      }
    }], function (err, result) {
      'use strict';
      authenticate(result); //pass credentials to authenticate function
    }
  );
}

