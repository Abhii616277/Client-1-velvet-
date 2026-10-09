import { Link, useParams } from 'react-router-dom';
import { services } from '../data/siteData';
import { useScrollReveal } from '../hooks/useScrollReveal';

export function ServiceDetailPage() {
  useScrollReveal();

  const { slug } = useParams();
  const service = services.find((entry) => entry.slug === slug) ?? services[0];

  return (
    <div className="container service-detail-container">
      <div className="service-detail-card animate fadeInUp">
        <div className="service-image-wrap animate fadeInLeft">
          <img src={service.image} alt={service.name} />
        </div>
        <div className="service-detail-content animate fadeInRight">
          <h4 className="sub-heading">Massage Service</h4>
          <h1>{service.name}</h1>
          <div className="service-meta">
            <span>{service.duration}</span>
            <span>{service.price}</span>
          </div>
          <p>{service.description}</p>
          <Link className="btn btn-theme btn-md" to={`/booking?service=${service.slug}`}>Book appointment now</Link>
        </div>
      </div>
    </div>
  );
}
