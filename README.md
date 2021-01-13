# Tron

## Table of Contents
- [Introduction](#introduction)
- [Project Setup](#project-setup)
  * [Prerequisites](#prerequisites)
  * [How To Download](#how-to-download)
  * [Launch the MongoDB Database](#Launch-the-MongoDB-Database)
  * [Start the server](#Start-the-server)
  * [Configure the project](#Configure-the-project)
  * [Launch the project](#Launch-the-project)

  
## Introduction


## Project Setup

### Prerequisites

In order to be able to launch the project, you must first have installed on your machine:
- Node and NPM
- Anaconda or Miniconda
- NodeJS
- MongoDB
- Cordova


### How To Download

Download the source code :
- with git :
```text
git clone https://github.com/heloise-d/Tron
```
- or by uploading the code directly to github.

Open a terminal window and go to the project root folder.

You need to have npm installed globally.

Run `npm install` to install the required libraries.


### Launch the MongoDB Database
1) If you don't have a Python development environment on your machine:
Open a terminal and type the following commands successively to create an environment
named MongoDB on your machine:
```text
conda create --name MongoDB
conda activate MongoDB
conda install MongoDB
mkdir MongoDB
mongod --dbpath MongoDB
```
Keep this terminal open.

2) If you already have a Python development environment on your machine:
Just type the following commands:
```text
conda activate [environmentName]
mongod --dbpath [environmentName]
```
Keep this terminal open.

### Start the server
Place the “server” folder on your machine. Launch a terminal and be inside the
“server” folder, then type the following commands into the terminal:
Run `npm install` to install the required libraries, then `node server.js` to start the server.
Keep this terminal open.

### Configure the project
Place the “client” folder in your Cordova working directory. Go inside the "client" floder and type the following commands successively :
```text
cordova platform add android
cordova platform add browser
```

### Launch the project
Open a terminal and go inside the Cordova Project.
- To launch the project on an emulator, type: `cordova run android`
- To run the project on a navigator, type: `cordova run browser`

Navigate to `http://localhost:8000/`
