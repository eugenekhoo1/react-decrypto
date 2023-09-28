const { query } = require("../config/db");

async function addPlayer(req, res) {
  const { gid, player, team } = req.body;

  const teamCol = `team${team}_players`;

  const checkPlayers = await query(
    `
    SELECT ${teamCol} FROM games WHERE game_id=$1
  `,
    [gid]
  );

  if (checkPlayers.rows[0][teamCol].length < 4) {
    if (
      checkPlayers.rows[0].team1_players.includes(player) ||
      checkPlayers.rows[0].team2_players.includes(player)
    ) {
      return res.status(400).json({ message: "Player already exists!" });
    }
    try {
      const SQL_QUERY = `
          UPDATE games SET ${teamCol} = ARRAY_APPEND(${teamCol}, $1) WHERE game_id=$2
      `;
      const response = await query(SQL_QUERY, [player, gid]);
      return res.status(201).json({ message: "Player created!" });
    } catch (err) {
      console.error(err);
    }
  } else {
    return res.status(400).json({ error: "Max players!" });
  }
}

module.exports = { addPlayer };
