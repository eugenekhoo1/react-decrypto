import React from "react";

export default function OppTeamClues({ clues, team }) {
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
                <td>
                  {row.clue[1] || null} <br />
                  <span className="text-danger text-opacity-75">
                    {row.clue[1] ===
                    row[team === 1 ? "team2_response" : "team1_response"][1]
                      ? null
                      : row[
                          team === 1 ? "team2_response" : "team1_response"
                        ][1] || null}
                  </span>
                </td>
                <td>
                  {row.clue[2] || null} <br />
                  <span className="text-danger text-opacity-75">
                    {row.clue[2] ===
                    row[team === 1 ? "team2_response" : "team1_response"][2]
                      ? null
                      : row[
                          team === 1 ? "team2_response" : "team1_response"
                        ][2] || null}
                  </span>
                </td>
                <td>
                  {row.clue[3] || null} <br />
                  <span className="text-danger text-opacity-75">
                    {row.clue[3] ===
                    row[team === 1 ? "team2_response" : "team1_response"][3]
                      ? null
                      : row[
                          team === 1 ? "team2_response" : "team1_response"
                        ][3] || null}
                  </span>
                </td>
                <td>
                  {row.clue[4] || null}
                  <br />
                  <span className="text-danger text-opacity-75">
                    {row.clue[4] ===
                    row[team === 1 ? "team2_response" : "team1_response"][4]
                      ? null
                      : row[
                          team === 1 ? "team2_response" : "team1_response"
                        ][4] || null}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
