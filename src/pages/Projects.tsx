import { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/effect-cards';
import './css/Projects.css';
import { EffectCards } from 'swiper/modules';
import AnimatedBack from '@/components/AnimatedBack';

interface Project {
  category: string;
  name: string;
  desc: string;
  skills: string[];
  image: string;
  githubLink: string;
}

const projects: Project[] = [
  {
    category: "<MachineLearning />",
    name: "DepGAN",
    desc: "Image composition model",
    skills: ["Python", "TensorFlow"],
    image: "depgan.jpg",
    githubLink: "https://github.com/amrtsg/DepGAN"
  },
  {
    category: "<MachineLearning />",
    name: "Instance Segmentation Model",
    desc: "Model to segment an image",
    skills: ["Python", "TensorFlow"],
    image: "segmentation.png",
    githubLink: "https://github.com/amrtsg/instance-seg"
  },
  {
    category: "<3D />",
    name: "3D Model Renderer",
    desc: "Render 3D models",
    skills: ["C++", "OpenGL"],
    image: "3dmodelrender.gif",
    githubLink: "https://github.com/amrtsg/model-renderer"
  },
  {
    category: "<3D />",
    name: "3D Graphics Engine",
    desc: "3D graphics engine using OpenGL",
    skills: ["C++", "OpenGL", "Assimp"],
    image: "3dengine.gif",
    githubLink: "https://github.com/amrtsg/graphics-engine"
  },
  {
    category: "<3D />",
    name: "Raytracer",
    desc: "Simple raytracer engine",
    skills: ["C++"],
    image: "raytrace.png",
    githubLink: "https://github.com/amrtsg/ray-trace"
  },
  {
    category: "<Games />",
    name: "Unity Shooter Game",
    desc: "Shooter maze game made for fun",
    skills: ["Unity", "C#", "Blender"],
    image: "unity-game.png",
    githubLink: "https://github.com/amrtsg/unity-game"
  },
];

const Projects = () => {
  const categories = [...new Set(projects.map(project => project.category))];
  const projectsByCategory = categories.map(category => ({
    category,
    projects: projects.filter(project => project.category === category)
  }));

  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
  const [activeSlideIndices, setActiveSlideIndices] = useState<{ [key: string]: number }>(
    categories.reduce((acc, category) => ({
      ...acc,
      [category]: 0
    }), {})
  );

  const handleCategoryChange = (index: number) => {
    setActiveCategoryIndex(index);
    setActiveSlideIndices((prevState) => ({
      ...prevState,
      [categories[activeCategoryIndex]]: 0 // Reset active slide index for the current category
    }));
  };

  const handleSlideChange = (swiper: any, category: string) => {
    setActiveSlideIndices((prevState) => ({
      ...prevState,
      [category]: swiper.activeIndex
    }));
  };

  return (
    <div className="projects-container">
      <div className="category-navigation">
        {categories.map((category, index) => (
          <button
            key={index}
            onClick={() => handleCategoryChange(index)}
            className={index === activeCategoryIndex ? 'active' : ''}
          >
            {category}
          </button>
        ))}
      </div>
      <div className="animated-back">
        <AnimatedBack />
      </div>
      <div className="category-swiper">
        <Swiper
          effect={'cards'}
          grabCursor={true}
          modules={[EffectCards]}
          className="mySwiper"
          onSlideChange={(swiper) => handleSlideChange(swiper, categories[activeCategoryIndex])}
        >
          {projectsByCategory[activeCategoryIndex].projects.map((project, index) => (
            <SwiperSlide key={index}>
              <div className="project-slide">
                <img
                  src={project.image}
                  alt={project.name}
                  className="project-image"
                />
                <div className={`project-details ${activeSlideIndices[categories[activeCategoryIndex]] === index ? 'active' : ''}`}>
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
  );
};

export default Projects;
