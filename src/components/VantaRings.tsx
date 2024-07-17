import React, { Component, RefObject } from 'react';
// @ts-ignore
import rings from 'vanta/dist/vanta.rings.min';

class VantaRings extends Component {
  vantaRef: RefObject<HTMLDivElement>;
  vantaEffect: any;
  constructor(props: {}) {
    super(props);
    this.vantaRef = React.createRef<HTMLDivElement>();
  }

  componentDidMount() {
    this.vantaEffect = rings({
      el: this.vantaRef.current,
      mouseControls: true,
      touchControls: true,
      gyroControls: false,
      minHeight: 200.00,
      minWidth: 200.00,
      scale: 1.00,
      scaleMobile: 1.00,
      color: 0xff3f81,
      color2: 0xffffff,
      backgroundColor: 0x23153c
    });
  }

  componentWillUnmount() {
    if (this.vantaEffect) this.vantaEffect.destroy();
  }

  render() {
    return (
      <div
        ref={this.vantaRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: -1,
        }}
      ></div>
    );
  }
}

export default VantaRings;
