import { ArrowUpRight, BrainCircuit, Box, ExternalLink, Gamepad2, GitBranch, Layers3, Scan } from "lucide-react";
import "./pages.css";

interface Project {
  name: string;
  description: string;
  technologies: string[];
  image: string;
  icon: typeof Layers3;
  github?: string;
  external?: string;
  externalLabel?: string;
}

const projects: Project[] = [
  {
    name: "DepGAN",
    description:
      "A depth-aware image composition model using depth maps and alpha channels to improve object placement, occlusion handling, and transparency.",
    technologies: ["Python", "TensorFlow", "GANs", "Computer Vision"],
    image: "/depgan.jpg",
    icon: BrainCircuit,
    github: "https://github.com/amrtsg/DepGAN",
    external: "https://arxiv.org/abs/2407.11890",
    externalLabel: "Paper",
  },
  {
    name: "Instance Segmentation",
    description:
      "A computer vision project for detecting and segmenting individual objects in images using a neural network trained for instance-level segmentation.",
    technologies: ["Python", "TensorFlow", "Deep Learning", "Computer Vision"],
    image: "/instance-seg.png",
    icon: Scan,
    github: "https://github.com/amrtsg/instance-seg",
  },
  {
    name: "Graphics Engine",
    description:
      "A custom graphics engine exploring real-time rendering, graphics programming, and the underlying systems required to build a game engine.",
    technologies: ["C++", "OpenGL", "Graphics", "Game Development"],
    image: "/engine.gif",
    icon: Box,
    github: "https://github.com/amrtsg/graphics-engine",
  },
  {
    name: "Vertical Descent",
    description:
      "A first-person horror puzzle game focused on atmospheric exploration, environmental storytelling, and immersive gameplay.",
    technologies: ["Game Development", "3D Graphics", "Horror", "Puzzle"],
    image: "/descent.jpg",
    icon: Gamepad2,
    external: "https://store.steampowered.com/app/3509650/",
    externalLabel: "Steam",
  },
];

function Projects() {
  const openLink = (url?: string) => {
    if (!url) return;

    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      <div className="page projects-page">
        <header className="topbar">
          <div>
            <div className="eyebrow">Developer workspace</div>
            <h1>Projects</h1>
            <p>A selection of things I've built and worked on.</p>
          </div>

          <div className="topbar-badge">
            <Layers3 size={16} />
            {projects.length} projects
          </div>
        </header>

        <section className="projects-intro">
          <div className="projects-intro-icon">
            <Layers3 size={21} />
          </div>

          <div>
            <h2>Things I've built.</h2>
            <p>
              A collection of research, software, graphics, and game development projects spanning machine learning,
              computer vision, C++, and real-time graphics.
            </p>
          </div>
        </section>

        <section className="projects-grid">
          {projects.map((project) => {
            const ProjectIcon = project.icon;

            return (
              <article className="project-card" key={project.name}>
                <button
                  type="button"
                  className="project-image"
                  onClick={() => openLink(project.external || project.github)}
                  aria-label={`Open ${project.name}`}>
                  <img src={project.image} alt={`${project.name} project preview`} />

                  <div className="project-image-overlay">
                    <span>View project</span>
                    <ArrowUpRight size={15} />
                  </div>
                </button>

                <div className="project-card-body">
                  <div className="project-card-top">
                    <div className="project-icon">
                      <ProjectIcon size={20} />
                    </div>

                    <div className="project-actions">
                      {project.github && (
                        <button
                          type="button"
                          aria-label={`View ${project.name} on GitHub`}
                          title="GitHub"
                          onClick={() => openLink(project.github)}>
                          <GitBranch size={16} />
                        </button>
                      )}

                      {project.external && (
                        <button
                          type="button"
                          aria-label={`Open ${project.name} ${project.externalLabel || "project"}`}
                          title={project.externalLabel || "Open project"}
                          onClick={() => openLink(project.external)}>
                          <ExternalLink size={16} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="project-content">
                    <h2>{project.name}</h2>
                    <p>{project.description}</p>
                  </div>

                  <div className="technology-list">
                    {project.technologies.map((technology) => (
                      <span key={technology}>{technology}</span>
                    ))}
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      </div>
    </>
  );
}

export default Projects;
