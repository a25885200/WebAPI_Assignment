const mongoose = require('mongoose');

const GameSchema = new mongoose.Schema({
    title: {
      type: String,
      required: true
    },
    discription: {
      type: String,
      required: true
    }
    
  });
  
  const Game = mongoose.model('Game', GameSchema);
  
  module.exports = Game;