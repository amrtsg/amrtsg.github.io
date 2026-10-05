import { NavLink, Outlet } from "react-router-dom";
import { Code2, FolderKanban, User, Wrench } from "lucide-react";

function Layout() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">A</div>

          <div>
            <div className="brand-name">Amr Ghoneim</div>
            <div className="brand-subtitle">Developer Tools</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-label">Workspace</div>

          <NavLink to="/" end className="nav-item">
            <User size={18} />
            <span>About Me</span>
          </NavLink>

          <NavLink to="/tools" className="nav-item">
            <Wrench size={18} />
            <span>Tools</span>
          </NavLink>

          <NavLink to="/projects" className="nav-item">
            <FolderKanban size={18} />
            <span>Projects</span>
          </NavLink>
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-status">
            <span className="status-dot" />
            <span>All systems operational</span>
          </div>

          <div className="sidebar-version">
            <Code2 size={14} />
            <span>amrtsg.github.io</span>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
