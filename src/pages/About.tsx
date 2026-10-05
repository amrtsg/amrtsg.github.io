import type { ReactNode } from "react";
import "./pages.css";
import { BriefcaseBusiness, Check, Code2, ExternalLink, FileText, GraduationCap, Languages, User } from "lucide-react";

const technologies = [
  "Python",
  "C++",
  "TensorFlow",
  "PyTorch",
  "Keras",
  "TypeScript",
  "React",
  "OpenCV",
  "Scikit-learn",
];

const experience = [
  {
    role: "Systems Engineer Asc",
    company: "Lockheed Martin",
    dates: "Apr 2026 — Present",
    description: "Working as a Systems Engineer in Halifax, contributing to complex engineering and technical systems.",
    tags: ["Systems Engineering", "Engineering", "Software"],
  },
  {
    role: "Signals Operator",
    company: "Canadian Armed Forces",
    dates: "Jan 2026 — Present",
    description:
      "Serving as a Signals Operator in the Canadian Armed Forces, working in communications and military signal operations.",
    tags: ["Communications", "Signals", "Military"],
  },
  {
    role: "Machine Learning Engineer",
    company: "Modest Tree",
    dates: "May 2023 — May 2024",
    description:
      "Conducted research on 2D/video to 3D mesh reconstruction using Neural Radiance Fields, Gaussian Splatting, and convolutional neural networks using Keras, TensorFlow, and PyTorch.",
    tags: ["3D Reconstruction", "NeRF", "Gaussian Splatting", "PyTorch"],
  },
];

const education = [
  {
    degree: "M.A.Sc.",
    dates: "2022 — 2024",
    field: "Machine Learning",
    school: "Saint Mary's University",
    detail: "Thesis: Occlusion Aware Image Composition",
  },
  {
    degree: "B.Sc.",
    dates: "2018 — 2022",
    field: "Computing Science",
    school: "Saint Mary's University",
    detail: "Computer Science & Software Development",
  },
];

const research = [
  {
    title: "A Persistent Homology Design Space for 3D Point Cloud Deep Learning",
    description:
      "Research exploring persistent homology and topology-aware representations for deep learning on 3D point cloud data.",
    meta: "2026 · Computers & Graphics",
    link: "https://www.sciencedirect.com/science/article/pii/S0097849326001895",
  },
  {
    title: "DepGAN",
    description:
      "A depth-aware generative approach for image composition designed to improve object placement, occlusion handling, and transparency.",
    meta: "2024 · arXiv",
    link: "https://amrtsg.github.io/DepGAN/",
  },
  {
    title: "DepGAN-RS (Link coming soon)",
    description:
      "An extension of depth-guided object placement research applied to realistic remote sensing image augmentation.",
    meta: "2026 · IGARSS",
    link: "https://2020.lagirs.org/view_paper.php?PaperNum=1015&SessionID=1488",
  },
];

const languages = [
  ["English", "Native / Bilingual"],
  ["Arabic", "Native / Bilingual"],
];

function SectionHeading({ icon, eyebrow, title }: { icon: ReactNode; eyebrow: string; title: string }) {
  return (
    <div className="about-section-title">
      <div className="about-section-icon">{icon}</div>
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h2>{title}</h2>
      </div>
    </div>
  );
}

function About() {
  return (
    <div className="page about-page">
      <section className="about-hero">
        <div className="about-hero-main">
          <div className="about-avatar">
            <User size={30} />
          </div>
          <div>
            <div className="eyebrow">About Me</div>
            <h1>Amr Ghoneim</h1>
            <p className="about-role">Systems Engineer · Machine Learning · Software Development</p>
          </div>
        </div>
        <div className="about-hero-description">
          <p>
            Systems Engineer with a background in machine learning, computer vision, 3D data, and software development.
            I enjoy solving complex technical problems through a combination of engineering and research.
          </p>
        </div>
      </section>

      <section className="about-intro">
        <div className="about-intro-label">
          <Code2 size={17} />
          <span>What I do</span>
        </div>
        <div className="about-intro-content">
          <h2>Building systems, software, and intelligent solutions.</h2>
          <p>
            I'm a Systems Engineer at Lockheed Martin with a graduate background in machine learning and a foundation in
            computing science. My experience spans systems engineering, software development, machine learning, computer
            vision, and 3D data.
          </p>
          <p>
            I enjoy working at the intersection of engineering and research, building practical software and tools that
            turn complex technical ideas into usable applications.
          </p>
        </div>
      </section>

      <section className="about-section">
        <SectionHeading icon={<BriefcaseBusiness size={18} />} eyebrow="Career" title="Experience" />
        <div className="experience-grid">
          {experience.map((item) => (
            <article className="experience-card" key={`${item.role}-${item.company}`}>
              <div className="experience-card-header">
                <div>
                  <h3>{item.role}</h3>
                  <p>{item.company}</p>
                </div>
                <span>{item.dates}</span>
              </div>
              <div className="experience-line" />
              <p className="experience-description">{item.description}</p>
              <div className="experience-tags">
                {item.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="about-section">
        <SectionHeading icon={<GraduationCap size={18} />} eyebrow="Education" title="Academic Background" />
        <div className="education-grid">
          {education.map((item) => (
            <article className="education-card" key={`${item.degree}-${item.field}`}>
              <div className="education-card-top">
                <div className="education-degree">{item.degree}</div>
                <span>{item.dates}</span>
              </div>
              <h3>{item.field}</h3>
              <p>{item.school}</p>
              <div className="education-detail">
                <Check size={14} />
                <span>{item.detail}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="about-section">
        <SectionHeading icon={<FileText size={18} />} eyebrow="Research" title="Publications" />
        <div className="research-grid">
          {research.map((paper) => (
            <a className="research-card" key={paper.title} href={paper.link} target="_blank" rel="noreferrer">
              <div className="research-card-top">
                <div className="research-icon">
                  <FileText size={15} />
                </div>
                <ExternalLink size={15} className="research-arrow" />
              </div>
              <div className="research-meta">{paper.meta}</div>
              <h3>{paper.title}</h3>
              <p>{paper.description}</p>
            </a>
          ))}
        </div>
      </section>

      <section className="about-section">
        <SectionHeading icon={<Code2 size={18} />} eyebrow="Technical Skills" title="Technologies I Work With" />
        <div className="skills-grid">
          {technologies.map((technology) => (
            <div className="skill-card" key={technology}>
              <Check size={14} />
              <span>{technology}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="about-section">
        <SectionHeading icon={<Languages size={18} />} eyebrow="Languages" title="Communication" />
        <div className="language-grid">
          {languages.map(([language, level]) => (
            <div className="language-card" key={language}>
              <span>{language}</span>
              <small>{level}</small>
            </div>
          ))}
        </div>
      </section>

      <section className="about-contact">
        <div className="about-contact-icon">
          <User size={20} />
        </div>
        <div>
          <div className="eyebrow">Let's connect</div>
          <h2>Interested in working together?</h2>
          <p>Feel free to connect with me to discuss engineering, software, machine learning, or research.</p>
        </div>
        <a href="https://www.linkedin.com/in/amrtsg" target="_blank" rel="noreferrer" className="about-contact-button">
          <ExternalLink size={15} />
          LinkedIn
        </a>
      </section>
    </div>
  );
}

export default About;
