const React = require('react');

import TWEEN from 'tween.js';

const width = 30;
const height = 30;

let _id = 0;

function arc(startAngle, endAngle, outerRadius, innerRadius = 0) {
  const sinAlpha = Math.sin(startAngle);
  const cosAlpha = Math.cos(startAngle);
  const sinBeta = Math.sin(endAngle);
  const cosBeta = Math.cos(endAngle);

  const largeArc = endAngle - startAngle > Math.PI;

  const P = {
    x: outerRadius + outerRadius * sinAlpha,
    y: outerRadius - outerRadius * cosAlpha
  };

  const Q = {
    x: outerRadius + outerRadius * sinBeta,
    y: outerRadius - outerRadius * cosBeta
  };

  const R = {
    x: outerRadius + innerRadius * sinBeta,
    y: outerRadius - innerRadius * cosBeta
  };

  const S = {
    x: outerRadius + innerRadius * sinAlpha,
    y: outerRadius - innerRadius * cosAlpha
  };

  return `M${P.x},${P.y} A${outerRadius},${outerRadius} 0 ${largeArc ? '1,1' : '0,1'} ${Q.x},${
    Q.y
  } L${R.x},${R.y} A${innerRadius},${innerRadius} 0 ${largeArc ? '1,0' : '0,0'} ${S.x},${S.y} Z`;
}


class Animator extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      progress: 0
    }
    this.id = _id++;
  }

  animate(key, start, value, time, yoyo, yoyoOffset) {
    let _tween = { value : start };

    new TWEEN.Tween(_tween)
      .to({value: value}, time === undefined ? 750 : time)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .onUpdate(() => {
        const updated = {};
        updated[key] = _tween.value;
        this.props.updateProps(updated);

        this.setState({
          progress: (_tween.value - start) / (value - start) * (yoyo ? 0.5 : 1) + yoyoOffset
        })
      }).start();
  }

  componentDidMount() {
    const listenForAnimations = () => {
      const update = TWEEN.update();
      requestAnimationFrame(listenForAnimations);
    };
    listenForAnimations();

    if (this.props.runOnMount) {
      this.startAnimation(true);
    }
  }

  startAnimation(initial) {
    const { hasError, idyll, updateProps, ...props } = this.props;

    const _initialState = props.animations.reduce((memo, animation) => {
      if (animation.start) {
        memo[animation.key] = animation.start;
      }
      return memo;
    }, {})

    updateProps(_initialState)
    props.animations.forEach(({ key, start, end, duration, yoyo, autoplay }) => {
      if (!(autoplay === undefined || autoplay) && initial) {
        return;
      }
      this.animate(key, start, end, (duration || 750) * (yoyo ? .5 : 1), yoyo, 0);
      if (yoyo) {
        setTimeout(() => {
          this.animate(key, end, start, (duration || 750) * .5, yoyo, 0.5);
        }, (duration || 750) * .5)
      }
    })
  }

  render() {
    const { hasError, idyll, updateProps, ...props } = this.props;

    return (
      <div style={{ display: 'inline', lineHeight: 1, position: 'absolute', bottom: 5, right: 5 }}>
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          style={{ display: 'block', background: 'white', cursor: 'pointer' }}
          onClick={() => {
            this.startAnimation()
          }}
        >
          <defs>
            <clipPath id={`cut-off-play-${this.id}`}>
              <rect x={width / 3} y="0" width={(this.state.progress === 1) ? 0 : ((3 * width / 4 - width / 3) * this.state.progress)} height={height} />
            </clipPath>
          </defs>
          <circle cx={width / 2} cy={height / 2} r={Math.min(width, height) / 2} fill={'#ddd'} />
          <circle cx={width / 2} cy={height / 2} r={Math.min(width, height) / 2 - 3} fill={'white'} />
          <path d={arc(0, 2 * Math.PI * this.state.progress, Math.min(width, height) / 2, Math.min(width, height) / 2 - 3)} fill="#333" />
          <polygon points={`${width / 3}, ${height / 4} ${width / 3}, ${3 * height / 4} ${3 * width / 4}, ${height / 2} `} fill="#ddd"/>
          <polygon points={`${width / 3}, ${height / 4} ${width / 3}, ${3 * height / 4} ${3 * width / 4}, ${height / 2} `} fill="#333" clipPath={`url(#cut-off-play-${this.id})`}/>
        </svg>
      </div>
    );
  }
}

module.exports = Animator;
