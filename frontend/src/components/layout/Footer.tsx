import { Send } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <img src="/assets/img/velvet-touch-spa-logo.svg" alt="Velvet Touch Spa Logo" />
            <div className="footer-about">
              <h4>About Us</h4>
              <p>
                Escape the hustle and bustle of daily life, and step into a haven of relaxation at Velvet Touch Spa in Bengaluru.
              </p>
            </div>
            <div className="social-links">
              <a href="https://t.me/8431803560" target="_blank" rel="noreferrer" aria-label="Telegram chat">
                <Send size={16} />
              </a>
            </div>
          </div>

          <div className="footer-links">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/services">Our Services</Link></li>
              <li><Link to="/blog">Our Blog</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
            </ul>
          </div>

          <div className="footer-links">
            <h4>Best Services</h4>
            <ul>
              <li><Link to="/services">Hotel Massage</Link></li>
              <li><Link to="/services">Home Massage</Link></li>
              <li><Link to="/services">Door Step Massage</Link></li>
              <li><Link to="/services">Female To Male Massage</Link></li>
              <li><Link to="/services">Indian Massage</Link></li>
            </ul>
          </div>

          <div className="footer-links">
            <h4>Get In Touch</h4>
            <ul>
              <li><span>Shop no 18, old no.278, 200 feet road, 11th Main Rd, 2nd Block, Pattabhirama Nagar, Jayanagar, Bengaluru, Karnataka 560011</span></li>
              <li><a href="tel:+919845280400">+91 98452 80400</a></li>
              <li><a href="tel:+918431803560">+91 84318 03560</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© Allright 2025 Reserved</p>
        </div>
      </div>
    </footer>
  );
}
