import { Link } from 'react-router-dom';
import { services } from '../data/siteData';
import { useScrollReveal } from '../hooks/useScrollReveal';

export function ServicesPage() {
  useScrollReveal();

  return (
    <>
      <div className="breadcrumb-area bg-cover shadow dark text-center text-light" style={{ backgroundImage: 'url(/assets/img/shape/5.jpg)' }}>
        <div className="container">
          <div className="row">
            <div className="col-lg-12 col-md-12">
              <h1>Our Services</h1>
              <ul className="breadcrumb">
                <li><a href="/"><i className="fas fa-home" /> Home</a></li>
                <li>Services</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="food-menu-style-three-area default-padding-top">
        <div className="container">
          <div className="row">
            <div className="col-lg-8 offset-lg-2">
              <div className="site-heading text-center animate fadeInUp">
                <h4 className="sub-title">Best Massage Services</h4>
                <h2 className="title">Our Services</h2>
              </div>
            </div>
          </div>

          <div className="row">
            {services.map((service, index) => (
              <div key={service.id} className="col-xl-4 col-lg-6 col-md-6 mt-30">
                <div className="food-menu-style-three animate fadeInUp" style={{ transitionDelay: `${index * 120}ms` }}>
                  <div className="thumb">
                    <img src={service.image} alt={service.name} />
                  </div>
                  <div className="info">
                    <h4><Link to={`/services/${service.slug}`}>{service.name}</Link></h4>
                    <p>{service.shortDescription}</p>
                    <div className="service-meta">
                      <span>{service.duration}</span>
                      <span>{service.price}</span>
                    </div>
                    <Link to={`/booking?service=${service.slug}`} className="cart-btn-border"><i className="fas fa-calendar-check" /> Book Now Appointment</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
