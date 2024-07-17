import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Projects from '@/pages/Projects';
import Home from '@/pages/Home';
import Resume from '@/pages/Resume';
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
          <Route path="/" element={<HomeComponent />} />
          <Route path="/projects" element={<ProjectsComponent />} />
          <Route path="/resume" element={<ResumeComponent />} />
        </Routes>
      </div>
    </Router>
  );
}

const pageVariants = {
  initial: {
    opacity: 0,
    scale: 0.9,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: {
      duration: 1.0,
    },
  },
};

const HomeComponent = () => {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      className="page"
    >
      <Home />
    </motion.div>
  );
};

const ProjectsComponent = () => {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      className="page"
    >
      <Projects />
    </motion.div>
  );
};

const ResumeComponent = () => {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      className="page"
    >
      <Resume />
    </motion.div>
  );
};

export default App;
