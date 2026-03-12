import React, { Component } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ThreeDots } from 'react-loader-spinner';
import { Heart, ChevronLeft, ChevronRight } from 'lucide-react'; 
import { supabase } from '../../supabaseClient';
import Navbar from '../Navbar';
import './index.css';

class Books extends Component {
    state = {
        searchInput: '',
        searchResults: [],
        suggestion: null,
        selectedLanguage: '',
        userFavorites: [],
        categories: {
            love: [], magic: [], crime: [], mystery: [],
            fantasy: [], horror: [], fiction: []
        },
        categoryOffsets: {
            love: 0, magic: 0, crime: 0, mystery: 0,
            fantasy: 0, horror: 0, fiction: 0
        },
        isLoading: true,
        isSearching: false,
        isLoadingMore: false,
        searchPage: 1,
        shouldRedirect: false
    }

    async componentDidMount() {
        await this.fetchUserFavorites();
        this.fetchAllCategories();
    }

    fetchUserFavorites = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data, error } = await supabase.from('favorites').select('book_id').eq('user_id', user.id);
        if (!error && data) {
            this.setState({ userFavorites: data.map(f => f.book_id) });
        }
    }

    toggleFavorite = async (book) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return alert("Please login!");
        const isFavorited = this.state.userFavorites.includes(book.id);

        if (isFavorited) {
            const { error } = await supabase.from('favorites').delete().eq('user_id', user.id).eq('book_id', book.id);
            if (!error) this.setState({ userFavorites: this.state.userFavorites.filter(id => id !== book.id) });
        } else {
            const { error } = await supabase.from('favorites').insert([{
                user_id: user.id, book_id: book.id, book_title: book.title,
                book_author: book.author, book_cover: book.coverImage
            }]);
            if (!error) this.setState({ userFavorites: [...this.state.userFavorites, book.id] });
        }
    }

    handleCarouselMove = (key, direction) => {
        const { categoryOffsets, categories } = this.state;
        const totalItems = categories[key].length;
        const itemsPerView = 4;
        let newOffset = direction === 'next' ? categoryOffsets[key] + itemsPerView : categoryOffsets[key] - itemsPerView;

        if (newOffset >= totalItems) newOffset = 0;
        if (newOffset < 0) newOffset = Math.max(0, totalItems - itemsPerView);

        this.setState({
            categoryOffsets: { ...categoryOffsets, [key]: newOffset }
        });
    }

    renderBookCard = (book) => {
        if (!book) return null;
        const isFavorited = this.state.userFavorites.includes(book.id);
        const placeholder = 'https://via.placeholder.com/150x225?text=No+Cover';

        return (
            <div key={book.id} className="slender-book-card">
                <div className="card-image-container">
                    <button className={`heart-btn ${isFavorited ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); this.toggleFavorite(book); }}>
                        <Heart size={18} fill={isFavorited ? "#000000" : "none"} color="#000000" />
                    </button>
                    <Link to={`/books/${book.id}`} className="cover-link">
                        <div className="cover-box">
                            <img src={book.coverImage || placeholder} alt={book.title} onError={(e) => { e.target.src = placeholder }} />
                        </div>
                    </Link>
                </div>
                <div className="book-meta">
                    <h4 className="title-truncate" title={book.title}>{book.title}</h4>
                    <p>{book.author}</p>
                </div>
                <Link to={`/books/${book.id}`} className="view-link">
                    <button className="shelf-view-btn">View Details</button>
                </Link>
            </div>
        );
    }

    fetchAllCategories = async () => {
        const subjects = Object.keys(this.state.categories);
        const categoryData = {};
        const fetchPromises = subjects.map(async (subject) => {
            try {
                const response = await fetch(`https://openlibrary.org/subjects/${subject}.json?limit=12`);
                const data = await response.json();
                if (data?.works) {
                    categoryData[subject] = data.works.map(book => ({
                        id: book.key.split('/').pop(),
                        title: book.title,
                        author: book.authors?.[0]?.name || 'Unknown Author',
                        coverImage: book.cover_id ? `https://covers.openlibrary.org/b/id/${book.cover_id}-L.jpg` : null
                    }));
                }
            } catch (err) { categoryData[subject] = []; }
        });
        await Promise.all(fetchPromises);
        this.setState({ categories: { ...this.state.categories, ...categoryData }, isLoading: false });
    }

    handleSearch = async (isNewSearch = true) => {
        const { searchInput, selectedLanguage, searchPage, searchResults } = this.state;
        if (!searchInput.trim()) return;
        const currentPage = isNewSearch ? 1 : searchPage + 1;
        this.setState({ isSearching: isNewSearch, isLoadingMore: !isNewSearch, shouldRedirect: false });
        let url = `https://openlibrary.org/search.json?q=${searchInput}&page=${currentPage}&limit=12`;
        if (selectedLanguage) url += `&language=${selectedLanguage}`;
        try {
            const response = await fetch(url);
            const data = await response.json();
            if (data?.docs?.length > 0) {
                const newResults = data.docs.map(book => ({
                    id: book.key.split('/').pop(),
                    title: book.title,
                    author: book.author_name?.[0] || 'Unknown Author',
                    coverImage: book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg` : null
                }));
                this.setState({ searchResults: isNewSearch ? newResults : [...searchResults, ...newResults], searchPage: currentPage, isSearching: false, isLoadingMore: false });
            }
        } catch (err) { this.setState({ isSearching: false, isLoadingMore: false }); }
    }

    render() {
        const { searchInput, searchResults, categories, categoryOffsets, isLoading, isSearching, isLoadingMore, shouldRedirect, suggestion, selectedLanguage } = this.state;
        if (shouldRedirect) return <Navigate to="/404" replace />;

        return (
            <div className="books-page">
                <Navbar />
                <header className="books-header">
                    <h1 className="books-title">Reader's Compendium</h1>
                    <p className="book-subtitle">Discover Stories that stay with you Forever.</p>
                    <div className="search-container">
                        <select className="language-dropdown" value={selectedLanguage} onChange={(e) => this.setState({ selectedLanguage: e.target.value })}>
                            <option value="">All Languages</option>
                            <option value="eng">English</option>
                            <option value="spa">Spanish</option>
                        </select>
                        <input className="books-search-input" type="text" placeholder="Search titles or authors..." value={searchInput} onChange={(e) => this.setState({ searchInput: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && this.handleSearch(true)} />
                        <button className="books-search-btn" onClick={() => this.handleSearch(true)} disabled={isSearching}>{isSearching ? 'Searching...' : 'Search'}</button>
                    </div>
                </header>

                <main className="books-content">
                    {searchResults.length > 0 ? (
                        <section className="shelf-container search-results-shelf">
                            <div className="shelf-header-row">
                                <h2 className="shelf-title">RESULTS FOR "{searchInput.toUpperCase()}"</h2>
                                <button className="clear-btn" onClick={() => this.setState({ searchResults: [], searchInput: '' })}>Clear Results</button>
                            </div>
                            <div className="search-grid">{searchResults.map(book => this.renderBookCard(book))}</div>
                            <div className="load-more-container"><button className="load-more-btn" onClick={() => this.handleSearch(false)}>{isLoadingMore ? "Loading..." : "Load More"}</button></div>
                        </section>
                    ) : (
                        isLoading ? <div className="books-loader-container"><ThreeDots height="80" width="80" color="#000000" /></div> :
                            Object.keys(categories).map(key => {
                                const shelfBooks = categories[key];
                                const offset = categoryOffsets[key];
                                const visibleBooks = shelfBooks.slice(offset, offset + 4);
                                if (shelfBooks.length === 0) return null;

                                return (
                                    <section key={key} className="shelf-container horizontal-carousel">
                                        <div className="shelf-header-row">
                                            <Link to={`/subjects/${key}`} className="shelf-title-link">
                                                <h2 className="shelf-title">{key.toUpperCase()} <span className="view-all-tag">View All ❯</span></h2>
                                            </Link>
                                        </div>
                                        <div className="carousel-wrapper">
                                            <button className="side-arrow left" onClick={() => this.handleCarouselMove(key, 'prev')}><ChevronLeft size={30} /></button>
                                            <div className="shelf-grid">
                                                {visibleBooks.map(book => this.renderBookCard(book))}
                                            </div>
                                            <button className="side-arrow right" onClick={() => this.handleCarouselMove(key, 'next')}><ChevronRight size={30} /></button>
                                        </div>
                                    </section>
                                );
                            })
                    )}
                </main>
            </div>
        );
    }
}

export default Books;