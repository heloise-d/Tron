// --------------------------------------------------------------------------------------------------------------
// CONNEXION AVEC LE SERVEUR :
// --------------------------------------------------------------------------------------------------------------

var socket;

// Evènement lancé lorsque l'appareil est prêt 
document.addEventListener("deviceready", onDeviceReady, false);
function onDeviceReady() {
  let isSimulator = device.isVirtual; // Stocker si le client est lancé sur un navigateur/un émulateur
  connexionServer(isSimulator); // Se connecter au serveur
  socketON(); // Charger les socket.on
  setupGame(); // Lancer le jeu
}

// Fonction permettant de connecter le client au serveur selon s'il est sur un navigateur ou un émulateur :
function connexionServer(isSimulator){
  if(isSimulator){ // S'il est sur emulateur
    socket = io.connect('http://10.0.2.2:8080/');
  }
  else{ // Sinon
    socket = io('http://127.0.0.1:8080/');
  }
}


// --------------------------------------------------------------------------------------------------------------
// INITIALISATION DES CONSTANTES ET VARIABLES :
// --------------------------------------------------------------------------------------------------------------

// Définition des propriétés des 2 joueurs :
let pseudo1; // Pseudo du joueur courant
let pseudo2; // Pseudo du joueur adverse
let currentPlayer; // Définit si le joueur courant est le 0e ou le 1er joueur
let opponentPlayer; // Définit si le joueur adverse est le 0e ou le 1er joueur (doit être 1 si currentPlayer=0, et vice versa)
let position = [{x:2, y:12}, {x:18, y:12}]
let color = ['rgb(51,114,255)', 'rgb(103,255,51)']
let direction = ['right', 'left']
let winner=""; // Initialisation du gagant à "" (aucun gagant en début de partie)

// Paramètres du plateau de jeu :
let WIDTH = 23;
let HEIGHT = 21;
let playground = new Playground(WIDTH, HEIGHT);
const PIX = 17; // La largeur et longueur d'un carré d'un joueur dans le Canvas

// Numéro de Room :
let numeroRoom;

// Variables permettant de déterminer si le 2e joueur est inactif : (par comparaison de la position du joueur adverse au temps 0 et temps 1)
let debut; // Contient le temps 0
let fin; // Contient le temps 1
let lastPositionP2; // Contient la position du joueur adverse au temps 1

// Initialisation de l'état de la partie à false. Dès que le jeu est à true, la partie commence :
let game = false; 



// --------------------------------------------------------------------------------------------------------------
// FONCTIONS DE JEU :
// --------------------------------------------------------------------------------------------------------------

// Initialisation du plateau de jeu et des deux joueurs :
function setupGame() {
  canva = createCanvas(WIDTH*PIX, HEIGHT*PIX); // Initialiser le Canva
  document.getElementById("defaultCanvas0").style.margin = "auto" // Mettre le Canva au milieu de la fenêtre
  canva.hide(); // Par défaut, cacher le Canva
  frameRate(3); // Définition du nombre de frame par secondes
  background(40); // Fond du canva
}

// Après la fonction setup(), la fonction draw() est continuellement appelée
function draw() {
  if (game == true) { // Si le jeu n'est pas en pause
    canva.show(); // Montrer le Canva
    playGame() // Appeler la fonction permettant de faire jouer le jeu
  };
}



