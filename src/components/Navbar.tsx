import { useState } from 'react';
import { Link } from 'react-router-dom';
import '@/components/css/Navbar.css';
import { TiThMenu } from "react-icons/ti";

import { FcOpenedFolder , FcDocument, FcDepartment } from "react-icons/fc";

function Navbar() {
  const [showMenu, setShowMenu] = useState(false);

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Mobile menu toggle button */}
        <button className="mobile-menu-toggle" onClick={toggleMenu}>
          <TiThMenu />
        </button>

        {/* Menu links for large screens */}
        <ul className={`navbar-links ${showMenu ? 'active' : ''}`}>
          <li><Link to="/" onClick={() => setShowMenu(false)}><FcDepartment  /> Home();</Link></li>
          <li><Link to="/projects" onClick={() => setShowMenu(false)}><FcOpenedFolder  /> Projects.js</Link></li>
          <li><Link to="/resume" onClick={() => setShowMenu(false)}><FcDocument /> Resume.pdf</Link></li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
