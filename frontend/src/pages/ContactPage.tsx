import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { submitContactForm } from '../services/api';

const contactSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().min(8, 'Phone is required'),
  subject: z.string().min(3, 'Subject is required'),
  message: z.string().min(10, 'Message is required'),
});

type ContactFormData = z.infer<typeof contactSchema>;

export function ContactPage() {
  useScrollReveal();
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [submitError, setSubmitError] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({ resolver: zodResolver(contactSchema) });

  const onSubmit = async (data: ContactFormData) => {
    setSubmitSuccess('');
    setSubmitError('');
    try {
      await submitContactForm(data as Record<string, string>);
      reset();
      setSubmitSuccess('Thank you! Your message has been sent. We will get back to you shortly.');
    } catch (error) {
      setSubmitError(
        axios.isAxiosError(error)
          ? error.response?.data?.detail || 'Unable to send your message. Please try again or call us directly.'
          : 'Unable to send your message. Please try again.',
      );
    }
  };

  return (
    <>
      <div className="breadcrumb-area bg-cover shadow dark text-center text-light" style={{ backgroundImage: 'url(/assets/img/shape/5.jpg)' }}>
        <div className="container">
          <div className="row">
            <div className="col-lg-12 col-md-12">
              <h1>Contact Us</h1>
              <ul className="breadcrumb">
                <li><a href="/"><i className="fas fa-home" /> Home</a></li>
                <li>Contact Us</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="contact-style-one-area default-padding overflow-hidden">
        <div className="container">
          <div className="row align-center">
            <div className="col-lg-10 offset-lg-1">
              <div className="contact-style-one-info animate fadeInUp">
                <ul>
                  <li>
                    <div className="icon">
                      <img src="/assets/img/icon/phone.png" alt="Phone icon" />
                    </div>
                    <div className="content">
                      <h5 className="title">Call Now</h5>
                      <a href="tel:+919845280400">+91 98452 80400</a>
                    </div>
                  </li>
                  <li>
                    <div className="icon">
                      <img src="/assets/img/icon/placeholder.png" alt="Location icon" />
                    </div>
                    <div className="info">
                      <h5 className="title">Our Location</h5>
                      <p>Shop no 18, old no.278, 200 feet road, Jayanagar, Bengaluru, Karnataka 560011</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            <div className="col-lg-12 mt-50">
              <div className="google-map animate fadeInUp" style={{ overflow: 'hidden', borderRadius: '18px', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)' }}>
                <iframe
                  title="Velvet Touch Spa Location"
                  src="https://www.google.com/maps?q=Shop%20no%2018%20old%20no.%20278,%20200%20feet%20road,%20Jayanagar,%20Bengaluru,%20Karnataka%20560011&output=embed"
                  width="100%"
                  height="420"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  style={{ border: 0, display: 'block' }}
                  allowFullScreen
                />
              </div>
            </div>

            <div className="col-lg-10 offset-lg-1">
              <div className="contact-form-style-one animate fadeInUp">
                <div className="heading text-center">
                  <h5 className="sub-title">Keep in touch</h5>
                  <h2 className="heading">Send us a Massage</h2>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="contact-form">
                  <div className="row">
                    <div className="col-lg-12">
                      <div className="form-group">
                        <input className="form-control" placeholder="Name" {...register('name')} />
                        {errors.name && <span className="alert-error">{String(errors.name.message)}</span>}
                      </div>
                    </div>
                    <div className="col-lg-6">
                      <div className="form-group">
                        <input className="form-control" placeholder="Email" {...register('email')} />
                        {errors.email && <span className="alert-error">{String(errors.email.message)}</span>}
                      </div>
                    </div>
                    <div className="col-lg-6">
                      <div className="form-group">
                        <input className="form-control" placeholder="Phone" {...register('phone')} />
                        {errors.phone && <span className="alert-error">{String(errors.phone.message)}</span>}
                      </div>
                    </div>
                    <div className="col-lg-12">
                      <div className="form-group">
                        <input className="form-control" placeholder="Subject" {...register('subject')} />
                        {errors.subject && <span className="alert-error">{String(errors.subject.message)}</span>}
                      </div>
                    </div>
                    <div className="col-lg-12">
                      <div className="form-group">
                        <textarea className="form-control" rows={5} placeholder="Your message" {...register('message')} />
                        {errors.message && <span className="alert-error">{String(errors.message.message)}</span>}
                      </div>
                    </div>
                    <div className="col-lg-12">
                      {submitSuccess && <p className="booking-success" role="status">{submitSuccess}</p>}
                      {submitError && <p className="alert-error" role="alert">{submitError}</p>}
                      <button type="submit" className="btn btn-theme btn-md" disabled={isSubmitting}>
                        {isSubmitting ? 'Sending...' : 'Send message'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
