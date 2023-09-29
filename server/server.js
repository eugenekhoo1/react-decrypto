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
  socket.on("join-room", (data) => {
    // Joins room and leaves all other rooms
    socket.join(data.gid);
    socket.rooms.forEach((room) => {
      if (/^\d+$/.test(room) && room !== data.gid) {
        socket.leave(room);
      }
    });
    console.log(`${socket.id} has joined room ${data.gid}`);
  });

  socket.on("add-player", (data) => {
    console.log(`add-player: ${data.player}`);
    socket.to(data.gid).emit("received-add-player", data);
  });

  socket.on("start-game", (data) => {
    console.log(`received-start-game:`, data.gid);
    socket.to(data.gid).emit("received-start-game", data);
  });

  socket.on("next-round", (data) => {
    console.log(`received-next-round:`, data.gid);
    socket.to(data.gid).emit("received-next-round", data);
  });

  socket.on("clue-submitted", (data) => {
    console.log(`received-clue:`);
    clueStatus[`team${data.team}`] = true;
    checkClueAndEmit(data.gid);
  });

  socket.on("decode-submitted", (data) => {
    console.log(`score: ${data.score}, team: ${data.team}`);

    if (data.score > scoreStatus.score) {
      scoreStatus.score = data.score;
    }

    responseStatus[`team${data.team}`] = true;

    if (scoreStatus.score > 1 && responseStatus.team1 && responseStatus.team2) {
      endGame(data.gid);
    } else {
      checkDecodeAndEmit(data.gid);
    }
  });

  socket.on("intercept-submitted", (data) => {
    console.log(`score: ${data.score}, team: ${data.team}`);

    if (data.score > scoreStatus.score) {
      scoreStatus.score = data.score;
    }

    responseStatus[`team${data.team}`] = true;

    if (scoreStatus.score > 1 && responseStatus.team1 && responseStatus.team2) {
      endGame(data.gid);
    } else {
      checkInterceptAndEmit(data.gid);
    }
  });

  socket.on("complete-game", (data) => {
    console.log(`received-complete-game:`, data.gid);
    socket.to(data.gid).emit("received-complete-game", data);
  });

  const checkClueAndEmit = (gid) => {
    console.log(`checking clue`);
    if (clueStatus.team1 && clueStatus.team2) {
      console.log(`received-clues`);
      io.to(gid).emit("received-clues", clueStatus);
      clueStatus.team1 = false;
      clueStatus.team2 = false;
    }
  };

  const checkInterceptAndEmit = (gid) => {
    console.log(`checking intercept`);
    if (scoreStatus.score < 2 && responseStatus.team1 && responseStatus.team2) {
      console.log(`received-intercept`);
      io.to(gid).emit("received-intercept");
      responseStatus.team1 = false;
      responseStatus.team2 = false;
      scoreStatus.score = 0;
    }
  };

  const checkDecodeAndEmit = (gid) => {
    console.log(`checking decode`);
    if (scoreStatus.score < 2 && responseStatus.team1 && responseStatus.team2) {
      io.to(gid).emit("received-decode");
      responseStatus.team1 = false;
      responseStatus.team2 = false;
      scoreStatus.score = 0;
    }
  };

  const endGame = (gid) => {
    console.log(`ending game`);
    io.to(gid).emit("received-end-game");
    responseStatus.team1 = false;
    responseStatus.team2 = false;
    scoreStatus.score = 0;
  };
});

server.listen(PORT, () => console.log(`Listening on port ${PORT}...`));
