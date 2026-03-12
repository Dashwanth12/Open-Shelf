import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ThreeDots } from 'react-loader-spinner';
import { Heart } from 'lucide-react'; 
import { supabase } from '../../supabaseClient';
import Navbar from '../Navbar';
import './index.css';

const SubjectView = () => {
    const { subject } = useParams();
    const [books, setBooks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [userFavorites, setUserFavorites] = useState([]); 

    useEffect(() => {
        fetchUserFavorites();
        fetchSubjectBooks();
    }, [subject]);

    const fetchUserFavorites = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data } = await supabase.from('favorites').select('book_id').eq('user_id', user.id);
        if (data) setUserFavorites(data.map(f => f.book_id));
    };

    const fetchSubjectBooks = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`https://openlibrary.org/subjects/${subject}.json?limit=40`);
            const data = await response.json();
            if (data?.works) {
                const formatted = data.works.map(work => ({
                    id: work.key.split('/').pop(),
                    title: work.title,
                    author: work.authors?.[0]?.name || 'Unknown Author',
                    cover: work.cover_id ? `https://covers.openlibrary.org/b/id/${work.cover_id}-L.jpg` : null
                }));
                setBooks(formatted);
            }
        } catch (err) { console.error(err); } finally { setIsLoading(false); }
    };

    const toggleFavorite = async (book) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return alert("Please login to save books!");

        const isFavorited = userFavorites.includes(book.id);

        if (isFavorited) {
            const { error } = await supabase.from('favorites').delete().eq('user_id', user.id).eq('book_id', book.id);
            if (!error) setUserFavorites(prev => prev.filter(id => id !== book.id));
        } else {
            const { error } = await supabase.from('favorites').insert([{
                user_id: user.id,
                book_id: book.id,
                book_title: book.title,
                book_author: book.author,
                book_cover: book.cover,
                reading_status: 'Want to Read'
            }]);
            if (!error) setUserFavorites(prev => [...prev, book.id]);
        }
    };

    if (isLoading) return (
        <div className="books-page">
            <Navbar />
            <div className="books-loader-container">
                <ThreeDots height="80" width="80" color="#000000" visible={true} />
                <p>Opening the archives...</p>
            </div>
        </div>
    );

    return (
        <div className="subject-view-page">
            <Navbar />
            <div className="subject-container">
                <header className="subject-header">
                    <Link to="/books" className="back-link">❮ Back to Library</Link>
                    <h1 className="subject-title">{subject.toUpperCase()}</h1>
                </header>
                <div className="books-grid">
                    {books.map(book => {
                        const isFavorited = userFavorites.includes(book.id);
                        return (
                            <div key={book.id} className="slender-book-card">
                                <div className="card-image-container">
                                    
                                    <button
                                        className={`heart-btn ${isFavorited ? 'active' : ''}`}
                                        onClick={() => toggleFavorite(book)}
                                    >
                                        <Heart
                                            size={18}
                                            fill={isFavorited ? "#000000" : "none"}
                                            color={isFavorited ? "#000000" : "#666"}
                                        />
                                    </button>

                                    <Link to={`/books/${book.id}`}>
                                        <div className="cover-box">
                                            <img
                                                src={book.cover || 'https://via.placeholder.com/150x225?text=No+Cover'}
                                                alt={book.title}
                                            />
                                        </div>
                                    </Link>
                                </div>

                                <div className="book-meta">
                                    <h4 className="title-truncate">{book.title}</h4>
                                    <p>{book.author}</p>
                                </div>
                                <Link to={`/books/${book.id}`} className="view-link">
                                    <button className="shelf-view-btn">View Details</button>
                                </Link>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default SubjectView;