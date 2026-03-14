import React, { useEffect, useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { ThreeDots } from 'react-loader-spinner';
import { supabase } from '../../supabaseClient';
import Navbar from '../Navbar';
import './index.css';

const BookDetail = () => {
    const { id } = useParams();
    const [bookData, setBookData] = useState(null);
    const [authorName, setAuthorName] = useState("Loading...");
    const [isLoading, setIsLoading] = useState(true);
    const [isSaved, setIsSaved] = useState(false);
    const [readingStatus, setReadingStatus] = useState('Want to Read');
    const [shouldRedirect, setShouldRedirect] = useState(false);
    const [shareText, setShareText] = useState("Share Book");

    useEffect(() => {
        const fetchBookDetails = async () => {
            try {
                const response = await fetch(`https://openlibrary.org/works/${id}.json`);
                if (!response.ok) {
                    setShouldRedirect(true);
                    return;
                }
                const data = await response.json();

                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const { data: favData } = await supabase
                        .from('favorites')
                        .select('book_id, reading_status')
                        .eq('user_id', user.id)
                        .eq('book_id', id);

                    if (favData && favData.length > 0) {
                        setIsSaved(true);
                        setReadingStatus(favData[0].reading_status || 'Want to Read');
                    }
                }

                let descText = "No description available.";
                if (data.description) {
                    descText = typeof data.description === 'string'
                        ? data.description
                        : data.description.value || descText;
                }

                const langText = data.languages?.length > 0
                    ? data.languages.map(l => l.key?.split('/').pop().toUpperCase()).join(', ')
                    : "Not specified";

                if (data.authors?.[0]?.author?.key) {
                    const authRes = await fetch(`https://openlibrary.org${data.authors[0].author.key}.json`);
                    if (authRes.ok) {
                        const authData = await authRes.json();
                        setAuthorName(authData.name || "Unknown Author");
                    }
                } else {
                    setAuthorName("Unknown Author");
                }

                setBookData({
                    id: id,
                    title: data.title || "Untitled",
                    description: descText,
                    languages: langText,
                    publishDate: data.first_publish_date || "N/A",
                    coverId: data.covers?.[0] || null,
                    subjects: data.subjects?.slice(0, 5) || []
                });

            } catch (error) {
                setShouldRedirect(true);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBookDetails();
    }, [id]);

    const toggleFavorite = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return alert("Please login to manage your shelf!");

        if (isSaved) {
            const { error } = await supabase
                .from('favorites')
                .delete()
                .eq('user_id', user.id)
                .eq('book_id', id);
            if (!error) setIsSaved(false);
        } else {
            const { error } = await supabase
                .from('favorites')
                .insert([{
                    user_id: user.id,
                    book_id: id,
                    book_title: bookData.title,
                    book_author: authorName,
                    book_cover: bookData.coverId ? `https://covers.openlibrary.org/b/id/${bookData.coverId}-L.jpg` : null,
                    reading_status: 'Want to Read'
                }]);
            if (!error) {
                setIsSaved(true);
                setReadingStatus('Want to Read');
            }
        }
    };

    const updateStatus = async (newStatus) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase
            .from('favorites')
            .update({ reading_status: newStatus })
            .eq('user_id', user.id)
            .eq('book_id', id);

        if (!error) setReadingStatus(newStatus);
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        setShareText("Link Copied!");
        setTimeout(() => {
            setShareText("Share Book");
        }, 2000);
    };

    if (shouldRedirect) return <Navigate to="/404" replace />;

    if (isLoading) {
        return (
            <div className="detail-loading-wrapper">
                <Navbar />
                <div className="loader-container">
                    <ThreeDots height="80" width="80" color="#000000" visible={true} />
                    <p className="loading-text">Opening the archives...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="detail-page">
            <Navbar />
            <div className="detail-content-container">
                <Link to="/books" className="back-btn">❮ Back to Library</Link>

                <div className="detail-main-grid">
                    <div className="detail-img-wrapper">
                        <img
                            src={bookData.coverId
                                ? `https://covers.openlibrary.org/b/id/${bookData.coverId}-L.jpg`
                                : 'https://via.placeholder.com/300x450?text=No+Cover'}
                            alt={bookData.title}
                            className="detail-main-cover"
                        />
                    </div>

                    <div className="detail-info-wrapper">
                        <h1 className="detail-title-text">{bookData.title}</h1>
                        <p className="detail-author-text">By {authorName}</p>

                        {isSaved && (
                            <div className="status-container">
                                <p className="status-label">Reading Status:</p>
                                <div className="status-toggle-group">
                                    {['Want to Read', 'Reading', 'Finished'].map((status) => (
                                        <button
                                            key={status}
                                            className={`status-chip ${readingStatus === status ? 'active' : ''}`}
                                            onClick={() => updateStatus(status)}
                                        >
                                            {status}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="detail-stats-box">
                            <p><strong>Published:</strong> {bookData.publishDate}</p>
                            <p><strong>Language:</strong> {bookData.languages}</p>
                        </div>

                        <div className="detail-desc-section">
                            <h3>About the Work</h3>
                            <p>{bookData.description}</p>

                            <div className="detail-tags-list">
                                {bookData.subjects.map((s, i) => (
                                    <Link key={i} to={`/subjects/${s.toLowerCase()}`} className="genre-tag">
                                        {s}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <div className="detail-button-group">
                            <button
                                className={isSaved ? "btn-remove" : "btn-primary"}
                                onClick={toggleFavorite}
                            >
                                {isSaved ? "Remove from Shelf" : "Save to My Shelf"}
                            </button>

                            <button
                                className={`btn-secondary ${shareText === "Link Copied!" ? "success-state" : ""}`}
                                onClick={handleShare}
                            >
                                {shareText}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookDetail;