const React = require('react');

class VideoStepper extends React.Component {

  componentDidMount() {
    console.log('stepper did mount', this.props.index, this.props.length);
    const update = () => {
      let currentIndex = this.props.index;
      console.log('updating', currentIndex);
      if (currentIndex < this.props.length - 1) {

        console.log('did update!!');
        this.props.updateProps({
          index: currentIndex + 1
        })
        setTimeout(update, 1000);
      } else {
        console.log('did not update');
      }
    }

    setTimeout(update, 1000);
  }

  render() {
    return null;
  }
}

module.exports = VideoStepper;
