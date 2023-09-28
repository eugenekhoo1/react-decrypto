const { query } = require("../config/db");
const WORDS = require("../assets/words");
const checkResponse = require("../utils/checkResponse");
const checkWinner = require("../utils/checkWinner");

async function newGame(req, res) {
  // Generate words for both teams
  const team1Words = [];
  const team2Words = [];
  const wordArray = WORDS;
  for (i = 0; i < 4; i++) {
    const randomIndex1 = Math.floor(Math.random() * WORDS.length);
    team1Words.push(wordArray.splice(randomIndex1, 1)[0]);

    const randomIndex2 = Math.floor(Math.random() * WORDS.length);
    team2Words.push(wordArray.splice(randomIndex2, 1)[0]);
  }
  try {
    const SQL_QUERY = `
        INSERT INTO games (team1_words, team2_words)
        VALUES ($1, $2)
        RETURNING game_id
    `;
    const response = await query(SQL_QUERY, [team1Words, team2Words]);
    return res.status(201).send(response.rows);
  } catch (err) {
    console.error(err);
  }
}

async function getGame(req, res) {
  const gid = parseInt(req.params.gid);
  try {
    const response = await query(`SELECT * FROM games WHERE game_id=$1`, [gid]);
    return res.status(200).send(response.rows);
  } catch (err) {
    console.error(err);
  }
}

async function getWords(req, res) {
  const gid = req.query.gid;
  const team = req.query.team;
  try {
    const response = await query(
      `SELECT team${team}_words FROM games WHERE game_id=$1`,
      [gid]
    );
    return res.status(200).send(response.rows[0]);
  } catch (err) {
    console.error(err);
  }
}

async function startGame(req, res) {
  // Set status to Started
  const gid = req.body.gid;

  // Check minimum players
  const playersResponse = await query(
    `SELECT team1_players, team2_players FROM games WHERE game_id=$1`,
    [gid]
  );
  const team1Players = playersResponse.rows[0].team1_players;
  const team2Players = playersResponse.rows[0].team2_players;

  if (team1Players.length < 2 || team2Players.length < 2) {
    return res.status(400).json({ message: "Not enough players!" });
  }

  // Check game status
  const gameResponse = await query(`SELECT * FROM games WHERE game_id=$1`, [
    gid,
  ]);
  const status = gameResponse.rows[0].status;
  if (status === "In Progress") {
    return res.status(400).json({ message: "Game already started!" });
  } else if (status === "Completed") {
    return res.status(400).json({ message: "Game already completed!" });
  }

  try {
    await query(`UPDATE games SET status='In Progress' WHERE game_id=$1`, [
      gid,
    ]);
  } catch (err) {
    console.error(err);
  }

  // Generate code - randomized array of 3 numbers 1-4 without repeats
  const code1 = [];
  while (code1.length < 3) {
    const randomNum = Math.floor(Math.random() * 4) + 1;
    if (!code1.includes(randomNum)) {
      code1.push(randomNum);
    }
  }

  const code2 = [];
  while (code2.length < 3) {
    const randomNum = Math.floor(Math.random() * 4) + 1;
    if (!code2.includes(randomNum)) {
      code2.push(randomNum);
    }
  }

  // Set code in database
  // Set proposer and guesser to first and second player in team (default for first round)
  try {
    const response = await query(
      `INSERT INTO logs (game_id, round, team, code, encryptor, decoder, interceptor) VALUES ($1, 1, 1, $2, 1, 2, 1), ($1, 1, 2, $3, 1, 2, 1)`,
      [gid, code1, code2]
    );
    return res.status(201).send({ code1, code2 });
  } catch (err) {
    console.error(err);
  }
}

