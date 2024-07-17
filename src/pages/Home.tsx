import Typer from '@/components/Typer';
import './css/Home.css';
import AnimatedBack from '@/components/AnimatedBack';
import VantaWaves from '@/components/VantaWaves';

function Home() {
  return (
    <>
    <VantaWaves />
    <div className="content">
      <div className="animated-back">
        <AnimatedBack />
      </div>
      <div className="typewriter-container">
        <Typer />
      </div>
    </div>
    </>
  );
}

export default Home;
