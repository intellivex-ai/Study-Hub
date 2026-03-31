import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

/**
 * StatCard – A premium metric card for the Stats/Analytics page.
 * Features an animated emerald icon glow, vertical accent bar, and glassmorphism.
 */
const StatCard = ({ label, value, sub, icon, delay = 0 }) => {
  return (
    <StyledWrapper>
      <motion.div
        className="stat-card"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut', delay }}
        whileHover="hover"
      >
        {/* Vertical Accent Bar */}
        <div className="accent-bar" />

        {/* Animated Glow Background */}
        <div className="glow-bg" />

        {/* Icon */}
        <motion.div
          className="icon-wrap"
          variants={{ hover: { scale: 1.15, filter: 'drop-shadow(0 0 12px rgba(74,225,118,0.8))' } }}
          transition={{ duration: 0.3 }}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontVariationSettings: "'FILL' 1", fontSize: '1.5rem', color: '#4AE176' }}
          >
            {icon}
          </span>
        </motion.div>

        {/* Content */}
        <div className="content">
          <p className="label">{label}</p>
          <motion.p
            className="value"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delay + 0.2, duration: 0.4 }}
          >
            {value}
          </motion.p>
          <p className="sub">{sub}</p>
        </div>
      </motion.div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  width: 100%;
  height: 100%;

  .stat-card {
    position: relative;
    width: 100%;
    height: 100%;
    background: rgba(26, 28, 28, 0.6);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(74, 225, 118, 0.08);
    border-radius: 20px;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    overflow: hidden;
    cursor: default;
    transition: border-color 0.4s ease, box-shadow 0.4s ease;
  }

  .stat-card:hover {
    border-color: rgba(74, 225, 118, 0.25);
    box-shadow: 0 0 30px rgba(74, 225, 118, 0.07), 0 8px 32px rgba(0, 0, 0, 0.4);
  }

  .accent-bar {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background: linear-gradient(180deg, #4AE176 0%, transparent 100%);
    border-radius: 20px 0 0 20px;
    opacity: 0.7;
  }

  .glow-bg {
    position: absolute;
    top: -40px;
    right: -40px;
    width: 120px;
    height: 120px;
    background: radial-gradient(circle, rgba(74, 225, 118, 0.08) 0%, transparent 70%);
    pointer-events: none;
    border-radius: 50%;
  }

  .icon-wrap {
    width: 48px;
    height: 48px;
    background: rgba(74, 225, 118, 0.08);
    border: 1px solid rgba(74, 225, 118, 0.15);
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    z-index: 1;
  }

  .content {
    position: relative;
    z-index: 1;
  }

  .label {
    font-size: 0.75rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: rgba(180, 195, 180, 0.6);
    margin-bottom: 0.2rem;
  }

  .value {
    font-family: 'Space Mono', 'Courier New', monospace;
    font-size: 1.9rem;
    font-weight: 900;
    color: #ffffff;
    line-height: 1;
    letter-spacing: -0.03em;
    margin-bottom: 0.2rem;
  }

  .sub {
    font-size: 0.7rem;
    font-weight: 600;
    color: rgba(74, 225, 118, 0.6);
  }
`;

export default StatCard;