// Fonction de jeu : fait jouer les joueurs sur le plateau et dessine le plateau de jeu
function playGame(){ 

  // Détecter si le deuxième joueur n'est plus actif depuis 1 seconde : (dans ce cas, le gagnant est le joueur courant)
  if(debut == undefined){ // Si début n'a jamais été défini
    debut = new Date(); // Définir début en affectant la date actuelle (qui contient aussi le temps)
    lastPositionP2 = player2.position // Stocker la position du joueur 2 dans la variable
  }
  else {
    fin = new Date(); // Affecter le temps actuel à la variable fin
    if(fin.getTime()>=debut.getTime()+1000 ){ // S'il s'est déroulé plus d'une seconde entre les 2 variables
      if(lastPositionP2 == player2.position ){  // Vérifier si la position du joueur 2 n'a pas été changée
        winner = player1 // Si oui, le gagnant est le joueur courant
      } else { // Sinon, restocker la position du joueur 2 et définir une nouvelle date pour debut
        debut = new Date();
        lastPositionP2 = player2.position
      }
    }
  }

  // Faire jouer le joueur 1 dans le plateau de jeu :
  player1.play(); 
  socket.emit('player', {player:player1,num:numeroRoom}); // Envoyer la position et la direction du joueur 1 à l'adversaire

  // Vérification du gagnant et des différentes conditions de victoire
  if (winner == "") winner = player1.collisionFacingOpponent(player2); // Vérification de la collision de face des deux joueurs : s'ils se heurtent de face, affectation du gagnant à "tie"
  if (winner == "") winner = playground.collisionWithEdges(player1, player2); // Vérifier si le joueur 1 dépasse les limites du plateau de jeu. S'il dépasse, le gagnant = joueur 2
  if (winner == "") winner = playground.collisionWithOpponent(player1, player2); // Vérifier si le joueur 1 recontre un mur (son propre mur ou le mur de l'adversaire). S'il rencontre un mur, le gagnant = joueur 2
  if (winner == "") {playground.placePlayerInTab(player1);playground.drawTab();} // S'il n'y a pas de gagant : on place le joueur 1 dans le plateau de jeu
  if (winner != "") {
      socket.emit('winner',{winner:winner,num:numeroRoom}); // Envoyer le nom du gagant au joueur adverse 
      game=false; // S'il y a un gagant : arrêt de la partie
  }
}

// Fonction permettant de créer les 4 boutons de direction et les afficher dans la fenêtre de jeu :
function createButtonsDirection(){
  var body = document.getElementsByTagName("body")[0];

  // Bouton Up :
  var buttonUp = document.createElement("span");
  buttonUp.id = "buttonUp"
  buttonUp.innerHTML = "↑"
  //buttonUp.style.display = "block"
  //buttonUp.style.margin = "auto" // Centrer le bouton au milieu de la page

  // Bouton Left : 
  var buttonLeft = document.createElement("span");
  buttonLeft.id = "buttonLeft";
  buttonLeft.innerHTML="←";

  // Bouton Right :
  var buttonRight = document.createElement("span");
  buttonRight.id = "buttonRight"
  buttonRight.innerHTML = "→"

  // Bouton Down :
  var buttonDown = document.createElement("span");
  buttonDown.id = "buttonDown"
  buttonDown.innerHTML = "↓"
  //buttonDown.style.display = "block"
  //buttonDown.style.margin = "auto" // Centrer le bouton au milieu de la page

  // Associer les boutons Right et Left dans une meme div :
  var divRightLeft = document.createElement("div");
  divRightLeft.id = "divRightLeft"
  divRightLeft.appendChild(buttonLeft);
  divRightLeft.appendChild(buttonRight);
  divRightLeft.style.margin = "auto" // Centrer les deux boutons (right et left) au milieu de la page
  divRightLeft.style.width = "70px";
  
  // Placer les boutons dans la page :
  body.appendChild(buttonUp);
  body.appendChild(divRightLeft);
  body.appendChild(buttonDown);
  eventsButtonDirection();
}


function afficheIdentifiantsJoueurs(){
  let idDiv = document.getElementById("identifiantsJoueurs");
  let txt = "Vous : "+player1.name+"<br/>"+"Adversaire : "+player2.name;
  idDiv.innerHTML = txt;
}

// --------------------------------------------------------------------------------------------------------------
// SOCKET.ON
// --------------------------------------------------------------------------------------------------------------

