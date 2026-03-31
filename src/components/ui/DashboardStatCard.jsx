import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

/**
 * DashboardStatCard — Premium stat card for the Home dashboard.
 * Larger and more impactful than the Analytics StatCard.
 * Features a number readout, icon, glowing border accent, and micro-animation.
 */
const DashboardStatCard = ({ label, value, icon, accent = '#4AE176', delay = 0 }) => {
  return (
    <StyledWrapper $accent={accent}>
      <motion.div
        className="dsc-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut', delay }}
        whileHover="hover"
        role="group"
        aria-label={`${label}: ${value}`}
      >
        {/* Animated corner glow */}
        <div className="corner-glow" />

        {/* Top row: icon + label */}
        <div className="top-row">
          <motion.div
            className="icon-box"
            variants={{ hover: { scale: 1.15, rotate: -5 } }}
            transition={{ duration: 0.25 }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontVariationSettings: "'FILL' 1", fontSize: '1.4rem' }}
            >
              {icon}
            </span>
          </motion.div>
          <p className="label">{label}</p>
        </div>

        {/* Value */}
        <motion.p
          className="value"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.15, duration: 0.4 }}
        >
          {value}
        </motion.p>

        {/* Bottom shimmer line */}
        <div className="shimmer-line" />
      </motion.div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  width: 100%;
  height: 100%;

  .dsc-card {
    position: relative;
    background: rgba(20, 22, 22, 0.7);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 22px;
    padding: 1.6rem;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    overflow: hidden;
    cursor: default;
    height: 100%;
    transition: border-color 0.4s ease, box-shadow 0.4s ease;
  }

  .dsc-card:hover {
    border-color: ${props => props.$accent}30;
    box-shadow:
      0 0 0 1px ${props => props.$accent}15,
      0 12px 40px rgba(0, 0, 0, 0.5);
  }

  .corner-glow {
    position: absolute;
    top: -30px;
    right: -30px;
    width: 100px;
    height: 100px;
    background: radial-gradient(circle, ${props => props.$accent}18 0%, transparent 70%);
    border-radius: 50%;
    pointer-events: none;
    transition: opacity 0.4s ease;
  }

  .top-row {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    position: relative;
    z-index: 1;
  }

  .icon-box {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: ${props => props.$accent}12;
    border: 1px solid ${props => props.$accent}20;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${props => props.$accent};
  }

  .label {
    font-size: 0.75rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: rgba(180, 195, 180, 0.8);
  }

  .value {
    font-size: 2.4rem;
    font-weight: 900;
    color: #ffffff;
    line-height: 1;
    letter-spacing: -0.04em;
    position: relative;
    z-index: 1;
    font-family: 'Space Mono', 'Courier New', monospace;
  }

  .shimmer-line {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, ${props => props.$accent}40, transparent);
    border-radius: 0 0 22px 22px;
    opacity: 0;
    transition: opacity 0.4s ease;
  }

  .dsc-card:hover .shimmer-line {
    opacity: 1;
  }
`;

export default DashboardStatCard;
