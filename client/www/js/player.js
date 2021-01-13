class Player {
    /* Constructeur : Initialise un nouveau joueur sur le plateau de jeu
     * name = le pseudo du joueur, 
     * x et y = la position initiale du joueur sur le plateau
     * direction = la direction du joueur (valeurs possibles = "up", "down", "right", "left")
     * color = la couleur du joueur
    */
    constructor(name, x, y, direction, color){
        this.name = name;
        this.position = {x:x, y:y}
        this.direction = direction;
        this.color = color;
    }

    // Retourne la position x du joueur
    getX(){
        return this.position.x;
    }

    // Retourne la position y du joueur
    getY(){
        return this.position.y;
    }

    // Retourne la direction du joueur
    getDirection(){
        return this.direction;
    }

    /* Affecte une nouvelle direction au joueur
     * direction = la nouvelle direction du joueur
    */
    setDirection(direction){
        this.direction = direction;
    }

    /* Change la direction du joueur si les contraintes les lui permet.
     * direction = la nouvelle direction du joueur
    */
    changeDirection(direction){
        // Un joueur ne peut aller qu'à droite/gauche que s'il allait initialement en haut/en bas ;
        // Un joueur ne peut aller qu'en haut/bas que s'il allait intialement à droite/à gauche ;

        switch (this.getDirection()){ // Récupérer la direction initiale du joueur
            // Si le joueur va initialement à droite ou à gauche :
            case "left":
            case "right":
                // Si la nouvelle direction est en haut ou en bas : le joueur prend cette nouvelle direction
                if ((direction == "up") || (direction == "down")) this.setDirection(direction);break;
            
            // Si le joueur va initialement en haut/en bas :
            case "down":
            case "up":
                // Si la nouvelle direction est à droite/à gauche : le joueur prend cette nouvelle direction
                if ((direction == "right") || (direction == "left")) this.setDirection(direction);break;
        }
        return;
    }

    // Fait jouer le joueur : modification de ses positions x et y en fonction de sa direction
    play(){
        switch (this.getDirection()){ // Si le joueur va :
            case "left": // à gauche
                this.position = ({x:this.getX()-1, y:this.getY()});break; 
            case "right": // à droite
                this.position = ({x:this.getX()+1, y:this.getY()});break;
            case "up": // en haut
                this.position = ({x:this.getX(), y:this.getY()-1});break;
            case "down": // en bas
                this.position = ({x:this.getX(), y:this.getY()+1});break;
        }
    }

    /* Modifie la position et la direction du joueur 
     * player = objet contenant une position et une direction que le joueur courant devra calquer
    */
    update(player){
        this.position = player.position;
        this.direction = player.direction;
        this.color = player.color;
    }


    /* Fonction de collision entre des joueurs de face :
     * player2 = le deuxième joueur du plateau
     * Retourne le gagnant s'il y en a un
    */
    collisionFacingOpponent(player2){
        let intPosP1 = this.getIntDirection(); // Récupérer la direction du joueur courant en un entier
        let intPosP2 = player2.getIntDirection(); // Récupérer la direction du joueur adverse en un entier

        if (intPosP1 == -intPosP2){ // Si les directions des deux joueurs sont opposées :

            if (this.getX() == player2.getX() && this.getY() == player2.getY()) return "tie"; // Si les deux joueurs sont entrés en collision de face : retourne un match nul
        }
        return ""; // Si les joueurs ne se font pas face et qu'ils n'ont pas les mêmes positions : retourner aucun gagnant

    }

    /* Retourne la direction du joueur en un nombre entier
    */
    getIntDirection(){
        switch(this.getDirection()){ // Récupère la direction du joueur
            case "up" : return 1;
            case "down" : return -1;
            case "right" : return 2;
            case "left" : return -2;
        }
    }

}