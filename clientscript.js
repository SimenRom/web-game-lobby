let inLobby = false;
$(document).ready( ()=> {
    document.getElementById('CreateBtn').addEventListener("click", ()=>{
        $.post("/createLobby", {
            username: document.getElementById("username").value,
            //lobbycode: document.getElementById("lobbycode").value
        }, (data, status) => {
            alert(data.message, status);
            if(data.lobbycode != null){
                document.getElementById("insideLobby").style.display = "block";
                updateLobbyInfo(data.lobbycode);
                document.getElementById("outsideLobby").style.display = "none";
            } else {
                alert("Rar feilmelding.");
            }
        }
        );
    });
    function updateLobbyInfo(lobbycode){
        $.get("/lobbyinfo?lobbycode=" + lobbycode, (data, status)=>{
            if(data.accepted){ 
                document.getElementById("lobbyName").innerHTML = "You are in lobby #" + lobbycode;
                document.getElementById("playerlist").innerHTML = "Players: " + data.players.map(item=>{
                    return item.username;
                });
                document.getElementById("chatText").innerHTML = "" + data.chat;
            } else {
                alert(data.message);
            }
        });
    }
    document.getElementById('JoinBtn').addEventListener("click", ()=>{
        $.post("/joinLobby", {
            username: document.getElementById("username").value,
            lobbycode: document.getElementById("lobbycode").value
        }, (data, status) => {
            //alert(data.message);
            if(data.accepted){
                document.getElementById("insideLobby").style.display = "block";
                updateLobbyInfo(document.getElementById("lobbycode").value);
                document.getElementById("outsideLobby").style.display = "none";
            } else {
                alert(data.message);
            }
            
            //alert(data, status);
        }
        );
    });
    document.getElementById('startGameBtn').addEventListener("click", ()=>{
        $.get('/start',  (data, status)=>{
            //if()//uID matcher lobby owner her slapp eg av sist
            if(data.accepted == true){
                alert(data.message);
            } else {
                alert(data.message);
            }
        });
    })
    document.getElementById('refreshLobbyList').addEventListener("click", ()=>{
        updateLobbyList();
    });
    function updateLobbyList() {
        $.get("/lobbies", (data, status) => {
            document.getElementById("lobbyOverview").innerHTML = "" + data;
            //alert(data, status);
        });
    }
    updateLobbyList();
    setInterval(updateLobbyList, 5000);
});

