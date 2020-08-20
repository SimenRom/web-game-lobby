let inLobby = false;
$(document).ready( ()=> {
    let socket = io();
    document.getElementById('CreateBtn').addEventListener("click", ()=>{
        $.post("/createLobby", {
            username: document.getElementById("username").value,
            //lobbycode: document.getElementById("lobbycode").value
        }, (data, status) => {
            if(data.lobbycode != null){
                fromOutsideToInsideLobby(data.lobbycode);
                /*document.getElementById("insideLobby").style.display = "block";
                updateLobbyInfo(data.lobbycode);
                document.getElementById("outsideLobby").style.display = "none";*/
            } else if(data.errorcode == 100){
                alert("Page is outdated. Reloading the page..");    
                location.reload();
            } else {
                console.log(data.message);
            }
        }
        );
    });
    function updateLobbyInfo(lobbycode){
        $.get("/lobbyinfo?lobbycode=" + lobbycode, (data, status)=>{
            if(data.accepted){ 
                document.getElementById("lobbyName").innerHTML = "You are in lobby #" + lobbycode;
                document.getElementById("playerlist").innerHTML = "Players: " + data.players.map(item=>{
                    return " " + item.username;
                }); 
                document.getElementById("lobbyHost").innerHTML = "Host: " + data.owner.username;
                let chatString = "";
                data.chat.forEach(e => {
                    chatString += e.time + ": " + e.username + ": " + e.message + "<br/>";
                });
                document.getElementById("chatText").innerHTML = "" + chatString;
            } else {
                console.log(data.message);
            }
        });
    }
    document.getElementById('JoinBtn').addEventListener("click", ()=>{
        let lobbycode = document.getElementById("lobbycode").value;
        $.post("/joinLobby", {
            username: document.getElementById("username").value,
            lobbycode: lobbycode
        }, (data, status) => {
            //alert(data.message);
            if(data.accepted){
                fromOutsideToInsideLobby(lobbycode);
                /*document.getElementById("insideLobby").style.display = "block";
                updateLobbyInfo(document.getElementById("lobbycode").value);
                document.getElementById("outsideLobby").style.display = "none";*/
            } else if(data.errorcode == 101){
                alert("Page is outdated. Reloading the page..");    
                location.reload();
            } else {
                console.log(data.message);
            }
            
            //alert(data, status);
        }
        );
    });
    document.getElementById('startGameBtn').addEventListener("click", ()=>{
        $.get('/start',  (data, status)=>{
            //if()//uID matcher lobby owner her slapp eg av sist
            if(data.accepted == true){
                console.log(data.message);
            } else {
                console.log(data.message);
            }
        });
    })
    document.getElementById('leaveLobbyBtn').addEventListener("click", ()=>{
        let reallywant = confirm("Are you sure? If you are the last in lobby, the lobby together with the chat will be deleted.");
        if(reallywant){
            $.get('/leaveLobby', (data, status)=>{
                console.log(data.message);
                if(data.accepted){
                    fromInsideToOutsideLobby();
                }
            })
        }
    })
    document.getElementById('SendChatMessageBtn').addEventListener("click", ()=>{
        $.post('/sendChatMessage', {
            message: document.getElementById("chatInput").value,
        }, (data, status)=>{
            updateLobbyInfo(data.lobbycode);
        })
    })
    document.getElementById('refreshLobbyList').addEventListener("click", ()=>{
        updateLobbyList();
    });
    function fromOutsideToInsideLobby(lobbycode){
        inLobby = true;
        document.getElementById("insideLobby").style.display = "block";
        updateLobbyInfo(lobbycode);
        document.getElementById("outsideLobby").style.display = "none";
    }
    function fromInsideToOutsideLobby(){
        inLobby = false;
        document.getElementById("insideLobby").style.display = "none";
        document.getElementById("outsideLobby").style.display = "block";
        updateLobbyList();
    }
    function updateLobbyList() {
        $.get("/lobbies", (data, status) => {
            
            if(inLobby){
                if(data.currentLobby != null){
                    updateLobbyInfo(data.currentLobby);
                }
            } else {
                let lobbies = data.lobbies;
                let html = "<div><h2>" + lobbies.length + " lobbies</h2>";
                lobbies.forEach(lobby => {
                    html += "<dl><dt>#" + lobby.code + "</dt>";
                    html += "<dd>" + lobby.status + "</dd>";
                    //html += "<ul>";
                    lobby.users.forEach(usr => {
                        html += "<dd>" + usr.username + "</dd>";
                    })
                    //html += "</ul>";
                    html += /*"<button type='button' onClick='joinLobby(" + lobby.code + ")'>Join</button>*/"</dl><br/>";
                })
                html += "</div>";
                document.getElementById("lobbyOverview").innerHTML = "" + html;
                //console.log(data, status);
            }
        });
    }
    function showPresence(){
        $.get("/showPresence", (data, status) => {
            //console.log("Showing precense. " + data);

        })
    }
    $.get("/checkUserStatus", (data, status) => {
        if(data.lobbycode != null){
            console.log("You are in lobby #" + data.lobbycode);
            fromOutsideToInsideLobby(data.lobbycode);
        }
    })
    updateLobbyList();
    var UpdateLobbyListInterval = setInterval(updateLobbyList, 5000); 
    var UpdateOnlineInterval = setInterval(showPresence, 20000);
});

