import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const literaryQuotes = [
    {
        text: "Knowing I lov'd my books, he furnish'd me from mine own library with volumes that I prize above my dukedom.",
        author: "William Shakespeare",
        context: "The Tempest"
    },
    {
        text: "Reading is a hobby, but for some of us, it's an escape from the difficulties we face.",
        author: "Colleen Hoover",
        context: "Reminders of Him"
    },
    {
        text: "A mind needs books as a sword needs a whetstone, if it is to keep its edge.",
        author: "George R.R. Martin",
        context: "A Game of Thrones"
    },
    {
        text: "Books are a uniquely portable magic.",
        author: "Stephen King",
        context: "On Writing"
    },
    {
        text: "Every book is a little mirror, and sometimes you look into it and see someone else looking back.",
        author: "Travis Baldree",
        context: "Legends & Lattes"
    }
];

const QuoteSection = () => {
    const [quote, setQuote] = useState(literaryQuotes[0]);

    useEffect(() => {
        const randomIndex = Math.floor(Math.random() * literaryQuotes.length);
        setQuote(literaryQuotes[randomIndex]);
    }, []);

    return (
        <QuoteWrapper>
            <div className="quote-container">
                {/* Changed <p> to <blockquote> to fix nesting errors */}
                <blockquote className="quote-text">"{quote.text}"</blockquote>
                <div className="quote-meta">
                    <span className="quote-author">— {quote.author}</span>
                    <span className="quote-context">{quote.context}</span>
                </div>
            </div>
        </QuoteWrapper>
    );
};

// Use a div or section, but ensure the parent in Home.js is NOT a <p>
const QuoteWrapper = styled.div`
  display: flex;
  justify-content: center;
  padding: 80px 20px;
  background-color: #f9f7f1; 
  border-top: 1px solid rgba(0,0,0,0.05);
  border-bottom: 1px solid rgba(0,0,0,0.05);
  margin: 60px 0;

  .quote-container {
    max-width: 700px;
    text-align: center;
  }

  .quote-text {
    font-family: 'Mikale', serif;
    font-size: 28px; /* Slightly larger for impact */
    font-style: italic;
    color: #1a1a1a;
    line-height: 1.4;
    margin-bottom: 24px;
    padding: 0;
    border: none;
  }

  .quote-meta {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .quote-author {
    font-family: ltc-nicholas-cochin-pro, serif;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    font-size: 13px;
    color: #333;
  }

  .quote-context {
    font-family: ltc-nicholas-cochin-pro, serif;
    font-style: italic;
    font-size: 12px;
    color: #888;
  }
`;

export default QuoteSection;