import React from 'react';
import styled from 'styled-components';

const AnimatedStartFocusButton = ({ onClick, ...props }) => {
  return (
    <StyledWrapper>
      <button type="button" className="codepen-button" onClick={onClick} {...props}>
        <span>▶︎ Start Focus</span>
      </button>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  /* Yoinked from CodePen, but improved the animation
  so that it is smooth among other more minor things */

  .codepen-button {
    display: block;
    width: 100%;
    cursor: pointer;
    background: none;
    border: none;
    color: white;
    margin: 0 auto;
    position: relative;
    text-decoration: none;
    font-weight: 600;
    border-radius: 100px;
    overflow: hidden;
    padding: 2px;
    isolation: isolate;
  }

  .codepen-button::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 400%;
    height: 100%;
    background: linear-gradient(115deg, #4AE176, #003915, #CBF8D9);
    background-size: 25% 100%;
    animation: an-at-keyframe-css-at-rule-that-translates-via-the-transform-property-the-background-by-negative-25-percent-of-its-width-so-that-it-gives-a-nice-border-animation_-We-use-the-translate-property-to-have-a-nice-transition-so-it_s-not-a-jerk-of-a-start-or-stop
      0.75s linear infinite;
    animation-play-state: running;
    translate: -5% 0%;
    transition: translate 0.25s ease-out;
  }

  .codepen-button:hover::before {
    animation-play-state: running;
    transition-duration: 0.75s;
    translate: 0% 0%;
  }

  @keyframes an-at-keyframe-css-at-rule-that-translates-via-the-transform-property-the-background-by-negative-25-percent-of-its-width-so-that-it-gives-a-nice-border-animation_-We-use-the-translate-property-to-have-a-nice-transition-so-it_s-not-a-jerk-of-a-start-or-stop {
    to {
      transform: translateX(-25%);
    }
  }

  .codepen-button span {
    position: relative;
    display: block;
    padding: 0.8rem 1.2rem;
    font-size: 0.9rem;
    background: #003915;
    border-radius: 100px;
    height: 100%;
  }`;

export default AnimatedStartFocusButton;
