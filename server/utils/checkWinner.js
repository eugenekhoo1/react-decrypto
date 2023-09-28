function checkWinner(
  team1_miscommunications,
  team1_interceptions,
  team2_miscommunications,
  team2_interceptions
) {
  const team1Result =
    team1_interceptions > 1 || team2_miscommunications > 1 ? true : false;
  const team2Result =
    team2_interceptions > 1 || team1_miscommunications > 1 ? true : false;

  console.log(
    team1_miscommunications,
    team1_interceptions,
    team2_miscommunications,
    team2_interceptions,
    team1Result,
    team2Result
  );
  const winner =
    team1Result && team2Result
      ? 0
      : team1Result && !team2Result
      ? 1
      : !team1Result && team2Result
      ? 2
      : 99;

  return winner;
}

module.exports = checkWinner;
