class GameServerHandler {
    constructor(app, io){
        this.app = app;
        

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
            socket.on('disconnect', ()=>{
                console.log('a user disconnected');

            })
        });
        
    }

}
exports.GameServerHandler = GameServerHandler;