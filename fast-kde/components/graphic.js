const React = require('react');

class Graphic extends React.Component {
  render() {
    const { idyll, updateProps, hasError, children, error, title, subtitle, displayParameters, ...props } = this.props;

    console.log('graphic props', props)
    return (
      <div className="idyll-graphic">
        {(title || subtitle) ?
          <div>
            {title ? <div><b>{title}</b></div> : null}
            {subtitle ? <div>{subtitle}</div> : null}
          </div>
        : null}
        <div>
          {children}
        </div>
        {
          displayParameters ? <details>
            <summary>Parameters</summary>
            {Object.keys(props).map((k) => {
              return <div key={k}>
                <div>{k}: {'' + props[k]}</div>
              </div>
            })}
          </details> : null
        }
      </div>
    );
  }
}

Graphic._idyll = {
  name: "Graphic",
  tagType: "open"
}

module.exports = Graphic;
