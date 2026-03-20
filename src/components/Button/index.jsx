import React, { useState } from 'react';
import styled from 'styled-components';
import { supabase } from '../../supabaseClient';

const Button = () => {
  const [showConfirm, setShowConfirm] = useState(false);

  
  const handleConfirmLogout = async () => {
    await supabase.auth.signOut();
    setShowConfirm(false); 
  };

  return (
    <>
      <StyledWrapper>
        <button onClick={() => setShowConfirm(true)}>
          <span>Log out</span>
        </button>
      </StyledWrapper>

      {showConfirm && (
        <ModalOverlay>
          <div className="modal-box">
            <p>Are you sure you want to log out?</p>
            <div className="button-group">
              <button className="cancel" onClick={() => setShowConfirm(false)}>
                Cancel
              </button>
              <button className="confirm" onClick={handleConfirmLogout}>
                Yes, log out
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}
    </>
  );
};


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
    position: relative;
    overflow: hidden;
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
  }
`;


const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.6); /* Dark semi-transparent background */
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;

    .modal-box {
        background: #fff;
        padding: 40px;
        border-radius: 12px;
        text-align: center;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        animation: popIn 0.3s ease;
    }

    p {
        font-size: 18px;
        margin-bottom: 24px;
        color: #333;
        font-family: sans-serif;
    }

    .button-group {
        display: flex;
        gap: 15px;
        justify-content: center;
    }

    .button-group button {
        padding: 10px 20px;
        border: none;
        border-radius: 6px;
        font-size: 15px;
        cursor: pointer;
        font-weight: 600;
        transition: 0.2s;
    }

    .cancel {
        background: #e4e4e4;
        color: #333;
    }

    .cancel:hover {
        background: #d4d4d4;
    }

    .confirm {
        background: #000;
        color: #fff;
    }

    .confirm:hover {
        background: #333;
    }

    @keyframes popIn {
        from { transform: scale(0.9); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
    }
`;

export default Button;