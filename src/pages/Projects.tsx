import { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import './css/Projects.css';
import { EffectCoverflow, Pagination } from 'swiper/modules';
import AnimatedBack from '@/components/AnimatedBack';
import VantaGlobe from '@/components/VantaGlobe';

interface Project {
  name: string;
  desc: string;
  skills: string[];
  image: string;
  githubLink: string;
}

const projects: Project[] = [
  {
    name: "DepGAN",
    desc: "Image composition model",
    skills: ["Python", "TensorFlow"],
    image: "depgan.jpg",
    githubLink: "https://github.com/amrtsg/DepGAN"
  },
  {
    name: "Instance Segmentation Model",
    desc: "Model to segment an image",
    skills: ["Python", "TensorFlow"],
    image: "segmentation.png",
    githubLink: "https://github.com/amrtsg/instance-seg"
  },
  {
    name: "3D Model Renderer",
    desc: "Render 3D models",
    skills: ["C++", "OpenGL"],
    image: "3dmodelrender.gif",
    githubLink: "https://github.com/amrtsg/model-renderer"
  },
  {
    name: "3D Graphics Engine",
    desc: "3D graphics engine using OpenGL",
    skills: ["C++", "OpenGL", "Assimp"],
    image: "3dengine.gif",
    githubLink: "https://github.com/amrtsg/graphics-engine"
  },
  {
    name: "Raytracer",
    desc: "Simple raytracer engine",
    skills: ["C++"],
    image: "raytrace.png",
    githubLink: "https://github.com/amrtsg/ray-trace"
  },
  {
    name: "Unity Shooter Game",
    desc: "Shooter maze game made for fun",
    skills: ["Unity", "C#", "Blender"],
    image: "unity-game.png",
    githubLink: "https://github.com/amrtsg/unity-game"
  },
];

const Projects = () => {
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  const handleSlideChange = (swiper: any) => {
    setActiveSlideIndex(swiper.activeIndex);
  };

  return (
    <>
      <VantaGlobe />
      <div className="projects-container">
        <div className="animated-back">
          <AnimatedBack />
        </div>
        <div className="category-swiper">
          <Swiper
            effect={'coverflow'}
            grabCursor={true}
            centeredSlides={true}
            slidesPerView={'auto'}
            coverflowEffect={{
              rotate: 50,
              stretch: 0,
              depth: 100,
              modifier: 1,
              slideShadows: true,
            }}
            pagination={true}
            modules={[EffectCoverflow, Pagination]}
            className="swiper"
            onSlideChange={(swiper) => handleSlideChange(swiper)}
          >
            {projects.map((project, index) => (
              <SwiperSlide key={index}>
                <div className="project-slide">
                  <img
                    src={project.image}
                    alt={project.name}
                    className="project-image"
                  />
                  <div className={`project-details ${activeSlideIndex === index ? 'active' : ''}`}>
                    <h3>{project.name}</h3>
                    <p>{project.desc}</p>
                    <div className="skills">
                      {project.skills.map((skill, skillIndex) => (
                        <button key={skillIndex} className={`skill-btn skill-${skillIndex}`}>
                          {skill}
                        </button>
                      ))}
                    </div>
                    <a href={project.githubLink} className="github-button" target="_blank" rel="noopener noreferrer">getCode();</a>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </>
  );
};

export default Projects;
