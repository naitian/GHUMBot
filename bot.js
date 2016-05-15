'use strict';
var splitargs = require('string-argv');
var storage = require('node-persist');

module.exports = class Bot {

  constructor(name, api, tests) {
    this.name = name;
    this.scripts = new Map();
    this.eventScripts = new Map();
    this.botAPI = {
      api: api,
      sendMessage: this.sendMessage.bind(this),
      getUserByName: this.getUserByName.bind(this),
      getName: this.getName.bind(this),
      ban: this.ban.bind(this),
      cache: this.cacheUserList.bind(this)
    };
    

    this.command.bind(this);
    this.event.bind(this);
    this.run.bind(this);
    this.listen.bind(this);
    this.fillUserInfo.bind(this);

    if (tests) {
      this.tests = tests;
      this.command('!test', this.test.bind(this), '!test');
    }
    this.command('!help', this.help.bind(this), '!help');

    storage.initSync();
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
        return console.error(err);

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

    if (this.eventScripts.get(event.type)) {
      this.eventScripts.get(event.type).forEach((func) => {
        func(this.botAPI, event);
      });
    } 
    if (messageText == null || event.type !== 'message') {
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
        return console.error(err);
      else if(callback)
        return callback(err);
    });
  }


  getUserByName(name, threadID, callback) {
    storage.getItem('users', (err, users) => {
      if (!users || !users[threadID]) {
        this.cacheUserList(threadID);
        this.botAPI.api.getThreadInfo(threadID, (err, res) => {
          if(err)
            return console.error(err);
          else {
            let pid = res.participantIDs;
            for (var i = 0; i < pid.length; i++) {
              this.botAPI.api.getUserInfo(pid[i], (err, res) => {
                if(err)
                  return console.error(err);
                else {
                  let id = Object.keys(res)[0];
                  res = res[Object.keys(res)[0]];
                  res.id = id;
                  if(res.name.toLowerCase().indexOf(name.toLowerCase()) > -1) {
                    callback(null, res);
                  }
                }
              });
            }
          }
        }); 
      } else {
        const thread = users[threadID];
        let possible = [];
        for (var user in thread) {
          let match = thread[user].names.some((val) => {
            return val.toLowerCase().indexOf(name.toLowerCase()) > -1;
          });
          if (match) {
            let person = thread[user].account;
            person.id = user;
            possible.push(person);
          }
        }
        if (possible.length > 0)
          callback(null, possible);
        else 
          callback('No users found!', null);
      }
    });
    
  }

  getName() {
    return this.name;
  }

  ban(userID, threadID, time, callback) {
    this.botAPI.api.addUserToGroup('100011682500413', '1265170750179147', (err) => {
      console.log(err);
    });
    return;
    if (userID === this.botAPI.api.getCurrentUserID())
      return;
    this.botAPI.api.removeUserFromGroup(userID, threadID, (err) => {
      if (err)
        return console.error(err);
      setTimeout(() => {
        this.botAPI.api.addUserToGroup(userID, threadID, (err) => {
          if (callback)
            callback(err);
        });
      }, time);
    });
  }

  fillUserInfo(threadID) {
    storage.getItem('users', (err, users) => {
      if (err)
        return console.error(err);
      this.botAPI.api.getThreadInfo(threadID, (err, res) => {
        if (err)
          return console.error(err);
        console.log('\tRetrieved Group Data');  
        res.participantIDs.forEach((val) => {
          storage.getItem('users', (err, users) => {
            if (!users[threadID][val]) {
              users[threadID][val] = {};
              users[threadID][val].names = new Set();
            }
            else {
              users[threadID][val].names = new Set(users[threadID][val].names);
            }
            if (res.nicknames[val]) {
              users[threadID][val].names.add(res.nicknames[val]);
            }

            this.botAPI.api.getUserInfo(val, (err, user) => {
              if (err)
                return console.error(err);
              users[threadID][val].names.add(user[val].name);
              users[threadID][val].names = Array.from(users[threadID][val].names);
              users[threadID][val].account = user[val];
              storage.setItem('users', users);
              console.log('\t' + val + ' caching complete');
            }); 
          });
        });
      });
    });
  }

  cacheUserList(threadID) {
    console.log('Caching Users');
    storage.getItem('users', (err, users) => {
      console.log('\tRetrieved Users Object');
      if (err)
        return console.error(err);
      if (!users) {
        users = {};
        users[threadID] = {};
        storage.setItem('users', users);
      }
      this.fillUserInfo(threadID);
    });

  }

  

// Built-in commands: help and test
  help(args, botAPI, event) {
    if (args.length > 0) {
      if (this.scripts.get(args[0])) {
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
    Object.keys(this.tests).forEach((key) => {

      try {
        let val = this.tests[key];
        this.run(val.message, val.event);
      } catch (err) {
        console.error(err);
      }
    });
  }

};

