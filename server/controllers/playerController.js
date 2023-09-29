const { query } = require("../config/db");

async function addPlayer(req, res) {
  const { gid, player, team } = req.body;

  const checkPlayers = await query(
    `
    SELECT team1_players, team2_players FROM games WHERE game_id=$1
  `,
    [gid]
  );

  if (
    checkPlayers.rows[0].team1_players.includes(player) ||
    checkPlayers.rows[0].team2_players.includes(player)
  ) {
    return res.status(400).json({ message: "Player already exists!" });
  }
  try {
    const SQL_QUERY = `
            UPDATE games SET team${team}_players = ARRAY_APPEND(team${team}_players, $1) WHERE game_id=$2
        `;
    const response = await query(SQL_QUERY, [player, gid]);
    return res.status(201).json({ message: "Player created!" });
  } catch (err) {
    console.error(err);
  }
}

module.exports = { addPlayer };
