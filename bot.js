'use strict';
var splitargs = require('string-argv');


module.exports = class Bot {

  constructor(name, api, tests) {
    this.name = name;
    this.scripts = new Map();
    this.eventScripts = new Map();
    this.botAPI = {
      api: api,
      sendMessage: this.sendMessage.bind(this),
      getUserByName: 'hi'
    };
    

    this.command.bind(this);
    this.event.bind(this);
    this.run.bind(this);
    this.listen.bind(this);

    if (tests) {
      this.tests = tests;
      this.command('!test', this.test.bind(this), '!test');
    }
    this.command('!help', this.help.bind(this), '!help');

    this.listen();
  }

  listen() {
    this.botAPI.api.setOptions({
      logLevel: 'silent',
      selfListen: false,
      listenEvents: true
    });

    this.botAPI.api.listen(function(err, event) {
      if(err)
        return console.log(err);

      this.run(event.body, event);
         
    }.bind(this));
  }

  command(name, func, usage) {
    this.scripts.set(name, {
      'call': func,
      'usage': usage
    });
    return this;
  }

  event(func, type) {
    if (this.eventScripts.get(type)) 
      this.eventScripts.get(type).push(func);
    else
      this.eventScripts.set(type, [func]);
    return this;
  }

  run(messageText, event) {
    // The commented code logs the message and event for writing tests.
    // console.log('=====Log======');
    // console.log('{\n\t\'message\':\'' + messageText + 
    //   '\',\n\t\'event\':' + JSON.stringify(event, null, 2).replace(/"/g, '\'') + '\n}');

    if (event.type !== 'message' && this.eventScripts.get(event.type)) {
      this.eventScripts.get(event.type).forEach((func) => {
        func(this.botAPI, event);
      });
    } else if (messageText == null) {
      return;
    } else {
      console.log('Got a message from', event.senderID, ':', event.body);
      let args = splitargs(messageText);
      let scriptName = args[0];

      if (this.scripts.get(scriptName)) {
        this.scripts.get(scriptName).call(args.slice(1), this.botAPI, event);
      }
    }
  }

  

  sendMessage(message, threadID, callback) {
    this.botAPI.api.sendMessage(message, threadID, (err) => {
      if(err)
        return console.log(err);
      else if(callback)
        return callback(err);
    });
  }


// Built-in commands: help and test
  help(args, botAPI, event) {
    if (args.length > 0) {
      if (this.scripts.get(args[0])) {
        console.log(args[0]);
        console.log(this.scripts.get(args[0]));
        botAPI.sendMessage(this.name + ' Help!' + 
          '\n\t' + this.scripts.get(args[0]).usage,
          event.threadID);
      }
    }
    else {
      let helpMessage = this.name + ' Help:';
      this.scripts.forEach((val) => {
        helpMessage += '\n\t' + val.usage;
      });
      botAPI.sendMessage(helpMessage,
        event.threadID);
    }
  }

  test() {
    console.log(this.tests);
    Object.keys(this.tests).forEach((key) => {

      try {
        let val = this.tests[key];
        console.log(val.event);
        this.run(val.message, val.event);
      } catch (err) {
        console.log(err);
      }
    });
  }

};

