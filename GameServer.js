class GameServer {
  constructor() {
    this.lobbies = new Array();
  }
  AddLobby(gameLobby) {
    this.lobbies.push(gameLobby);
  }
  RemoveLobby(code) {
    for (let i = 0; i < this.lobbies.length; i++) {
      if (this.lobbies[i].code == code) {
        this.lobbies.splice(i, 1);
        console.log("Removed lobby #" + code);
        return;
      }
    }
  }
  LobbiesToString() {
    let lobbystring = "";
    //console.log(this.lobbies.length);
    if (this.lobbies.length == 0) {
      lobbystring = "No lobbies found. You can create a new above.";
      return lobbystring;
    }
    lobbystring = "<h4>" + this.lobbies.length + " lobbies found.</h4><br/>";
    for (let i = 0; i < this.lobbies.length; i++) {
      lobbystring += "#" + this.lobbies[i].code + "<br/>";
      lobbystring += "" + this.lobbies[i].status + "<br/>";
      for (let j = 0; j < this.lobbies[i].users.length; j++) {
        lobbystring += "--> " + this.lobbies[i].users[j].username + "<br/>";
      }
      if(this.lobbies[i].users.length == 0){
        lobbystring += "--> No players joined yet<br/>";

      }
      lobbystring += "<br/>";
    }
    return lobbystring;
  }
  ExistsLobbyWithCode(code) {
    for (let i = 0; i < this.lobbies.length; i++) {
      if (this.lobbies[i].code == code) {
        return true;
      }
    }
    return false;
  }
  GetLobby(lobbycode) {
    for (let i = 0; i < this.lobbies.length; i++) {
      if (this.lobbies[i].code === parseInt(lobbycode)) {
        return this.lobbies[i];
      }
    }
    return null;
  }
  JoinPlayerToLobby(username, uID, lobbycode) {
    this.GetLobby(lobbycode).AddUser(new User(username, uID));
  }
  FindLobbyWithUser(uID){
    
    for(let i = 0; i < this.lobbies.length; i++){
      if(this.lobbies[i].ExistsUser(uID)){
        console.log(uID + " is already in lobby #" + this.lobbies[i].code);
        return this.lobbies[i].code;
      }
    }
    return null;
  }
}
let date = new Date();

class GameLobby {
  constructor(code, ownerID) {
    this.ownerID = ownerID;
    this.game = null; 
    this.status = "Waiting to start";
    this.code = code;
    this.users = new Array();
    this.gameMode = GameModes.NOTSELECTED;
    this.chat = new Array(); 
    this.chat.push({"time": date.getUTCHours() + ":" + date.getUTCMinutes(), "message" :  "Lobby created \n", "uID": 2020});
  }

  NewChatMessage(message, uID){
    date = new Date();
    this.chat.push({"message" : message, "uID": uID, "time": date.getUTCHours() + ":" + date.getUTCMinutes()});
  }

  AddUser(user) {
    this.users.push(user);
    return;
  }
  RemoveUser(uID) {
    for (let i = 0; i < this.users.length; i++) {
      if (this.users[i].uID == uID) {
        this.users.splice(i, 1);
        return true;
      }
    }
    return false;
  }
  SelectGamemode(gameMode) {
    this.gameMode = gameMode;
  }
  GetUser(uID){
    for(let i = 0; i < this.users.length; i++){
      if(this.users[i].uID == uID){
        return this.users[i];
      }
    }
    return null;
  }
  ExistsUser(uID){
    for(let i = 0; i < this.users.length; i++){
      if(this.users[i].uID == uID){
        return true;
      }
    }
    return false;
  }
  StartGame() {
    switch (this.gameMode) {
      case GameModes.NOTSELECTED:
        //Not selected error.
        break;
      case GameModes.DICEGAME:
        game = new DiceGame(users);
        this.game.StartGame();
        this.status = "Starting dice game";
        break;
      case GameModes.RANDOM:
        game = new DiceGame(users);
        this.game.StartGame();
        break;
      default:
        break;
    }
  }
}
const GameModes = {
  NOTSELECTED: "none",
  DICEGAME: "dicegame",
  RANDOM: "random",
};

class Game {
  constructor(users) {
    this.users = users;
  }
  GetUser(uID){
    users.forEach(u=>{
      if(u.uID == uID){
        return u;
      }
    })
  }
}

class DiceGame extends Game {
  constructor(users) {
    super(users);
    this.dices = [new Dice(), new Dice(), new Dice(), new Dice(), new Dice()];
    score = new Map();
    turnOwner = null;
    turnIndex = 0;
    roundsPlayed = 0;
    roundsToPlay = 4;
  }
  StartGame() {
    if(users.length < 2){
      console.log("Too few to start game...");
      return null;
    }
    console.log("Game is starting...");
    turnOwner = users[turnIndex];
    this.RollDices();

    users.forEach(u => {
      score.delete(u.uID);
      score.set(u.uID, 0);
    })
  }
  EndGame(){
    console.log("Game is done.");
    score.forEach((v, i, a) => {
      console.log(this.GetUser(i) + " got score: " + v);
    })
  }
  DoTurn(user){
    
    if(user.uID == turnOwner.uID){

      if(roundsPlayed >= 4){
        EndGame();
        return false;
      } else if (turnIndex == this.users.length){
        roundsPlayed++;
      }

      
      this.RollDices()
      let sumRound = this.GetDiceSum();
      console.log(user.username + " got score: " + sumRound);
      score.set(turnOwner.uID, score.get(turnOwner.uID) + sumRound);

      turnIndex = (turnIndex+1) % users.length;
      turnOwner = users[turnIndex]

      return true;
    } else {
      console.log(user.username + " tried to do turn, but turnowner is " + turnOwner.username)
      return false;
    }
  }

  RollDices() {
    this.dices.forEach((dice) => {
      dice.Roll();
    });
  }
  GetDiceValues() {
    let values = [];
    this.dices.forEach((dice) => {
      values.push(dice.GetValue());
    });
    return values;
  }
  GetDiceSum(){
    let sum = 0;
      this.GetDiceValues().forEach(v=>{
        sum += v;
      });
      return sum;
  }
}

class Dice {
  constructor() {
    this.value = 0;
  }
  Roll() {
    this.value = Math.floor(Math.random() * 6 + 1);
  }
  GetValue() {
    return this.value;
  }
}

class User {
  constructor(username, uID) {
    this.username = username;
    this.uID = uID;
  }
}

exports.GameServer = GameServer;
exports.GameLobby = GameLobby;
exports.User = User;
exports.Dice = Dice;
