const {GameServer, GameLobby, Dice, User} = require('./GameServer.js');
//let lobbycodes = [0, 1];
//let lobbies = [{code: 0, users: ["Alf", "Berit"]}, {code: 1, users: ["Chris", "Dina"]}];
//let chats = [{code: 0, content: "Chat 0 content"}, {code: 1, content: "Content of chat 1"}];

let gameServer = new GameServer();
gameServer.AddLobby(new GameLobby(0));

const express = require('express');
const session = require('express-session')
let app = express();
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: false,
}))

let fs = require('fs');
let indexContentJS = '';
let indexContentJSALT = '';
let indexContent = '<!DOCTYPE html><html><body><p>Wow, such empty! (Simen har gjort noke feil)</p></body></html>';
fs.readFile('./index.html', (err, html) => {
    if(err){
        throw err;
    } else {
        indexContent = html;
    }
});
app.get('/lobbies', (req, res) => {
    res.header('Content-Type', 'text/plain');
    //console.log(gameServer.LobbiesToString());
    res.send(gameServer.LobbiesToString());
})
app.get('/', (req, res) => {
    res.header('Content-Type', 'text/html');
    //res.writeHead(213, "OK", {'Content-Type': 'text/plain'});
    //res.end();
    let thisID = 0;
    if(req.session.uID != null){

    } else {
        req.session.uID = Math.floor(Math.random() * 10000000);
    }
    console.log(req.session.uID, "loaded the index.html.");
    res.send(indexContent);
});

app.post('/createLobby', (req, res) => {
    res.header('Content-Type', 'text/plain'); //bytte til json seinare.
    if(req.session.uID == null){
        res.send("Could not find uID. Try reload the page.");
        return;
    }
    let username = req.body.username;
    if(username === ""){
        //missing name or code
        res.send("You must input a username.");
    } else {
        //create new lobby with unique code
        let isDuplicate = true;
        let failsafe = 0; //in case all lobby codes is taken, this should not go in endless loop.
        let newCode = 0;
        while(isDuplicate){
            failsafe++;
            newCode = Math.floor(Math.random() * 9999); 
            isDuplicate = false;
            gameServer.lobbies.forEach(lobby => {
                if(lobby.code === newCode){
                    isDuplicate = true;
                } 
            })
        }
        let newLobby = new GameLobby(newCode, req.session.uID);
        newLobby.AddUser(new User(username, req.session.uID));
        gameServer.AddLobby(newLobby);
        req.session.lobbycode = newCode;
        res.send("You created new lobby with id #" + newCode);
        console.log(req.session.uID, "Created new lobby with id #" + newCode);

    }
})
app.get('/lobbyinfo', (req, res) => {
    
    res.header('Content-Type', 'application/json');
    let reply = {
        accepted: false,
        message: "",
        chat: "",
        players: new Array(),
    }
    let lobbycode = req.query.lobbycode;
    if(lobbycode == null){
        reply.message = "Request didn't contain 'lobbycode' in params.";
    } else if(lobbycode  > -1){
        let lobby = gameServer.GetLobby(lobbycode);
        if(lobby != null){
            reply.message = "Found lobby #" + lobby.code;
            reply.chat = lobby.chat;
            reply.players = lobby.users;
            reply.accepted = true;
        } else {
            reply.message = "No lobby with code " + lobbycode;
        }
    }
    res.send(JSON.stringify(reply));
})
app.post('/joinLobby', (req, res) => {
    res.header('Content-Type', 'application/json');
    let reply = {
        message: "",
        accepted: false,
    }
    if(req.session.uID == null){
        reply.message = "Error. Could not find uID. Try reload the page.";
        reply.accepted = false;
        res.send(JSON.stringify(reply));
        return;
    }
    let username = req.body.username;
    let lobbycode = parseInt(req.body.lobbycode);
    if(lobbycode === "" || username === ""){
        //missing name or code
        reply.message = "You must input a username and lobby code.";
        reply.accepted = false;
    } else if (gameServer.ExistsLobbyWithCode(lobbycode)){
        //join existing lobby

        reply.message = ("Joining lobby #" + lobbycode);
        reply.accepted = true;
        gameServer.JoinPlayerToLobby(username, req.session.uID, lobbycode);
        req.session.lobbycode = lobbycode;
    } else {
        reply.accepted = false;
        reply.message = "Found no lobby with code " + lobbycode; //her slapp eg av.

    }
    res.send(JSON.stringify(reply));
})
app.get('/start', (req, res) => {
    res.header('Content-Type', 'application/json');
    let reply = {
        accepted: false,
        message: "",
    }
    let lobbycode = req.session.lobbycode;
    let uID = req.session.uID;
    if(gameServer.GetLobby(lobbycode).ownerID == uID){
        reply.accepted = true;
        reply.message = "Starting game...";
    } else {
        reply.accepted = false;
        reply.message = "Only lobby-owner can start the game.";
    }
})

fs.readFile('./clientscript.js', (err, html) => {
    if(err){
        throw err;
    } else {
        indexContentJS = html;
    }
});
//this is for working with JQuery without internet
fs.readFile('./jquery.min.js', (err, html) => {
    if(err){
        throw err;
    } else {
        indexContentJSALT = html;
    }
});
app.get('/clientscript.js', (req, res) => {
    res.send(indexContentJS);
})
app.get('/jquery.min.js', (req, res) => {
    res.send(indexContentJSALT);
})


app.listen(3000, () => console.log("Server running on port 3000.")); //'127.0.0.1');

