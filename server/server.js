const express = require("express");
const cors = require("cors");
const corsOptions = require("./config/corsOption");
const { PORT } = require("./config/server");
const credentials = require("./middleware/credentials");
const gameRoutes = require("./routes/gameRoutes");
const playerRoutes = require("./routes/playerRoutes");
const viewRoutes = require("./routes/viewRoutes");
const http = require("http");
const { Server } = require("socket.io");

const app = express();

app.use(credentials);
app.use(cors(corsOptions));
app.use(express.json());

app.use("/game", gameRoutes);
app.use("/player", playerRoutes);
app.use("/view", viewRoutes);

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

const clueStatus = {
  team1: false,
  team2: false,
};

const scoreStatus = { score: 0 };

const responseStatus = {
  team1: false,
  team2: false,
};

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("start-game", (data) => {
    socket.broadcast.emit("received-start-game", data);
  });

  socket.on("next-round", (data) => {
    socket.broadcast.emit("received-next-round", data);
  });

  socket.on("clue-submitted", (data) => {
    clueStatus[`team${data.team}`] = true;
    checkClueAndEmit();
  });

  socket.on("decode-submitted", (data) => {
    console.log(data.score);

    if (data.score > scoreStatus.score) {
      scoreStatus.score = data.score;
    }

    responseStatus[`team${data.team}`] = true;

    if (scoreStatus.score > 1 && responseStatus.team1 && responseStatus.team2) {
      endGame();
    } else {
      checkDecodeAndEmit();
    }
  });

  socket.on("intercept-submitted", (data) => {
    console.log(data.score);

    if (data.score > scoreStatus.score) {
      scoreStatus.score = data.score;
    }

    responseStatus[`team${data.team}`] = true;

    if (scoreStatus.score > 1 && responseStatus.team1 && responseStatus.team2) {
      endGame();
    } else {
      checkInterceptAndEmit();
    }
  });

  socket.on("complete-game", (data) => {
    socket.broadcast.emit("received-complete-game", data);
  });

  const checkClueAndEmit = () => {
    if (clueStatus.team1 && clueStatus.team2) {
      io.emit("received-clues", clueStatus);
      clueStatus.team1 = false;
      clueStatus.team2 = false;
    }
  };

  const checkInterceptAndEmit = () => {
    console.log(`checking intercept`);
    if (scoreStatus.score < 2 && responseStatus.team1 && responseStatus.team2) {
      io.emit("received-intercept");
      responseStatus.team1 = false;
      responseStatus.team2 = false;
      scoreStatus.score = 0;
    }
  };

  const checkDecodeAndEmit = () => {
    console.log(`checking decode`);
    if (scoreStatus.score < 2 && responseStatus.team1 && responseStatus.team2) {
      io.emit("received-decode");
      responseStatus.team1 = false;
      responseStatus.team2 = false;
      scoreStatus.score = 0;
    }
  };

  const endGame = () => {
    console.log(`ending game`);
    io.emit("received-end-game");
    responseStatus.team1 = false;
    responseStatus.team2 = false;
    scoreStatus.score = 0;
  };
});

server.listen(PORT, () => console.log(`Listening on port ${PORT}...`));
