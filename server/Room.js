'use strict';

module.exports = class Room{
  // Définit une Room qui peut accueillir 2 joueurs
  constructor(){
    this.socketId=[] // Contient les socket.id des 2 joueurs
    this.name="" // Nom de la Room
    this.pseudo=[] // Les pseudos des 2 joueurs ayant rejoint la room
  }
}
 