import React from 'react';
import styled from 'styled-components';

const ScheduleButton = ({ onClick, children }) => {
  return (
    <StyledWrapper>
      <button type="button" className="btn" onClick={onClick}>
        <div className="wrapper">
          <p className="text">Schedule</p>
          <div className="flower flower1">
            <div className="petal one" />
            <div className="petal two" />
            <div className="petal three" />
            <div className="petal four" />
          </div>
          <div className="flower flower2">
            <div className="petal one" />
            <div className="petal two" />
            <div className="petal three" />
            <div className="petal four" />
          </div>
          <div className="flower flower3">
            <div className="petal one" />
            <div className="petal two" />
            <div className="petal three" />
            <div className="petal four" />
          </div>
          <div className="flower flower4">
            <div className="petal one" />
            <div className="petal two" />
            <div className="petal three" />
            <div className="petal four" />
          </div>
          <div className="flower flower5">
            <div className="petal one" />
            <div className="petal two" />
            <div className="petal three" />
            <div className="petal four" />
          </div>
          <div className="flower flower6">
            <div className="petal one" />
            <div className="petal two" />
            <div className="petal three" />
            <div className="petal four" />
          </div>
        </div>
      </button>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .btn {
    height: 3.2em;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: 0px solid black;
    cursor: pointer;
  }

  .wrapper {
    height: 2em;
    width: 100%;
    position: relative;
    background: transparent;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .text {
    font-size: 12px;
    z-index: 1;
    color: #ffffff;
    padding: 4px 8px;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(4px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: all 0.5s ease;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  .flower {
    display: grid;
    grid-template-columns: 0.7em 0.7em;
    position: absolute;
    transition: grid-template-columns 0.8s ease;
  }

  .flower1 {
    top: -10px;
    left: -10px;
    transform: rotate(5deg);
  }

  .flower2 {
    bottom: -4px;
    left: 6px;
    transform: rotate(35deg);
  }

  .flower3 {
    bottom: -12px;
    transform: rotate(0deg);
  }

  .flower4 {
    top: -12px;
    transform: rotate(15deg);
  }

  .flower5 {
    right: 8px;
    top: -2px;
    transform: rotate(25deg);
  }

  .flower6 {
    right: -12px;
    bottom: -12px;
    transform: rotate(30deg);
  }

  .petal {
    height: 0.7em;
    width: 0.7em;
    border-radius: 40% 70% / 7% 90%;
    background: linear-gradient(#4AE176, #CBF8D9); /* Green emerald theme */
    border: 0.5px solid #4AE176;
    z-index: 0;
    transition: width 0.8s ease, height 0.8s ease;
  }

  .two {
    transform: rotate(90deg);
  }

  .three {
    transform: rotate(270deg);
  }

  .four {
    transform: rotate(180deg);
  }

  .btn:hover .petal {
    background: linear-gradient(#2F9E52, #4AE176);
    border: 0.5px solid #2F9E52;
  }

  .btn:hover .flower {
    grid-template-columns: 1em 1em;
  }

  .btn:hover .flower .petal {
    width: 1em;
    height: 1em;
  }

  .btn:hover .text {
    background: rgba(74, 225, 118, 0.2);
    border-color: #4AE176;
    color: #4AE176;
  }

  .btn:focus,
  .btn:focus-visible {
    outline: 2px solid #4AE176;
    outline-offset: 3px;
  }

  .btn:focus .petal,
  .btn:focus-visible .petal {
    background: linear-gradient(#2F9E52, #4AE176);
    border: 0.5px solid #2F9E52;
  }

  .btn:focus .flower,
  .btn:focus-visible .flower {
    grid-template-columns: 1em 1em;
  }

  .btn:focus .flower .petal,
  .btn:focus-visible .flower .petal {
    width: 1em;
    height: 1em;
  }

  .btn:focus .text,
  .btn:focus-visible .text {
    background: rgba(74, 225, 118, 0.2);
    border-color: #4AE176;
    color: #4AE176;
  }

  .btn:hover div.flower1 {
    animation: 15s linear 0s normal none infinite running flower1;
  }

  @keyframes flower1 {
    0% {
      transform: rotate(5deg);
    }

    100% {
      transform: rotate(365deg);
    }
  }

  .btn:hover div.flower2 {
    animation: 13s linear 1s normal none infinite running flower2;
  }

  @keyframes flower2 {
    0% {
      transform: rotate(35deg);
    }

    100% {
      transform: rotate(-325deg);
    }
  }

  .btn:hover div.flower3 {
    animation: 16s linear 1s normal none infinite running flower3;
  }

  @keyframes flower3 {
    0% {
      transform: rotate(0deg);
    }

    100% {
      transform: rotate(360deg);
    }
  }

  .btn:hover div.flower4 {
    animation: 17s linear 1s normal none infinite running flower4;
  }

  @keyframes flower4 {
    0% {
      transform: rotate(15deg);
    }

    100% {
      transform: rotate(375deg);
    }
  }

  .btn:hover div.flower5 {
    animation: 20s linear 1s normal none infinite running flower5;
  }

  @keyframes flower5 {
    0% {
      transform: rotate(25deg);
    }

    100% {
      transform: rotate(-335deg);
    }
  }

  .btn:hover div.flower6 {
    animation: 15s linear 1s normal none infinite running flower6;
  }

  @keyframes flower6 {
    0% {
      transform: rotate(30deg);
    }

    100% {
      transform: rotate(390deg);
    }
  }`;

export default ScheduleButton;
