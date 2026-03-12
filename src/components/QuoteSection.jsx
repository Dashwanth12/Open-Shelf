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
                <p className="quote-text">"{quote.text}"</p>
                <div className="quote-meta">
                    <span className="quote-author">— {quote.author}</span>
                    <span className="quote-context">{quote.context}</span>
                </div>
            </div>
        </QuoteWrapper>
    );
};

const QuoteWrapper = styled.section`
  display: flex;
  justify-content: center;
  padding: 60px 20px;
  background-color: #f9f7f1; /* Matching your cream archive look */
  border-top: 1px solid #e0ddd5;
  border-bottom: 1px solid #e0ddd5;
  margin: 40px 0;

  .quote-container {
    max-width: 800px;
    text-align: center;
  }

  .quote-text {
    font-family: 'Mikale', serif;
    font-size: 24px;
    font-style: italic;
    color: #1a1a1a;
    line-height: 1.6;
    margin-bottom: 20px;
  }

  .quote-meta {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
  }

  .quote-author {
    font-family: ltc-nicholas-cochin-pro, serif;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 2px;
    font-size: 14px;
  }

  .quote-context {
    font-family: ltc-nicholas-cochin-pro, serif;
    font-style: italic;
    font-size: 13px;
    color: #666;
  }
`;

export default QuoteSection;