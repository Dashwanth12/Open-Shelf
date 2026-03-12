import React, { Component } from 'react';
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import { supabase } from './supabaseClient';
import Login from './pages/Login';
import Home from './components/Home';
import Books from './components/Books'
import BookDetails from './components/BookDetails';
import SubjectView from './components/SubjectView';
import NotFound from './components/NotFound';
import MyShelf from './components/MyShelf';
import './App.css';

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      initializing: true
    };
  }

  componentDidMount() {
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      this.setState({ user: session?.user ?? null, initializing: false });
    });

    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      this.setState({ user: session?.user ?? null });
    });

    this.subscription = subscription;
  }

  componentWillUnmount() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  render() {
    const { user, initializing } = this.state;
    
    if (initializing) return null;
    
    return (
      <BrowserRouter>
        <div className="main-app">
          {user ? (
            <Routes>
              <Route path="/" element={<Home user={user} />} />
              <Route path="/books" element={<Books user={user} />} />
              <Route  path='/books/:id' element={<BookDetails user={user} />} />
              <Route path="/subjects/:subject" element={<SubjectView user={user} />} />
              <Route path="/my-shelf" element={<MyShelf user={user} />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          ) : (
            <Login />
          )}
        </div>
      </BrowserRouter>
    );
  }
}