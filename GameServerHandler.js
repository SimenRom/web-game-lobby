class GameServerHandler {
    
    constructor(app, io){
        this.app = app;
        this.socketList = new Array();

        app.get('/testet', (req, res)=>{
            res.header('Content-Type', 'application/json');
            let reply = {
                lobbies: "hey",
                currentLobby: 2
            }
            res.send(JSON.stringify(reply));
        })
        io.on('connection', (socket) => {
            console.log('a user connected');
            this.socketList.push(socket)
            socket.on('disconnect', ()=>{
                console.log('a user disconnected');
                //socket.remove() fjerne socket fra lista kanskje?
            })
        });
        
    }
    startNewGame() {
        
    }
}
exports.GameServerHandler = GameServerHandler;