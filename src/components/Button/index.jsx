import React from 'react';
import styled from 'styled-components';
import {supabase} from '../../supabaseClient'

const Button = () => {
    return (
        <StyledWrapper>
            <button onClick={() => supabase.auth.signOut()}>
                <span>Log out</span>
            </button>
        </StyledWrapper>
    );
}

const StyledWrapper = styled.div`
  button {
    background: transparent;
    border: none;
    padding: 10px 20px;
    display: inline-block;
    font-size: 15px;
    font-family: ltc-nicholas-cochin-pro;
    font-weight: 600;
    width: 120px;
    text-transform: uppercase;
    cursor: pointer;
    transform: skew(-21deg);
  }

  span {
    display: inline-block;
    transform: skew(21deg);
  }

  button::before {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    right: 100%;
    left: 0;
    background: rgb(20, 20, 20);
    opacity: 0;
    z-index: -1;
    transition: all 0.5s;
  }

  button:hover {
    color: #fff;
    font-family: ltc-nicholas-cochin-pro;
  }

  button:hover::before {
    left: 0;
    right: 0;
    opacity: 1;
  }`;

export default Button;
