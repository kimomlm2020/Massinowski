// ============================================
// ADD.JSX - VERSION AVEC SELECTEURS DROPDOWN
// ============================================

import React, { useState, useEffect } from "react";
import { assets } from "../assets/assets.js";
import axios from 'axios';
import { toast } from "react-toastify";
import { backendUrl } from '../App';
import '../style/Add.scss';

// ========== CONFIGURATION COMPLÈTE DES CATÉGORIES ==========

const CATEGORY_CONFIG = {
  "Fitness": {
    icon: "💪",
    color: "#FF6B6B",
    bgColor: "#FFE5E5",
    subCategories: {
      "Weight Loss": {
        features: {
          "Beginner": [
            "Calorie-deficit meal plan (1500-1800 kcal)",
            "Low-impact cardio routine (3x/week)",
            "Bodyweight circuit training",
            "Weekly weigh-in tracking",
            "Portion control guide",
            "Healthy recipe booklet",
            "Basic macro education",
            "Email support for questions"
          ],
          "Intermediate": [
            "Custom macro cycling for fat loss",
            "HIIT + steady state cardio combo",
            "Resistance training for metabolism",
            "Bi-weekly body composition analysis",
            "Supplement stack for fat loss",
            "Meal prep strategies",
            "WhatsApp check-ins 3x/week",
            "Progress photo reviews"
          ],
          "Advanced": [
            "Metabolic adaptation protocol",
            "Advanced HIIT periodization",
            "Strength maintenance while cutting",
            "Daily macro adjustments",
            "Competition prep guidance",
            "Refeed & diet break strategies",
            "Daily WhatsApp accountability",
            "Weekly video consultations"
          ],
          "Elite": [
            "Lab-based metabolic testing integration",
            "Precision nutrition timing protocols",
            "Dual-energy X-ray absorptiometry tracking",
            "24/7 nutritionist availability",
            "Celebrity trainer methodology",
            "Red carpet ready transformation",
            "Private chef meal coordination",
            "Daily physique assessments"
          ]
        }
      },
      "Muscle Gain": {
        features: {
          "Beginner": [
            "Hypertrophy-focused split routine",
            "Surplus meal plan (2500+ kcal)",
            "Progressive overload tracking",
            "Protein intake optimization (1.6g/kg)",
            "Recovery sleep guidelines",
            "Basic supplement guide (creatine, protein)",
            "Form check via email monthly",
            "Beginner gains maximization"
          ],
          "Intermediate": [
            "Periodized hypertrophy program",
            "Custom calorie cycling (training/rest days)",
            "Advanced training techniques (dropsets, supersets)",
            "Bi-weekly strength assessments",
            "Anabolic nutrition timing",
            "Supplement stack optimization",
            "Weekly progress photos",
            "Direct messaging 5x/week"
          ],
          "Advanced": [
            "Undulating periodization model",
            "Nutrient partitioning strategies",
            "Advanced recovery protocols",
            "Blood work analysis for optimization",
            "PED-aware natural alternatives",
            "Daily training log review",
            "Video form analysis weekly",
            "Competition prep integration"
          ],
          "Elite": [
            "Genetic potential maximization protocol",
            "Pharmaceutical-grade supplement protocols",
            "Real-time biomonitoring integration",
            "Olympic-level recovery facilities access",
            "Celebrity physique coaching",
            "Magazine cover prep expertise",
            "Daily physique photography analysis",
            "Private training facility coordination"
          ]
        }
      },
      "General Fitness": {
        features: {
          "Beginner": [
            "Full-body functional routine",
            "Balanced nutrition template",
            "Flexibility & mobility basics",
            "Weekly activity tracking",
            "Wellness habit formation",
            "Stress management introduction",
            "Community forum access",
            "Monthly goal reviews"
          ],
          "Intermediate": [
            "Split routine customization",
            "Macro-balanced meal planning",
            "Performance metrics tracking",
            "Periodized training blocks",
            "Recovery optimization",
            "Mindfulness integration",
            "Priority email support",
            "Quarterly fitness assessments"
          ],
          "Advanced": [
            "Elite performance programming",
            "Precision nutrition protocols",
            "Advanced recovery systems",
            "Biomarker tracking integration",
            "Periodization mastery",
            "Lifestyle optimization",
            "Daily coaching access",
            "Monthly comprehensive reviews"
          ],
          "Elite": [
            "Celebrity wellness concierge",
            "Integrated health optimization",
            "Executive performance coaching",
            "Private wellness team assembly",
            "Global retreat access",
            "Longevity protocols",
            "24/7 lifestyle management",
            "Quarterly medical integration"
          ]
        }
      },
      "HIIT": {
        features: {
          "Beginner": [
            "Low-impact HIIT modifications",
            "Heart rate zone training intro",
            "20-minute beginner circuits",
            "Recovery day protocols",
            "Pre/post workout nutrition",
            "Injury prevention basics",
            "Form check resources",
            "Weekly check-in emails"
          ],
          "Intermediate": [
            "Advanced interval protocols",
            "Metabolic conditioning cycles",
            "Tabata & EMOM variations",
            "Performance tracking app",
            "Supplement timing for HIIT",
            "Active recovery programming",
            "WhatsApp group support",
            "Bi-weekly video reviews"
          ],
          "Advanced": [
            "Elite athletic conditioning",
            "Sport-specific HIIT design",
            "Lactate threshold training",
            "Wearable tech integration",
            "Periodized intensity blocks",
            "Recovery biomarker tracking",
            "Daily program adjustments",
            "Weekly performance calls"
          ],
          "Elite": [
            "Olympic training methodologies",
            "Real-time performance monitoring",
            "Custom altitude protocols",
            "Elite recovery facilities",
            "Competition tapering expertise",
            "World-class coaching team",
            "Immediate program modifications",
            "Daily physiological monitoring"
          ]
        }
      },
      "Functional Training": {
        features: {
          "Beginner": [
            "Movement pattern fundamentals",
            "Bodyweight progression system",
            "Core stability foundation",
            "Daily mobility routine",
            "Functional nutrition basics",
            "Injury-proofing exercises",
            "Technique video library",
            "Weekly progress emails"
          ],
          "Intermediate": [
            "Kettlebell & sandbag mastery",
            "Unilateral strength development",
            "Movement flow sequences",
            "Performance benchmarks",
            "Nutrition for function",
            "Recovery mobility protocols",
            "Direct coach messaging",
            "Monthly movement screens"
          ],
          "Advanced": [
            "Elite functional patterns",
            "Sport-specific carryover",
            "Advanced plyometrics",
            "Neuromuscular training",
            "Precision recovery systems",
            "Biomechanical analysis",
            "Daily program optimization",
            "Weekly video consultations"
          ],
          "Elite": [
            "Tactical athlete preparation",
            "Military/LEO fitness standards",
            "Extreme environment readiness",
            "Specialized equipment access",
            "Performance under stress",
            "Elite team integration",
            "Immediate tactical adjustments",
            "Daily readiness monitoring"
          ]
        }
      }
    }
  },
  
  "Bodybuilding": {
    icon: "🏋️",
    color: "#4ECDC4",
    bgColor: "#E5F9F6",
    subCategories: {
      "Hypertrophy": {
        features: {
          "Beginner": [
            "3-day full-body split",
            "Muscle group prioritization",
            "Volume progression system",
            "Protein timing basics (20-40g)",
            "Sleep optimization for growth",
            "Pump-focused techniques",
            "Monthly measurements",
            "Email form checks"
          ],
          "Intermediate": [
            "4-day upper/lower split",
            "Mechanical tension focus",
            "Metabolic stress protocols",
            "Muscle protein synthesis timing",
            "Advanced supplementation",
            "Pose & presentation basics",
            "Weekly progress photos",
            "WhatsApp check-ins"
          ],
          "Advanced": [
            "5-6 day body part split",
            "Periodized hypertrophy blocks",
            "Advanced intensity techniques",
            "Nutrient timing mastery",
            "Anabolic window optimization",
            "Competition posing practice",
            "Daily training reviews",
            "Weekly video consultations"
          ],
          "Elite": [
            "IFBB pro-level programming",
            "Maximum recoverable volume",
            "Pharmaceutical-grade protocols",
            "Stage-ready conditioning",
            "Sponsor coordination",
            "Media appearance prep",
            "Daily physique monitoring",
            "24/7 contest prep support"
          ]
        }
      },
      "Strength": {
        features: {
          "Beginner": [
            "Big 4 lift progression",
            "Linear periodization intro",
            "Technique mastery focus",
            "Caloric support for strength",
            "Basic recovery protocols",
            "Equipment selection guide",
            "Monthly strength tests",
            "Email technique reviews"
          ],
          "Intermediate": [
            "Conjugate method elements",
            "Block periodization system",
            "Accessory lift optimization",
            "Nutrition for power output",
            "Supplement timing",
            "Meet preparation basics",
            "Bi-weekly programming",
            "Direct messaging access"
          ],
          "Advanced": [
            "Advanced periodization",
            "Velocity-based training",
            "Competition peak cycles",
            "Weight class management",
            "Elite recovery systems",
            "Championship preparation",
            "Daily program tweaks",
            "Weekly video analysis"
          ],
          "Elite": [
            "World record programming",
            "Elite coaching team",
            "International competition prep",
            "Anti-doping compliance",
            "Sponsorship management",
            "Media & appearance coaching",
            "Real-time competition support",
            "Daily physiological monitoring"
          ]
        }
      },
      "Cutting": {
        features: {
          "Beginner": [
            "Moderate deficit (-500 kcal)",
            "Protein preservation focus",
            "Training volume maintenance",
            "Hunger management strategies",
            "Basic cardio integration",
            "Supplement essentials",
            "Weekly weigh-ins",
            "Email support"
          ],
          "Intermediate": [
            "Aggressive fat loss phases",
            "Macro cycling protocols",
            "Training intensity preservation",
            "Metabolic adaptation prevention",
            "Advanced cutting supplements",
            "Refeed strategies",
            "Bi-weekly assessments",
            "WhatsApp daily support"
          ],
          "Advanced": [
            "Contest prep protocols",
            "Maximum leanness strategies",
            "Muscle retention science",
            "Peak week manipulation",
            "Professional posing",
            "Stage presentation",
            "Daily conditioning checks",
            "Weekly video reviews"
          ],
          "Elite": [
            "Championship conditioning",
            "Multi-show prep management",
            "Sponsor requirement balance",
            "Media-ready leanness",
            "Global contest travel prep",
            "Elite team coordination",
            "24/7 prep monitoring",
            "Daily stage-ready checks"
          ]
        }
      },
      "Bulking": {
        features: {
          "Beginner": [
            "Clean surplus (+300-500 kcal)",
            "Lean mass focus",
            "Minimal fat gain strategies",
            "Protein optimization",
            "Training progression",
            "Basic mass supplements",
            "Monthly composition checks",
            "Email guidance"
          ],
          "Intermediate": [
            "Strategic surplus cycling",
            "Nutrient partitioning focus",
            "Hypertrophy periodization",
            "Digestive health optimization",
            "Advanced mass stack",
            "Body composition tracking",
            "Weekly check-ins",
            "Direct messaging"
          ],
          "Advanced": [
            "Maximum muscle accretion",
            "Off-season optimization",
            "Metabolic flexibility",
            "Gut health protocols",
            "Pharmaceutical guidance",
            "Professional bulk cycles",
            "Daily program reviews",
            "Weekly consultations"
          ],
          "Elite": [
            "Genetic limit approaching",
            "Professional off-season",
            "Sponsor-ready conditioning",
            "Media appearance timing",
            "Elite medical support",
            "Team integration",
            "Daily physique management",
            "24/7 availability"
          ]
        }
      },
      "Contest Prep": {
        features: {
          "Beginner": [
            "First competition guidance",
            "16-week prep timeline",
            "Basic posing introduction",
            "Stage-ready conditioning",
            "Suit/tan coordination",
            "Registration assistance",
            "Weekly check-ins",
            "Email support"
          ],
          "Intermediate": [
            "Multi-show season planning",
            "Advanced conditioning",
            "Professional posing",
            "Peak week protocols",
            "Travel & logistics",
            "Photography prep",
            "Bi-weekly assessments",
            "WhatsApp daily"
          ],
          "Advanced": [
            "National level preparation",
            "Pro card pursuit",
            "Sponsor coordination",
            "Media management",
            "International travel",
            "Elite posing",
            "Daily conditioning",
            "Weekly video calls"
          ],
          "Elite": [
            "IFBB Pro League prep",
            "Olympia qualification",
            "Global contest circuit",
            "Team management",
            "Sponsorship optimization",
            "Legacy building",
            "24/7 contest support",
            "Daily stage monitoring"
          ]
        }
      },
      "Classic Physique": {
        features: {
          "Beginner": [
            "Aesthetic foundation building",
            "V-taper emphasis",
            "Proportion development",
            "Classic posing basics",
            "Old-school techniques",
            "Golden era inspiration",
            "Monthly measurements",
            "Email guidance"
          ],
          "Intermediate": [
            "Classic symmetry focus",
            "Waist-to-shoulder ratio",
            "Leg development balance",
            "Posing routine creation",
            "Aesthetic nutrition",
            "Conditioning for classic",
            "Weekly progress",
            "Direct messaging"
          ],
          "Advanced": [
            "Professional classic prep",
            "Olympia classic standards",
            "Perfect proportions",
            "Signature posing",
            "Stage presence mastery",
            "Media-ready aesthetics",
            "Daily refinement",
            "Weekly consultations"
          ],
          "Elite": [
            "Olympia Classic Physique",
            "Legacy physique building",
            "Global classic standards",
            "Championship posing",
            "Sponsor aesthetics",
            "Media dominance",
            "24/7 classic monitoring",
            "Daily perfection pursuit"
          ]
        }
      }
    }
  },

  "Nutrition": {
    icon: "🥗",
    color: "#45B7D1",
    bgColor: "#E5F5FA",
    subCategories: {
      "Meal Plans": {
        features: {
          "Beginner": [
            "7-day rotating meal plan",
            "Grocery shopping lists",
            "Meal prep instructions",
            "Macro-balanced recipes",
            "Portion size guides",
            "Substitution options",
            "Weekly plan updates",
            "Email questions support"
          ],
          "Intermediate": [
            "Custom meal plan design",
            "Bi-weekly menu rotation",
            "Advanced meal prep",
            "Nutrient timing integration",
            "Dietary restriction accommodation",
            "Family-friendly options",
            "Weekly check-ins",
            "WhatsApp support"
          ],
          "Advanced": [
            "Precision meal planning",
            "Daily macro adjustments",
            "Performance nutrition",
            "Body composition-based changes",
            "Elite athlete protocols",
            "Travel nutrition plans",
            "Daily meal reviews",
            "Weekly consultations"
          ],
          "Elite": [
            "Celebrity chef coordination",
            "Private meal delivery",
            "Real-time dietary adjustments",
            "Global cuisine expertise",
            "Event nutrition management",
            "Medical condition integration",
            "24/7 meal support",
            "Daily optimization"
          ]
        }
      },
      "Macro Coaching": {
        features: {
          "Beginner": [
            "Macro calculation basics",
            "Tracking app setup",
            "Flexible dieting intro",
            "Protein target focus",
            "Carb & fat balance",
            "Weekly macro reviews",
            "Adjustment protocols",
            "Email guidance"
          ],
          "Intermediate": [
            "Advanced macro cycling",
            "Nutrient partitioning",
            "Refined tracking methods",
            "Bio-feedback integration",
            "Diet break strategies",
            "Metabolic adaptation",
            "Bi-weekly adjustments",
            "Direct messaging"
          ],
          "Advanced": [
            "Precision macro manipulation",
            "Daily adjustments",
            "Performance correlation",
            "Hormonal optimization",
            "Advanced refeeds",
            "Contest prep macros",
            "Daily reviews",
            "Weekly calls"
          ],
          "Elite": [
            "Real-time macro optimization",
            "Biomarker-informed changes",
            "Pharmaceutical integration",
            "Elite performance focus",
            "Global travel adaptation",
            "Medical team coordination",
            "24/7 macro management",
            "Daily precision"
          ]
        }
      },
      "Supplements": {
        features: {
          "Beginner": [
            "Essential supplement guide",
            "Protein powder selection",
            "Basic stack design",
            "Timing & dosing basics",
            "Quality brand recommendations",
            "Budget-friendly options",
            "Monthly stack reviews",
            "Email questions"
          ],
          "Intermediate": [
            "Advanced stack optimization",
            "Performance enhancers",
            "Health support protocols",
            "Cycling strategies",
            "Brand quality analysis",
            "Cost-effectiveness",
            "Bi-weekly reviews",
            "WhatsApp support"
          ],
          "Advanced": [
            "Elite supplement protocols",
            "Research-backed stacks",
            "Individual response analysis",
            "Advanced timing",
            "Quality testing",
            "Competition legal",
            "Daily optimization",
            "Weekly consultations"
          ],
          "Elite": [
            "Pharmaceutical-grade sourcing",
            "Custom formulation",
            "Medical supervision",
            "Performance maximization",
            "Global procurement",
            "Anti-doping compliance",
            "24/7 protocol management",
            "Daily adjustments"
          ]
        }
      },
      "Diet Challenges": {
        features: {
          "Beginner": [
            "30-day transformation",
            "Simple meal structures",
            "Daily accountability",
            "Group support access",
            "Progress tracking tools",
            "Reward system",
            "Weekly weigh-ins",
            "Community forum"
          ],
          "Intermediate": [
            "Advanced challenges",
            "Competition elements",
            "Team challenges",
            "Prize incentives",
            "Detailed tracking",
            "Coaching integration",
            "Daily check-ins",
            "Direct support"
          ],
          "Advanced": [
            "Elite transformation",
            "Professional coaching",
            "Significant prizes",
            "Media features",
            "Comprehensive tracking",
            "Medical oversight",
            "Multiple daily check-ins",
            "Priority support"
          ],
          "Elite": [
            "Celebrity challenges",
            "Major prize pools",
            "Global recognition",
            "Professional production",
            "Elite coaching team",
            "Medical team",
            "24/7 challenge support",
            "Immediate response"
          ]
        }
      }
    }
  },

  "Cardio": {
    icon: "🏃",
    color: "#F7DC6F",
    bgColor: "#FCF8E5",
    subCategories: {
      "Endurance": {
        features: {
          "Beginner": [
            "Base building protocol",
            "Heart rate zone training",
            "Progressive distance increase",
            "Recovery run integration",
            "Basic nutrition for endurance",
            "Injury prevention",
            "Weekly mileage logs",
            "Email support"
          ],
          "Intermediate": [
            "Periodized endurance plan",
            "Tempo & threshold work",
            "Long run progression",
            "Race preparation",
            "Fueling strategies",
            "Advanced recovery",
            "Bi-weekly assessments",
            "WhatsApp coaching"
          ],
          "Advanced": [
            "Elite endurance programming",
            "Lactate threshold training",
            "VO2 max development",
            "Ultra-endurance preparation",
            "Precision nutrition timing",
            "Professional recovery",
            "Daily training analysis",
            "Weekly consultations"
          ],
          "Elite": [
            "Marathon/Ultra coaching",
            "Professional race prep",
            "International competition",
            "Altitude training integration",
            "Elite medical support",
            "Sponsorship management",
            "24/7 training monitoring",
            "Daily physiological tracking"
          ]
        }
      },
      "Sprint Training": {
        features: {
          "Beginner": [
            "Sprint mechanics basics",
            "Acceleration development",
            "Speed drills introduction",
            "Recovery between sprints",
            "Basic speed nutrition",
            "Form video analysis",
            "Weekly speed tests",
            "Email feedback"
          ],
          "Intermediate": [
            "Advanced sprint mechanics",
            "Block start technique",
            "Speed endurance",
            "Competition preparation",
            "Power nutrition",
            "Video analysis",
            "Bi-weekly testing",
            "Direct messaging"
          ],
          "Advanced": [
            "Elite sprint programming",
            "Technical mastery",
            "Competition peak cycles",
            "International standards",
            "Performance nutrition",
            "Biomechanical analysis",
            "Daily technique review",
            "Weekly video calls"
          ],
          "Elite": [
            "Olympic-level sprinting",
            "World-class technique",
            "Major games preparation",
            "Professional management",
            "Elite team integration",
            "Global competition",
            "24/7 performance monitoring",
            "Daily optimization"
          ]
        }
      },
      "Heart Health": {
        features: {
          "Beginner": [
            "Cardiac-safe exercise",
            "Heart rate monitoring",
            "Blood pressure management",
            "Doctor clearance protocols",
            "Gentle progression",
            "Stress reduction",
            "Weekly health logs",
            "Medical liaison"
          ],
          "Intermediate": [
            "Advanced cardiac fitness",
            "Heart rate variability",
            "Performance metrics",
            "Preventive protocols",
            "Nutrition for heart health",
            "Comprehensive tracking",
            "Bi-weekly reviews",
            "Health coaching"
          ],
          "Advanced": [
            "Elite cardiac optimization",
            "Athletic heart management",
            "Performance medicine",
            "Advanced biomarkers",
            "Precision nutrition",
            "Medical integration",
            "Daily monitoring",
            "Weekly medical reviews"
          ],
          "Elite": [
            "Executive cardiac program",
            "Concierge cardiology",
            "Elite health optimization",
            "Longevity protocols",
            "Medical team management",
            "Global health access",
            "24/7 health monitoring",
            "Daily optimization"
          ]
        }
      },
      "Fat Burning": {
        features: {
          "Beginner": [
            "Low-impact fat burn",
            "Steady state cardio",
            "Heart rate fat zone",
            "Basic interval intro",
            "Calorie burn tracking",
            "Post-workout nutrition",
            "Weekly progress",
            "Email support"
          ],
          "Intermediate": [
            "Advanced fat burning",
            "HIIT integration",
            "Metabolic conditioning",
            "Fasted cardio protocols",
            "Fat oxidation nutrition",
            "Supplement timing",
            "Bi-weekly assessments",
            "WhatsApp support"
          ],
          "Advanced": [
            "Elite fat loss systems",
            "Metabolic enhancement",
            "Hormonal optimization",
            "Precision cardio timing",
            "Advanced nutrition",
            "Body composition focus",
            "Daily optimization",
            "Weekly consultations"
          ],
          "Elite": [
            "Maximum fat oxidation",
            "Medical-grade protocols",
            "Real-time metabolic monitoring",
            "Pharmaceutical integration",
            "Elite conditioning",
            "Rapid transformation",
            "24/7 fat loss support",
            "Daily monitoring"
          ]
        }
      }
    }
  },

  "Strength": {
    icon: "⚡",
    color: "#BB8FCE",
    bgColor: "#F5EEF8",
    subCategories: {
      "Powerlifting": {
        features: {
          "Beginner": [
            "Big 3 technique focus",
            "Novice linear progression",
            "Equipment basics",
            "Meet preparation intro",
            "Weight class basics",
            "Basic recovery",
            "Monthly mock meets",
            "Email form checks"
          ],
          "Intermediate": [
            "Advanced periodization",
            "Block training",
            "Competition peak",
            "Equipment optimization",
            "Weight class management",
            "Supplement protocols",
            "Bi-weekly programming",
            "Direct messaging"
          ],
          "Advanced": [
            "Elite powerlifting",
            "Custom periodization",
            "National competition",
            "Advanced equipment",
            "Professional nutrition",
            "Recovery optimization",
            "Daily program tweaks",
            "Weekly video reviews"
          ],
          "Elite": [
            "World record training",
            "International competition",
            "Professional coaching team",
            "Sponsorship management",
            "Anti-doping compliance",
            "Elite recovery systems",
            "24/7 competition support",
            "Daily monitoring"
          ]
        }
      },
      "Olympic Lifting": {
        features: {
          "Beginner": [
            "Movement pattern basics",
            "PVC pipe technique",
            "Progressive loading",
            "Mobility for lifting",
            "Basic barbell work",
            "Safety protocols",
            "Weekly technique",
            "Email video reviews"
          ],
          "Intermediate": [
            "Full lift development",
            "Complex training",
            "Competition preparation",
            "Advanced mobility",
            "Weight class focus",
            "Performance nutrition",
            "Bi-weekly technique",
            "Direct coaching"
          ],
          "Advanced": [
            "Elite weightlifting",
            "National competition",
            "Technical mastery",
            "Professional preparation",
            "Precision nutrition",
            "Medical support",
            "Daily technique work",
            "Weekly consultations"
          ],
          "Elite": [
            "Olympic preparation",
            "International competition",
            "World-class technique",
            "Professional management",
            "National team integration",
            "Elite medical team",
            "24/7 training support",
            "Daily optimization"
          ]
        }
      },
      "Strongman": {
        features: {
          "Beginner": [
            "Event introduction",
            "Basic implement training",
            "Strength foundation",
            "Technique for safety",
            "General conditioning",
            "Basic nutrition",
            "Weekly training logs",
            "Email support"
          ],
          "Intermediate": [
            "Event specialization",
            "Implement mastery",
            "Contest preparation",
            "Advanced conditioning",
            "Weight management",
            "Performance nutrition",
            "Bi-weekly programming",
            "Direct messaging"
          ],
          "Advanced": [
            "Professional strongman",
            "National contest prep",
            "Elite event training",
            "Professional conditioning",
            "Medical support",
            "Sponsorship coordination",
            "Daily training review",
            "Weekly consultations"
          ],
          "Elite": [
            "World's Strongest Man prep",
            "International competition",
            "Elite implement access",
            "Professional team",
            "Major sponsorship",
            "Global competition",
            "24/7 contest support",
            "Daily monitoring"
          ]
        }
      },
      "Calisthenics": {
        features: {
          "Beginner": [
            "Fundamental movements",
            "Progressive bodyweight",
            "Core development",
            "Basic skills (pushups, squats)",
            "Mobility foundation",
            "Park basics",
            "Weekly progressions",
            "Email guidance"
          ],
          "Intermediate": [
            "Intermediate skills",
            "Muscle-up, lever progressions",
            "Freestyle introduction",
            "Strength skills",
            "Advanced mobility",
            "Park mastery",
            "Bi-weekly skills",
            "Direct coaching"
          ],
          "Advanced": [
            "Advanced calisthenics",
            "Planche, front lever",
            "Freestyle flow",
            "Elite strength",
            "Professional preparation",
            "Competition ready",
            "Daily skill work",
            "Weekly consultations"
          ],
          "Elite": [
            "World-class calisthenics",
            "Professional freestyle",
            "International competition",
            "Elite strength feats",
            "Sponsorship & media",
            "Global recognition",
            "24/7 skill support",
            "Daily perfection"
          ]
        }
      }
    }
  },

  "Recovery": {
    icon: "🧘",
    color: "#85C1E2",
    bgColor: "#EBF5FB",
    subCategories: {
      "Mobility": {
        features: {
          "Beginner": [
            "Daily mobility routine",
            "Joint health basics",
            "Flexibility foundation",
            "Movement assessment",
            "Basic stretching",
            "Pain-free movement",
            "Weekly routines",
            "Email support"
          ],
          "Intermediate": [
            "Advanced mobility",
            "Joint preparation",
            "Movement optimization",
            "Sport-specific mobility",
            "Myofascial release",
            "Performance mobility",
            "Bi-weekly assessments",
            "Direct coaching"
          ],
          "Advanced": [
            "Elite mobility systems",
            "Professional preparation",
            "Advanced techniques",
            "Movement mastery",
            "Recovery integration",
            "Medical coordination",
            "Daily protocols",
            "Weekly consultations"
          ],
          "Elite": [
            "World-class mobility",
            "Celebrity preparation",
            "Elite team access",
            "Advanced therapies",
            "Global specialist network",
            "Immediate response",
            "24/7 mobility support",
            "Daily optimization"
          ]
        }
      },
      "Yoga": {
        features: {
          "Beginner": [
            "Foundational poses",
            "Breath work basics",
            "Beginner sequences",
            "Flexibility development",
            "Stress reduction",
            "Mindfulness intro",
            "Weekly classes",
            "Email guidance"
          ],
          "Intermediate": [
            "Advanced asanas",
            "Pranayama techniques",
            "Flow sequences",
            "Strength yoga",
            "Meditation integration",
            "Philosophy study",
            "Bi-weekly progress",
            "Direct teaching"
          ],
          "Advanced": [
            "Master-level practice",
            "Advanced pranayama",
            "Teaching preparation",
            "Therapeutic yoga",
            "Spiritual development",
            "Retreat preparation",
            "Daily practice review",
            "Weekly mentorship"
          ],
          "Elite": [
            "Yoga mastery",
            "International teaching",
            "Retreat leadership",
            "Celebrity instruction",
            "Global recognition",
            "Elite student base",
            "24/7 yoga support",
            "Daily spiritual guidance"
          ]
        }
      },
      "Injury Prevention": {
        features: {
          "Beginner": [
            "Prehab basics",
            "Movement screening",
            "Corrective exercises",
            "Warm-up protocols",
            "Load management",
            "Recovery basics",
            "Weekly monitoring",
            "Email support"
          ],
          "Intermediate": [
            "Advanced prehab",
            "Movement diagnostics",
            "Corrective programming",
            "Sport-specific prevention",
            "Load monitoring",
            "Return to play",
            "Bi-weekly screening",
            "Direct coaching"
          ],
          "Advanced": [
            "Elite injury prevention",
            "Professional screening",
            "Advanced diagnostics",
            "Medical integration",
            "Performance protection",
            "Surgery prevention",
            "Daily monitoring",
            "Weekly medical reviews"
          ],
          "Elite": [
            "World-class prevention",
            "Celebrity protection",
            "Medical team leadership",
            "Advanced diagnostics",
            "Immediate response",
            "Global specialist access",
            "24/7 injury prevention",
            "Daily optimization"
          ]
        }
      },
      "Deload Programs": {
        features: {
          "Beginner": [
            "Active recovery basics",
            "Reduced volume weeks",
            "Maintenance training",
            "Stress management",
            "Sleep optimization",
            "Nutrition maintenance",
            "Weekly check-ins",
            "Email support"
          ],
          "Intermediate": [
            "Strategic deloads",
            "Periodized recovery",
            "Performance maintenance",
            "Advanced recovery",
            "Mental refresh",
            "Systemic recovery",
            "Bi-weekly planning",
            "Direct coaching"
          ],
          "Advanced": [
            "Elite deload systems",
            "Performance peaking",
            "Professional recovery",
            "Medical integration",
            "Psychological refresh",
            "Comprehensive restoration",
            "Daily recovery review",
            "Weekly consultations"
          ],
          "Elite": [
            "World-class deload",
            "Celebrity recovery",
            "Elite team coordination",
            "Global recovery access",
            "Immediate restoration",
            "Maximum performance",
            "24/7 recovery support",
            "Daily optimization"
          ]
        }
      }
    }
  }
};

