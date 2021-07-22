const React = require('react');
const d3 = require('d3');

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

class VoteExplainer extends React.Component {

  constructor(props) {
    super(props);

    const membersWithHistory = props.data.members;
    const currentMembers = membersWithHistory.filter(d => d.congress === 117);
    this.members = currentMembers;

    this.xScale = d3.scaleLinear().domain([-1, 1]).range([0, width]);
    this.yScale = d3.scaleLinear().domain([-1, 1]).range([height, 0]);
  }
  render() {
    const { hasError, idyll, updateProps, ...props } = this.props;

    const selectedMemeberHistory = props.data.members.filter(m => {
      return m.icpsr === props.member_id;
    })
    return (
      <div {...props}>
        <svg
          width={'100%'}
          height={'auto'}
          viewBox={`0 0 ${width} ${height}`}
          style={{ display: 'block', margin: '20px auto', background: 'white' }}
        >
          {selectedMemeberHistory.map((m, i) => {
            return <circle key={m.icpsr + '-' + m.congress} r={3} opacity={i === selectedMemeberHistory.length - 1 ? 1 : 0.6} fill={PARTY_COLORS[m.party_code]} cx={this.xScale(m.nominate_dim1)} cy={this.yScale(m.nominate_dim2)}  />
          })}
        </svg>
      </div>
    );
  }
}

module.exports = VoteExplainer;
