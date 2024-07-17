import './css/Resume.css';
import VantaDots from '@/components/VantaDots';

function Resume() {
  return (
    <>
    <VantaDots />
    <div className="content">
      <iframe src="/resume.pdf" width="100%" height="800px" title="Resume"></iframe>
    </div>
    </>
  );
}

export default Resume;