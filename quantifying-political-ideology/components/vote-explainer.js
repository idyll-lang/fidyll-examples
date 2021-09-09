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

class VoteExplainer extends React.Component {

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

    let linearTransform = (x, y) => {
      return [x, y];
    }

    if (props.transformCoordinates) {
      linearTransform = (x, y, x0, y0, s1, s2) => {
        const xt = x - x0;
        const yt = y - y0;

        const dimWeightTwo = 0.4158127;
        const cuttingLineSlope = -1 * s1 / (s2 * Math.pow(dimWeightTwo, 2));


        let theta = 0;
        let cuttingLineAngle = 0;

        if (Number.isNaN(cuttingLineSlope)) {
          theta = 0;
        } else if (cuttingLineSlope < 0) {
          theta = Math.atan2(1, Math.abs(cuttingLineSlope));
        } else if (cuttingLineSlope > 0) {
          theta = (2 * Math.PI) - (Math.PI / 2 - Math.atan2(cuttingLineSlope, 1));
        } else {
          theta = Math.PI / 4;
        }

        // const theta = Math.PI / 4 - cuttingLineAngle + Math.PI / 4;
        const c = Math.cos(theta); // compute trig. functions only once
        const s = -1 * Math.sin(theta);

        const xr = xt * c - yt * s;
        const yr = xt * s + yt * c;
        return [xr, yr];
      }
    }

