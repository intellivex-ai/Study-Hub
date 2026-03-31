import React from 'react';
import styled from 'styled-components';

const AICoachCard = ({ focusScore = 0, streak = 0, time = '0m' }) => {
  return (
    <StyledWrapper>
      <div className="outer">
        <div className="dot" />
        <div className="card">
          <div className="ray" />
          
          <div className="header-badge">
             <div className="bolt-icon">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
             </div>
             <span className="badge-text" style={{ color: '#4AE176' }}>Kesari AI Coach</span>
          </div>

          <div className="content">
            <h2 className="main-text">
              "Your focus is at <span className="score">{focusScore}%</span> today. Ready for a deep session?"
            </h2>
          </div>

          <div className="footer">
            <div className="stat-pill">Streak: {streak} days 🔥</div>
            <div className="stat-pill">Today: {time} focused</div>
          </div>

          <div className="line topl" />
          <div className="line leftl" />
          <div className="line bottoml" />
          <div className="line rightl" />
        </div>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  width: 100%;
  height: 100%;
  
  .outer {
    width: 100%;
    height: 100%;
    border-radius: 20px;
    padding: 1px;
    background: radial-gradient(circle 230px at 0% 0%, #ffffff30, #0c0d0d);
    position: relative;
    overflow: hidden;
  }

  .dot {
    width: 5px;
    aspect-ratio: 1;
    position: absolute;
    background-color: #4AE176;
    box-shadow: 0 0 10px #4AE176;
    border-radius: 100px;
    z-index: 2;
    right: 10%;
    top: 10%;
    animation: moveDot 6s linear infinite;
  }

  @keyframes moveDot {
    0%, 100% { top: 10%; right: 10%; }
    25% { top: 10%; right: calc(100% - 35px); }
    50% { top: calc(100% - 30px); right: calc(100% - 35px); }
    75% { top: calc(100% - 30px); right: 10%; }
  }

  .card {
    z-index: 1;
    width: 100%;
    height: 100%;
    border-radius: 19px;
    border: solid 1px #202222;
    background: radial-gradient(circle 280px at 0% 0%, #1a1c1c, #0c0d0d);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 2rem;
    position: relative;
    color: #fff;
  }
  
  .ray {
    width: 220px;
    height: 45px;
    border-radius: 100px;
    position: absolute;
    background-color: #4AE176;
    opacity: 0.1;
    box-shadow: 0 0 50px #4AE176;
    filter: blur(10px);
    transform-origin: 10%;
    top: 0%;
    left: 0;
    transform: rotate(40deg);
  }

  .header-badge {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    z-index: 10;
  }

  .bolt-icon {
    width: 2.5rem;
    height: 2.5rem;
    background: rgba(74, 225, 118, 0.1);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #4AE176;
    border: 1px solid rgba(74, 225, 118, 0.2);
  }

  .badge-text {
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.15em;
  }

  .main-text {
    font-size: 1.5rem;
    font-weight: 700;
    line-height: 1.4;
    color: #ffffff;
    max-width: 90%;
    z-index: 10;
    position: relative;
  }

  .score {
    color: #4AE176;
    text-shadow: 0 0 10px rgba(74, 225, 118, 0.3);
  }

  .footer {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    z-index: 10;
  }

  .stat-pill {
    padding: 0.5rem 1rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 100px;
    font-size: 0.75rem;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.5);
    border: 1px solid rgba(255, 255, 255, 0.05);
  }

  .line {
    width: 100%;
    height: 1px;
    position: absolute;
    background-color: #2c2c2c;
  }
  
  .topl {
    top: 10%;
    background: linear-gradient(90deg, rgba(74, 225, 118, 0.2) 30%, #1d1f1f 70%);
  }
  
  .bottoml {
    bottom: 10%;
  }
  
  .leftl {
    left: 10%;
    width: 1px;
    height: 100%;
    background: linear-gradient(180deg, rgba(74, 225, 118, 0.2) 30%, #222424 70%);
  }
  
  .rightl {
    right: 10%;
    width: 1px;
    height: 100%;
  }
`;

export default AICoachCard;
