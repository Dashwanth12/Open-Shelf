import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, BookOpen, CheckCircle, Bookmark, Sparkles } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import Navbar from '../Navbar';
import QuoteSection from '../QuoteSection';
import './index.css';

const MyShelf = () => {
    const [savedBooks, setSavedBooks] = useState([]);
    const [recommended, setRecommended] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchShelf();
        fetchRecommendations();
    }, []);

    const fetchShelf = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data } = await supabase.from('favorites').select('*').eq('user_id', user.id);
        if (data) setSavedBooks(data);
        setIsLoading(false);
    };

    const fetchRecommendations = async () => {
        try {
            // Fetching specifically for Colleen Hoover and William Shakespeare
            const [hooverRes, shakespeareRes] = await Promise.all([
                fetch(`https://openlibrary.org/search.json?author=Colleen+Hoover&limit=3`),
                fetch(`https://openlibrary.org/search.json?author=William+Shakespeare&limit=3`)
            ]);

            const hooverData = await hooverRes.json();
            const shakespeareData = await shakespeareRes.json();

            // Combine the docs from both authors
            const combinedDocs = [...(hooverData.docs || []), ...(shakespeareData.docs || [])];

            setRecommended(combinedDocs.map(b => ({
                id: b.key.split('/').pop(),
                title: b.title,
                author: b.author_name?.[0] || 'Unknown Author',
                cover: b.cover_i
                    ? `https://covers.openlibrary.org/b/id/${b.cover_i}-M.jpg`
                    : null
            })));
        } catch (e) {
            console.error("Error fetching recommendations:", e);
        }
    };

    const wantToRead = savedBooks.filter(b => b.reading_status === 'Want to Read');
    const currentlyReading = savedBooks.filter(b => b.reading_status === 'Reading');
    const completed = savedBooks.filter(b => b.reading_status === 'Finished');

    const renderCompactShelf = (title, books, Icon) => (
        books.length > 0 && (
            <section className="compact-shelf">
                <h3 className="shelf-status-title-sm">
                    <Icon size={18} /> {title} ({books.length})
                </h3>
               
                <div className="compact-grid">
                    {books.map(book => (
                        <div key={book.book_id} className="mini-book-card">
                            <Link to={`/books/${book.book_id}`}>
                                <img src={book.book_cover} alt={book.book_title} className="mini-cover" />
                            </Link>
                            <div className="mini-meta">
                                <p className="mini-title">{book.book_title}</p>
                                <Link to={`/books/${book.book_id}`} className="mini-edit">Edit Status</Link>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        )
    );

    return (
        <div className="shelf-page">
            <Navbar />
            
            <main className="shelf-main-content">
                <div className="user-shelves-wrapper">
                    {renderCompactShelf("Currently Reading", currentlyReading, BookOpen)}
                    {renderCompactShelf("Want to Read", wantToRead, Bookmark)}
                    {renderCompactShelf("Completed", completed, CheckCircle)}

                    {!isLoading && savedBooks.length === 0 && (
                        <p className="empty-msg">Your shelf is empty. Go add some books!</p>
                    )}
                </div>
                <QuoteSection />
                <section className="recommendations-section">
                    <h2 className="shelf-status-title-large">
                        <Sparkles size={24} color="#433d35" /> Recommended for You
                    </h2>
                    <div className="search-grid">
                        {recommended.map(book => (
                            <div key={book.id} className="slender-book-card">
                                <Link to={`/books/${book.id}`}>
                                    <div className="cover-box">
                                        <img src={book.cover} alt={book.title} />
                                    </div>
                                </Link>
                                <div className="book-meta">
                                    <h4 className="title-truncate">{book.title}</h4>
                                    <p>{book.author}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default MyShelf;