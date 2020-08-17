let inLobby = false;
$(document).ready( ()=> {
    document.getElementById('CreateBtn').addEventListener("click", ()=>{
        $.post("/createLobby", {
            username: document.getElementById("username").value,
            //lobbycode: document.getElementById("lobbycode").value
        }, (data, status) => {
            console.log(data.message, status);
            if(data.lobbycode != null){
                fromOutsideToInsideLobby(data.lobbycode);
                /*document.getElementById("insideLobby").style.display = "block";
                updateLobbyInfo(data.lobbycode);
                document.getElementById("outsideLobby").style.display = "none";*/
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
                    return item.username;
                });
                document.getElementById("chatText").innerHTML = "" + data.chat;
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
        $.get('/leaveLobby', (data, status)=>{
            console.log(data.message);
            if(data.accepted){
                fromInsideToOutsideLobby();
            }
        })
    })
    document.getElementById('refreshLobbyList').addEventListener("click", ()=>{
        updateLobbyList();
    });
    function updateLobbyList() {
        $.get("/lobbies", (data, status) => {
            document.getElementById("lobbyOverview").innerHTML = "" + data;
            //console.log(data, status);
        });
    }
    function fromOutsideToInsideLobby(lobbycode){
        document.getElementById("insideLobby").style.display = "block";
        updateLobbyInfo(lobbycode);
        document.getElementById("outsideLobby").style.display = "none";
    }
    function fromInsideToOutsideLobby(){
        document.getElementById("insideLobby").style.display = "none";
        document.getElementById("outsideLobby").style.display = "block";
    }
    updateLobbyList();
    $.get("/refresh", (data, status) => {
        if(data.lobbycode != null){
            console.log("You are in lobby " + data.lobbycode);
            fromOutsideToInsideLobby(data.lobbycode);
        }
    })
    setInterval(updateLobbyList, 5000);
});