// Fonction contenant toutes les socket.on
function socketON(){

  // Socket 'opponent'
  // Receptionner les données contenant les positions et la direction de l'adversaire
  socket.on('opponent', function(player){
    player2.update(player) // Mettre à jour les informations du joueur adverse (position et direction)
    playground.placePlayerInTab(player2); // Placer le joueur adverse dans le plateau de jeu
    playground.drawTab(); // Dessiner le plateau de jeu

  });

  // Socket 'dejaConnecte'
  // Le pseudo que le joueur essaie d'utiliser est déjà en cours d'utilisation par un autre joueur : le joueur reçoit un message d'alerte et doit changer de pseudo pour pouvoir jouer
  socket.on('dejaConnecte', function(){
    msgValidation.innerHTML = "Pseudo déjà en cours d'utilisation, veuillez en choisir un autre.";
  })


  // Socket 'winner'
  // Réceptionner les données concernant le gagnant
  socket.on('winner', function(winner2){
    game=false; // La partie s'arrête lorqu'il y a un gagnant

    // Affichage du gagnant dans la fenêtre de jeu :
    if(winner2.name ===pseudo1){ 
      document.getElementById("resultat").textContent="Bravo "+pseudo1+" vous avez gagné !"
    }else if(winner2.name ===pseudo2){
      document.getElementById("resultat").textContent="Defaite ! "+pseudo1 +"  vous avez perdu !"
    }else{
      document.getElementById("resultat").textContent="Match nul entre vous et "+pseudo2
    }

    document.getElementById("backToTheMenu").style.display = "block"
  });


  // Socket 'pseudo'
  // Réceptionner les données contenant les pseudos des 2 joueurs
  socket.on("pseudo",function(pseudo){
    pseudo1 = pseudo.pseudo1 // Pseudo du joueur courant
    pseudo2 = pseudo.pseudo2 // Pseudo du joueur adverse
  })

  // Socket 'currentPlayer'
  // Réceptionner les informations sur le joueur courant/le joueur adverse et initialiser les 2 joueurs
  socket.on("currentPlayer",(data)=>{
    // Définir si currentPlayer est 0 ou 1 (de même avec opponentPlayer).
    currentPlayer=data.current;
    opponentPlayer=data.opponent

    // Initialisation des deux joueurs :
    player1 = new Player(pseudo1, position[currentPlayer].x, position[currentPlayer].y, direction[currentPlayer], color[currentPlayer]);
    player2 = new Player(pseudo2, position[opponentPlayer].x, position[opponentPlayer].y, direction[opponentPlayer], color[opponentPlayer]);

    // Affichage du message d'attente avant que la partie commence :
    if (currentPlayer == 0){
      // Si le joueur courant est à l'indice 0, alors il sera le joueur bleu :
      document.getElementById("att").innerHTML='Adversaire trouvé. Vous êtes le joueur <b>Bleu</b>. Votre jeu va demarrer dans'
    } else {
      // Sinon il sera le joueur vert :
      document.getElementById("att").innerHTML='Adversaire trouvé. Vous êtes le joueur <b>Vert</b>. Votre jeu va demarrer dans'
    }
  })


  // Socket 'numRoom'
  // Réceptionner l'information du numéro de Room dans laquelle l'utilisateur va jouer.
  socket.on("numRoom",(data)=>{
    numeroRoom =data; // Stocker le numéro de Room dans la variable 'numeroRoom'
  })


  // Socket 'lancer'
  // Lors de la reception de l'information 'lancer', changer l'affichage du client et envoyer le numéro de Room au serveur
  socket.on("lancer",()=>{
    document.getElementById("attenteAdversaire").style.display="none"
  })


  // Socket 'jouer'
  // Les deux joueurs sont prêts à commencer et un compte à rebours se lance
  socket.on("jouer",()=>{
    
    // Affichage d'un compte à rebours avant que la partie commence : 
    let i = 5 // Temps du compte à rebours
    
    setInterval(() => {
      document.getElementById("seconde").innerHTML = i + " secondes"
      i--;
    }, 1000);

    // Après les i secondes à attendre, changer l'affichage et commencer la partie
    setTimeout(()=>{
      afficheIdentifiantsJoueurs()
      document.getElementById("att").style.display="none"
      document.getElementById("seconde").style.display="none"
      
      // Création des boutons pour jouer sur portable :
      createButtonsDirection();

      game = true; // Affecter "true" à game pour que la partie commence.
    },i*1000)

  })


  // Socket 'save'
  // Changer l'affichage de la fenêtre de jeu, et envoi du pseudo au serveur
  socket.on('save',(data)=>{
    socket.emit("pret",data.pseudo)

    // Changement de l'affichage : 
    document.getElementById("loader").style.display="block"
    document.getElementById("attente").style.display="inline"
    document.getElementById("backMenu").style.display="block"
    document.getElementById("title").style.display="none"
  })


  // Socket 'highScore'
  // Permet de récupérer tous les joueurs de la BDD et de les afficher dans un tableau :
  socket.on('highScore', function(playersScore){

    // Trier le tableau en fonction des scores :
    playersScore.sort(function compare(a, b) {
      if (a.score < b.score)
         return 1;
      if (a.score > b.score )
         return -1;
      return 0;
    });

    // Créer le tableau contenant le classement :
    var body = document.getElementsByTagName("body")[0];
    var tbl = document.createElement("table");
    var tblBody = document.createElement("tbody");
    var tblHead = document.createElement("thead");

    
    // Créer les deux cellules dans le thead contenant les titres "pseudo" et "score" :
    // Cellule "pseudo" :
    var rowHead = document.createElement("tr");
    var cellA = document.createElement("td");
    var cellTextA = document.createTextNode("Pseudo");
    cellA.appendChild(cellTextA);
    rowHead.appendChild(cellA);
    // Cellule "score" :
    var cellB = document.createElement("td");
    var cellTextB = document.createTextNode("Score");
    cellB.appendChild(cellTextB);
    rowHead.appendChild(cellB);

    // Ajouter la ligne dans le thead, et ajouter le thead dans la table :
    tblHead.appendChild(rowHead);
    tbl.appendChild(tblHead);

    // Le tableau aura un nombre de lignes égal au nombre de joueurs dans la BDD :
    for (var i = 0; i < playersScore.length; i++) {
      // Créer une nouvelle ligne
      var row = document.createElement("tr");

      // Cellule contenant le pseudo du joueur
      var cell = document.createElement("td");
      var cellText = document.createTextNode(playersScore[i].pseudo);
      cell.appendChild(cellText);
      row.appendChild(cell);

      // Cellule contenant le score du joueur :
      var cell = document.createElement("td");
      var cellText = document.createTextNode(playersScore[i].score);
      cell.appendChild(cellText);
      row.appendChild(cell);

      // Ajouter la ligne à la fin de la table
      tblBody.appendChild(row);
    }

    // Mettre tbody dans la table
    tbl.appendChild(tblBody);

    // Modifier les attributs
    tbl.setAttribute("border", "1");
    tbl.style.marginRight="auto"
    tbl.style.marginLeft="auto"
    tbl.style.textAlign = "center"
    tbl.style.borderCollapse = "collapse"

    // Ajouter la table dans le body
    body.appendChild(tbl);
  })
}


