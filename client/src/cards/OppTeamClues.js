import React from "react";

export default function OppTeamClues({ clues }) {
  return (
    <div className="container mt-4">
      <div class="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th scope="col">Round</th>
              <th scope="col">1</th>
              <th scope="col">2</th>
              <th scope="col">3</th>
              <th scope="col">4</th>
            </tr>
          </thead>
          <tbody>
            {clues.map((row, index) => (
              <tr key={index}>
                <td scope="row">{index + 1}</td>
                <td>{row.clue[1] || null}</td>
                <td>{row.clue[2] || null}</td>
                <td>{row.clue[3] || null}</td>
                <td>{row.clue[4] || null}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
