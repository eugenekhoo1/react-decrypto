const { query } = require("../config/db");

async function getClues(req, res) {
  const gid = req.query.gid;
  const team = req.query.team;
  const type = req.query.type;
  const oppTeam = team === "1" ? "2" : "1";

  try {
    if (type === "encrypt") {
      const teamCluesResponse = await query(
        `
        SELECT clue FROM logs WHERE game_id=$1 AND team=$2 ORDER BY round
        `,
        [gid, team]
      );
      return res.status(200).json({
        teamClues: teamCluesResponse.rows.slice(0, -1),
      });
    } else if (type === "intercept") {
      const oppTeamCluesResponse = await query(
        `
        SELECT clue, team${oppTeam}_response FROM logs WHERE game_id=$1 AND team=$2 ORDER BY round
        `,
        [gid, oppTeam]
      );
      return res.status(200).json({
        oppTeamClues: oppTeamCluesResponse.rows.slice(0, -1),
      });
    }
  } catch (err) {
    console.error(err);
  }
}

module.exports = { getClues };
