import React from 'react';
import styled from 'styled-components';

const KesariChatInput = ({ value, onChange, onSend, placeholder }) => {
  return (
    <StyledWrapper>
      <div className="container">
        <div className="search-container">
          <input 
            className="input" 
            type="text" 
            value={value}
            onChange={onChange}
            onKeyDown={(e) => e.key === 'Enter' && onSend && onSend()}
            placeholder={placeholder}
            autoComplete="off"
          />
        </div>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  width: 100%;
  
  .container {
    position: relative;
    background: linear-gradient(135deg, rgba(74, 225, 118, 0.15) 0%, rgba(0, 57, 21, 0.3) 100%);
    border-radius: 1000px;
    padding: 8px;
    display: flex;
    justify-content: center;
    z-index: 0;
    width: 100%;
    margin: 0;
  }

  .search-container {
    position: relative;
    width: 100%;
    border-radius: 50px;
    background: linear-gradient(135deg, #1a1c1c 0%, #0c0d0d 100%);
    padding: 2px;
    display: flex;
    align-items: center;
  }

  .search-container::after, .search-container::before {
    content: "";
    width: 100%;
    height: 100%;
    border-radius: inherit;
    position: absolute;
  }

  .search-container::before {
    top: -1px;
    left: -1px;
    background: linear-gradient(0deg, rgba(74, 225, 118, 0.3) 0%, rgba(255, 255, 255, 0.1) 100%);
    z-index: -1;
  }

  .search-container::after {
    bottom: -1px;
    right: -1px;
    background: linear-gradient(0deg, rgba(74, 225, 118, 0.1) 0%, rgba(74, 225, 118, 0.2) 100%);
    box-shadow: rgba(74, 225, 118, 0.2) 3px 3px 15px 0px;
    z-index: -2;
  }

  .input {
    padding: 12px 20px;
    width: 100%;
    background: transparent;
    border: none;
    color: #ffffff;
    font-size: 16px;
    border-radius: 50px;
    z-index: 10;
  }

  .input:focus {
    outline: none;
  }

  .input::placeholder {
    color: rgba(255, 255, 255, 0.25);
  }
`;

export default KesariChatInput;
