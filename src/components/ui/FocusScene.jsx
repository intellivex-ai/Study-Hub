import React from 'react';
import styled from 'styled-components';

const FocusScene = ({ children }) => {
  return (
    <StyledWrapper>
      <div className="view">
        <div className="lamp lamp-left">
          <div className="head">
            <div className="head-top" />
            <div className="light-source" />
            <div className="head-body">
              <div className="head-body-rod" />
              <div className="head-body-glass" />
              <div className="head-body-rod" />
              <div className="head-body-glass" />
              <div className="head-body-rod" />
              <div className="head-bottom" />
            </div>
          </div>
          <div className="rod" />
          <div className="bottom">
            <div className="bottom-top" />
            <div className="bottom-body" />
            <div className="bottom-bottom" />
          </div>
          <div className="lamp-shadow" />
        </div>
        <div className="lamp lamp-right">
          <div className="head">
            <div className="head-top" />
            <div className="light-source" />
            <div className="head-body">
              <div className="head-body-rod" />
              <div className="head-body-glass" />
              <div className="head-body-rod" />
              <div className="head-body-glass" />
              <div className="head-body-rod" />
              <div className="head-bottom" />
            </div>
          </div>
          <div className="rod" />
          <div className="bottom">
            <div className="bottom-top" />
            <div className="bottom-body" />
            <div className="bottom-bottom" />
          </div>
          <div className="lamp-shadow" />
        </div>
        <div className="masonry-perspective">
          <div className="masonry-container">
            <div className="masonry">
              <div className="masonry-item" />
              <div className="masonry-item" />
              <div className="masonry-item" />
              <div className="masonry-item" />
              <div className="masonry-item" />
            </div>
            <div className="masonry">
              <div className="masonry-item" />
              <div className="masonry-item" />
              <div className="masonry-item" />
              <div className="masonry-item" />
              <div className="masonry-item" />
            </div>
            <div className="masonry">
              <div className="masonry-item" />
              <div className="masonry-item" />
              <div className="masonry-item" />
              <div className="masonry-item" />
              <div className="masonry-item" />
            </div>
            <div className="masonry">
              <div className="masonry-item" />
              <div className="masonry-item" />
              <div className="masonry-item" />
              <div className="masonry-item" />
              <div className="masonry-item" />
            </div>
            <div className="masonry">
              <div className="masonry-item" />
              <div className="masonry-item" />
              <div className="masonry-item" />
              <div className="masonry-item" />
              <div className="masonry-item" />
            </div>
            <div className="masonry">
              <div className="masonry-item" />
              <div className="masonry-item" />
              <div className="masonry-item" />
              <div className="masonry-item" />
              <div className="masonry-item" />
            </div>
            <div className="masonry">
              <div className="masonry-item" />
              <div className="masonry-item" />
              <div className="masonry-item" />
              <div className="masonry-item" />
              <div className="masonry-item" />
            </div>
            <div className="masonry">
              <div className="masonry-item" />
              <div className="masonry-item" />
              <div className="masonry-item" />
              <div className="masonry-item" />
              <div className="masonry-item" />
            </div>
            <div className="masonry">
              <div className="masonry-item" />
              <div className="masonry-item" />
              <div className="masonry-item" />
              <div className="masonry-item" />
              <div className="masonry-item" />
            </div>
            <div className="masonry">
              <div className="masonry-item" />
              <div className="masonry-item" />
              <div className="masonry-item" />
              <div className="masonry-item" />
              <div className="masonry-item" />
            </div>
          </div>
        </div>
        <div className="sky">
          <div className="star star-1" />
          <div className="star star-2" />
          <div className="star star-3" />
          <div className="star star-4" />
          <div className="star star-5" />
          <div className="star star-6" />
          <div className="star star-7" />
          <div className="star star-8" />
          <div className="star star-9" />
        </div>
        <div className="ground" />
        <div className="content-overlay">
          {children}
        </div>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 320px;
  height: 320px;
  
  .view {
    position: relative;
    width: 300px;
    height: 300px;
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    overflow: hidden;
    background-color: #0b1026;
    box-shadow: inset 0 0 30px rgba(0,0,0,0.8), 0 0 40px rgba(0,0,0,0.3);
  }

  .content-overlay {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 500;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    /* Soften text so it reads well over the animation */
    text-shadow: 0 4px 15px rgba(0, 0, 0, 0.9);
    width: 100%;
  }

  .lamp {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 400px;
    opacity: 0;
    z-index: 300;
  }
  .lamp-left {
    animation: lamp-pass-left 2s ease-in 1s infinite;
  }
  .lamp-right {
    animation: lamp-pass-right 2s ease-in 2s infinite;
  }
  .head {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    position: relative;
  }
  .light-source {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    box-shadow: 0px 0px 200px 50px #dfd89c;
    z-index: 3;
    pointer-events: none;
  }
  .head-top {
    height: 15px;
    width: 10px;
    background-color: #000;
    border-top-left-radius: 100%;
    border-top-right-radius: 100%;
  }
  .head-body {
    height: 80px;
    width: 70px;
    clip-path: polygon(0% 0%, 100% 0%, 80% 100%, 20% 100%);
    border-top-left-radius: 20%;
    border-top-right-radius: 20%;
    border-top: 15px solid black;
    border-bottom: 15px solid black;
    overflow: hidden;
    display: flex;
    background-color: #dfd89c;
    flex-direction: row;
    align-items: stretch;
  }
  .head-body-rod {
    width: 8px;
    background-color: black;
  }
  .head-body-rod:nth-child(1) {
    transform: skewX(7deg);
    width: 15px;
  }
  .head-body-rod:nth-child(5) {
    transform: skewX(-7deg);
    width: 15px;
  }
  .head-body-glass {
    flex: 1;
  }

  .rod {
    flex: 1;
    background-color: black;
    width: 16px;
  }
  .bottom {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 80px;
    border-top-left-radius: 30%;
    border-top-right-radius: 30%;
    border-bottom-left-radius: 20%;
    border-bottom-right-radius: 20%;
    box-shadow: inset 0px 2px 3px #5d5f3f;
    background: linear-gradient(0deg, #000 50%, #373829);
  }
  .bottom-top {
    margin-top: 20px;
    width: 50px;
    height: 10px;
    box-shadow: inset 0px 2px 3px #5d5f3f;
    background: linear-gradient(0deg, #000 70%, #5d5f3f);
    border-radius: 30%;
  }
  .bottom-body {
    flex: 1;
  }
  .bottom-bottom {
    width: 50px;
    height: 30px;
    background: linear-gradient(0deg, #000 50%, #373829);
    border-top-left-radius: 100%;
    border-top-right-radius: 100%;
  }
  .lamp-shadow {
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 150px;
    height: 16px;
    border-top-left-radius: 100%;
    border-top-right-radius: 100%;
    border-bottom-left-radius: 90%;
    border-bottom-right-radius: 90%;
    background: radial-gradient(circle, #000 0%, transparent 100%);
  }
  .masonry-perspective {
    perspective: 150px;
    width: 90px;
    height: 150px;
    position: absolute;
    bottom: 0;
    left: 50%;
    margin-bottom: -60px;
    transform: translateX(-50%);
  }
  .masonry-container {
    transform: rotateX(50deg) !important;
    transform-style: preserve-3d;
    width: 100%;
  }
  .masonry {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(15px, 1fr));
    gap: 1px;
    width: 100%;
    height: 10px;
    position: absolute;
    padding-bottom: 15px;
    opacity: 0;
  }
  .masonry:nth-child(1) {
    animation: walk 2s linear infinite;
  }
  .masonry:nth-child(2) {
    animation: walk 2s linear 0.2s infinite;
  }
  .masonry:nth-child(3) {
    animation: walk 2s linear 0.4s infinite;
  }
  .masonry:nth-child(4) {
    animation: walk 2s linear 0.6s infinite;
  }
  .masonry:nth-child(5) {
    animation: walk 2s linear 0.8s infinite;
  }
  .masonry:nth-child(6) {
    animation: walk 2s linear 1s infinite;
  }
  .masonry:nth-child(7) {
    animation: walk 2s linear 1.2s infinite;
  }
  .masonry:nth-child(8) {
    animation: walk 2s linear 1.4s infinite;
  }
  .masonry:nth-child(9) {
    animation: walk 2s linear 1.6s infinite;
  }
  .masonry:nth-child(10) {
    animation: walk 2s linear 1.8s infinite;
  }
  .masonry-item {
    background-color: #1a1c2c;
    border-radius: 3px;
    box-shadow:
      inset 1px 1px 3px rgba(74, 225, 118, 0.1),
      inset -1px -1px 6px #000;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  /* Farklı boyutlarda öğeler eklemek için */
  .masonry:nth-child(even) .masonry-item:nth-child(odd) {
    height: 20px;
  }
  .masonry:nth-child(odd) .masonry-item:nth-child(even) {
    height: 24px;
  }
  .masonry:nth-child(odd) .masonry-item:nth-child(odd) {
    height: 24px;
  }
  .masonry:nth-child(odd) .masonry-item:nth-child(even) {
    height: 20px;
  }
  .sky {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    z-index: -2;
    background-color: #0d0b1f;
  }
  .star {
    width: 1px;
    height: 1px;
    background-color: #fff;
    box-shadow: 0px 0px 10px 1px #ffdd48;
    position: absolute;
  }
  .star-1 {
    left: 50%;
    top: 20%;
  }
  .star-2 {
    left: 40%;
    top: 30%;
  }
  .star-3 {
    left: 16%;
    top: 23%;
  }
  .star-4 {
    left: 56%;
    top: 44%;
  }
  .star-5 {
    left: 72%;
    top: 10%;
  }
  .star-6 {
    left: 42%;
    top: 8%;
  }
  .star-7 {
    left: 18%;
    top: 40%;
  }
  .star-8 {
    left: 80%;
    top: 50%;
  }
  .star-9 {
    left: 90%;
    top: 30%;
  }
  .ground {
    position: absolute;
    bottom: 0;
    width: 100%;
    background-color: rgb(10, 31, 10);
    height: 38%;
    z-index: -1;
  }

  @keyframes walk {
    0% {
      opacity: 0;
      transform: translateY(-900%);
    }
    20% {
      opacity: 0;
    }
    50% {
      opacity: 1;
      transform: translateY(0%);
    }
    80% {
      opacity: 1;
    }
    90% {
      opacity: 1;
    }
    100% {
      opacity: 0;
      transform: translateY(900%);
    }
  }
  @keyframes lamp-pass-right {
    0% {
      opacity: 0;
      transform: translateX(-10%) translateY(-50%) scale(0.2);
    }
    20% {
      opacity: 1;
    }
    100% {
      opacity: 1;
      transform: translateX(250%) translateY(-40%) scale(1.2);
    }
  }
  @keyframes lamp-pass-left {
    0% {
      opacity: 0;
      transform: translateX(-90%) translateY(-50%) scale(0.2);
    }
    20% {
      opacity: 1;
    }
    100% {
      opacity: 1;
      transform: translateX(-350%) translateY(-40%) scale(1.2);
    }
  }
`;

export default FocusScene;
