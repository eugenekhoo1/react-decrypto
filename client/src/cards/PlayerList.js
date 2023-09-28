import useUser from "../hooks/useUser";

export default function PlayerList({ players, team, gid }) {
  const { user } = useUser();
  return (
    <>
      <table className="table text-center">
        <thead>
          <tr>
            <th scope="col">Team {team}</th>
          </tr>
        </thead>
        <tbody>
          {players.map((player, index) => (
            <tr key={index}>
              <td
                className={
                  user?.player === player &&
                  user?.team === team &&
                  user?.gid === gid
                    ? "table-success"
                    : "table-secondary"
                }
              >
                {player}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
