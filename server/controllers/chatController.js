const { query } = require("../config/db");

async function getChatMessages(req, res) {
  const gid = req.query.gid;
  const team = req.query.team;

  try {
    const response = await query(
      `
            SELECT * FROM chat WHERE game_id=$1 AND team=$2 ORDER BY chat_id ASC
        `,
      [gid, team]
    );
    return res.status(200).send(response.rows);
  } catch (err) {
    console.error(err);
  }
}

async function postChatMessage(req, res) {
  const text = req.body.text;
  const gid = req.body.gid;
  const team = req.body.team;
  const player = req.body.player;

  try {
    const response = await query(
      `
            INSERT INTO chat (game_id, team, player, text) VALUES ($1, $2, $3, $4)
        `,
      [gid, team, player, text]
    );
    return res.status(201).json({ message: "Message created!" });
  } catch (err) {
    console.error(err);
  }
}

module.exports = { getChatMessages, postChatMessage };
