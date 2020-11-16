import React, { useState, useEffect } from 'react';
import { string, number, bool } from 'prop-types';

const INITIAL_OFFSET = 25;
const circleConfig = {
  viewBox: '0 0 38 38',
  x: '19',
  y: '19',
  radio: '15.91549430918954'
};

const CircleProgressBarBase = ({
  className,
  strokeColor,
  strokeWidth,
  innerText,
  title,
  duration,
  label,
  legendText,
  percentage,
  trailStrokeWidth,
  trailStrokeColor,
  trailSpaced,
  speed,
  tasksCount
}) => {
  const [progressBar, setProgressBar] = useState(0);
  const pace = percentage / speed;
  const updatePercentage = () => {
    setTimeout(() => {
      setProgressBar(progressBar + 1);
    }, pace);
  };

  useEffect(() => {
    if (percentage > 0) updatePercentage();
    // eslint-disable-next-line
  }, [percentage]);

  useEffect(() => {
    if (progressBar < percentage) updatePercentage();
    // eslint-disable-next-line
  }, [progressBar]);

  return (
    <figure className={className}>
      <svg viewBox={circleConfig.viewBox}>
        <circle
          className="donut-ring"
          cx={circleConfig.x}
          cy={circleConfig.y}
          r={circleConfig.radio}
          fill="transparent"
          stroke={trailStrokeColor}
          strokeWidth={trailStrokeWidth}
          strokeDasharray={trailSpaced ? 1 : 0}
        />

        <circle
          className="donut-segment"
          cx={circleConfig.x}
          cy={circleConfig.y}
          r={circleConfig.radio}
          fill="transparent"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={`${progressBar} ${100 - progressBar}`}
          strokeDashoffset={INITIAL_OFFSET}
        />

        <g className="chart-text">
          {/* <text x="50%" y="50%" className="chart-number"> */}
            {/* {progressBar}% */}
          {/* </text> */}
          {/* <text x="50%" y="30%" className="chart-label">
            {innerText}
          </text> */}
          {/* <text x="50%" y="18%" className="chart-label-t">
            {title}
          </text>
          <line x1="15%" y1="28%" x2="85%" y2="28%" className="chart-line" /> */}
          <text x="50%" y="15%" className="chart-label cl-h" fill="grey">
            Duration:
          </text>
            <text x="50%" y="23%" className="chart-label" fill="black">{duration}</text>
          <text x="50%" y="33%" className="chart-label cl-h" fill="grey">
            Label:
          </text>
            <text x="50%" y="41%" className="chart-label" fill="black">{label}</text>
          <text x="50%" y="49%" className="chart-label cl-h cl-h-a" fill="grey">
            Task
          </text>
            <circle cx="19.2" cy="24.8" r="3.5" fill="#7530E9" />
        <text x="50%" y="60%" className="chart-label cl-a" fill="#4affff">{tasksCount}</text>
        </g>
      </svg>
      {legendText && (
        <figcaption className="figure-key">
          <ul
            className="figure-key-list"
            aria-hidden="true"
            role="presentation"
          >
            <li>
              <span className="shape-circle" />
              <span>{legendText}</span>
            </li>
          </ul>
        </figcaption>
      )}
    </figure>
  );
};

CircleProgressBarBase.propTypes = {
  className: string.isRequired,
  strokeColor: string,
  strokeWidth: number,
  innerText: string,
  legendText: string,
  percentage: number,
  trailStrokeWidth: number,
  trailStrokeColor: string,
  trailSpaced: bool,
  speed: number
};

CircleProgressBarBase.defaultProps = {
  strokeColor: 'blueviolet',
  strokeWidth: 1,
  innerText: 'Completed',
  legendText: '',
  percentage: 0,
  trailStrokeWidth: 1,
  trailStrokeColor: '#d2d3d4',
  trailSpaced: false,
  speed: 1
};

export default CircleProgressBarBase;