import React from 'react';
import { Link } from 'react-router-dom';
import './index.css';

const NotFound = () => {
    return (
        <div className="not-found-container">
            <div className="not-found-content">
                <h1 className="error-code">404</h1>
                <h2 className="error-message">Lost in the Stacks?</h2>
                <p className="error-description">
                    The page or book you're looking for has been misplaced or
                    checked out indefinitely.
                </p>
                <Link to="/" className="home-link">
                    Return to the Library Lobby
                </Link>
            </div>
        </div>
    );
};

export default NotFound;