const LEVELS = ["Beginner", "Intermediate", "Advanced", "Elite"];
const DURATIONS = ["4 weeks", "8 weeks", "12 weeks", "16 weeks", "24 weeks", "Ongoing"];

// Helper pour récupérer les features selon catégorie/sous-catégorie/niveau
const getFeaturesForSelection = (category, subCategory, level) => {
  const catConfig = CATEGORY_CONFIG[category];
  if (!catConfig) return [];
  
  const subCatConfig = catConfig.subCategories[subCategory];
  if (!subCatConfig || !subCatConfig.features) return [];
  
  return subCatConfig.features[level] || [];
};

// Helper pour le support et bestFor par niveau (général)
const LEVEL_SUPPORT = {
  "Beginner": "Monthly check-ins via email",
  "Intermediate": "WhatsApp access, weekly check-ins",
  "Advanced": "Daily WhatsApp, private consultations, priority response",
  "Elite": "24/7 VIP support, immediate response, dedicated coach"
};

const LEVEL_BEST_FOR = {
  "Beginner": "Independent athletes wanting expert structure and monthly guidance",
  "Intermediate": "Clients serious about transformation needing weekly support",
  "Advanced": "Pros, influencers, and dedicated athletes requiring daily support",
  "Elite": "Elite performers, celebrities, and professionals needing white-glove service"
};