// --------------------------------------------------------------------------------------------------------------
// EVENEMENTS JAVASCRIPT
// --------------------------------------------------------------------------------------------------------------

// Récupérer l'évènement lorsque l'utilisateur clique sur le bouton "valider" après avoir rempli son pseudo
let valider = document.getElementById("valider-pseudo");
let msgValidation = document.getElementById("MsgValidation");

valider.onclick = function(){
  // Valider seulement les pseudo de plus de 3 caractères et de moins de 12 caractères :
  if (document.getElementById("pseudo").value.length < 4) msgValidation.innerHTML = "Pseudo trop court, veuillez en choisir un plus long.";
  else if (document.getElementById("pseudo").value.length > 12) msgValidation.innerHTML = "Pseudo trop long, veuillez en choisir un plus court.";
  else socket.emit("username",document.getElementById("pseudo").value)
}

// Récupérer les évènements onkeydown qui vont modifier la direction du joueur courant :
document.onkeydown = function(event){
    switch(event.keyCode) {
      case 37: // Flèche gauche
        player1.changeDirection("left");
        break;
      case 38: // Flèche haut
        player1.changeDirection("up");
        break;
      case 39: // Flèche droite
        player1.changeDirection("right");
        break;
      case 40: // Flèche bas
        player1.changeDirection("down");
        break;
    }
}

// Récupérer les évènements liés aux 4 boutons de direction pour modifier la direction du joueur courant :
function eventsButtonDirection() {
  let buttonUp = document.getElementById("buttonUp");
  buttonUp.onclick = function() { player1.changeDirection("up");}
  let buttonDown = document.getElementById("buttonDown");
  buttonDown.onclick = function() { player1.changeDirection("down");}
  let buttonRight = document.getElementById("buttonRight");
  buttonRight.onclick = function() { player1.changeDirection("right");}
  let buttonLeft = document.getElementById("buttonLeft");
  buttonLeft.onclick = function() { player1.changeDirection("left");}
}


// Permet de récupérer l'évènement lorsque l'utilisateur clique sur le bouton 'Retour' alors qu'il attendait un adversaire : (permet de quitter la file d'attente)
let backMenu = document.getElementById("backMenu");
backMenu.onclick = function(){
  socket.emit("quitterFile", numeroRoom);
}

// Permet de récupérer l'évènement lorsque l'utilisateur clique sur le bouton 'Classement' : envoi d'un message au serveur pour demander le classement de tous les joueurs
let buttonHighScore = document.getElementById("buttonHighScore");
buttonHighScore.onclick = function(){
  document.getElementById("highScore").style.display="block"
  document.getElementById("playGame").style.display="none"
  socket.emit("highScore");
}
