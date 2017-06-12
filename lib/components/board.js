import { html } from 'diffhtml';
import Component from 'diffhtml-components/lib/component';

export default class Board extends Component {
  render() {
    const { x, y, width, children, style } = this.props;
    const { color } = this;
    const height = 300;

    return html`
      <g onclick=${this.click} transform=${`translate(${x}, ${y})`}>
        <rect
          class="background"
          x="0"
          y="0"
          rx="8"
          ry="8"
          fill=${this.state.color || "#8C5831"}
          style=${{ width, height }}
        />
      </g>
    `;
  }

  static defaultProps = {
    x: 10,
    y: 10,
    width: 50,
  }

  click = ev => {
    if (this.state.color !== 'red') {
      this.setState({ color: 'red' });
    }
    else {
      this.setState({ color: 'blue' });
    }
  }
}
