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

##Contributing

Adding new comands is relatively easy. In `index.js`, new commands are assigned to `gb`, which is a `Bot`. There is a section in the code that looks like this: 
```javascript
    gb.command('!wquote', wquote, '!wquote')
      .command('!dict', dictcc, '!dict <from> <to> <text>')
      .command('!ship', ship, '!ship OR !ship <name 1> <name 2>')
      .command('!note', note, '!note <name> <note>');
```

To add a new command, simply append another `.command()` function. Define the function where the code gets executed elsewhere in `index.js`. The first argument is the actual command being run. The second argument is the function that gets executed when someone calls the command. The third argument is usage that the `Bot` class uses to automatically generate a help screen.

##To-Do
- [ ] Further refactoring (Help needed!!!)
- [ ] Color changing functionality
- [ ] Improved note functionality