'use strict';
var splitargs = require('string-argv');


module.exports = class Bot {

  constructor(name) {
    this.name = name;
    this.scripts = new Map();

    this.command.bind(this);
    this.run.bind(this);

    this.command('!help', this.help.bind(this), '!help');
  }

  command(name, func, usage) {
    this.scripts.set(name, {
      'call': func,
      'usage': usage
    });
    return this;
  }

  run(command, api, message) {
    let args = splitargs(command);
    let scriptName = args[0];

    if(this.scripts.get(scriptName)) {
      this.scripts.get(scriptName).call(args.slice(1), api, message);
    }
  }

  help(args, api, message) {
    console.log(this);
    console.log(this.scripts);
    if (args.length > 0) {
      if (this.scripts.get(args[0])) {
        api.sendMessage(this.name + ' Help!' + 
          '\n\t' + this.scripts.get(args[0].usage),
          message.threadID,
          (err) => { if (err) return console.log(err); });
      }
    }
    else {
      let helpMessage = this.name + ' Help:';
      this.scripts.forEach((val) => {
        helpMessage += '\n\t' + val.usage;
      });
      api.sendMessage(helpMessage,
        message.threadID,
        (err) => { if (err) return console.log(err); });
    }
  }
};

