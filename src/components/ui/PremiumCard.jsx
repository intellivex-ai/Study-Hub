import React from 'react';
import styled from 'styled-components';

/**
 * PremiumCard – A wrapper component that matches the AICoachCard aesthetic.
 * Includes a radial gradient, a moving border dot, and animated rays.
 * @param {string} variant - 'emerald' (default) or 'danger'
 */
const PremiumCard = ({ children, className, variant = 'emerald' }) => {
  const isDanger = variant === 'danger';
  const primaryColor = isDanger ? '#ef4444' : '#4AE176';
  const primaryGlow = isDanger ? '#7f1d1d' : '#003915';
  
  return (
    <StyledWrapper className={className} $primaryColor={primaryColor} $primaryGlow={primaryGlow} $isDanger={isDanger}>
      <div className="outer">
        <div className="dot" />
        <div className="card">
          <div className="ray" />
          {children}
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
  
  .outer {
    width: 100%;
    border-radius: 20px;
    padding: 1px;
    background: radial-gradient(circle 230px at 0% 0%, #ffffff20, #0c0d0d);
    position: relative;
    overflow: hidden;
  }

  .dot {
    width: 4px;
    aspect-ratio: 1;
    position: absolute;
    background-color: ${props => props.$primaryColor};
    box-shadow: 0 0 10px ${props => props.$primaryColor};
    border-radius: 100px;
    z-index: 2;
    right: 10%;
    top: 10%;
    animation: moveDot 8s linear infinite;
  }

  @keyframes moveDot {
    0%, 100% { top: 5%; right: 5%; }
    25% { top: 5%; right: calc(100% - 20px); }
    50% { top: calc(100% - 20px); right: calc(100% - 20px); }
    75% { top: calc(100% - 20px); right: 5%; }
  }

  .card {
    z-index: 1;
    width: 100%;
    height: 100%;
    border-radius: 19px;
    border: solid 1px ${props => props.$isDanger ? '#450a0a' : '#202222'};
    background: radial-gradient(circle 280px at 0% 0%, ${props => props.$isDanger ? '#1a0d0d' : '#1a1c1c'}, #0c0d0d);
    display: flex;
    flex-direction: column;
    padding: 1.5rem;
    position: relative;
    color: #fff;
    overflow: hidden;
  }
  
  .ray {
    width: 180px;
    height: 40px;
    border-radius: 100px;
    position: absolute;
    background-color: ${props => props.$primaryColor};
    opacity: 0.1;
    box-shadow: 0 0 50px ${props => props.$primaryColor};
    filter: blur(10px);
    transform-origin: 10%;
    top: -10%;
    left: -10%;
    transform: rotate(40deg);
    pointer-events: none;
  }

  .line {
    width: 100%;
    height: 1px;
    position: absolute;
    background-color: rgba(44, 44, 44, 0.4);
    pointer-events: none;
  }
  
  .topl {
    top: 15%;
    background: linear-gradient(90deg, ${props => props.$primaryColor}15 0%, transparent 80%);
  }
  
  .bottoml {
    bottom: 15%;
  }
  
  .leftl {
    left: 10%;
    width: 1px;
    height: 100%;
    background: linear-gradient(180deg, ${props => props.$primaryColor}15 0%, transparent 80%);
  }
  
  .rightl {
    right: 10%;
    width: 1px;
    height: 100%;
  }
`;

export default PremiumCard;
