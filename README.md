# GHUMBot 

## Installation

Clone this repository. `cd` into the repository, and install the packages using `npm install .`
Run `node index.js` and enter your Facebook credentials.

For wquote to work, make a quotes.txt file and add quotes in the following format:

- Each quote is separated by a newline, a number, and a period.
- Ex:
    
    ```
    
        1. Hello
        2. Goodbye
    ```
    
!!! Warning: This bot does *not* abide by the Facebook terms and conditions. It's entirely that Facebook will think you are infected by a virus, and block you from posting any links (speaking from experience here).

## About the `Bot` class

`Bot` is a class that helps maintain a readable bot, while adding some extra features like automatic `!help` menu generation, as well as some convenience helper methods. Here are the methods and fields in the `Bot` class.

- `Bot.prototype.constructor(name, api)`
    + Constructs new Bot with `name`. Must also pass in the facebook-chat-api `api` object upon `login`
- `Bot.prototype.command(name, func, usage)`
    + Register a user-facing command called by `name`. `func` is the function ran upon the command being called in a message. `usage` is the usage for the command, used when generating the dynamic help menu.
    + Each registered function can take 3 arguments:
        * `args`
            - an array of arguments, as processed by `string-argv`
        * `botAPI`
            - the `botAPI` in the Bot class
        * `message`
            - the event object
    + Ex: `gb.command('!dict', dictcc, '!dict <from> <to> <text>'` would register a command called "!dict". This means `dictcc()` would be run every time someone types "!dict" in a messenger chat with your bot. The usage will appear in the help menu.
    + Ex: Running `!dict en de Hello` would run `dictcc` and the `args` argument would contain `['en', 'de', 'hello']`
- `Bot.prototype.event(func, eventType)`
    + Register a function that runs upon an event firing
    + See all events at the docs for [facebook-chat-api](https://github.com/Schmavery/facebook-chat-api/blob/master/DOCS.md)
- `Bot.prototype.botAPI`
    + Gets passed into every function
    + `Bot.prototype.botAPI.api`
        * The API provided by facebook-chat-api
    + `Bot.prototype.botAPI.sendMessage(message, threadID, [callback])`

## Contributing

Adding new comands is relatively easy. In `index.js`, new commands are assigned to `gb`, which is a `Bot`. There is a section in the code that looks like this: 
```javascript
    gb.command('!wquote', wquote, '!wquote')
      .command('!dict', dictcc, '!dict <from> <to> <text>')
      .command('!ship', ship, '!ship OR !ship <name 1> <name 2>')
      .command('!note', note, '!note <name> <note>')
      .event(sendNote, 'type');
```

To add a new command, simply append another `.command()` function. Define the function where the code gets executed elsewhere in `index.js`. The first argument is the actual command being run. The second argument is the function that gets executed when someone calls the command. The third argument is usage that the `Bot` class uses to automatically generate a help screen.


##To-Do
- [ ] Further refactoring (Help needed!!!)
- [ ] Color changing functionality
- [ ] Improved note functionality
- [ ] Add helper methods to botAPI