// Connexion avec la BDD :

module.exports = function connectionbd(nomDb){
    'use strict';
    var mongoose = require('mongoose')
    mongoose.connect('mongodb://localhost:27017/'+nomDb,
      { useNewUrlParser: true,
        useUnifiedTopology: true })
      .then(() => console.log('Connexion à MongoDB réussie !'))
      .catch(() => console.log('Connexion à MongoDB échouée !'));
    mongoose.set('useFindAndModify', false);
}
