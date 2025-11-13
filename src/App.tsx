import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="*" element={<Landing />} />
    </Routes>
  </BrowserRouter>
);

export default App;
