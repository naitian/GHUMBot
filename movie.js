'use strict';
var fs = require('fs');

module.exports = class MovieGame {
  constructor(file) {
    this.filename = file;
    this.movie = null;
    this.previous = null;
    this.answer = null;
    this.lines = fs.readFileSync('movie', 'utf8').split('\n');
    this.lines.pop();
    this.getNewMovie.bind(this);

    this.gameOn = false;
  }

  getNewMovie() {


    let index = Math.floor(Math.random() * this.lines.length / 2) * 2 + 1;
    while (this.lines[index] === this.previous)
      index = Math.floor(Math.random() * this.lines.length / 2) * 2 + 1;
    this.previous = this.movie;
    this.movie = this.lines[index];
    this.answer = this.lines[index - 1];

    return this.movie;
  }


};