const React = require('react');
const d3 = require('d3');
import { motion } from "framer-motion";

const width = 600;
const height = 360;

const PARTY_COLORS = {
  100: '#0000CC',
  200: '#CC0000',
  328: '#00CC00',
}
const VOTE_STATUS_COLORS = {
  'Passed': '#00cc00',
  'Failed': '#CC0000'
}

const radsToDegress = (radians) => {
  return radians * 180 / Math.PI;
}


const pad = (str, len) => {
  str = '' + str;
  if (str.length >= len) {
    return str;
  }
  return `${'0'.repeat(len - str.length)}${str}`;
}

const linearTransform = (x, y) => {
  return [x, y];
}

class OptimizerVis extends React.Component {

  constructor(props) {
    super(props);

    const membersWithHistory = props.data.members;
    const currentMembers = membersWithHistory.filter(d => d.congress === 117);
    this.members = currentMembers;

    this.xScale = d3.scaleLinear().domain([-1, 1]).range([0, width]);
    this.yScale = d3.scaleLinear().domain([-1, 1]).range([height, 0]);
  }

  getMemberVoteColor(m) {
    // const memberAllVotes = this.props.data.membervotes.filter(mv => mv.icpsr == m.icpsr);
    const memberVote = this.props.data.membervotes.filter(mv => mv.icpsr == m.icpsr && mv.rollnumber == this.props.rollnumber)[0];
    if (!memberVote || memberVote.cast_code === 0 || memberVote.cast_code >= 7) {
      return '#ddd';
    } else if (memberVote.cast_code < 4) {
      return '#00cc00';
    } else if (memberVote.cast_code < 7) {
      return '#cc0000'
    } else {
      return '#ddd';
    }
  }

  render() {
    const { hasError, idyll, updateProps, ...props } = this.props;

    return (
      <div>
        <svg
          width={'100%'}
          height={'auto'}
          viewBox={`0 0 ${width} ${height}`}
          style={{ display: 'block', margin: '20px auto', background: 'white', maxHeight: '100vh' }}
        >
          <defs>
            <clipPath id="clipCircle">
              <circle r={6} cx={7.5} cy={7.5}/>
            </clipPath>
          </defs>
          {this.members.map((m) => {
            let mx, my;

            switch(props.optimizeState) {
              case "initialization":
                mx = (Math.random() * 2) - 1;
                my = (Math.random() - 0.5) * 0.25;
                break;
              case "placeVotes":
                mx = (Math.random() * 2) - 1;
                my = (Math.random() - 0.5) * 0.25;
                break;
              case "orderMembers":
                mx = m.nominate_dim1;
                my = (Math.random() - 0.5) * 0.25;
                break;
              case "orderVotes":
                mx = m.nominate_dim1;
                my = (Math.random() - 0.5) * 0.25;
                break;
              case "results":
                mx = m.nominate_dim1;
                my = (Math.random() - 0.5) * 0.25;
                break;
              default:
                break;
            }


            const [mxt, myt] = linearTransform(mx, my);


            return <React.Fragment key={`${m.icpsr}-container`}>
              <circle key={`${m.icpsr}-member`} r={7} fill={PARTY_COLORS[m.party_code]} cx={this.xScale(mxt)} cy={this.yScale(myt)} />
              <image width={15} height={15} href={`static/images/members-small/${pad(m.icpsr, 6)}.jpg`} transform={`translate(${this.xScale(mxt) - 15/2}, ${this.yScale(myt) - 15/2})`} clipPath="url(#clipCircle)" />

              {/* <motion.rect animate={{x: this.xScale(mxt) - 15/2, y: this.yScale(myt) - 15/2}} width={15} height={15} fill={PARTY_COLORS[m.party_code]} opacity={0.2}  transition={{ease: "easeInOut", duration: .75}} initial={false} /> */}
              <motion.circle animate={{x: this.xScale(mxt), y: this.yScale(myt), opacity: props.showMemberVote ? .6 : 0,  fill: this.getMemberVoteColor(m) }} r={6}  transition={{ease: "easeInOut", duration: .75}} initial={false} />
              {/* <circle key={m.icpsr} r={3} fill={PARTY_COLORS[m.party_code]} cx={this.xScale(m.nominate_dim1)} cy={this.yScale(m.nominate_dim2)}  /> */}
            </React.Fragment>
          })}

          {props.data.rollcalls.filter(_ => Math.random() < .05).map((rc, _idx) => {
            let x, y;

            switch(props.optimizeState) {
              case "initialization":
                return null;
                break;
              case "placeVotes":
                x = (Math.random() * 2) - 1;
                y = .25 + (Math.random() - 0.5) / 10;
                break;
              case "orderMembers":
                x = (Math.random() * 2) - 1;
                y = .25 + (Math.random() - 0.5) / 10;
                break;
              case "orderVotes":
                x = rc.nominate_mid_1;
                y = .25 + (Math.random() - 0.5) / 10;
                break;
              case "results":
                x = rc.nominate_mid_1;
                y = .25 + (Math.random() - 0.5) / 10;
                break;
              default:
                break;
            }

            const [xt, yt] = linearTransform(x, y);

            return <circle cx={this.xScale(xt)} cy={this.yScale(yt)} r={3} fill={'#333'} />
          })}
        </svg>
      </div>
    );
  }
}

module.exports = OptimizerVis;
