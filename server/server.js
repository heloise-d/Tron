// --------------------------------------------------------------------------------------------------------------
// MODULES :
// --------------------------------------------------------------------------------------------------------------
var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
const Joueur = require('./models/joueur');
let Room = require('./Room.js');

// Connexion avec la Base de Donnée avec mongoose :
let connectionBd = require('./ConnectionBdService.js');
connectionBd("Tron") // Prend en paramètre le nom de la base de données



// --------------------------------------------------------------------------------------------------------------
// INITIALISATION DES CONSTANTES ET VARIABLES :
// --------------------------------------------------------------------------------------------------------------

// Définition des Room :
let roomno = 0; // Initialisation du numéro de room à zéro
let roomPlayer=[]; // Tableau contenant les différentes room
// Création d'une première Room :
let rp = new Room(); 
rp.name=roomno+"";
roomPlayer.push(rp); // Push cette première Room dans le tableau des Room

let winnerScore; // Stocker le score du gagnant
let score1; // Stocker le score du joueur


// --------------------------------------------------------------------------------------------------------------
// SOCKET :
// --------------------------------------------------------------------------------------------------------------


//process.setMaxListeners(1000)

// Set header to enable CORS :
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

// Connexion d'un client au serveur : 
io.sockets.on('connection', function(socket) {
  console.log('User connected');

  // Deconnexion d'un client :
  socket.on('disconnect', function () {

    // Si le joueur qui s'est déconnecté était un joueur étant en file d'attente (donc s'il composait le premier joueur de la dernière salle) :
    if (socket.id == roomPlayer[roomPlayer.length- 1].socketId[0]){

      // Récupérer le pseudo du joueur :
      let pseudoLeave =  roomPlayer[roomPlayer.length- 1].pseudo[0];

      // Mettre le status du joueur correspondant à "false" dans la base de données
      putStatusFalseDB(pseudoLeave);

      // Vider la salle qui était occupée par le joueur qui a quitté la file d'attente :
      roomPlayer[roomPlayer.length- 1].pseudo.pop();
      roomPlayer[roomPlayer.length- 1].socketId.pop();
    }
    console.log('User disconnected');
  });


  // Socket 'username' :
  // Récupérer dans la BDD le pseudo envoyé, ou création d'un joueur portant ce pseudo
  socket.on("username",function(data){

    // Rechercher le joueur dans la BDD par le pseudo :
    Joueur.findOne({ 'pseudo': data }, function (err, user) {
      if(err){ // Erreur :
        console.log("echec")
      }
      else if (user!=null) { // Si le joueur existe dans la BDD :
        
        if(user.status==false){ // Si le status du joueur est à false (donc que le pseudo n'est pas déjà en cours d'utilisation)

          // Mise à jour du status correspondant au pseudo dans la BDD (le status passe à true) :
          Joueur.findOneAndUpdate({ 'pseudo': data }, {"pseudo":data,"score":user.score,"status":true},function (err, user) {
            if (err) console.log("echec");
          });
          io.sockets.to(socket.id).emit("save",user); // Envoi d'une socket à l'utilisateur pour changer d'affichage du côté client
            
        }
        else
          socket.emit('dejaConnecte') // Envoi d'une socket à l'utilisateur : le pseudo qu'il essaie d'utiliser pour se connecter à une partie est déjà utilisé
      } 

      else{ // Si le joueur n'existe pas dans la BDD :
        // Création d'un nouvel objet de type Joueur
        var joueur= new Joueur(); 
        joueur.pseudo = data; 
        joueur.score = 0;
        joueur.status=true

        io.sockets.to(socket.id).emit("save",joueur); // Envoi du Joueur à l'utilisateur
        joueur.save() // Sauvegarder le joueur dans la BDD
      }
    });
  })


  // Socket "highScore" :
  // Afficher le classement des joueurs de la BDD
  socket.on("highScore", function(){
    Joueur.find(function(err, user){ // Récupérer tous les joueurs de la BDD 
      io.sockets.to(socket.id).emit("highScore", user); // Envoi de tous les joueurs de la BDD au client
    });
  });


  // Socket "pseudo" :
  // Placer dans le tableau roomPlayer de la Room le pseudo à l'indice correspondant à la socket.id de l'utilisateur
  socket.on("pseudo",(pseudo)=>{
    // Si la socket.id est stockée à l'indice 0 du tableau roomPlayer :
    if(socket.id===roomPlayer[pseudo.num].socketId[0])
      roomPlayer[pseudo.num].pseudo[0]=pseudo.pseudo // Stocker le pseudo à l'indice 0 du tableau
    
    // Sinon, stocker le pseudo à l'indice 1 du tableau
    else if(socket.id===roomPlayer[pseudo.num].socketId[1]) // Stocker le pseudo à l'indice 1 du tableau
      roomPlayer[pseudo.num].pseudo[1]=pseudo.pseudo
  })
    

  // Socket 'pret' :
  // Gérer les Rooms en fonction des connexions des utilisateurs 
  socket.on("pret",(pseudo)=>{

    // Ajouter le pseudo/la socket.id dans les attributs de la dernière room dans le tableau :
    let room = roomPlayer[roomPlayer.length- 1]
    room.socketId.push(socket.id) 
    room.pseudo.push(pseudo)

    // Joindre l'utilisateur à la Room :
    socket.join(""+roomno);
    io.sockets.to(""+roomno).emit("numRoom",roomno) // Envoyer le numéro de room à l'utilisateur
    
    // Si le nombre de joueur dans la Room est égal à 2 (=le nombre max de joueurs), commencer la partie :
    if (roomPlayer[roomPlayer.length-1].socketId.length==2){
      
      // Envoyer à l'utilisateur son numéro de Room :
      io.sockets.to(socket.id).emit("numRoom",roomno)

      // Envoyer aux 2 utilisateurs constituant la room les instructions "jouer" et "lancer" :
      io.sockets.to(roomno+"").emit("jouer")
      io.sockets.to(roomno+"").emit("lancer")

      // Récupérer les pseudos des deux joueurs constituant la Room :
      let pseudos = roomPlayer[roomno].pseudo

      // Envoyer le pseudo de l'utilisateur 1 à l'utilisateur 2, et vice-versa :
      io.sockets.to(roomPlayer[roomno].socketId[0]).emit("pseudo",{pseudo1:pseudos[0],pseudo2:pseudos[1]})
      io.sockets.to(roomPlayer[roomno].socketId[1]).emit("pseudo",{pseudo1:pseudos[1],pseudo2:pseudos[0]})

      // Définir chaque joueur dans sa partie :
      io.sockets.to(roomPlayer[roomno].socketId[1]).emit('currentPlayer',{current:1,opponent:0});
      io.sockets.to(roomPlayer[roomno].socketId[0]).emit('currentPlayer',{current:0,opponent:1});
      
      // Création d'une nouvelle room vide pour les prochains joueurs :
      let room =new Room();
      roomPlayer.push(room); // Push la nouvelle Room dans le tableau des rooms
      roomno++; // Incrémentation du numéro de Room
    }
  })


  // Socket 'winner'
  // Gestion du gagnant : augmenter le score du gagnant et envoyer l'information aux joueurs de la partie.
  socket.on('winner', function(winner){

    // Envoi du gagnant aux utilisateurs faisant parti de la même Room :
    io.sockets.to(winner.num+"").emit('winner', winner.winner);
    let pseudo1 = roomPlayer[winner.num].pseudo[0];
    let pseudo2 = roomPlayer[winner.num].pseudo[1];


    // S'il n'y a pas un match nul :
    if (winner.winner !="tie"){

      // Rechercher le joueur dans la BDD afin de récupérer son ancien score
      Joueur.findOne({ 'pseudo': winner.winner.name},function(err,user){
        if (err) console.log("echec");
        winnerScore=user.score+1 // Incrémenter de 1 l'ancien score du gagnant

          // Mettre à jour le score du gagnant dans la BDD et mettre à jour son status à "false" dans la BDD :
        Joueur.findOneAndUpdate({ 'pseudo': winner.winner.name }, {"pseudo":winner.winner.name,"score":winnerScore,"status":false},function (err, user) {
          if (err) console.log("echec");
        });
      });

      // Mettre le status du joueur adverse à "false" dans la BDD :
      if (pseudo1 != winner.winner.name) putStatusFalseDB(pseudo1);
      else putStatusFalseDB(pseudo2);

    } 

    else { // Si c'est match nul :
      // Mettre les status des deux joueurs à false : (sans changer les scores)
      putStatusFalseDB(pseudo1);
      putStatusFalseDB(pseudo2);
    }
  });


  // Socket 'player'
  // Envoyer les informations du joueurs à l'opposant
  socket.on("player",(data)=>{
    if(roomPlayer[data.num].socketId[0]==socket.id)
      io.sockets.to(roomPlayer[data.num].socketId[1]).emit('opponent',data.player);
    else
      io.sockets.to(roomPlayer[data.num].socketId[0]).emit('opponent',data.player);
  })


  // Socket 'quitterFile'
  // Permet de faire sortir le joueur de la file d'attente s'il a cliqué sur "Retour" alors qu'il attendait un adversaire
  socket.on("quitterFile",(numRoom)=>{
    // Récupérer le pseudo du joueur qui a quitté la file d'attente : (il constitue le joueur numéro zéro de la salle car seul le joueur zéro a accès au bouton "Retour" pour quitter la salle d'attente)
    let pseudoLeave =  roomPlayer[numRoom].pseudo[0];
    putStatusFalseDB(pseudoLeave); // Mettre le status du joueur à false

    // Vider la salle qui était occupée par le joueur qui a quitté la file d'attente :
    roomPlayer[numRoom].pseudo.pop();
    roomPlayer[numRoom].socketId.pop();
  });

})


// Fonction permettant de faire passer le status d'un joueur à "false" dans la BDD :
function putStatusFalseDB(pseudo){
  // Chercher le joueur dans la BDD :
  Joueur.findOne({ 'pseudo': pseudo},function(err,user){
      if (err) console.log("echec");
      score1=user.score // Récupérer le score du joueur

      // Mettre à jour le status à "false" dans la BDD :
      Joueur.findOneAndUpdate({ 'pseudo': pseudo}, {"pseudo":pseudo,"score":score1,"status":false},function (err, user) {
        if (err) console.log("echec");
      });
    });
}


//Now server would listen on port 8080 for new connection
http.listen(8080, function(){
     console.log('listening on *:8080');
});