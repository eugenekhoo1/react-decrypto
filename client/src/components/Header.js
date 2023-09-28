export default function Header({ user }) {
  return (
    <div className="container mt-3">
      <div className="row ms-2">Game ID: {user.gid}</div>
      <div className="row ms-2">Player: {user.player}</div>
      <div className="row ms-2">Team: {user.team}</div>
    </div>
  );
}
