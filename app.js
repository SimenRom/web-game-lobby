const {GameServer, GameLobby, Dice, User} = require('./GameServer.js');
//let lobbycodes = [0, 1];
//let lobbies = [{code: 0, users: ["Alf", "Berit"]}, {code: 1, users: ["Chris", "Dina"]}];
//let chats = [{code: 0, content: "Chat 0 content"}, {code: 1, content: "Content of chat 1"}];

let gameServer = new GameServer();
if(false){
    gameServer.AddLobby(new GameLobby(1322));
    gameServer.AddLobby(new GameLobby(2335));
    gameServer.AddLobby(new GameLobby(6893));
    gameServer.AddLobby(new GameLobby(2384));
}
let onlineUsers = new Map();

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
    res.header('Content-Type', 'application/json');
    let reply = {
        lobbies: gameServer.lobbies,
        currentLobby: null
    }
    if(req.session.lobbycode != null){
        reply.currentLobby = req.session.lobbycode;
    }
    //console.log(gameServer.LobbiesToString());
    res.send(JSON.stringify(reply));
})
app.get('/', (req, res) => {
    res.header('Content-Type', 'text/html');
    //res.writeHead(213, "OK", {'Content-Type': 'text/plain'});
    //res.end();
    let thisID = 0;
    if(req.session.uID != null){
        let lobbycode = req.session.lobbycode;
        if(lobbycode != null){
            if(gameServer.ExistsLobbyWithCode(lobbycode)){
                gameServer.GetLobby(lobbycode);
            }
        }
    } else {
        req.session.uID = Math.floor(Math.random() * 10000000); //This ID is only meant to be unique, not protected. 
    }
    console.log(req.session.uID, "loaded the index.html.");
    res.send(indexContent);
});
app.get('/checkUserStatus', (req, res) => {
    res.header('Content-Type', 'application/json');
    let reply = {
        lobbycode: null
    }
    if(req.session.uID != null){
        let lobbycode = gameServer.FindLobbyWithUser(req.session.uID);
        reply.lobbycode = lobbycode;
    }
    res.send(JSON.stringify(reply));

})
app.post('/createLobby', (req, res) => {
    res.header('Content-Type', 'application/json'); //bytte til json seinare.
    let reply = {
        message: "",
        lobbycode: null,
        errorcode: null
    }
    if(req.session.uID == null){
        reply.message = "Could not find uID. Try reload the page.";
        reply.errorcode = 100;
        res.send(JSON.stringify(reply));
        return;
    }
    let username = req.body.username;
    if(username === ""){
        //missing name or code
        reply.message = "You need to input a username.";
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
        reply.message = "You created new lobby with id #" + newCode;
        reply.lobbycode = newCode;
        console.log(req.session.uID, "Created new lobby with id #" + newCode);

    }
    res.send(JSON.stringify(reply));

})
app.get('/lobbyinfo', (req, res) => {
    res.header('Content-Type', 'application/json');
    let reply = {
        accepted: false,
        message: "",
        chat: null,
        players: new Array(),
        owner: "",
    }
    let lobbycode = req.query.lobbycode;
    if(lobbycode == null){
        reply.message = "Request didn't contain 'lobbycode' in params.";
    } else if(lobbycode  > -1){
        let lobby = gameServer.GetLobby(lobbycode);
        if(lobby != null){
            reply.message = "Found lobby #" + lobby.code;
            reply.chat = lobby.chat.map(e => {
                let newObj = {
                    time: e.time,
                    username: "",
                    message: e.message,
                }
                if(lobby.ExistsUser(e.uID)){
                    newObj.username = lobby.GetUser(e.uID).username
                }
                return newObj;
            });
            reply.players = lobby.users;
            reply.accepted = true;
            reply.owner = lobby.GetUser(lobby.ownerID);
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
        errorcode: null
    }
    if(req.session.uID == null){
        reply.message = "Error. Could not find uID. Try reload the page.";
        reply.errorcode = 101;
        reply.accepted = false;
        res.send(JSON.stringify(reply));
        return;
    }
    let username = req.body.username;
    let lobbycode = parseInt(req.body.lobbycode);
    if(lobbycode === "" || username === ""){ //missing name or code
        reply.message = "You need to input a username and lobby code.";
        reply.accepted = false;
    } else if (gameServer.ExistsLobbyWithCode(lobbycode)){ //join existing lobby
        reply.message = ("Joining lobby #" + lobbycode);
        reply.accepted = true;
        gameServer.JoinPlayerToLobby(username, req.session.uID, lobbycode);
        req.session.lobbycode = lobbycode;
    } else {
        reply.accepted = false;
        reply.message = "Found no lobby with code " + lobbycode; 
    }
    res.send(JSON.stringify(reply));
})
app.get('/leaveLobby', (req, res) => {
    res.header('Content-Type', 'application/json');
    let reply = {
        accepted: false,
        message: ""
    }
    let userID = req.session.uID;
    let lobbycode = req.session.lobbycode;
    if(userID != null && lobbycode != null){
        let success = gameServer.GetLobby(lobbycode).RemoveUser(userID);
        if(success){
            console.log("Removed " + userID + " from lobby #" + lobbycode);
            reply.accepted = true;
            reply.message = "Removed " + userID + " from lobby #" + lobbycode;
            let lobbyObj = gameServer.GetLobby(lobbycode);
            if(lobbyObj.users.length <= 0){
                gameServer.RemoveLobby(lobbycode);
            } else if (!lobbyObj.ExistsUser(lobbyObj.ownerID)){
                console.log(lobbyObj.users[0]);
                lobbyObj.ownerID = lobbyObj.users[0].uID;
            }
        }
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
        reply.message = "Only lobby-owner can start the game";
    }
    res.send(JSON.stringify(reply));
})
app.get('/showPresence', (req, res) => {
    res.header('Content-Type', 'application/json');
    let reply = {
        message: "ty"
    }
    if(req.session.uID != null){
        let time = new Date().getTime();
        onlineUsers.set(req.session.uID, time);
        //console.log(req.session.uID + " showed presence at " + time);
    }
    res.send(JSON.stringify(reply));
})
app.post('/sendChatMessage', (req, res) => {
    res.header('Content-Type', 'application/json');
    let reply = {
        lobbycode: req.session.lobbycode,
    }
    let chatMessage = req.body.message;
    let uID = req.session.uID;
    let lobbycode = req.session.lobbycode;
    if(lobbycode != null && uID != null && chatMessage.length >= 1){
        let lobby = gameServer.GetLobby(lobbycode);
        if(lobby != null){
            let user = lobby.GetUser(uID);
            lobby.NewChatMessage(chatMessage, uID);
        }
    }
    res.send(JSON.stringify(reply));
})
app.get('/kickUser', (req, res) => {
    res.header('Content-Type', 'application/json');
    let reply = {
        message: "Not implemented yet.",
    }
    res.send(JSON.stringify(reply));
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

function removeOfflineUsers(){
    let now = new Date().getTime();
    let timeout = 1000 * 60 * 5;
    let border = now - timeout;
    //console.log("Throwing inactive users.");
    onlineUsers.forEach((val, key, map)=>{
        if(val < border){
            console.log(key + " is offline and will be removed.");
            map.delete(key);
            let lobby = gameServer.GetLobby(gameServer.FindLobbyWithUser(key));
            if(lobby != null){
                lobby.RemoveUser(key);
                if(lobby.users.length <= 0){
                    gameServer.RemoveLobby(lobby.code);
                }
            }
        }
    })
    
}


app.listen(3000, () => console.log("Server running on port 3000.")); //'127.0.0.1');

setInterval(removeOfflineUsers, 60000);