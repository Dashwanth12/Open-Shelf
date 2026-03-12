import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../Navbar';
import QuoteSection from '../QuoteSection';
import './index.css';

class Home extends Component {
    state = {
        trendingBooks: [],
        startIndex: 0,
        isLoading: true
    }

    autoSlideTimer = null;

    componentDidMount() {
        this.getTrendingBooks();
        this.startAutoSlide();
    }

    componentWillUnmount() {
        this.stopAutoSlide();
    }

    getTrendingBooks = async () => {
        try {
            const response = await fetch('https://openlibrary.org/subjects/fiction.json?limit=12');
            const data = await response.json();

            if (data && data.works) {
                const formattedBooks = data.works.map(book => ({
                    id: book.key,
                    title: book.title,
                    author: book.authors ? book.authors[0].name : 'Unknown Author',
                    coverImage: book.cover_id
                        ? `https://covers.openlibrary.org/b/id/${book.cover_id}-L.jpg`
                        : 'https://via.placeholder.com/300x450?text=No+Cover',
                }));
                this.setState({ trendingBooks: formattedBooks, isLoading: false });
            }
        } catch (error) {
            console.error("Error fetching trending books:", error);
            this.setState({ isLoading: false });
        }
    }

    startAutoSlide = () => {
        if (this.autoSlideTimer) clearInterval(this.autoSlideTimer);
        this.autoSlideTimer = setInterval(() => {
            const { startIndex, trendingBooks } = this.state;
            if (trendingBooks.length === 0) return;

            if (startIndex + 4 >= trendingBooks.length) {
                this.setState({ startIndex: 0 });
            } else {
                this.nextSlide();
            }
        }, 5000);
    }

    stopAutoSlide = () => {
        if (this.autoSlideTimer) {
            clearInterval(this.autoSlideTimer);
            this.autoSlideTimer = null;
        }
    }

    nextSlide = () => {
        const { startIndex, trendingBooks } = this.state;
        if (startIndex + 4 < trendingBooks.length) {
            this.setState({ startIndex: startIndex + 4 });
        }
    }

    prevSlide = () => {
        const { startIndex } = this.state;
        if (startIndex - 4 >= 0) {
            this.setState({ startIndex: startIndex - 4 });
        }
    }

    render() {
        const { trendingBooks, startIndex, isLoading } = this.state;
        const visibleBooks = trendingBooks.slice(startIndex, startIndex + 4);

        return (
            <div className="home">
                <Navbar />

                <section className="hero">
                    <div className="hero-text">
                        <h1 className="sub-title">Discover Your Next Great Read</h1>
                        <p className="hero-description">
                            Explore books, have discussions, and track
                            what readers around the world are loving.
                        </p>
                        <div className="hero-buttons">
                            <Link to="/books">
                                <button className="primary-btn">Explore Books</button>
                            </Link>
                            <Link to="/subjects/fiction">
                                <button className="secondary-btn">Check what's trending</button>
                            </Link>
                        </div>
                    </div>
                </section>

                <section
                    className="trending"
                    onMouseEnter={this.stopAutoSlide}
                    onMouseLeave={this.startAutoSlide}
                >
                    <div className="trending-header">
                        <Link to="/subjects/fiction" className="trending-link-wrapper">
                            <h2 className="trending-title">Trending Books ❯</h2>
                        </Link>
                        <div className="nav-arrows">
                            <button
                                className={`arrow-btn ${startIndex === 0 ? 'disabled' : ''}`}
                                onClick={this.prevSlide}
                            >❮</button>
                            <button
                                className={`arrow-btn ${startIndex + 4 >= trendingBooks.length ? 'disabled' : ''}`}
                                onClick={this.nextSlide}
                            >❯</button>
                        </div>
                    </div>

                    <div className="book-grid">
                        {isLoading ? (
                            <div className="loader">Loading Trending Books...</div>
                        ) : (
                            visibleBooks.map(book => {
                                const cleanId = book.id.split('/').pop();

                                return (
                                    <div key={book.id} className="carousel-item">
                                        <Link to={`/books/${cleanId}`} className="cover-link">
                                            <img
                                                src={book.coverImage}
                                                alt={book.title}
                                                className="minimal-book-cover"
                                            />
                                        </Link>
                                        <div className="trending-book-details">
                                            <h4 className="trending-book-title">{book.title}</h4>
                                            <p className="trending-book-author">By: {book.author}</p>
                                        </div>
                                        <Link to={`/books/${cleanId}`} className="btn-link">
                                            <button className="view-btn">Check out</button>
                                        </Link>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </section>

                <section className="quote">
                    <p>
                       <QuoteSection /> 
                    </p>
                </section>
            </div>
        );
    }
}

export default Home;