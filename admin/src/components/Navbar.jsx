import React from 'react'
import { assets } from '../assets/assets.js'
import '../style/Navbar.scss'
import { Link } from 'react-router-dom'

const Navbar = ({ setToken }) => {
  return (
    <div className="navbar">
      <Link to="/" className='logo-link'>
      <img src={assets.logo} alt="Logo" />
      </Link>
      <button onClick={() => setToken('')}>
        Logout
      </button>
    </div>
  )
}

export default Navbar
