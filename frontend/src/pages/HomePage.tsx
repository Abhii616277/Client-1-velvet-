import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import { Link } from 'react-router-dom';
import { featureCards, heroSlides, services, testimonials } from '../data/siteData';
import { useScrollReveal } from '../hooks/useScrollReveal';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export function HomePage() {
  useScrollReveal();

  return (
    <>
      <div className="banner-area banner-style-two navigation-circle text-center text-light">
        <Swiper
          modules={[Autoplay, Navigation]}
          slidesPerView={1}
          autoplay={{ delay: 4500, disableOnInteraction: false }}
          navigation
          loop
          className="banner-fade"
        >
          {heroSlides.map((slide) => (
            <SwiperSlide key={slide.title}>
              <div className="banner-thumb bg-cover shadow dark" style={{ backgroundImage: `url(${slide.image})` }} />
              <div className="container">
                <div className="content">
                  <div className="row align-center">
                    <div className="col-lg-10 offset-lg-1">
                      <div className="info animate fadeInUp">
                        <h4>{slide.eyebrow}</h4>
                        <h2>{slide.title.split('\n').map((line, index) => <span key={line + index}>{line}<br /></span>)}</h2>
                        <div className="button mt-30">
                          <a className="btn btn-md btn-theme animation" href="/booking">BOOK APPOINTMENT NOW</a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <div className="about-style-three-area default-padding">
        <div className="container">
          <div className="row align-center">
            <div className="col-lg-5">
              <div className="about-style-three-thumb animate fadeInRight">
                <img src="/assets/img/about/5.jpg" alt="Velvet Touch Spa massage therapy" />
                <img className="secondary" src="/assets/img/thumb/7.jpg" alt="Spa therapy closeup" />
              </div>
            </div>
            <div className="col-lg-7 pl-80 pl-md-15 pl-xs-15">
              <div className="about-style-three-info animate fadeInLeft">
                <h4 className="sub-heading">About Velvet Touch Spa</h4>
                <h2 className="title">Velvet Touch Spa In Bengaluru</h2>
                <div className="item">
                  <p>
                    Welcome to Velvet Touch Spa, your ultimate destination for rejuvenation and relaxation in Bengaluru. We are your gateway to a world of tranquility and luxury. Our team is committed to providing an unforgettable spa experience that leaves you feeling refreshed and revitalized.
                  </p>
                  <p>
                    Escape the hustle and bustle of daily life, and step into a haven of relaxation where your well-being is our top priority.
                  </p>
                  <a className="btn btn-theme btn-md animation" href="tel:+919845280400">+91 98452 80400</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="menu-type-area overflow-hidden default-padding bg-dark bg-cover">
        <div className="container">
          <div className="row">
            {featureCards.map((card, index) => (
              <div key={card.title} className="col-xl-4 col-md-6 menu-type-single">
                <div className="menu-type-item animate fadeInUp" style={{ transitionDelay: `${index * 120}ms` }}>
                  <div className="thumb">
                    <img src={card.image} alt={card.title} />
                  </div>
                  <div className="info">
                    <h3>{card.title}</h3>
                    <p>{card.text}</p>
                    <a href="tel:+919845280400" className="btn mt-20 circle btn-sm btn-theme effect"> +91 98452 80400</a>
                  </div>
                </div>
              </div>
            ))}
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
                    <Link to={`/booking?service=${service.slug}`} className="cart-btn-border">
                      <i className="fas fa-phone" /> Book Now Appointment
                    </Link>
                  </div>
                </div>
              </div>
            ))}
            <div className="col-xl-12 text-center mt-30 animate fadeInUp">
              <Link to="/services" className="btn mt-20 circle btn-sm btn-theme effect">View All Services</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="opening-hours-area default-padding overflow-hidden">
        <div className="container">
          <div className="opening-hour-items">
            <h2 className="text-fixed animate fadeInUp">Velvet Touch Spa</h2>
            <div className="shape animate fadeInRight">
              <img src="/assets/img/shape/4.png" alt="Decorative shape" />
            </div>
            <div className="row">
              <div className="col-lg-6">
                <div className="opening-hours-thumb animate fadeInLeft">
                  <img src="/assets/img/banner/7.jpg" alt="Spa session in progress" />
                </div>
              </div>
              <div className="col-lg-6">
                <div className="opening-hours-info animate fadeInRight">
                  <h3>Opening Hours</h3>
                  <p>
                    At Velvet Touch Spa, we focus on a wide range of massage treatments designed to pamper your body, calm your mind, and restore your energy.
                  </p>
                  <ul className="opening-hours-table">
                    <li><h4>Monday to Sunday:</h4> <span>24 Hours</span></li>
                  </ul>
                  <div className="call-to-action">
                    <div className="icon">
                      <img src="/assets/img/icon/6.png" alt="Phone icon" />
                    </div>
                    <div className="info">
                      <p>Call Anytime</p>
                      <h4><a href="tel:+919845280400">+91 98452 80400</a></h4>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="fun-facts-area text-center bg-dark text-light default-padding">
        <div className="container">
          <div className="row">
            {[
              ['18', '+', 'Experience'],
              ['98', 'K', 'Treatment'],
              ['12', 'M', 'Happy Client'],
              ['5', '+', 'Therapists'],
            ].map(([value, operator, label], index) => (
              <div key={label} className="col-lg-3 col-md-6 item">
                <div className="fun-fact animate fadeInUp" style={{ transitionDelay: `${index * 120}ms` }}>
                  <div className="counter"><div className="timer">{value}</div><div className="operator">{operator}</div></div>
                  <span className="medium">{label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="testimonial-area bg-gray default-padding">
        <div className="container">
          <div className="row">
            <div className="col-lg-8 offset-lg-2">
              <div className="site-heading text-center animate fadeInUp">
                <h4 className="sub-title">Happy Customers</h4>
                <h2 className="title">Our Customers Feedback</h2>
              </div>
            </div>
          </div>

          <div className="row align-center">
            <div className="col-lg-12">
              <Swiper
                modules={[Pagination]}
                slidesPerView={1}
                spaceBetween={20}
                pagination={{ clickable: true }}
                loop
                className="testimonial-carousel"
              >
                {testimonials.map((person) => (
                  <SwiperSlide key={person.name}>
                    <div className="testimonial-item animate fadeInUp">
                      <div className="quote">“</div>
                      <p>{person.quote}</p>
                      <div className="thumb">
                        <img src="/assets/img/team/1.jpg" alt={person.name} />
                      </div>
                      <h4>{person.name}</h4>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
        </div>
      </div>

      <div className="map-area">
        <div className="container-fluid px-0">
          <div className="google-map" style={{ overflow: 'hidden', boxShadow: '0 -10px 30px rgba(0, 0, 0, 0.08)' }}>
            <iframe
              title="Velvet Touch Spa Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15554.745941645428!2d77.57882495937858!3d12.92786066202655!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae15ba60ae85a5%3A0x79ba3861596b8700!2sNifit%20Spa%20Home%20Massage%20Service!5e0!3m2!1sen!2sus!4v1791627632237!5m2!1sen!2sus"
              width="100%"
              height="420"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              style={{ border: 0, display: 'block' }}
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </>
  );
}
