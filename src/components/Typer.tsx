import React, { useEffect, useState } from 'react';
import '@/components/css/Typer.css'; // Import the CSS file for styling

const initialHTML = `
  <pre id="typer">
    <span class="var-highlight">var</span> contact = {
      name: <span class="string-highlight">'<strong>Amr Ghoneim</strong>'</span>,
      email: <span class="string-highlight">'<a href="#">amrtsg@gmail.com</a>'</span>,
      github: <span class="string-highlight">'<a href="#">github.com/amrtsg</a>'</span>,
      linkedin: <span class="string-highlight">'<a href="#">linkedin.com/in/amrtsg/</a>'</span>,
      skills:[<span class="string-highlight">'Machine Learning'</span>,
              <span class="string-highlight">'3D Reconstruction'</span>,
              <span class="string-highlight">'Software Development'</span>
              <span class="string-highlight">'Data Automation'</span>
              <span class="string-highlight">'Tensorflow/Pytorch'</span>];
    };
  </pre>
`;

function Typer() {
  const [displayText, setDisplayText] = useState('');
  const typeSpeed = 1;

  useEffect(() => {
    let cursorPosition = 0;
    const interval = setInterval(() => {
      if (cursorPosition <= initialHTML.length) {
        setDisplayText(initialHTML.substring(0, cursorPosition) + '▌'); // Add a cursor character
        cursorPosition++;
      } else {
        clearInterval(interval); // Clear interval once typing is complete
      }
    }, typeSpeed); // Adjust the interval for typing speed

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="typewriter">
      <pre dangerouslySetInnerHTML={{ __html: displayText }} />
    </div>
  );
}

export default Typer;
