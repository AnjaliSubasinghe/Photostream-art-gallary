const awilix = require('awilix')
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const http = require('http');
const socketIO = require('socket.io');
const database = require("./database.js");

const cors = require("cors");
const {asValue, createContainer} = awilix;
const app = express()
const server = http.Server(app);
const io = socketIO(server);
const container = createContainer();
const corsOptions = {
    origin: "http://localhost:4200",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
    sameSite: 'none',
    optionsSuccessStatus: 200
}

app.use(cookieParser());
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// Open the database connection when the application starts
database.connect().then(() => {

    container
        .register({
            db: asValue(database.getDb())
        });
    require("./repositories")(container)

// Close the database connection when the application is interrupted
    process.on('SIGINT', function () {
        database.close();
    });

    const rootRouter = require("./routes/rootRoutes")
    app.use("/api", rootRouter)

// Socket.io namespace
    const ns = io.of('/chat');

    ns.on('connection', (socket) => {
        socket.on('join', (data) => {
            socket.join(data.room);
            socket.broadcast.to(data.room).emit('user joined');
        });

        socket.on('message', (data) => {
            ns.in(data.room).emit('new message', {user: data.user, message: data.message});
        });

    });

    server.listen(process.env.PORT || 4000, () => {
        console.log("Server start");
    });
});

module.exports = {container}
