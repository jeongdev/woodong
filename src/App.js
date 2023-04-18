import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header/Header";
import Map from "./components/Map/Map";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<Map />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
