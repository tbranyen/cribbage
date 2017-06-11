import { html } from 'diffhtml';
import Component from 'diffhtml-components/lib/component';

export default class Card extends Component {
  render() {
    const { x, y, width, facing, value, children } = this.props;
    const { suit, label } = this;
    const height = width * 1.4;
    const fontSize = Math.round(width * 0.20);
    const graphicSize = Math.round(width * 0.30);
    const fontX = Math.round(width * 0.12);
    const fontY = Math.round(width * 0.24);
    const isRed = suit === 'diamond' || suit == 'heart';

    return html`
      <g transform=${`translate(${x}, ${y})`} width=${width} height=${height}>
        <rect
          class="background"
          x="0"
          y="0"
          width=${width}
          height=${height}
          rx="8"
          ry="8"
          fill="#303030"
        />

        ${facing && html`
          <rect
            class="foreground"
            x="2"
            y="2"
            width=${width - 4}
            height=${height - 4}
            rx="8"
            ry="8"
            fill="url(#card_background)"
          />

          <g class="top" text-anchor="start">
            <text
              class="label-top"
              font-weight="bold"
              font-size=${fontSize}
              fill=${isRed ? '#FF0000' : '#000000'}
              x=${fontX}
              y=${fontY}
            >${label}</text>

            <text
              class="suit-top"
              font-weight="bold"
              font-size=${graphicSize}
              fill=${isRed ? '#FF0000' : '#000000'}
              x=${fontX}
              y=${fontY * 2}
            >
              ${suit === 'heart' && '♥'}
              ${suit === 'spade' && '♠'}
              ${suit === 'diamond' && '♦'}
              ${suit === 'club' && '♣'}
            </text>
          </g>

          <g class="bottom" text-anchor="end">
            <text
              class="label-bottom"
              font-weight="bold"
              font-size=${fontSize}
              fill=${isRed ? '#FF0000' : '#000000'}
              x=${width - (fontX)}
              y=${height - (fontY * 0.65)}
            >${label}</text>

            <text
              class="suit-bottom"
              font-weight="bold"
              font-size=${graphicSize}
              fill=${isRed ? '#FF0000' : '#000000'}
              x=${width - (fontX)}
              y=${height - (fontY * 1.5)}
            >
              ${suit === 'heart' && '♥'}
              ${suit === 'spade' && '♠'}
              ${suit === 'diamond' && '♦'}
              ${suit === 'club' && '♣'}
            </text>
          </g>
        `}
      </g>
    `;
  }

  constructor(props) {
    super(props);

    this.update(props);
  }

  componentWillReceiveProps(nextProps) {
    this.update(nextProps);
    this.props = nextProps;
  }

  update(nextProps) {
    const { value } = nextProps;

    this.value = value;
    this.label = (value % 13) + 1;

    switch (this.label) {
      case 1: {
        this.label = "A";
        this.value = 1;

        break;
      }

      case 11: {
        this.label = "J";
        this.value = 10;

        break;
      }

      case 12: {
        this.label = "Q";
        this.value = 10;

        break;
      }

      case 13: {
        this.label = "K";
        this.value = 10;

        break;
      }
    }

    const index = Math.floor((value / 52) * 4);
    this.suit = ['heart', 'spade', 'diamond', 'club'][index];
  }

  static defaultProps = {
    x: 10,
    y: 10,
    width: 50,
    facing: true,
  }
}
