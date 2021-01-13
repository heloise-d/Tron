class Playground {
    
    /* Constructeur : Initialise le plateau de jeu
     * width = largeur du plateau
     * height = hauteau du plateau
     * Initialise chaque case du plateau de jeu à undefined
    */
    constructor(width, height){
        this.tabPlayground = [];
        this.width = width;
        this.height = height;

        // Parcours du plateau de jeu et initialise chaque case du tableau à undefined
        for(var i=0; i<width; i++) {
            this.tabPlayground[i] = [];
            for(var j=0; j<height; j++) {
                this.tabPlayground[i][j] = undefined;
            }
        }
    }

    /* Placer le joueur player dans le plateau de jeu :
     * player = le joueur à placer sur le tableau (instance de la classe Player)
    */
    placePlayerInTab(player){
        this.tabPlayground[player.getX()][player.getY()] = {player:player.name, color:player.color}; // Placer le joueur dans le tableau aux coordonnées x et y du joueur
    }

    /* Dessiner le plateau de jeu dans le Canvas
    */
    drawTab(){
        // Parcours du plateau de jeu :
        for (let i in this.tabPlayground){
            for (let j in this.tabPlayground[i]){
                if (this.tabPlayground[i][j] != undefined){ // Si la case du plateau n'est pas à undefined (donc qu'il y a un joueur dans cette case)
                    this.drawSquare(i*PIX, j*PIX, this.tabPlayground[i][j].color); // Dessiner le carré du joueur au coordonnées i*PIX et j*PIX et la couleur de la case sera celle placée dans le plateau de jeu aux coordonnées i*j
                }
            }
        }
    }

    /* Dessiner un carré dans le Canvas :
     * i = le numéro de ligne
     * j = le numéro de colonne
     * color = la couleur du joueur
    */
    drawSquare(i, j, color){
        noStroke(); // Enlever les contours du carré
        fill(color); // Remplir le carré avec la couleur color
        rect(i, j, PIX, PIX); // Dessiner le carré
    }

    /* Vérifier qu'un joueur ne dépasse pas les limites du tableau de jeu
     * player = le joueur pour lequel la vérification est réalisée
     * opponent = l'adversaire
     * Retourne le joueur adverse (donc le gagnant) si le joueur courant dépasse les limites. Sinon ne retourne aucun gagant
    */ 
    collisionWithEdges(player, opponent){
        switch (player.direction){ // Récupère la direction du joueur
            case "up": // Si le joueur va en haut
                if (player.getY() <= 0) return opponent; // Si la coordonnée y du joueur est inférieure ou égale à 0 : le joueur a dépassé les limites du plateau, donc l'adversaire a gagné
            case "down": // Si le joueur va en bas
                if (player.getY() >= this.height) return opponent;
            case "left": // Si le joueur va à gauche
                if (player.getX() <= 0) return opponent;
            case "right": // Si le joueur vas à droite
                if (player.getX()+1 >= this.width) return opponent;
        }
        return ""; // Si aucun des cas n'est vérifié : retourner aucun gagnant
    }


    /* Vérifier si un joueur entre dans le mur d'un autre joueur :
     * player = le joueur pour lequel la vérification est réalisée
     * opponent = l'adversaire du joueur
    */
    collisionWithOpponent(player, opponent){
        if (this.tabPlayground[player.getX()][player.getY()] != undefined){ // Si à la future position du joueur, la case n'est pas vide :
            return opponent; // Retourner le gagnant : l'adversaire
        }
        return ""; // Sinon : retourner aucun gagnant.
    }
    
}