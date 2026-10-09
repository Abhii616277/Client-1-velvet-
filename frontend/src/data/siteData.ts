export type ServiceItem = {
  id: number;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  image: string;
  price: string;
  duration: string;
};

export const navItems = [
  { label: 'Home', to: '/' },
  { label: 'About Us', to: '/about' },
  { label: 'Our Services', to: '/services' },
  { label: 'Our Blog', to: '/blog' },
  { label: 'Contact Us', to: '/contact' },
];

export const services: ServiceItem[] = [
  {
    id: 1,
    name: 'Men Massage In Bengaluru',
    slug: 'men-massage-in-bengaluru',
    shortDescription: 'A calming and restorative service designed for stress relief and deep relaxation.',
    description: 'Our men massage service is a gateway to serenity and relaxation, designed to help you unwind and rejuvenate after a busy day.',
    image: '/assets/img/menu/swedish.jpg',
    price: '₹1,999',
    duration: '60 mins',
  },
  {
    id: 2,
    name: 'Hotel Massage In Bengaluru',
    slug: 'hotel-massage-in-bengaluru',
    shortDescription: 'Luxury in-room care for guests seeking convenience, comfort, and recovery.',
    description: 'Our hotel massage service is designed to reach the very core of muscle tension and stress, offering a pathway to deep comfort.',
    image: '/assets/img/menu/deep.jpg',
    price: '₹2,499',
    duration: '75 mins',
  },
  {
    id: 3,
    name: 'Home Massage In Bengaluru',
    slug: 'home-massage-in-bengaluru',
    shortDescription: 'Private, soothing, and tailored bodywork in the comfort of your own home.',
    description: 'Our home massage service combines smooth, therapeutic techniques with a stress-free environment for your complete relaxation.',
    image: '/assets/img/menu/sss2.jpg',
    price: '₹2,299',
    duration: '60 mins',
  },
  {
    id: 4,
    name: 'Body Massage In Bengaluru',
    slug: 'body-massage-in-bengaluru',
    shortDescription: 'A classic full-body treatment that eases tension and restores freshness.',
    description: 'Our body massage service is a sensory delight and comfortable treatment that combines the power of essential oils and soothing strokes.',
    image: '/assets/img/menu/aroma.jpg',
    price: '₹2,199',
    duration: '50 mins',
  },
  {
    id: 5,
    name: 'Door Step Massage In Bengaluru',
    slug: 'door-step-massage-in-bengaluru',
    shortDescription: 'Premium massage treatment delivered at your door for convenience and calm.',
    description: 'Our door step massage service is designed for athletes and active individuals seeking flexibility, tension relief, and recovery.',
    image: '/assets/img/menu/sss1.jpg',
    price: '₹2,799',
    duration: '90 mins',
  },
  {
    id: 6,
    name: 'Indian Massage In Bengaluru',
    slug: 'indian-massage-in-bengaluru',
    shortDescription: 'Traditional deep-healing techniques inspired by time-tested Indian wellness practice.',
    description: 'Our Indian massage service is deeply rooted in the ancient healing system of Indian massage and is excellent for stress relief and balance.',
    image: '/assets/img/menu/aurvedic.jpg',
    price: '₹2,699',
    duration: '75 mins',
  },
];

export const testimonials = [
  {
    name: 'Ananya P.',
    quote: 'The therapist arrived on time and the massage was incredibly relaxing. Highly recommended for busy professionals in Bengaluru.',
  },
  {
    name: 'Nitin S.',
    quote: 'Amazing experience from booking to the service itself. The at-home massage was comfortable, professional, and very soothing.',
  },
  {
    name: 'Divya R.',
    quote: 'I booked a hotel massage and it was worth every rupee. Their attention to detail and calm approach made all the difference.',
  },
];

export const featureCards = [
  {
    title: 'Body Massage',
    text: 'Therapeutic care for stress relief, circulation, and deep relaxation.',
    image: '/assets/img/illustration/12.png',
  },
  {
    title: 'Hotel Massage',
    text: 'Enjoy luxurious treatment in the comfort and privacy of your hotel room.',
    image: '/assets/img/illustration/13.png',
  },
  {
    title: 'Home Massage',
    text: 'A warm, private experience designed for your routines and comfort.',
    image: '/assets/img/illustration/14.png',
  },
];

export const heroSlides = [
  {
    eyebrow: 'Female To Male Massage',
    title: 'Hotel & Home\nMassage Services',
    image: '/assets/img/banner/3.jpg',
  },
  {
    eyebrow: 'Body Massage In Bengaluru',
    title: 'Best Body\nMassage Services',
    image: '/assets/img/banner/4.jpg',
  },
];