async function nextRound(req, res) {
  const gid = req.body.gid;

  // Get round number
  const roundResponse = await query(
    `SELECT MAX(round) FROM logs WHERE game_id=$1`,
    [gid]
  );
  const nextRound = roundResponse.rows[0].max + 1;

  // Generate code - randomized array of 3 numbers 1-4 without repeats
  const code1 = [];
  while (code1.length < 3) {
    const randomNum = Math.floor(Math.random() * 4) + 1;
    if (!code1.includes(randomNum)) {
      code1.push(randomNum);
    }
  }

  const code2 = [];
  while (code2.length < 3) {
    const randomNum = Math.floor(Math.random() * 4) + 1;
    if (!code2.includes(randomNum)) {
      code2.push(randomNum);
    }
  }

  // Generate new encryptor, decoder, and interceptor
  const team1PlayersResponse = await query(
    `SELECT team1_players FROM games WHERE game_id=$1`,
    [gid]
  );
  const team1Players = team1PlayersResponse.rows[0].team1_players;
  const team1LastRoundResponse = await query(
    `
    SELECT * FROM logs WHERE game_id=$1 AND team=1 AND round=$2
  `,
    [gid, nextRound - 1]
  );
  const team1Encryptor =
    team1LastRoundResponse.rows[0].encryptor + 1 > team1Players.length
      ? 1
      : team1LastRoundResponse.rows[0].encryptor + 1;
  const team1Decoder =
    team1LastRoundResponse.rows[0].decoder + 1 > team1Players.length
      ? 1
      : team1LastRoundResponse.rows[0].decoder + 1;
  const team1Interceptor =
    team1LastRoundResponse.rows[0].interceptor + 1 > team1Players.length
      ? 1
      : team1LastRoundResponse.rows[0].interceptor + 1;

  const team2PlayersResponse = await query(
    `SELECT team2_players FROM games WHERE game_id=$1`,
    [gid]
  );
  const team2Players = team2PlayersResponse.rows[0].team2_players;
  const team2LastRoundResponse = await query(
    `
    SELECT * FROM logs WHERE game_id=$1 AND team=2 AND round=$2
  `,
    [gid, nextRound - 1]
  );
  const team2Encryptor =
    team2LastRoundResponse.rows[0].encryptor + 1 > team2Players.length
      ? 1
      : team2LastRoundResponse.rows[0].encryptor + 1;
  const team2Decoder =
    team2LastRoundResponse.rows[0].decoder + 1 > team2Players.length
      ? 1
      : team2LastRoundResponse.rows[0].decoder + 1;
  const team2Interceptor =
    team2LastRoundResponse.rows[0].interceptor + 1 > team2Players.length
      ? 1
      : team2LastRoundResponse.rows[0].interceptor + 1;

  // Set code in database
  try {
    const response = await query(
      `INSERT INTO logs (game_id, round, team, code, encryptor, decoder, interceptor) VALUES ($1, $2, 1, $3, $4, $5, $6), ($1, $2, 2, $7, $8, $9, $10)`,
      [
        gid,
        nextRound,
        code1,
        team1Encryptor,
        team1Decoder,
        team1Interceptor,
        code2,
        team2Encryptor,
        team2Decoder,
        team2Interceptor,
      ]
    );
    return res.status(201).send({ code1, code2 });
  } catch (err) {
    console.error(err);
  }
}

async function getRoundInfo(req, res) {
  const gid = req.params.gid;

  try {
    const response = await query(
      `
      SELECT * FROM logs WHERE game_id=$1 ORDER BY round DESC, team ASC LIMIT 2
    `,
      [gid]
    );
    return res.status(200).send(response.rows);
  } catch (err) {
    console.error(err);
  }
}

async function postClue(req, res) {
  const gid = req.body.gid;
  const round = req.body.round;
  const team = req.body.team;
  const clue = req.body.clue;

  try {
    const response = await query(
      `
      UPDATE logs SET clue=$1 WHERE game_id=$2 AND round=$3 AND team=$4
    `,
      [clue, gid, round, team]
    );
    return res.status(201).send({ message: "Clue posted!" });
  } catch (err) {
    console.error(err);
  }
}