const Add = ({ token }) => {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Fitness");
  const [subCategory, setSubCategory] = useState("");
  const [level, setLevel] = useState("Beginner");
  const [duration, setDuration] = useState("4 weeks");
  const [popular, setPopular] = useState(false);
  
  // États pour les features dynamiques
  const [features, setFeatures] = useState([]);
  const [bestFor, setBestFor] = useState("");
  const [support, setSupport] = useState("");
  const [subtitle, setSubtitle] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);

  const currentIconConfig = CATEGORY_CONFIG[category];

  // Initialisation de la sous-catégorie quand la catégorie change
  useEffect(() => {
    const subCats = Object.keys(currentIconConfig.subCategories);
    const newSubCat = subCats[0];
    setSubCategory(newSubCat);
  }, [category]);

  // MAJ des features quand catégorie, sous-catégorie OU niveau change
  useEffect(() => {
    if (subCategory) {
      const newFeatures = getFeaturesForSelection(category, subCategory, level);
      setFeatures(newFeatures);
      setBestFor(LEVEL_BEST_FOR[level]);
      setSupport(LEVEL_SUPPORT[level]);
      setSubtitle(`${level} ${subCategory} Program`);
    }
  }, [category, subCategory, level]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be less than 5MB");
        return;
      }
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setPrice('');
    setCategory("Fitness");
    const defaultSubCat = Object.keys(CATEGORY_CONFIG["Fitness"].subCategories)[0];
    setSubCategory(defaultSubCat);
    setLevel("Beginner");
    setDuration("4 weeks");
    setPopular(false);
    setImage(null);
    setPreviewUrl(null);
    // Reset features
    const defaultFeatures = getFeaturesForSelection("Fitness", defaultSubCat, "Beginner");
    setFeatures(defaultFeatures);
    setBestFor(LEVEL_BEST_FOR["Beginner"]);
    setSupport(LEVEL_SUPPORT["Beginner"]);
    setSubtitle(`Beginner ${defaultSubCat} Program`);
  };

  // Gestion des features personnalisées
  const handleFeatureChange = (index, value) => {
    const newFeatures = [...features];
    newFeatures[index] = value;
    setFeatures(newFeatures);
  };

  const addFeature = () => {
    setFeatures([...features, '']);
  };

  const removeFeature = (index) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("description", description.trim());
      formData.append("price", Number(price));
      formData.append("category", category);
      formData.append("subCategory", subCategory);
      formData.append("level", level);
      formData.append("duration", duration);
      formData.append("popular", popular);
      
      // Envoi des features et métadonnées dynamiques
      formData.append("features", JSON.stringify(features.filter(f => f.trim())));
      formData.append("subtitle", subtitle);
      formData.append("bestFor", bestFor);
      formData.append("support", support);
      formData.append("icon", CATEGORY_CONFIG[category].icon);

      if (image) {
        formData.append("image", image);
      }

      const response = await axios.post(
        `${backendUrl}/api/program/add`,
        formData,
        { 
          headers: {
            token,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        resetForm();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to add program");
    } finally {
      setIsLoading(false);
    }
  };

  const PlanIcon = ({ categoryName, size = "medium", showBadge = false }) => {
    const config = CATEGORY_CONFIG[categoryName] || CATEGORY_CONFIG["Fitness"];
    
    const sizes = {
      small: { width: 32, height: 32, fontSize: 16 },
      medium: { width: 48, height: 48, fontSize: 24 },
      large: { width: 80, height: 80, fontSize: 40 },
      xl: { width: 120, height: 120, fontSize: 60 }
    };

    const sizeStyle = sizes[size] || sizes.medium;

    return (
      <div 
        className="plan-icon-container"
        style={{
          width: sizeStyle.width,
          height: sizeStyle.height,
          backgroundColor: config.bgColor,
          border: `2px solid ${config.color}`,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: sizeStyle.fontSize,
          position: 'relative',
          transition: 'all 0.3s ease',
          boxShadow: `0 4px 15px ${config.color}30`
        }}
      >
        <span style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}>
          {config.icon}
        </span>
        
        {showBadge && (
          <div 
            className="plan-icon-badge"
            style={{
              position: 'absolute',
              bottom: -2,
              right: -2,
              width: sizeStyle.width * 0.35,
              height: sizeStyle.height * 0.35,
              backgroundColor: config.color,
              borderRadius: '50%',
              border: '2px solid white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: sizeStyle.fontSize * 0.4,
              color: 'white'
            }}
          >
            ✓
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="add-container">
      <div className="page-header">
        <div className="header-icon-wrapper">
          <PlanIcon categoryName={category} size="xl" showBadge={true} />
        </div>
        <h1 className="page-title">
          {category} • {subCategory}
        </h1>
        <p className="page-subtitle">
          {level} Level • {features.length} specialized features
        </p>
      </div>
      
      <form onSubmit={onSubmitHandler} className="add-form">
        {/* Category & SubCategory Selection - DROPDOWNS */}
        <div className="form-section">
          <label className="section-label">
            <span className="gold-icon">🎯</span> Program Category & Focus
          </label>
          
          <div className="selectors-row">
            <div className="form-group">
              <label className="input-label">
                <span style={{ color: currentIconConfig.color }}>{currentIconConfig.icon}</span> Category
              </label>
              <div className="custom-select-wrapper">
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="custom-select"
                >
                  {Object.keys(CATEGORY_CONFIG).map((cat) => (
                    <option key={cat} value={cat}>
                      {CATEGORY_CONFIG[cat].icon} {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="input-label">Subcategory</label>
              <div className="custom-select-wrapper">
                <select 
                  value={subCategory}
                  onChange={(e) => setSubCategory(e.target.value)}
                  className="custom-select"
                >
                  {Object.keys(currentIconConfig.subCategories).map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Image Upload - CONTAINER PLUS PETIT */}
        <div className="form-section image-section-compact">
          <label className="section-label">
            <span className="gold-icon">📷</span> Program Image
          </label>
          <div className="image-upload-wrapper compact">
            <label htmlFor="image" className="image-upload-box">
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="preview-image compact" />
              ) : (
                <div className="upload-placeholder compact">
                  <PlanIcon categoryName={category} size="small" />
                  <span className="placeholder-text">Click to upload</span>
                  <span className="placeholder-hint" style={{ color: currentIconConfig.color, fontSize: '0.75rem' }}>
                    {currentIconConfig.icon} {category}
                  </span>
                </div>
              )}
              <input
                onChange={handleImageChange}
                type="file"
                id="image"
                accept="image/*"
                hidden
                required
              />
            </label>
            {image && (
              <button 
                type="button" 
                className="remove-image-btn small"
                onClick={() => {
                  setImage(null);
                  setPreviewUrl(null);
                }}
              >
                ✕ Remove
              </button>
            )}
          </div>
        </div>

        {/* Basic Info */}
        <div className="form-section">
          <label className="section-label">
            <PlanIcon categoryName={category} size="small" /> Program Details
          </label>
          
          <div className="form-group">
            <label className="input-label">
              <span style={{ color: currentIconConfig.color }}>{currentIconConfig.icon}</span> Program Name
            </label>
            <input
              onChange={(e) => setName(e.target.value)}
              value={name}
              type="text"
              placeholder={`e.g., ${level} ${subCategory} Mastery`}
              required
              style={{ borderColor: name ? currentIconConfig.color : undefined }}
            />
          </div>

          <div className="form-group">
            <label className="input-label">Description</label>
            <textarea
              onChange={(e) => setDescription(e.target.value)}
              value={description}
              rows="4"
              placeholder={`Specialized ${subCategory.toLowerCase()} program for ${level.toLowerCase()} athletes...`}
              required
            />
          </div>
        </div>

        {/* Pricing */}
        <div className="form-section">
          <label className="section-label">
            <span className="gold-icon">💰</span> Pricing
          </label>
          
          <div className="form-group">
            <label className="input-label">Price (€)</label>
            <div className="price-input-wrapper">
              <span className="currency" style={{ color: currentIconConfig.color }}></span>
              <input
                onChange={(e) => setPrice(e.target.value)}
                value={price}
                type="number"
                placeholder="99"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>
        </div>

        {/* Level & Duration - DROPDOWNS */}
        <div className="form-section">
          <label className="section-label">
            <span className="gold-icon">⚡</span> Level & Duration
          </label>
          
          <div className="selectors-row two-col">
            <div className="form-group">
              <label className="input-label">Difficulty Level</label>
              <div className="custom-select-wrapper">
                <select 
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="custom-select"
                >
                  {LEVELS.map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {lvl}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="input-label">Duration</label>
              <div className="custom-select-wrapper">
                <select 
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="custom-select"
                >
                  {DURATIONS.map(dur => (
                    <option key={dur} value={dur}>{dur}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* DYNAMIC FEATURES */}
        <div className="form-section features-section">
          <label className="section-label" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px',
            color: currentIconConfig.color
          }}>
            <span>📋</span>
            Specialized Features: {category} • {subCategory} • {level}
            <span className="feature-count">({features.length} items)</span>
          </label>
          
          <div className="features-editor" style={{ 
            background: currentIconConfig.bgColor,
            border: `2px solid ${currentIconConfig.color}40`,
            borderRadius: '16px',
            padding: '20px'
          }}>
            <div className="features-header" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '15px',
              paddingBottom: '10px',
              borderBottom: `1px solid ${currentIconConfig.color}30`
            }}>
              <span style={{ fontWeight: 600, color: currentIconConfig.color }}>
                Auto-generated for {subCategory}
              </span>
              <button 
                type="button"
                onClick={() => setFeatures(getFeaturesForSelection(category, subCategory, level))}
                style={{
                  padding: '6px 12px',
                  background: currentIconConfig.color,
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                ↺ Reset to Default
              </button>
            </div>

            {features.map((feature, idx) => (
              <div key={idx} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px',
                marginBottom: '10px'
              }}>
                <span style={{ 
                  color: currentIconConfig.color,
                  fontWeight: 700,
                  minWidth: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'white',
                  borderRadius: '50%',
                  border: `2px solid ${currentIconConfig.color}`
                }}>{idx + 1}</span>
                <input
                  type="text"
                  value={feature}
                  onChange={(e) => handleFeatureChange(idx, e.target.value)}
                  placeholder={`${subCategory} feature ${idx + 1}`}
                  style={{ 
                    flex: 1,
                    padding: '10px 14px',
                    border: `1px solid ${currentIconConfig.color}40`,
                    borderRadius: '8px',
                    fontSize: '0.95rem',
                    background: 'white'
                  }}
                />
                <button 
                  type="button"
                  onClick={() => removeFeature(idx)}
                  style={{
                    background: '#ff4757',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem'
                  }}
                >
                  ×
                </button>
              </div>
            ))}
            
            <button 
              type="button" 
              onClick={addFeature}
              style={{
                width: '100%',
                padding: '12px',
                background: 'transparent',
                border: `2px dashed ${currentIconConfig.color}`,
                color: currentIconConfig.color,
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: 600,
                marginTop: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              + Add Custom {subCategory} Feature
            </button>
          </div>
        </div>

        {/* Auto-generated Info */}
        <div className="form-section" style={{
          background: '#f8f9fa',
          borderRadius: '12px',
          padding: '20px'
        }}>
          <label className="section-label">Auto-Generated Program Info</label>
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '15px'
          }}>
            <div className="form-group">
              <label className="input-label">Best For</label>
              <input 
                type="text" 
                value={bestFor}
                readOnly
                style={{ 
                  background: 'white',
                  cursor: 'not-allowed',
                  fontSize: '0.85rem',
                  color: '#666'
                }}
              />
            </div>
            <div className="form-group">
              <label className="input-label">Support Level</label>
              <input 
                type="text" 
                value={support}
                readOnly
                style={{ 
                  background: 'white',
                  cursor: 'not-allowed',
                  fontSize: '0.85rem',
                  color: '#666'
                }}
              />
            </div>
          </div>
          <div className="form-group" style={{ marginTop: '10px' }}>
            <label className="input-label">Program Subtitle</label>
            <input 
              type="text" 
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              style={{ fontSize: '0.9rem' }}
            />
          </div>
        </div>

        {/* Popular Toggle */}
        <div className="form-section popular-section">
          <label className="toggle-switch">
            <input
              onChange={() => setPopular(prev => !prev)}
              checked={popular}
              type="checkbox"
            />
            <span 
              className="toggle-slider" 
              style={{ backgroundColor: popular ? currentIconConfig.color : '#ccc' }}
            ></span>
            <div className="toggle-content">
              <span className="toggle-label">Mark as Popular Program</span>
              <span className="toggle-hint">
                Featured on homepage • {currentIconConfig.icon} {category} • {subCategory}
              </span>
            </div>
          </label>
        </div>

        {/* Submit */}
        <button 
          type="submit" 
          className="submit-btn"
          disabled={isLoading}
          style={{ 
            background: `linear-gradient(135deg, ${currentIconConfig.color}, ${currentIconConfig.color}dd)`,
            boxShadow: `0 10px 30px ${currentIconConfig.color}50`
          }}
        >
          {isLoading ? (
            <span className="loading-text">
              Creating {level} {subCategory} Program...
            </span>
          ) : (
            <>
              <PlanIcon categoryName={category} size="small" />
              CREATE {level.toUpperCase()} {subCategory.toUpperCase()} PROGRAM
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default Add;