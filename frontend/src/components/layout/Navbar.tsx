import { LockKeyhole, MapPin, Menu, Phone, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { navItems } from '../../data/siteData';

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header>
      <div className="topbar-two">
        <div className="container">
          <div className="topbar-two-items">
            <div className="topbar-info">
              <div className="icon">
                <Phone size={16} />
              </div>
              <div className="info">
                <h5>Call for Appointment</h5>
                <a href="tel:+919845280400">+91 98452 80400</a>
                <a href="tel:+918431803560">+91 84318 03560</a>
              </div>
            </div>

            <div className="logo-wrap">
              <Link to="/">
                <img
                  src="/assets/img/velvet-touch-spa-logo.svg"
                  alt="Velvet Touch Spa Logo"
                  style={{ width: '220px', height: 'auto', display: 'block', margin: '0 auto' }}
                />
              </Link>
            </div>

            <div className="topbar-info">
              <div className="icon">
                <MapPin size={16} />
              </div>
              <div className="info">
                <h5>Our Location</h5>
                <p>Shop no 18, old no.278, 200 feet road</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      <nav className="navbar-box validnavs">
        <div className="container nav-box">
          <div className="navbar-header">
            <button className="navbar-toggle" type="button" onClick={() => setMenuOpen((open) => !open)} aria-label="Toggle navigation">
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <Link className="navbar-brand" to="/">
              <img
                src="/assets/img/velvet-touch-spa-logo.svg"
                alt="Velvet Touch Spa Logo"
                style={{ width: '200px', height: 'auto', display: 'block' }}
              />
            </Link>
          </div>

          <div className={`collapse navbar-collapse ${menuOpen ? 'open' : ''}`} id="navbar-menu">
            <button className="mobile-close" type="button" onClick={() => setMenuOpen(false)} aria-label="Close menu">
              <X size={18} />
            </button>
            <ul className="nav navbar-nav navbar-right">
              {navItems.map((item) => (
                <li key={item.label}>
                  <Link to={item.to} onClick={() => setMenuOpen(false)}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="attr-right">
            <div className="attr-nav attr-box">
              <ul>
                <li className="side-menu">
                  <a href="tel:+919845280400">
                    <i className="fas fa-phone" /> +91 98452 80400
                  </a>
                  <br></br>
                  <a href="tel:+918431803560">
                    <i className="fas fa-phone" />+91 84318 03560

                  </a>
                </li>
                <li className="side-menu admin-link-hidden">
                  <Link to="/login" aria-label="Admin login" title="Admin login">
                    <LockKeyhole size={15} />
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
