import './App.css';
import EmbedDash from './pages/EmbedDash';
import Home from './pages/home';
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

function App() {
  return (
    <Router basename='/neoview'>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/mobility-windows' element={<EmbedDash endpoint="metabase-dashboard" title="Mobility Windows" />} />
        <Route path='/research-profile' element={<EmbedDash endpoint="research-profiles" title="Research Profiles" />} />
      </Routes>
    </Router>
  );
}

export default App;
