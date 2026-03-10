import React from 'react'
import { assets } from '../assets/assets.js'
import '../style/Navbar.scss'

const Navbar = ({ setToken }) => {
  return (
    <div className="navbar">
      <img src={assets.logo} alt="Logo" />
      <button onClick={() => setToken('')}>
        Logout
      </button>
    </div>
  )
}

export default Navbar