import { Link } from 'react-router-dom';
import '@/components/css/Navbar.css'; // Import a CSS file for styling

function Navbar() {
  return (
    <nav className="navbar">
      <ul className="navbar-links">
        <li><Link to="/">Home();</Link></li>
        <li><Link to="/projects">Projects.js</Link></li>
        <li><Link to="/resume">Resume.pdf</Link></li>
      </ul>
    </nav>
  );
}

export default Navbar;
