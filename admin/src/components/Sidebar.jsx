import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { assets } from '../assets/assets'
import '../style/Sidebar.scss'

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-links">
          <NavLink to="/add" onClick={() => setIsOpen(false)}>
            <img src={assets.add_icon} alt="Add" />
            <p>Add Program</p>
          </NavLink>

          <NavLink to="/list" onClick={() => setIsOpen(false)}>
            <img src={assets.order_icon} alt="List" />
            <p>All Programs</p>
          </NavLink>

          <NavLink to="/orders" onClick={() => setIsOpen(false)}>
            <img src={assets.clipboard} alt="Orders" />
            <p>Orders</p>
          </NavLink>
        </div>
      </div>
      
      <div 
        className={`sidebar-overlay ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(false)}
      />
      
      <button 
        className="mobile-menu-toggle"
        onClick={() => setIsOpen(!isOpen)}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          {isOpen ? (
            <path d="M18 6L6 18M6 6l12 12" />
          ) : (
            <path d="M3 12h18M3 6h18M3 18h18" />
          )}
        </svg>
      </button>
    </>
  )
}

export default Sidebar