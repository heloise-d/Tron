const mongoose = require('mongoose');

const joueurSchema= mongoose.Schema({
   pseudo: { type: String, required: true },
   score: { type: Number, required: true },
   status : {type: Boolean, required:true}

  
},{
    collection :'players'
});

module.exports = mongoose.model('Joueur', joueurSchema);