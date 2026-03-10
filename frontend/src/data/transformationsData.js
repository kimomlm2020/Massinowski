// src/data/transformationsData.js
import backBefore from "../assets/images/back_before_gm_optimized.avif";
import backAfter from "../assets/images/back_after_gm_optimized.avif";
import frontBefore from "../assets/images/front_before_gm_optimized.avif";
import frontAfter from "../assets/images/front_after_gm_optimized.avif";
import c1Before from "../assets/images/c1_gm_optimized.avif";
import c1After from "../assets/images/c1after_gm_optimized.avif";
import logo from "../assets/images/Logo.avif";

export const transformationsData = [
  {
    beforePhoto: backBefore,
    afterPhoto: backAfter,
    author: "Satisfied Client",
    age: 32,
    goal: "Weight loss & toning",
    weightLost: 15,
    duration: "3 months",
    muscleGain: 8,
    testimonial: "Thanks to the personalized program, I lost 15kg and regained my confidence. The daily follow-up made all the difference!",
    programType: "Fitness",
    dietType: "Weight Loss",
    rating: 5,
    clientAvatar: logo
  },
  {
    beforePhoto: frontBefore,
    afterPhoto: frontAfter,
    author: "Satisfied Client",
    age: 28,
    goal: "Muscle gain",
    weightLost: 5,
    duration: "4 months",
    muscleGain: 12,
    testimonial: "Incredible transformation! My body sculpted thanks to targeted exercises and adapted nutrition.",
    programType: "Strength Training",
    dietType: "Mass Gain",
    rating: 5,
    clientAvatar: logo
  },
  {
    beforePhoto: c1Before,
    afterPhoto: c1After,
    author: "Satisfied Client",
    age: 35,
    goal: "Fitness improvement",
    weightLost: 12,
    duration: "5 months",
    muscleGain: 6,
    testimonial: "The program changed my life. I feel stronger and more energetic than ever!",
    programType: "Full Body",
    dietType: "Balanced",
    rating: 5,
    clientAvatar: logo
  }
];