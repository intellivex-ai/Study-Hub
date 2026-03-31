import React from 'react';
import styled from 'styled-components';

/**
 * KesariSendButton — A premium animated send button for the Coach chat.
 * Features a rotating emerald ring and glow animation on hover.
 */
const KesariSendButton = ({ onClick, disabled }) => {
  return (
    <StyledWrapper>
      <button
        type="button"
        className="send-btn"
        onClick={onClick}
        disabled={disabled}
        aria-label="Send message"
      >
        <span className="send-ring" />
        <svg className="send-icon" viewBox="0 0 24 24" fill="none">
          <path
            d="M22 2L11 13"
            stroke="#4AE176"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M22 2L15 22L11 13L2 9L22 2Z"
            stroke="#4AE176"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .send-btn {
    position: relative;
    width: 52px;
    height: 52px;
    border-radius: 50%;
    background: linear-gradient(135deg, #001a0e 0%, #003915 100%);
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: transform 0.2s ease, box-shadow 0.3s ease;
  }

  .send-btn:hover:not(:disabled) {
    transform: scale(1.1);
    box-shadow: 0 0 24px rgba(74, 225, 118, 0.5);
  }

  .send-btn:active:not(:disabled) {
    transform: scale(0.96);
  }

  .send-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .send-ring {
    position: absolute;
    inset: -2px;
    border-radius: 50%;
    background: conic-gradient(#4AE176 0deg, transparent 120deg, transparent 360deg);
    animation: rotatering 3s linear infinite;
    opacity: 0.7;
    z-index: 0;
  }

  .send-ring::after {
    content: '';
    position: absolute;
    inset: 2px;
    border-radius: 50%;
    background: linear-gradient(135deg, #001a0e 0%, #003915 100%);
  }

  @keyframes rotatering {
    to { transform: rotate(360deg); }
  }

  .send-icon {
    width: 20px;
    height: 20px;
    position: relative;
    z-index: 1;
    transition: transform 0.2s ease;
  }

  .send-btn:hover:not(:disabled) .send-icon {
    transform: translate(2px, -2px);
  }
`;

export default KesariSendButton;
