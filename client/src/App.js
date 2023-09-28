import { Route, Routes } from "react-router-dom";
import Encrypt from "./pages/Encrypt";
import Landing from "./pages/Landing";
import Player from "./pages/Player";
import Decode from "./pages/Decode";
import Intercept from "./pages/Intercept";
import PostRound from "./pages/PostRound";
import PostGame from "./pages/PostGame";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/addplayer/:gid" element={<Player />} />
        <Route path="/encrypt/:gid" element={<Encrypt />} />
        <Route path="/decode/:gid" element={<Decode />} />
        <Route path="/intercept/:gid" element={<Intercept />} />
        <Route path="/postround/:gid" element={<PostRound />} />
        <Route path="/postgame/:gid" element={<PostGame />} />
      </Routes>
    </>
  );
}

export default App;