async function postDecode(req, res) {
  const decode = req.body.decode;
  const team = req.body.team;
  const round = req.body.round;
  const gid = req.body.gid;

  // Update logs
  try {
    const logsResponse = await query(
      `
    UPDATE logs SET team${team}_response=$1 WHERE round=$2 AND team=$3 AND game_id=$4`,
      [decode, round, team, gid]
    );
  } catch (err) {
    console.error(err);
  }

  // Check if decode is correct
  const codeResponse = await query(
    `SELECT clue FROM logs WHERE round=$1 AND team=$2 AND game_id=$3`,
    [round, team, gid]
  );
  const code = codeResponse.rows[0].clue;

  if (checkResponse(code, decode)) {
    return res.send({
      message: "Decoded!",
      score: 0,
    });
  } else {
    const gameResponse = await query(
      `
      UPDATE games SET team${team}_miscommunications = team${team}_miscommunications + 1 WHERE game_id=$1 RETURNING team${team}_miscommunications
    `,
      [gid]
    );
    const logResponse = await query(
      `
      UPDATE logs SET miscommunication = 1 WHERE round=$1 AND team=$2 AND game_id=$3
    `,
      [round, team, gid]
    );
    return res.send({
      message: "Miscommunication!",
      score: gameResponse.rows[0][`team${team}_miscommunications`],
    });
  }
}

async function postIntercept(req, res) {
  const intercept = req.body.intercept;
  const team = req.body.team;
  const round = req.body.round;
  const gid = req.body.gid;
  const teamCol = req.body.team === 1 ? 2 : 1;

  // Update logs
  try {
    const response = await query(
      `
      UPDATE logs SET team${team}_response=$1 WHERE round=$2 AND team=$3 AND game_id=$4`,
      [intercept, round, teamCol, gid]
    );
  } catch (err) {
    console.error(err);
  }

  // Check if intercept is correct
  const codeResponse = await query(
    `SELECT clue FROM logs WHERE round=$1 AND team=$2 AND game_id=$3`,
    [round, teamCol, gid]
  );
  const code = codeResponse.rows[0].clue;
  if (checkResponse(code, intercept)) {
    const gameResponse = await query(
      `
      UPDATE games SET team${team}_interceptions = team${team}_interceptions + 1 WHERE game_id=$1 RETURNING team${team}_interceptions
    `,
      [gid]
    );
    const logResponse = await query(
      `
        UPDATE logs SET interception = 1 WHERE round=$1 AND team=$2 AND game_id=$3
      `,
      [round, teamCol, gid]
    );
    return res.send({
      message: "Interception!",
      score: gameResponse.rows[0][`team${team}_interceptions`],
    });
  } else {
    return res.send({
      message: "Failed Interception!",
      score: 0,
    });
  }
}

async function endGame(req, res) {
  const gid = req.body.gid;

  // Check result
  const getResultsResponse = await query(
    `
    SELECT team1_miscommunications, team2_miscommunications, team1_interceptions, team2_interceptions FROM games WHERE game_id=$1
  `,
    [gid]
  );

  const winner = checkWinner(
    getResultsResponse.rows[0].team1_miscommunications,
    getResultsResponse.rows[0].team1_interceptions,
    getResultsResponse.rows[0].team2_miscommunications,
    getResultsResponse.rows[0].team2_interceptions
  );

  console.log(winner);

  try {
    const response = await query(
      `
      UPDATE games SET winner=$1, status='Completed' WHERE game_id=$2
    `,
      [winner, gid]
    );

    return res.status(201).send({ message: "Game completed!" });
  } catch (err) {
    console.error(err);
  }
}

module.exports = {
  newGame,
  getGame,
  getWords,
  startGame,
  nextRound,
  getRoundInfo,
  postClue,
  postDecode,
  postIntercept,
  endGame,
};