    return (
      <div>
        <svg
          width={'100%'}
          height={'auto'}
          viewBox={`0 0 ${width} ${height}`}
          style={{ display: 'block', margin: '20px auto', background: 'white', maxHeight: '100vh' }}
        >
          {props.data.rollcalls.filter((d, i) => d.rollnumber === this.props.rollnumber).map(rc => {

            const x = rc.nominate_mid_1;
            const y = rc.nominate_mid_2;

            const [xt, yt] = linearTransform(x, y, rc.nominate_mid_1, rc.nominate_mid_2, rc.nominate_spread_1, rc.nominate_spread_2);

            const _x1 = rc.nominate_mid_1 - rc.nominate_spread_1 / 2;
            const _x2 = rc.nominate_mid_1 + rc.nominate_spread_1 / 2;
            const _y1 = rc.nominate_mid_2 - rc.nominate_spread_2 / 2;
            const _y2 = rc.nominate_mid_2 + rc.nominate_spread_2 / 2;

            const x1 = Math.min(_x1, _x2);
            const x2 = Math.max(_x1, _x2);
            const y1 = Math.max(_y1, _y2);
            const y2 = Math.min(_y1, _y2);

            const [x1t, y1t] = linearTransform(x1, y1, rc.nominate_mid_1, rc.nominate_mid_2, rc.nominate_spread_1, rc.nominate_spread_2);
            const [x2t, y2t] = linearTransform(x2, y2, rc.nominate_mid_1, rc.nominate_mid_2, rc.nominate_spread_1, rc.nominate_spread_2);

            const dimWeightTwo = 0.4158127;
            const cuttingLineSlope = -1 * rc.nominate_spread_1 / (rc.nominate_spread_2 * Math.pow(dimWeightTwo, 2));
            const cuttingLineIntercept = y - cuttingLineSlope * x;

            const lineX1 = -1;
            const lineX2 = 1;
            const lineY1 = cuttingLineSlope * lineX1 + cuttingLineIntercept;
            const lineY2 = cuttingLineSlope * lineX2 + cuttingLineIntercept;

            // const lx1 = Math.min(lineX1, lineX2) || -1;
            // const lx2 = Math.max(lineX1, lineX2) || 1;
            // const ly1 = Math.max(lineY1, lineY2) || 1;
            // const ly2 = Math.min(lineY1, lineY2) || -1;
            const lx1 = lineX1;
            const lx2 = lineX2;
            const ly1 = lineY1;
            const ly2 = lineY2;

            let [lx1t, ly1t] = linearTransform(lx1, ly1, rc.nominate_mid_1, rc.nominate_mid_2, rc.nominate_spread_1, rc.nominate_spread_2);
            let [lx2t, ly2t] = linearTransform(lx2, ly2, rc.nominate_mid_1, rc.nominate_mid_2, rc.nominate_spread_1, rc.nominate_spread_2);

            console.log('line transform top left: ', lx1, ly1, lx1t, ly1t);
            console.log('line transform bottom right: ', lx2, ly2, lx2t, ly2t);

            if (Number.isNaN(cuttingLineSlope)) {
              [lx1t, ly1t] = [0, -1];
              [lx2t, ly2t] = [0, 1];
            }

            if (ly2t > ly1t) {
              [lx1t, lx2t, ly1t, ly2t] = [lx2t, lx1t, ly2t, ly1t];
            }
            // [lx1t, lx2t] = [Math.min(lx1t, lx2t), Math.max(lx1t, lx2t)];
            // [ly1t, ly2t] = [Math.max(ly1t, ly2t), Math.max(ly1t, ly2t)];


            return (<React.Fragment key={`${rc.rollnumber}-contain`}>
              {this.members.map((m) => {
                const mx = m.nominate_dim1;
                const my = m.nominate_dim2;

                const [mxt, myt] = linearTransform(mx, my, rc.nominate_mid_1, rc.nominate_mid_2, rc.nominate_spread_1, rc.nominate_spread_2);

                return <React.Fragment key={`${m.icpsr}-container`}>
                  <motion.image  key={`${m.icpsr}-member`} width={15} height={15} href={`static/images/members/${pad(m.icpsr, 6)}.jpg`} animate={{x: this.xScale(mxt) - 15/2, y: this.yScale(myt) - 15/2 }} transition={{ease: "easeInOut", duration: .75}} >
                  </motion.image>
                  <motion.rect animate={{x: this.xScale(mxt) - 15/2, y: this.yScale(myt) - 15/2}} width={15} height={15} fill={PARTY_COLORS[m.party_code]} opacity={0.2}  transition={{ease: "easeInOut", duration: .75}} />
                  <motion.rect animate={{x: this.xScale(mxt) - 15/2, y: this.yScale(myt) + 15/2 - 5, opacity: props.showMemberVote ? 1 : 0}} width={15} height={5} fill={this.getMemberVoteColor(m)}  transition={{ease: "easeInOut", duration: .75}} />
                  {/* <circle key={m.icpsr} r={3} fill={PARTY_COLORS[m.party_code]} cx={this.xScale(m.nominate_dim1)} cy={this.yScale(m.nominate_dim2)}  /> */}
                  {/* <motion.circle key={`${m.icpsr}-member`} r={3} animate={{fill: props.showMemberVote ? this.getMemberVoteColor(m) : PARTY_COLORS[m.party_code], cx: , cy:  }} transition={{ease: "easeInOut", duration: .75}}  /> */}
                </React.Fragment>
              })}
              {props.colorBg ? <rect  key={`${rc.rollnumber}-status`}  opacity={0.125} fill={VOTE_STATUS_COLORS[rc.vote_result]} x={0} y={0} width={width} height={height} /> : null}
              {/* <rect opacity={0.25} fill={VOTE_STATUS_COLORS[rc.vote_result]} x={this.xScale(x1t)} y={this.yScale(y1t)} width={this.xScale(x2t) - this.xScale(x1t)} height={Math.max(this.yScale(y2t) - this.yScale(y1t)) || 10} /> */}
              <motion.line  key={`${rc.rollnumber}-cuttingline`} stroke={'#999'} animate={{x1: this.xScale(lx1t), x2: this.xScale(lx2t), y1: this.yScale(ly1t), y2: this.yScale(ly2t) }} transition={{ease: "easeInOut", duration: .75}} />
              <motion.rect  key={`${rc.rollnumber}-votecenter`} fill={VOTE_STATUS_COLORS[rc.vote_result]} animate={{ x: this.xScale(xt) - 5, y: this.yScale(yt) - 5 }} transition={{ease: "easeInOut", duration: .75}} width={10} height={10} />
            </React.Fragment>)
          })}
        </svg>
      </div>
    );
  }
}

module.exports = VoteExplainer;
