// src/App.js
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Projects from '@/pages/Projects';
import Home from '@/pages/Home';
import Resume from '@/pages/Resume'
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        {/*<video autoPlay loop muted className="background-video">
          <source src={`/back.mp4`} type="video/mp4" />
          Your browser does not support the video tag.
        </video>*/}
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/resume" element={<Resume />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
