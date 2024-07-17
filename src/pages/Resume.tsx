import './css/Resume.css';
import VantaRings from '@/components/VantaRings';

function Resume() {
  return (
    <>
    <VantaRings />
    <div className="content">
      <iframe src="/resume.pdf" width="100%" height="800px" title="Resume"></iframe>
    </div>
    </>
  );
}

export default Resume;