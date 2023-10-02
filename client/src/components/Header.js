import "../styles/header.css";
import refresh from "../assets/img/refresh.svg";

export default function Header({ user }) {
  const refreshPage = () => {
    window.location.reload();
  };

  return (
    <div className="container mt-3">
      <div className="row ms-2">Game ID: {user.gid}</div>

      <div className="row ms-2 me-2 justify-content-center">
        <div className="col-9 p-0">Player: {user.player}</div>
        <div className="col-3 p-0 text-end">
          <span className="refresh-btn" onClick={refreshPage}>
            <img src={refresh} alt="refresh" />
          </span>
        </div>
      </div>
      <div className="row ms-2">Team: {user.team}</div>
    </div>
  );
}
