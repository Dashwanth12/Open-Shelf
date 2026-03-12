import React, {Component} from 'react'
import './index.css'
import {NavLink} from 'react-router-dom'
import Button from '../Button'


class Navbar extends Component{
    render(){
        return(
            <nav className="navbar">

                <NavLink to="/" className="navbar-logo">Open Shelf</NavLink>
                <div className="nav-links">
                    <NavLink to="/" className={({ isActive }) => isActive ? 'active-link' : ''}>Home</NavLink>
                    <NavLink to="/books" className={({ isActive }) => isActive ? 'active-link' : ''}>Books</NavLink>
                    <NavLink to="/my-shelf" className={({ isActive }) => isActive ? 'active-link' : ''}>My Shelf</NavLink>
                    <NavLink to='/subjects' className={({ isActive }) => isActive ? 'active-link' : ''}></NavLink>
                </div>
                <Button />

            </nav>
        )
    }
}
export default Navbar