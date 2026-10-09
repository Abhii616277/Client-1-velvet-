import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { getServices, submitBooking, type Service } from '../services/api';

const bookingSchema = z.object({
  customer_name: z.string().min(2, 'Name is required'),
  phone: z.string().min(8, 'Valid phone number is required'),
  email: z.string().email('Please enter a valid email'),
  service_id: z.string().min(1, 'Please choose a service'),
  booking_date: z.string().min(1, 'Date is required'),
  booking_time: z.string().min(1, 'Time is required'),
  address: z.string().min(5, 'Address is required'),
  notes: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

export function BookingPage() {
  useScrollReveal();
  const [searchParams] = useSearchParams();
  const [services, setServices] = useState<Service[]>([]);
  const [servicesError, setServicesError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<BookingFormData>({ resolver: zodResolver(bookingSchema) });

  useEffect(() => {
    getServices()
      .then((availableServices) => {
        setServices(availableServices);
        const selectedService = availableServices.find((service) => service.slug === searchParams.get('service'));
        if (selectedService) {
          setValue('service_id', String(selectedService.id));
        }
      })
      .catch(() => setServicesError('Services are temporarily unavailable. Please call us to book.'));
  }, [searchParams, setValue]);

  const onSubmit = async (data: BookingFormData) => {
    setSubmitError('');
    setSubmitSuccess('');

    try {
      await submitBooking({ ...data, service_id: Number(data.service_id) });
      reset();
      setSubmitSuccess('Your appointment request has been submitted successfully. Our team will contact you to confirm your appointment.');
    } catch (error) {
      setSubmitError(
        axios.isAxiosError(error)
          ? error.response?.data?.detail || 'Unable to submit your booking. Please try again.'
          : 'Unable to submit your booking. Please try again.',
      );
    }
  };

  return (
    <div className="container booking-page-wrap">
      <div className="booking-card animate fadeInUp">
        <div className="booking-copy animate fadeInLeft">
          <h4 className="sub-heading">Book a session</h4>
          <h2>Reserve your spa experience</h2>
          <p>Schedule your preferred massage service and we'll confirm your appointment as quickly as possible.</p>
          <ul>
            <li>Private, professional service</li>
            <li>Flexible time slots</li>
            <li>Home, hotel, and in-studio options</li>
          </ul>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="booking-form animate fadeInRight">
          {submitError && <p className="alert-error" role="alert">{submitError}</p>}
          {submitSuccess && <p className="booking-success" role="status">{submitSuccess}</p>}
          <div className="row">
            <div className="col-lg-6">
              <label>Full name<input {...register('customer_name')} />{errors.customer_name && <span>{String(errors.customer_name.message)}</span>}</label>
            </div>
            <div className="col-lg-6">
              <label>Phone<input {...register('phone')} />{errors.phone && <span>{String(errors.phone.message)}</span>}</label>
            </div>
            <div className="col-lg-6">
              <label>Email<input type="email" {...register('email')} />{errors.email && <span>{String(errors.email.message)}</span>}</label>
            </div>
            <div className="col-lg-6">
              <label>
                Service
                <select {...register('service_id')} disabled={services.length === 0}>
                  <option value="">Select service</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name} - Rs. {service.price.toLocaleString('en-IN')} ({service.duration_minutes} min)
                    </option>
                  ))}
                </select>
                {errors.service_id && <span>{String(errors.service_id.message)}</span>}
                {servicesError && <span className="alert-error">{servicesError}</span>}
              </label>
            </div>
            <div className="col-lg-6">
              <label>Date<input type="date" min={new Date().toISOString().split('T')[0]} {...register('booking_date')} />{errors.booking_date && <span>{String(errors.booking_date.message)}</span>}</label>
            </div>
            <div className="col-lg-6">
              <label>Time<input type="time" {...register('booking_time')} />{errors.booking_time && <span>{String(errors.booking_time.message)}</span>}</label>
            </div>
            <div className="col-lg-12">
              <label>Address<textarea rows={3} {...register('address')} />{errors.address && <span>{String(errors.address.message)}</span>}</label>
            </div>
            <div className="col-lg-12">
              <label>Notes<textarea rows={3} {...register('notes')} /></label>
            </div>
            <div className="col-lg-12">
              <button type="submit" className="btn btn-theme btn-md" disabled={isSubmitting || services.length === 0}>
                {isSubmitting ? 'Submitting...' : 'Book appointment'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
