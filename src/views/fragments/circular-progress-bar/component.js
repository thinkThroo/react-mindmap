import styled from 'styled-components';
import { string } from 'prop-types';

import CircleProgressBarBase from './base';

const CircleProgressBar = styled(CircleProgressBarBase)`
  max-width: ${props => props.maxSize};
  vertical-align: middle;
  .chart-text {
    fill: ${props => props.textColor};
    transform: translateY(0.25em);
  }
  .chart-number {
    font-size: 0.6em;
    line-height: 1;
    text-anchor: middle;
    transform: translateY(-0.25em);
  }
  .chart-label-t {
    font-size: 0.25em;
    text-transform: uppercase;
    text-anchor: middle;
    transform: translateY(0.7em);
    display: block;
  }
  .chart-label {
    font-size: 0.16em;
    // text-transform: uppercase;
    text-anchor: middle;
    transform: translateY(0.7em);
    display: block;
  }
  .cl-h{
    font-size: 0.15em;
  }
  .cl-h-a {
    font-size: 0.15em;
  }
  .cl-a {
    font-size: 0.3em;
  }
  .chart-line {
    stroke: rgb(0,0,0);
    stroke-width: 0.12;
  }
  .figure-key [class*='shape-'] {
    margin-right: 8px;
  }
  .figure-key-list {
    list-style: none;
    display: flex;
    justify-content: space-between;
  }
  .figure-key-list li {
    margin: 5px auto;
  }
  .shape-circle {
    display: inline-block;
    vertical-align: middle;
    width: 21px;
    height: 21px;
    border-radius: 50%;
    background-color: ${props => props.strokeColor};
    text-transform: capitalize;
  }
`;

CircleProgressBar.propTypes = {
  textColor: string,
  strokeColor: string,
  maxSize: string
};

CircleProgressBar.defaultProps = {
  textColor: 'black',
  strokeColor: 'blueviolet',
  maxSize: '100vh'
};

export default CircleProgressBar;