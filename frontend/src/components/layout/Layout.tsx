import { MessageCircle, PhoneCall } from 'lucide-react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export function Layout() {
  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>

      <div className="floating-contact">
        <a className="floating-icon call" href="tel:+919845280400" aria-label="Call Velvet Touch Spa">
          <PhoneCall size={22} />
        </a>
        <a
          className="floating-icon whatsapp"
          href="https://api.whatsapp.com/send/?phone=919845280400&text=Hi+Velvet+Touch+Spa%2C+I+want+to+book+a+massage+appointment.&type=phone_number&app_absent=0"
          target="_blank"
          rel="noreferrer"
          aria-label="WhatsApp Velvet Touch Spa"
        >
          <MessageCircle size={22} />
        </a>
      </div>

      <Footer />
    </>
  );
}
