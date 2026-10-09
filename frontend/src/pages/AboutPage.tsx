import { useScrollReveal } from '../hooks/useScrollReveal';

export function AboutPage() {
  useScrollReveal();

  return (
    <>
      <div className="breadcrumb-area bg-cover shadow dark text-center text-light" style={{ backgroundImage: 'url(/assets/img/shape/5.jpg)' }}>
        <div className="container">
          <div className="row">
            <div className="col-lg-12 col-md-12">
              <h1>About Us</h1>
              <ul className="breadcrumb">
                <li><a href="/"><i className="fas fa-home" /> Home</a></li>
                <li>About Us</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="about-style-three-area default-padding">
        <div className="container">
          <div className="row align-center">
            <div className="col-lg-5">
              <div className="about-style-three-thumb animate fadeInRight">
                <img src="/assets/img/about/5.jpg" alt="Massage therapist" />
                <img className="secondary" src="/assets/img/thumb/7.jpg" alt="Spa closeup" />
              </div>
            </div>
            <div className="col-lg-7 pl-80 pl-md-15 pl-xs-15">
              <div className="about-style-three-info animate fadeInLeft">
                <h4 className="sub-heading">About Velvet Touch Spa</h4>
                <h2 className="title">Velvet Touch Spa In Bengaluru</h2>
                <div className="item">
                  <p>
                    Welcome to Velvet Touch Spa, your ultimate destination for rejuvenation and relaxation in Bengaluru. We are your gateway to a world of tranquility and luxury. At Velvet Touch Spa, we pride ourselves on offering a wide range of spa services designed to pamper your body and soothe your soul.
                  </p>
                  <p>
                    Our team of dedicated professionals is committed to providing an unforgettable spa experience that leaves you feeling refreshed and revitalized. Escape the hustle and bustle of daily life and step into a haven of relaxation.
                  </p>
                  <a className="btn btn-theme btn-md animation" href="tel:+919845280400">+91 98452 80400</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="about-style-one-area default-padding mb-80">
        <div className="about-thumb">
          <div className="item" style={{ backgroundImage: 'url(/assets/img/about/2.jpg)' }} />
          <div className="item" style={{ backgroundImage: 'url(/assets/img/about/3.jpg)' }} />
        </div>
        <div className="container">
          <div className="row">
            <div className="col-lg-6 offset-lg-6">
              <div className="about-style-one-info animate fadeInUp">
                <h4 className="sub-heading">Book And Enjoy Our Massage</h4>
                <h2 className="title">Why Choose Velvet Touch Spa</h2>
                <p>
                  Hotel & Home Massage Services: Indulge in a variety of massage treatments tailored to meet your unique needs. From relaxing massages to invigorating facials, we offer a comprehensive range of services to cater to your well-being.
                </p>
                <a className="btn btn-theme btn-md animation mt-10" href="tel:+919845280400">+91 98452 80400</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
