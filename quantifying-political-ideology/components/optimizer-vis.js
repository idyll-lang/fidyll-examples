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
    this.members = currentMembers.filter(_ => Math.random() < .05 );
    this.rollcalls = props.data.rollcalls.filter((rc) => props.rollcalls.includes(rc.rollnumber));

    this.xScale = d3.scaleLinear().domain([-1, 1]).range([0, width]);
    this.yScale = d3.scaleLinear().domain([-1, 1]).range([height, 0]);

    this.memberYs = Object.fromEntries(this.members.map((m) => {
      return [m.icpsr, -.5 + Math.random() * 0.75]
    }));
    this.rollcallYs = Object.fromEntries(this.rollcalls.map((rc) => {
      return [rc.rollnumber, .25 + (Math.random() - 0.5) / 10]
    }));
    this.state = {
      memberXs: Object.fromEntries(this.members.map((m) => {
        return [m.icpsr, (Math.random() * 2) - 1]
      })),
      rollcallXs: Object.fromEntries(this.rollcalls.map((rc) => {
        return [rc.rollnumber, rc.nominate_mid_1]
      })),
      rollcallOrientations: Object.fromEntries(this.rollcalls.map((rc) => {
        return [rc.rollnumber, -1 * Math.sign(rc.nominate_spread_1)]
      }))
    }

  }

  getMemberVoteColor(icpsr, rollnumber) {
    // const memberAllVotes = this.props.data.membervotes.filter(mv => mv.icpsr == m.icpsr);
    const memberVote = this.props.data.membervotes.filter(mv => mv.icpsr == icpsr && mv.rollnumber == rollnumber)[0];
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

  getMemberVote(icpsr, rollnumber) {
    const memberVote = this.props.data.membervotes.filter(mv => mv.icpsr == icpsr && mv.rollnumber == rollnumber)[0];
    if (!memberVote || memberVote.cast_code === 0 || memberVote.cast_code >= 7) {
      return null;
    } else if (memberVote.cast_code < 4) {
      return 'yay';
    } else if (memberVote.cast_code < 7) {
      return 'nay'
    } else {
      return null;
    }
  }

  componentDidUpdate(oldProps) {

    const optimizerDelta = 0.1;
    if (this.props.optimizeState !== oldProps.optimizeState) {
      switch(this.props.optimizeState) {
        case "initialization":
          this.setState({
            memberXs: Object.fromEntries(this.members.map((m) => {
              return [m.icpsr, (Math.random() * 2) - 1]
            })),
            rollcallXs: Object.fromEntries(this.rollcalls.map((rc) => {
              return [rc.rollnumber, (Math.random() * 2) - 1]
            }))
          })
          break;
        case "placeVotes":
          break;
        case "orderMembers":
          const newNewmemberXs = Object.fromEntries(Object.keys(this.state.memberXs).map(icpsr => {

            let minClassificationErrors = Number.POSITIVE_INFINITY;
            let minClassificationX = -1;

            console.log('Optimizing position of member ', icpsr);
            Object.keys(this.state.rollcallXs).forEach((rollnumber, rollIdx) => {
              const rollcallX = this.state.rollcallXs[rollnumber];

              let classificationErrors = 0;
              // if (rollIdx === 0) {
                // check what happens if we place the member before
                classificationErrors = Object.keys(this.state.rollcallXs).reduce((memo, checkRollnum) => {
                  const checkX = this.state.rollcallXs[checkRollnum];
                  const rollcallOrientation = this.state.rollcallOrientations[checkRollnum];
                  const memberVote = this.getMemberVote(icpsr, checkRollnum);

                  // member to the left
                  if ((rollcallX - optimizerDelta) < (checkX) && ((memberVote === 'yay' && rollcallOrientation === 1) || (memberVote === 'nay' && rollcallOrientation === -1))) {
                    return memo + 1;
                  } else if ((rollcallX - optimizerDelta) > (checkX) && ((memberVote === 'yay' && rollcallOrientation === -1) || (memberVote === 'nay' && rollcallOrientation === 1))) { // member to the right
                    return memo + 1;
                  }
                  return memo;
                }, 0);

                console.log(classificationErrors, ' errors putting the member before rollnumber ', rollnumber);

                if (classificationErrors < minClassificationErrors) {
                  minClassificationX = rollcallX - optimizerDelta - Math.random() / 100;
                  minClassificationErrors = classificationErrors;
                } else if (classificationErrors === minClassificationErrors && Math.abs(rollcallX - optimizerDelta) < Math.abs(minClassificationX)) {
                  minClassificationX = rollcallX - optimizerDelta - Math.random() / 100;
                }

              // }

              // check what happns if we place the member after
              classificationErrors = Object.keys(this.state.rollcallXs).reduce((memo, checkRollnum) => {
                const checkX = this.state.rollcallXs[checkRollnum];
                const rollcallOrientation = this.state.rollcallOrientations[checkRollnum];
                const memberVote = this.getMemberVote(icpsr, checkRollnum);

                // member to the left
                if ((rollcallX + optimizerDelta) < (checkX) && ((memberVote === 'yay' && rollcallOrientation === 1) || (memberVote === 'nay' && rollcallOrientation === -1))) {
                  return memo + 1;
                } else if ((rollcallX + optimizerDelta) > (checkX) && ((memberVote === 'yay' && rollcallOrientation === -1) || (memberVote === 'nay' && rollcallOrientation === 1))) { // member to the right
                  return memo + 1;
                }
                return memo;
              }, 0);

              console.log(classificationErrors, ' errors putting the member after rollnumber ', rollnumber);
              if (classificationErrors < minClassificationErrors) {
                minClassificationX = rollcallX + optimizerDelta + Math.random() / 100;
                minClassificationErrors = classificationErrors;
              } else if (classificationErrors === minClassificationErrors && Math.abs(rollcallX + optimizerDelta) < Math.abs(minClassificationX)) {
                minClassificationX = rollcallX + optimizerDelta + Math.random() / 100;
              }

            });

            console.log('minimum classifiication errors was ', minClassificationErrors);

            return [icpsr, minClassificationX];
          }));

          Object.keys(newNewmemberXs).forEach((k, idx) => {
            setTimeout(() => {
              const updated = {...this.state.memberXs};
              updated[k] = newNewmemberXs[k];
              this.setState({
                memberXs: updated
              });
              // this.props.updateProps({
              //   rollcallFocus:
              // })
            }, idx * 100)
          })

          break;
        case "orderVotes":
          const newRollcallData = Object.keys(this.state.rollcallXs).map(rollnumber => {

            let minClassificationErrors = Number.POSITIVE_INFINITY;
            let minClassificationX = -1;
            let minClassificationOrientation = -1;

            Object.keys(this.state.memberXs).forEach((_icpsr, memberIdx) => {
              const memberX = this.state.memberXs[_icpsr];


              let classificationErrors = 0;

              [-1, 1].forEach((testOrientation) => {
                // check what happens if we place the member before
                classificationErrors = Object.keys(this.state.memberXs).reduce((memo, icpsr) => {
                  const checkX = this.state.memberXs[icpsr];
                  const memberVote = this.getMemberVote(icpsr, rollnumber);

                  // member to the left
                  if ((memberX - optimizerDelta) > (checkX) && ((memberVote === 'yay' && testOrientation === 1) || (memberVote === 'nay' && testOrientation === -1))) {
                    return memo + 1;
                  } else if ((memberX - optimizerDelta) < (checkX) && ((memberVote === 'yay' && testOrientation === -1) || (memberVote === 'nay' && testOrientation === 1))) { // member to the right
                    return memo + 1;
                  }
                  return memo;
                }, 0);

                console.log(classificationErrors, ' errors putting the vote before member ', _icpsr);
                if (classificationErrors < minClassificationErrors) {
                  minClassificationX = memberX - optimizerDelta - Math.random() / 100;
                  minClassificationErrors = classificationErrors;
                  minClassificationOrientation = testOrientation;
                } else if (classificationErrors === minClassificationErrors && Math.abs(memberX - optimizerDelta) < Math.abs(minClassificationX)) {
                  minClassificationX = memberX - optimizerDelta - Math.random() / 100;
                  minClassificationOrientation = testOrientation;
                }

                // check what happns if we place the member after
                classificationErrors = Object.keys(this.state.memberXs).reduce((memo, icpsr) => {
                  const checkX = this.state.memberXs[icpsr];
                  const memberVote = this.getMemberVote(icpsr, rollnumber);

                  // member to the left
                  if ((memberX + optimizerDelta) > (checkX) && ((memberVote === 'yay' && testOrientation === 1) || (memberVote === 'nay' && testOrientation === -1))) {
                    return memo + 1;
                  } else if ((memberX + optimizerDelta) < (checkX) && ((memberVote === 'yay' && testOrientation === -1) || (memberVote === 'nay' && testOrientation === 1))) { // member to the right
                    return memo + 1;
                  }
                  return memo;
                }, 0);

                console.log(classificationErrors, ' errors putting the vote after member ', _icpsr);
                if (classificationErrors < minClassificationErrors) {
                  minClassificationX = memberX + optimizerDelta + Math.random() / 100;
                  minClassificationErrors = classificationErrors;
                  minClassificationOrientation = testOrientation;
                } else if (classificationErrors === minClassificationErrors && Math.abs(memberX + optimizerDelta) < Math.abs(minClassificationX)) {
                  minClassificationX = memberX + optimizerDelta + Math.random() / 100;
                  minClassificationOrientation = testOrientation;
                }

              })

            })
            return [rollnumber, minClassificationX, minClassificationOrientation];
          });

          this.setState({
            rollcallXs: Object.fromEntries(newRollcallData.map(([rollnumber, minClassificationX, minClassificationOrientation]) => {
              return [rollnumber, minClassificationX];
            })),
            rollcallOrientations: Object.fromEntries(newRollcallData.map(([rollnumber, minClassificationX, minClassificationOrientation]) => {
              return [rollnumber, minClassificationOrientation];
            }))
          })
          break;
        case "results":
          // mx = m.nominate_dim1;
          // my = (Math.random() - 0.5) * 0.25;
          break;
        default:
          break;
      }
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
            <clipPath id="clipCircleOpt">
              <circle r={6} cx={7.5} cy={7.5}/>
            </clipPath>
          </defs>
          <line x1={30} x2={width - 30} y1={height - 80} y2={height - 80} stroke={'#999'} strokeWidth={1}></line>
          <text x={width / 2} y={height - 70} fill={'#999'} fontSize={10} fontWeight={'bold'} textAnchor={'middle'} style={{textTransform: 'uppercase'}}>
            Left-Right
          </text>
          {this.members.map((m) => {
            let mx = this.state.memberXs[m.icpsr];
            let my = this.memberYs[m.icpsr];
            const [mxt, myt] = linearTransform(mx, my);


            return <React.Fragment key={`${m.icpsr}-container`}>
              <motion.circle r={7} fill={PARTY_COLORS[m.party_code]} animate={{cx: this.xScale(mxt), cy: this.yScale(myt)}} transition={{ease: "linear", duration: .25}} initial={false} />
              <motion.image width={15} height={15} href={`static/images/members-small/${pad(m.icpsr, 6)}.jpg`} animate={{x: this.xScale(mxt) - 15/2,  y: this.yScale(myt) - 15/2 }} clipPath="url(#clipCircleOpt)" transition={{ease: "linear", duration: .25}} initial={false} />

              {/* <motion.rect animate={{x: this.xScale(mxt) - 15/2, y: this.yScale(myt) - 15/2}} width={15} height={15} fill={PARTY_COLORS[m.party_code]} opacity={0.2}  transition={{ease: "easeInOut", duration: .75}} initial={false} /> */}
              {/* <motion.circle animate={{x: this.xScale(mxt), y: this.yScale(myt), opacity: props.showMemberVote ? .6 : 0,  fill: this.getMemberVoteColor(m) }} r={6}  transition={{ease: "easeInOut", duration: .75}} initial={false} /> */}
              {/* <circle key={m.icpsr} r={3} fill={PARTY_COLORS[m.party_code]} cx={this.xScale(m.nominate_dim1)} cy={this.yScale(m.nominate_dim2)}  /> */}

              {props.showVotes ? <motion.circle r={6} animate={{fill: this.getMemberVoteColor(m.icpsr, props.rollcallFocus),  cx: this.xScale(mxt), cy: this.yScale(myt) }} transition={{ease: "linear", duration: .25}} initial={false} /> : null}
            </React.Fragment>
          })}

          {!['initialization'].includes(props.optimizeState) ? this.rollcalls.map((rc, _idx) => {
            let x = this.state.rollcallXs[rc.rollnumber];
            let y = this.rollcallYs[rc.rollnumber];


            const [xt, yt] = linearTransform(x, y);

            if (rc.rollnumber == props.rollcallFocus) {
              return <React.Fragment>
                <circle key={rc.rollnumber} cx={this.xScale(xt)} cy={this.yScale(yt)} r={6} fill={'#333'} />
                <circle key={rc.rollnumber} cx={this.xScale(xt) - 5} cy={this.yScale(yt)} r={3} fill={-1 * Math.sign(rc.nominate_spread_1) === 1 ? '#cc0000' : '#00cc00'} />
                <circle key={rc.rollnumber} cx={this.xScale(xt) + 5} cy={this.yScale(yt)} r={3} fill={-1 * Math.sign(rc.nominate_spread_1) === 1 ? '#00cc00' : '#cc0000'} />
              </React.Fragment>
            }

            return <circle key={rc.rollnumber} cx={this.xScale(xt)} cy={this.yScale(yt)} r={rc.rollnumber == props.rollcallFocus ? 6 : 3} fill={'#333'} />
          }) : null}
        </svg>
      </div>
    );
  }
}

module.exports = OptimizerVis;
