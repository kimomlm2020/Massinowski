// src/data/index.js
export { statsData } from './statsData';
export { transformationsData } from './transformationsData';
export { testimonialsData } from './testimonialsData';

// Additional data for programs
export const programsData = [
  {
    id: 1,
    title: "Sports Coaching",
    description: "Personalized program to achieve your fitness goals",
    price: 299,
    duration: "3 months",
    features: [
      "One-on-one sessions",
      "Custom workout plan",
      "Weekly follow-up",
      "Video exercises"
    ],
    level: "All levels",
    icon: "💪"
  },
  {
    id: 2,
    title: "Mental Coaching",
    description: "Develop your mental strength and confidence",
    price: 249,
    duration: "3 months",
    features: [
      "Visualization sessions",
      "Breathing techniques",
      "Stress management",
      "Mental preparation"
    ],
    level: "Beginner to advanced",
    icon: "🧠"
  },
  {
    id: 3,
    title: "Nutrition",
    description: "Nutritional plan adapted to your goals",
    price: 199,
    duration: "3 months",
    features: [
      "Personalized meal plan",
      "Nutritional follow-up",
      "Adapted recipes",
      "Expert advice"
    ],
    level: "All levels",
    icon: "🥗"
  }
];

// FAQ data
export const faqData = [
  {
    id: 1,
    question: "How does coaching work?",
    answer: "Coaching takes place online with personalized sessions and daily follow-up."
  },
  {
    id: 2,
    question: "How long until I see results?",
    answer: "First results are usually visible within the first month."
  },
  {
    id: 3,
    question: "Can I get a refund if I'm not satisfied?",
    answer: "Yes, we offer a satisfaction guarantee with a 14-day refund policy."
  }
];