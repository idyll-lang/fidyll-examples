const React = require('react');

class SlideIndex extends React.Component {

  render() {
    return <div style={{ position: 'fixed', right: '1em', top: '1em', fontWeight: 'bold' }}>
      {this.props.index}
    </div>;
  }
}

module.exports = SlideIndex;
