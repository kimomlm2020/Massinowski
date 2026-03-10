// ============================================
// LIST.JSX - VERSION COMPLÈTE AVEC FEATURES PAR CATÉGORIE/SOUS-CATÉGORIE/NIVEAU
// ============================================

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { backendUrl, currency } from '../App';
import { toast } from 'react-toastify';
import '../style/List.scss';
import { assets } from '../assets/assets.js';

// ========== CONSTANTES PARTAGÉES (identiques à Add.jsx) ==========

const CATEGORY_ICONS = {
  "Fitness": { icon: "💪", color: "#FF6B6B", bgColor: "#FFE5E5" },
  "Bodybuilding": { icon: "🏋️", color: "#4ECDC4", bgColor: "#E5F9F6" },
  "Nutrition": { icon: "🥗", color: "#45B7D1", bgColor: "#E5F5FA" },
  "Cardio": { icon: "🏃", color: "#F7DC6F", bgColor: "#FCF8E5" },
  "Strength": { icon: "⚡", color: "#BB8FCE", bgColor: "#F5EEF8" },
  "Recovery": { icon: "🧘", color: "#85C1E2", bgColor: "#EBF5FB" }
};

const CATEGORY_SUBCATEGORIES = {
  "Fitness": ["Weight Loss", "Muscle Gain", "General Fitness", "HIIT", "Functional Training"],
  "Bodybuilding": ["Hypertrophy", "Strength", "Cutting", "Bulking", "Contest Prep", "Classic Physique"],
  "Nutrition": ["Meal Plans", "Macro Coaching", "Supplements", "Diet Challenges"],
  "Cardio": ["Endurance", "Sprint Training", "Heart Health", "Fat Burning"],
  "Strength": ["Powerlifting", "Olympic Lifting", "Strongman", "Calisthenics"],
  "Recovery": ["Mobility", "Yoga", "Injury Prevention", "Deload Programs"]
};

const LEVELS = ["Beginner", "Intermediate", "Advanced", "Elite"];
const DURATIONS = ["4 weeks", "8 weeks", "12 weeks", "16 weeks", "24 weeks", "Ongoing"];

// ========== FEATURES PAR CATÉGORIE + SOUS-CATÉGORIE + NIVEAU ==========

const CATEGORY_FEATURES = {
  "Fitness": {
    "Weight Loss": {
      "Beginner": [
        "Basic cardio routine (3x/week)",
        "Simple meal planning guide",
        "Weekly weight tracking",
        "Portion control education",
        "Basic home workouts",
        "Email support",
        "Progress photo guide",
        "Habit tracking sheet"
      ],
      "Intermediate": [
        "HIIT cardio programming",
        "Macro tracking setup",
        "Bi-weekly check-ins",
        "Supplement guidance",
        "Gym workout plans",
        "WhatsApp support",
        "Body composition analysis",
        "Meal prep strategies"
      ],
      "Advanced": [
        "Custom HIIT + LISS protocol",
        "Advanced macro cycling",
        "Weekly video check-ins",
        "Full supplement stack",
        "Periodized training",
        "Daily WhatsApp access",
        "Metabolic testing referral",
        "Contest prep guidance"
      ],
      "Elite": [
        "Metabolic conditioning specialist",
        "Daily macro adjustments",
        "24/7 coach access",
        "Blood work analysis",
        "Professional photo prep",
        "Weekly calls",
        "Priority scheduling",
        "Custom apparel"
      ]
    },
    "Muscle Gain": {
      "Beginner": [
        "3-day split routine",
        "Protein intake guide",
        "Monthly progress pics",
        "Basic form videos",
        "Recovery basics",
        "Email support",
        "Workout log template",
        "Nutrition timing intro"
      ],
      "Intermediate": [
        "4-day hypertrophy split",
        "Calorie surplus planning",
        "Bi-weekly measurements",
        "Form check videos",
        "Supplement basics",
        "WhatsApp chat",
        "Progressive overload tracking",
        "Meal timing optimization"
      ],
      "Advanced": [
        "5-day advanced split",
        "Nutrient timing protocol",
        "Weekly posing practice",
        "1-on-1 video sessions",
        "Advanced supplements",
        "Daily check-ins",
        "Blood panel review",
        "Peak week protocols"
      ],
      "Elite": [
        "Custom periodization",
        "Daily anabolic optimization",
        "24/7 priority access",
        "Pharmaceutical guidance",
        "Professional network access",
        "Weekly video calls",
        "Sponsorship guidance",
        "VIP event access"
      ]
    },
    "General Fitness": {
      "Beginner": [
        "Full body routine (3x/week)",
        "Basic nutrition guide",
        "Monthly check-in",
        "Exercise library",
        "Flexibility routine",
        "Email support",
        "Wellness tracking",
        "Beginner challenges"
      ],
      "Intermediate": [
        "Upper/Lower split",
        "Macro tracking setup",
        "Bi-weekly reviews",
        "Video form checks",
        "Recovery protocols",
        "WhatsApp group",
        "Performance testing",
        "Lifestyle coaching"
      ],
      "Advanced": [
        "Athletic performance plan",
        "Advanced recovery methods",
        "Weekly consultations",
        "Movement screening",
        "Injury prevention",
        "Daily monitoring",
        "Sport-specific prep",
        "Mental performance"
      ],
      "Elite": [
        "Elite athlete programming",
        "Recovery optimization lab",
        "24/7 performance support",
        "Biomechanical analysis",
        "Medical team coordination",
        "Daily video review",
        "Championship preparation",
        "Legacy planning"
      ]
    },
    "HIIT": {
      "Beginner": [
        "20-min home workouts",
        "Heart rate zone guide",
        "Weekly schedule",
        "Modification options",
        "Safety protocols",
        "Email support",
        "Progress tracking",
        "Equipment alternatives"
      ],
      "Intermediate": [
        "30-min advanced HIIT",
        "Zone 2 + Zone 5 mix",
        "Performance metrics",
        "Heart rate variability",
        "Recovery tracking",
        "WhatsApp support",
        "Monthly testing",
        "Nutrition timing"
      ],
      "Advanced": [
        "45-min elite protocols",
        "Lactate threshold training",
        "Power output tracking",
        "Altitude simulation",
        "Cryotherapy protocol",
        "Daily optimization",
        "Weekly blood markers",
        "Professional networking"
      ],
      "Elite": [
        "Olympic-level periodization",
        "VO2 max optimization",
        "24/7 performance lab",
        "Genetic testing",
        "Altitude chamber access",
        "Real-time monitoring",
        "World championship prep",
        "Career management"
      ]
    },
    "Functional Training": {
      "Beginner": [
        "Movement pattern basics",
        "Bodyweight progressions",
        "Mobility routine",
        "Core stability",
        "Balance training",
        "Email support",
        "Movement screening",
        "Daily movement tips"
      ],
      "Intermediate": [
        "Kettlebell & sandbag work",
        "Unilateral training",
        "Power development",
        "Agility drills",
        "Prehab routine",
        "WhatsApp coaching",
        "Video analysis",
        "Sport application"
      ],
      "Advanced": [
        "Olympic lift variations",
        "Plyometric progression",
        "Energy system training",
        "Movement complexity",
        "Rehab integration",
        "Daily programming",
        "Weekly assessments",
        "Performance video"
      ],
      "Elite": [
        "Elite athletic development",
        "Multi-planar power",
        "24/7 movement lab",
        "Neuromuscular training",
        "Return to play protocol",
        "Real-time feedback",
        "Professional combine prep",
        "Career longevity"
      ]
    }
  },
  "Bodybuilding": {
    "Hypertrophy": {
      "Beginner": [
        "3-day bro split",
        "Mind-muscle connection",
        "Basic posing",
        "Protein timing",
        "Sleep optimization",
        "Email support",
        "Pump techniques",
        "Beginner supplements"
      ],
      "Intermediate": [
        "4-day upper/lower",
        "Advanced techniques",
        "Weekly posing",
        "Nutrient partitioning",
        "Recovery modalities",
        "WhatsApp group",
        "Progress photos",
        "Peak week basics"
      ],
      "Advanced": [
        "5-day specialization",
        "Myo-reps & dropsets",
        "Daily posing practice",
        "Insulin manipulation",
        "PED guidance",
        "Daily check-ins",
        "Professional photoshoot",
        "Sponsorship prep"
      ],
      "Elite": [
        "IFBB pro programming",
        "Advanced pharmacology",
        "24/7 contest prep",
        "Metabolic flexibility",
        "Medical supervision",
        "Hourly updates",
        "Pro card strategy",
        "Legacy building"
      ]
    },
    "Strength": {
      "Beginner": [
        "5x5 foundation",
        "Technique mastery",
        "Linear progression",
        "Recovery basics",
        "Mobility routine",
        "Email support",
        "Form videos",
        "Beginner meets"
      ],
      "Intermediate": [
        "531 variation",
        "Block periodization",
        "Competition prep",
        "Accessory work",
        "Injury prevention",
        "WhatsApp chat",
        "Video analysis",
        "Local competitions"
      ],
      "Advanced": [
        "Conjugate method",
        "Advanced peaking",
        "National level prep",
        "Velocity tracking",
        "Specialized equipment",
        "Daily programming",
        "Weekly video calls",
        "Sponsorship approach"
      ],
      "Elite": [
        "Elite total programming",
        "World record prep",
        "24/7 meet day support",
        "Multi-ply/equipped",
        "Medical team",
        "Real-time coaching",
        "International travel",
        "Hall of fame path"
      ]
    },
    "Cutting": {
      "Beginner": [
        "Calorie deficit guide",
        "Cardio progression",
        "Hunger management",
        "Basic meal prep",
        "Supplement basics",
        "Weekly check-ins",
        "Progress photos",
        "Maintenance guide"
      ],
      "Intermediate": [
        "Macro cycling",
        "Refeed protocol",
        "Metabolic adaptation",
        "Advanced cardio",
        "Fat burners",
        "Bi-weekly calls",
        "Body fat testing",
        "Reverse diet plan"
      ],
      "Advanced": [
        "Contest prep protocol",
        "Peak week mastery",
        "Daily conditioning",
        "Water manipulation",
        "Advanced stack",
        "Daily monitoring",
        "Professional photos",
        "Post-show rebound"
      ],
      "Elite": [
        "Pro debut prep",
        "Multiple show season",
        "24/7 peak week",
        "Medical supervision",
        "Pharmaceutical grade",
        "Hourly adjustments",
        "Magazine features",
        "Sponsorship deals"
      ]
    },
    "Bulking": {
      "Beginner": [
        "Clean bulk guide",
        "Calorie surplus",
        "Minimize fat gain",
        "Strength focus",
        "Digestive health",
        "Monthly check-ins",
        "Progress tracking",
        "Off-season basics"
      ],
      "Intermediate": [
        "Lean bulk protocol",
        "Nutrient timing",
        "Mini-cut cycles",
        "Hypertrophy block",
        "Digestive enzymes",
        "Bi-weekly reviews",
        "Body composition",
        "Metabolic health"
      ],
      "Advanced": [
        "Off-season massing",
        "Anabolic optimization",
        "Strategic deloads",
        "Weak point training",
        "Advanced supplements",
        "Weekly assessments",
        "Professional feedback",
        "Long-term planning"
      ],
      "Elite": [
        "Pro off-season",
        "Maximum muscle gain",
        "24/7 anabolic support",
        "Health monitoring",
        "Pharmaceutical optimization",
        "Daily adjustments",
        "Team integration",
        "Career longevity"
      ]
    },
    "Contest Prep": {
      "Beginner": [
        "First show guidance",
        "16-week prep",
        "Basic posing",
        "Suit selection",
        "Tanning guide",
        "Weekly check-ins",
        "Local show prep",
        "Post-show recovery"
      ],
      "Intermediate": [
        "Regional show prep",
        "12-week protocol",
        "Advanced posing",
        "Peak week strategy",
        "Suit customization",
        "Bi-weekly calls",
        "Professional photos",
        "Multiple shows"
      ],
      "Advanced": [
        "National qualification",
        "8-week peak",
        "Professional posing",
        "Multiple peaks",
        "Wardrobe management",
        "Daily check-ins",
        "Magazine shoots",
        "Sponsorship prep"
      ],
      "Elite": [
        "Pro card chase",
        "Pro debut",
        "24/7 contest support",
        "Olympia qualification",
        "Full team support",
        "Real-time adjustments",
        "International travel",
        "Legacy building"
      ]
    },
    "Classic Physique": {
      "Beginner": [
        "Aesthetic foundation",
        "V-taper focus",
        "Posing basics",
        "Proportion training",
        "Classic look",
        "Monthly reviews",
        "Photo progress",
        "First show prep"
      ],
      "Intermediate": [
        "Classic division prep",
        "Advanced posing",
        "Symmetry work",
        "Old school methods",
        "Aesthetic coaching",
        "Bi-weekly videos",
        "Professional feedback",
        "Regional shows"
      ],
      "Advanced": [
        "Pro classic physique",
        "Signature poses",
        "Flow & transitions",
        "Golden era style",
        "Stage presence",
        "Daily practice",
        "National level",
        "Magazine features"
      ],
      "Elite": [
        "Olympia classic",
        "Legendary physique",
        "24/7 classic support",
        "Hall of fame path",
        "Iconic status",
        "Real-time coaching",
        "International fame",
        "Legacy creation"
      ]
    }
  },
  "Nutrition": {
    "Meal Plans": {
      "Beginner": [
        "7-day meal template",
        "Shopping list",
        "Meal prep guide",
        "Basic recipes",
        "Portion education",
        "Email support",
        "Substitution guide",
        "Budget options"
      ],
      "Intermediate": [
        "Custom meal plans",
        "Macro matching",
        "Recipe variety",
        "Dining out guide",
        "Travel nutrition",
        "WhatsApp support",
        "Weekly adjustments",
        "Family-friendly"
      ],
      "Advanced": [
        "Elite meal design",
        "Nutrient timing",
        "Cyclical nutrition",
        "Gourmet options",
        "Chef consultation",
        "Daily monitoring",
        "Blood sugar optimization",
        "Performance fueling"
      ],
      "Elite": [
        "Celebrity chef team",
        "Personal meal delivery",
        "24/7 nutritionist",
        "Organic sourcing",
        "Allergen management",
        "Real-time adjustments",
        "Medical nutrition",
        "Longevity focus"
      ]
    },
    "Macro Coaching": {
      "Beginner": [
        "Macro basics",
        "Tracking app setup",
        "Food scale guide",
        "Reading labels",
        "Basic adjustments",
        "Weekly check-ins",
        "Progress tracking",
        "Education materials"
      ],
      "Intermediate": [
        "Custom macros",
        "Cycling protocols",
        "Refeed strategy",
        "Tracking accuracy",
        "Bio-feedback",
        "Bi-weekly reviews",
        "Metabolic adaptation",
        "Flexible dieting"
      ],
      "Advanced": [
        "Advanced cycling",
        "Metabolic testing",
        "Hormonal optimization",
        "Contest macros",
        "Peak week nutrition",
        "Daily adjustments",
        "Blood work review",
        "Pharmaceutical synergy"
      ],
      "Elite": [
        "Elite metabolic programming",
        "Daily macro manipulation",
        "24/7 metabolic support",
        "Continuous monitoring",
        "Medical supervision",
        "Hourly adjustments",
        "Research participation",
        "Pioneer protocols"
      ]
    },
    "Supplements": {
      "Beginner": [
        "Basic stack guide",
        "Quality brands",
        "Timing protocol",
        "Safety information",
        "Budget options",
        "Monthly reviews",
        "Progress tracking",
        "Education"
      ],
      "Intermediate": [
        "Custom stack design",
        "Cycling protocols",
        "Advanced timing",
        "Bioavailability",
        "Stack synergy",
        "Bi-weekly check-ins",
        "Blood work basics",
        "Optimization"
      ],
      "Advanced": [
        "Advanced protocols",
        "Research compounds",
        "Blood work monitoring",
        "Health optimization",
        "Performance stack",
        "Weekly consultations",
        "Medical supervision",
        "Cutting edge"
      ],
      "Elite": [
        "Pharmaceutical grade",
        "Custom formulations",
        "24/7 medical support",
        "Clinical trials",
        "Exclusive access",
        "Daily monitoring",
        "Longevity focus",
        "Elite network"
      ]
    },
    "Diet Challenges": {
      "Beginner": [
        "30-day challenge",
        "Group support",
        "Daily motivation",
        "Simple rules",
        "Progress tracking",
        "Community access",
        "Weekly winners",
        "Completion rewards"
      ],
      "Intermediate": [
        "60-day transformation",
        "Competitive element",
        "Advanced tracking",
        "Prize incentives",
        "Leaderboard",
        "VIP group",
        "Bi-weekly prizes",
        "Alumni network"
      ],
      "Advanced": [
        "90-day elite challenge",
        "Cash prizes",
        "Professional judging",
        "Media exposure",
        "Sponsorship opportunities",
        "Daily coaching",
        "Weekly prizes",
        "Pro qualification"
      ],
      "Elite": [
        "Championship series",
        "Pro contract prizes",
        "24/7 elite support",
        "International exposure",
        "Career launching",
        "Real-time coaching",
        "Major sponsorships",
        "Hall of fame"
      ]
    }
  },
  "Cardio": {
    "Endurance": {
      "Beginner": [
        "Base building (Zone 2)",
        "Heart rate training",
        "Weekly mileage",
        "Recovery runs",
        "Basic nutrition",
        "Monthly check-ins",
        "Race preparation",
        "Injury prevention"
      ],
      "Intermediate": [
        "Threshold training",
        "Interval workouts",
        "Long run progression",
        "Tempo runs",
        "Fueling strategy",
        "Bi-weekly reviews",
        "Half marathon prep",
        "Performance testing"
      ],
      "Advanced": [
        "Advanced periodization",
        "Lactate threshold",
        "VO2 max intervals",
        "Ultra training",
        "Race simulation",
        "Weekly consultations",
        "Marathon/Ultra prep",
        "Elite racing"
      ],
      "Elite": [
        "Olympic development",
        "World championship",
        "24/7 coaching",
        "Altitude training",
        "Professional team",
        "Daily monitoring",
        "International circuit",
        "Legacy building"
      ]
    },
    "Sprint Training": {
      "Beginner": [
        "Form development",
        "Acceleration basics",
        "Speed drills",
        "Recovery protocols",
        "Basic strength",
        "Weekly sessions",
        "Video analysis",
        "Progress tracking"
      ],
      "Intermediate": [
        "Advanced mechanics",
        "Block starts",
        "Speed endurance",
        "Power development",
        "Plyometrics",
        "Bi-weekly testing",
        "Competition prep",
        "Technical refinement"
      ],
      "Advanced": [
        "Elite sprinting",
        "Video analysis",
        "Biomechanics",
        "Force-velocity",
        "Advanced plyos",
        "Daily programming",
        "National competition",
        "Professional approach"
      ],
      "Elite": [
        "Olympic sprinting",
        "World class mechanics",
        "24/7 performance lab",
        "Wind tunnel testing",
        "Neuromuscular training",
        "Real-time feedback",
        "Diamond League",
        "Gold medal pursuit"
      ]
    },
    "Heart Health": {
      "Beginner": [
        "Cardiac rehab basics",
        "Doctor clearance",
        "Gentle progression",
        "Heart rate zones",
        "Stress management",
        "Monthly monitoring",
        "Lifestyle changes",
        "Family support"
      ],
      "Intermediate": [
        "Advanced cardiac fitness",
        "Interval training",
        "Blood pressure management",
        "Cholesterol optimization",
        "Stress reduction",
        "Bi-weekly check-ins",
        "Medical collaboration",
        "Long-term health"
      ],
      "Advanced": [
        "Elite cardiac performance",
        "Athlete heart optimization",
        "Advanced monitoring",
        "Genetic factors",
        "Medical team",
        "Weekly assessments",
        "Research participation",
        "Optimal longevity"
      ],
      "Elite": [
        "Cardiac optimization lab",
        "Elite longevity",
        "24/7 medical support",
        "Cutting edge research",
        "Personalized medicine",
        "Daily monitoring",
        "Pioneer treatments",
        "Maximum lifespan"
      ]
    },
    "Fat Burning": {
      "Beginner": [
        "Fat loss cardio",
        "Heart rate zones",
        "Steady state basics",
        "Weekly schedule",
        "Basic nutrition",
        "Monthly check-ins",
        "Progress tracking",
        "Sustainable habits"
      ],
      "Intermediate": [
        "HIIT protocols",
        "Fasted cardio",
        "Metabolic conditioning",
        "Advanced zones",
        "Nutrient timing",
        "Bi-weekly reviews",
        "Body composition",
        "Metabolic health"
      ],
      "Advanced": [
        "Elite fat loss",
        "Metabolic enhancement",
        "Advanced protocols",
        "Hormonal optimization",
        "Supplement stack",
        "Weekly consultations",
        "Rapid results",
        "Contest ready"
      ],
      "Elite": [
        "Maximum fat oxidation",
        "Metabolic mastery",
        "24/7 optimization",
        "Medical supervision",
        "Pharmaceutical support",
        "Daily adjustments",
        "Photo shoot ready",
        "Pro level conditioning"
      ]
    }
  },
  "Strength": {
    "Powerlifting": {
      "Beginner": [
        "Big 3 technique",
        "Linear progression",
        "Equipment basics",
        "Meet preparation",
        "Safety protocols",
        "Monthly check-ins",
        "Local meets",
        "Form videos"
      ],
      "Intermediate": [
        "Periodized training",
        "Block programming",
        "Competition prep",
        "Gear introduction",
        "Peaking strategy",
        "Bi-weekly reviews",
        "Regional meets",
        "Video analysis"
      ],
      "Advanced": [
        "Advanced periodization",
        "Equipped lifting",
        "National competition",
        "Velocity tracking",
        "Specialized prep",
        "Weekly consultations",
        "Elite totals",
        "Sponsorship approach"
      ],
      "Elite": [
        "World record training",
        "Multi-ply mastery",
        "24/7 meet support",
        "International competition",
        "Professional team",
        "Daily programming",
        "IPF/Elite totals",
        "Hall of fame"
      ]
    },
    "Olympic Lifting": {
      "Beginner": [
        "Movement patterns",
        "PVC technique",
        "Basic positions",
        "Mobility work",
        "Light loading",
        "Weekly sessions",
        "Video learning",
        "Progress tracking"
      ],
      "Intermediate": [
        "Full lifts",
        "Percentage based",
        "Complex training",
        "Pull variations",
        "Jerk development",
        "Bi-weekly coaching",
        "Local competitions",
        "Technical refinement"
      ],
      "Advanced": [
        "Elite technique",
        "Double sessions",
        "Competition cycle",
        "Advanced complexes",
        "Video analysis",
        "Daily programming",
        "National level",
        "International prep"
      ],
      "Elite": [
        "Olympic team prep",
        "World class technique",
        "24/7 coaching",
        "International camps",
        "National team",
        "Real-time feedback",
        "Olympic qualification",
        "Medal pursuit"
      ]
    },
    "Strongman": {
      "Beginner": [
        "Event introduction",
        "Basic implements",
        "Strength foundation",
        "Technique focus",
        "Safety emphasis",
        "Monthly training",
        "Novice contests",
        "Community building"
      ],
      "Intermediate": [
        "Event specialization",
        "Implement training",
        "Contest prep",
        "Advanced technique",
        "Programming",
        "Bi-weekly sessions",
        "Regional contests",
        "Team training"
      ],
      "Advanced": [
        "Pro strongman prep",
        "All implements",
        "National contests",
        "Extreme loading",
        "Specialized diet",
        "Weekly coaching",
        "Pro qualification",
        "Sponsorship"
      ],
      "Elite": [
        "World's Strongest Man",
        "Elite implements",
        "24/7 strongman support",
        "International travel",
        "Professional career",
        "Daily coaching",
        "Arnold/WSM",
        "Legend status"
      ]
    },
    "Calisthenics": {
      "Beginner": [
        "Basic movements",
        "Push-up progressions",
        "Pull-up basics",
        "Core foundation",
        "Mobility routine",
        "Weekly workouts",
        "Form videos",
        "Progress tracking"
      ],
      "Intermediate": [
        "Advanced skills",
        "Muscle-up training",
        "Handstand basics",
        "Lever progressions",
        "Programming",
        "Bi-weekly reviews",
        "Skill videos",
        "Competition prep"
      ],
      "Advanced": [
        "Elite skills",
        "Planche training",
        "One-arm work",
        "Freestyle",
        "Strength skills",
        "Daily practice",
        "Professional shows",
        "Sponsorship"
      ],
      "Elite": [
        "World champion level",
        "Impossible skills",
        "24/7 skill coaching",
        "International competitions",
        "Professional career",
        "Real-time feedback",
        "World championships",
        "Icon status"
      ]
    }
  },
  "Recovery": {
    "Mobility": {
      "Beginner": [
        "Daily stretching",
        "Joint mobility",
        "Foam rolling",
        "Basic flows",
        "Pain relief",
        "Weekly routines",
        "Video guides",
        "Progress tracking"
      ],
      "Intermediate": [
        "Advanced mobility",
        "Movement patterns",
        "Myofascial release",
        "Dynamic flows",
        "Performance prep",
        "Bi-weekly sessions",
        "Video analysis",
        "Sport specific"
      ],
      "Advanced": [
        "Elite mobility",
        "Complex patterns",
        "Therapy integration",
        "Advanced tools",
        "Movement mastery",
        "Daily programming",
        "Professional assessment",
        "Optimization"
      ],
      "Elite": [
        "Maximum mobility",
        "Movement genius",
        "24/7 therapy",
        "Cutting edge techniques",
        "Research based",
        "Daily sessions",
        "Elite performance",
        "Longevity focus"
      ]
    },
    "Yoga": {
      "Beginner": [
        "Basic poses",
        "Breath work",
        "Flexibility",
        "Relaxation",
        "Stress relief",
        "Weekly classes",
        "Video library",
        "Home practice"
      ],
      "Intermediate": [
        "Vinyasa flow",
        "Advanced poses",
        "Meditation",
        "Strength yoga",
        "Sequence design",
        "Bi-weekly workshops",
        "Progressive series",
        "Teacher guidance"
      ],
      "Advanced": [
        "Advanced asanas",
        "Arm balances",
        "Inversions",
        "Pranayama",
        "Yoga philosophy",
        "Daily practice",
        "Retreats",
        "Advanced teaching"
      ],
      "Elite": [
        "Master level",
        "Extreme asanas",
        "24/7 yoga support",
        "Teacher training",
        "Spiritual guidance",
        "Daily immersion",
        "International retreats",
        "Master teacher"
      ]
    },
    "Injury Prevention": {
      "Beginner": [
        "Prehab basics",
        "Common injuries",
        "Warm-up protocols",
        "Movement screening",
        "Basic exercises",
        "Monthly check-ins",
        "Education",
        "Self-care"
      ],
      "Intermediate": [
        "Advanced prehab",
        "Sport specific",
        "Movement quality",
        "Corrective exercise",
        "Monitoring",
        "Bi-weekly assessments",
        "Video analysis",
        "Return to play"
      ],
      "Advanced": [
        "Elite prevention",
        "Complex cases",
        "Medical collaboration",
        "Advanced screening",
        "Custom protocols",
        "Weekly monitoring",
        "Professional teams",
        "Research based"
      ],
      "Elite": [
        "Maximum protection",
        "Medical team",
        "24/7 monitoring",
        "Cutting edge research",
        "Proactive care",
        "Daily assessment",
        "Elite athletes",
        "Career saving"
      ]
    },
    "Deload Programs": {
      "Beginner": [
        "Rest importance",
        "Light weeks",
        "Active recovery",
        "Sleep optimization",
        "Stress management",
        "Monthly planning",
        "Education",
        "Sustainability"
      ],
      "Intermediate": [
        "Strategic deloads",
        "Volume reduction",
        "Intensity management",
        "Recovery metrics",
        "Programming",
        "Bi-weekly planning",
        "Performance peaks",
        "Long-term health"
      ],
      "Advanced": [
        "Elite periodization",
        "Advanced deloads",
        "Tapering",
        "Peak performance",
        "Monitoring",
        "Weekly adjustments",
        "Competition peaks",
        "Professional approach"
      ],
      "Elite": [
        "Master deloads",
        "Precision timing",
        "24/7 monitoring",
        "Medical supervision",
        "Optimal peaks",
        "Daily adjustments",
        "Championship ready",
        "Career longevity"
      ]
    }
  }
};

// Fallback si la sous-catégorie n'existe pas
const LEVEL_FEATURES = {
  "Beginner": [
    "Personalized training plan",
    "Basic nutrition guide",
    "Monthly check-in",
    "Email support",
    "Progress tracking",
    "Exercise library",
    "Basic education",
    "Community access"
  ],
  "Intermediate": [
    "Advanced programming",
    "Custom nutrition",
    "Bi-weekly check-ins",
    "WhatsApp support",
    "Video analysis",
    "Priority support",
    "Advanced techniques",
    "Goal setting"
  ],
  "Advanced": [
    "Elite programming",
    "Precision nutrition",
    "Weekly consultations",
    "Daily support",
    "Professional analysis",
    "1-on-1 coaching",
    "Advanced protocols",
    "Competition prep"
  ],
  "Elite": [
    "World-class programming",
    "Elite nutrition",
    "24/7 support",
    "Real-time coaching",
    "Medical team",
    "Professional network",
    "Exclusive access",
    "Legacy building"
  ]
};

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

// Fonction helper pour récupérer les features
const getFeaturesForProgram = (category, subCategory, level) => {
  // Essaie de récupérer les features spécifiques Catégorie > Sous-catégorie > Niveau
  if (CATEGORY_FEATURES[category]?.[subCategory]?.[level]) {
    return CATEGORY_FEATURES[category][subCategory][level];
  }
  
  // Fallback sur les features par niveau génériques
  return LEVEL_FEATURES[level] || LEVEL_FEATURES["Beginner"];
};

const List = ({ token }) => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // État édition
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Fitness',
    subCategory: '',
    level: 'Beginner',
    duration: '4 weeks',
    popular: false,
    features: [],
    subtitle: '',
    bestFor: '',
    support: '',
    fullDescription: '',
    icon: '💪'
  });
  const [editImage, setEditImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const fetchList = async () => {
    try {
      setLoading(true);
      const response = await axios.get(backendUrl + '/api/program/list', {
        headers: { token: token }
      });
      if (response.data.success) {
        setList(response.data.programs || []);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const removeProgram = async (id) => {
    if (!window.confirm('⚠️ Delete this program permanently?')) return;

    try {
      const response = await axios.post(
        backendUrl + '/api/program/remove',
        { id },
        { headers: { token: token } }
      );
      if (response.data.success) {
        toast.success('Program deleted');
        await fetchList();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Delete failed');
    }
  };

  // ========== FONCTIONS EDIT ==========

  const startEdit = (program) => {
    setEditingId(program._id);
    const categoryConfig = CATEGORY_ICONS[program.category] || CATEGORY_ICONS["Fitness"];
    
    // Récupère les features existantes ou génère selon Catégorie/Sous-catégorie/Niveau
    const existingFeatures = program.features && program.features.length > 0 
      ? program.features 
      : getFeaturesForProgram(program.category, program.subCategory, program.level);
    
    setEditForm({
      name: program.name || '',
      description: program.description || '',
      price: program.price || '',
      category: program.category || 'Fitness',
      subCategory: program.subCategory || CATEGORY_SUBCATEGORIES[program.category]?.[0] || '',
      level: program.level || 'Beginner',
      duration: program.duration || '4 weeks',
      popular: program.popular || false,
      features: existingFeatures,
      subtitle: program.subtitle || `${program.level} ${program.subCategory || program.category} Program`,
      bestFor: program.bestFor || LEVEL_BEST_FOR[program.level],
      support: program.support || LEVEL_SUPPORT[program.level],
      fullDescription: program.fullDescription || program.description || '',
      icon: program.icon || categoryConfig.icon
    });

    if (program.image) {
      const imgUrl = Array.isArray(program.image) && program.image.length > 0
        ? `${backendUrl}/uploads/${program.image[0]}`
        : typeof program.image === 'string'
          ? `${backendUrl}/uploads/${program.image}`
          : null;
      setPreviewUrl(imgUrl);
    }
    setEditImage(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditImage(null);
    setPreviewUrl(null);
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // CORRECTION : MAJ features quand niveau, catégorie ou sous-catégorie change
  const handleLevelChange = (newLevel) => {
    const newFeatures = getFeaturesForProgram(editForm.category, editForm.subCategory, newLevel);
    setEditForm(prev => ({
      ...prev,
      level: newLevel,
      features: newFeatures,
      bestFor: LEVEL_BEST_FOR[newLevel],
      support: LEVEL_SUPPORT[newLevel],
      subtitle: `${newLevel} ${prev.subCategory || prev.category} Program`
    }));
  };

  const handleCategoryChange = (newCategory) => {
    const subcats = CATEGORY_SUBCATEGORIES[newCategory];
    const newSubCategory = subcats ? subcats[0] : '';
    const newFeatures = getFeaturesForProgram(newCategory, newSubCategory, editForm.level);
    
    setEditForm(prev => ({
      ...prev,
      category: newCategory,
      subCategory: newSubCategory,
      icon: CATEGORY_ICONS[newCategory]?.icon || prev.icon,
      features: newFeatures,
      subtitle: `${prev.level} ${newSubCategory} Program`
    }));
  };

  const handleSubCategoryChange = (newSubCategory) => {
    const newFeatures = getFeaturesForProgram(editForm.category, newSubCategory, editForm.level);
    
    setEditForm(prev => ({
      ...prev,
      subCategory: newSubCategory,
      features: newFeatures,
      subtitle: `${prev.level} ${newSubCategory} Program`
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be less than 5MB");
        return;
      }
      setEditImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Gestion features personnalisées
  const handleFeatureChange = (index, value) => {
    const newFeatures = [...editForm.features];
    newFeatures[index] = value;
    setEditForm(prev => ({ ...prev, features: newFeatures }));
  };

  const addFeature = () => {
    setEditForm(prev => ({ ...prev, features: [...prev.features, ''] }));
  };

  const removeFeature = (index) => {
    setEditForm(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const saveEdit = async () => {
    try {
      const formData = new FormData();
      
      formData.append("id", editingId);
      formData.append("name", editForm.name.trim());
      formData.append("description", editForm.description.trim());
      formData.append("price", Number(editForm.price));
      formData.append("category", editForm.category);
      formData.append("subCategory", editForm.subCategory);
      formData.append("level", editForm.level);
      formData.append("duration", editForm.duration);
      formData.append("popular", editForm.popular);
      formData.append("subtitle", editForm.subtitle.trim());
      formData.append("bestFor", editForm.bestFor.trim());
      formData.append("support", editForm.support.trim());
      formData.append("fullDescription", editForm.fullDescription.trim());
      formData.append("icon", editForm.icon);
      formData.append("features", JSON.stringify(editForm.features.filter(f => f.trim())));
      
      if (editImage) {
        formData.append("image", editImage);
      }

      const response = await axios.put(
        `${backendUrl}/api/program/update`,
        formData,
        { 
          headers: { 
            token: token,
            'Content-Type': 'multipart/form-data'
          } 
        }
      );

      if (response.data.success) {
        toast.success('✅ Program updated!');
        setEditingId(null);
        setEditImage(null);
        setPreviewUrl(null);
        await fetchList();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
    }
  };

  // Composant icône
  const PlanIcon = ({ categoryName, size = "small" }) => {
    const config = CATEGORY_ICONS[categoryName] || CATEGORY_ICONS["Fitness"];
    const sizes = {
      small: { width: 32, height: 32, fontSize: 16 },
      medium: { width: 48, height: 48, fontSize: 24 },
      large: { width: 64, height: 64, fontSize: 32 }
    };
    const sizeStyle = sizes[size] || sizes.small;

    return (
      <div style={{
        width: sizeStyle.width,
        height: sizeStyle.height,
        backgroundColor: config.bgColor,
        border: `2px solid ${config.color}`,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: sizeStyle.fontSize,
        flexShrink: 0
      }}>
        {config.icon}
      </div>
    );
  };

  const getImageUrl = (item) => {
    if (!item.image) return assets.upload_area;
    if (Array.isArray(item.image) && item.image.length > 0) {
      return `${backendUrl}/uploads/${item.image[0]}`;
    }
    if (typeof item.image === 'string') {
      return `${backendUrl}/uploads/${item.image}`;
    }
    return assets.upload_area;
  };

  useEffect(() => {
    if (token) fetchList();
  }, [token]);

  if (loading) {
    return (
      <div className="list-page">
        <div className="page-header"><h2>All Programs</h2></div>
        <div className="loading-spinner" />
      </div>
    );
  }

  if (!list.length) {
    return (
      <div className="list-page">
        <div className="page-header"><h2>All Programs</h2></div>
        <div className="empty-state"><p>No programs found</p></div>
      </div>
    );
  }

  return (
    <div className="list-page">
      <div className="page-header">
        <h2>All Programs</h2>
        <span className="program-count">{list.length} programs</span>
      </div>
      
      <div className="programs-grid">
        {list.map((item) => (
          <div className={`program-card ${item.popular ? 'popular' : ''}`} key={item._id}>
            <div className="program-image-container">
              {editingId === item._id ? (
                <div className="edit-image-upload">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="program-image" />
                  ) : (
                    <div className="upload-placeholder">
                      <PlanIcon categoryName={editForm.category} size="large" />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    id={`edit-image-${item._id}`}
                    hidden
                  />
                  <label htmlFor={`edit-image-${item._id}`} className="upload-overlay">
                    📷 Change
                  </label>
                </div>
              ) : (
                <img 
                  className="program-image" 
                  src={getImageUrl(item)} 
                  alt={item.name}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = assets.upload_area;
                  }}
                />
              )}
              
              {item.popular && <span className="popular-badge">⭐ Popular</span>}
            </div>
            
            <div className="program-info">
              {editingId === item._id ? (
                // ========== MODE ÉDITION ==========
                <div className="edit-form-inline">
                  {/* Catégorie */}
                  <div className="category-selector-horizontal">
                    {Object.keys(CATEGORY_SUBCATEGORIES).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => handleCategoryChange(cat)}
                        className={`cat-btn ${editForm.category === cat ? 'active' : ''}`}
                        style={{
                          borderColor: editForm.category === cat ? CATEGORY_ICONS[cat].color : 'transparent',
                          backgroundColor: editForm.category === cat ? CATEGORY_ICONS[cat].bgColor : 'white'
                        }}
                      >
                        <PlanIcon categoryName={cat} size="small" />
                        <span>{cat}</span>
                      </button>
                    ))}
                  </div>

                  <input
                    type="text"
                    name="name"
                    value={editForm.name}
                    onChange={handleEditChange}
                    placeholder="Program Name"
                    className="edit-input"
                  />
                  
                  <textarea
                    name="description"
                    value={editForm.description}
                    onChange={handleEditChange}
                    placeholder="Short Description"
                    className="edit-textarea"
                    rows="2"
                  />

                  <div className="edit-row">
                    <input
                      type="number"
                      name="price"
                      value={editForm.price}
                      onChange={handleEditChange}
                      placeholder="Price €"
                      className="edit-input small"
                    />
                    
                    {/* Sous-catégorie avec changement de features */}
                    <select
                      value={editForm.subCategory}
                      onChange={(e) => handleSubCategoryChange(e.target.value)}
                      className="edit-select"
                    >
                      {CATEGORY_SUBCATEGORIES[editForm.category]?.map(sub => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                  </div>

                  {/* Sélecteur de niveau avec MAJ auto features */}
                  <div className="edit-row">
                    <select
                      value={editForm.level}
                      onChange={(e) => handleLevelChange(e.target.value)}
                      className="edit-select"
                    >
                      {LEVELS.map(lvl => (
                        <option key={lvl} value={lvl}>
                          {lvl} ({getFeaturesForProgram(editForm.category, editForm.subCategory, lvl).length} features)
                        </option>
                      ))}
                    </select>
                    
                    <select
                      name="duration"
                      value={editForm.duration}
                      onChange={handleEditChange}
                      className="edit-select"
                    >
                      {DURATIONS.map(dur => <option key={dur} value={dur}>{dur}</option>)}
                    </select>
                  </div>

                  {/* Features éditables - spécifiques Catégorie/Sous-catégorie/Niveau */}
                  <div className="features-editor">
                    <label className="features-label">
                      {editForm.category} • {editForm.subCategory} • {editForm.level}
                      <br />
                      <small>{editForm.features.length} features auto-generated</small>
                    </label>
                    {editForm.features.map((feature, idx) => (
                      <div key={idx} className="feature-row">
                        <span className="feature-num">{idx + 1}.</span>
                        <input
                          type="text"
                          value={feature}
                          onChange={(e) => handleFeatureChange(idx, e.target.value)}
                          className="feature-input"
                          placeholder={`Feature ${idx + 1}`}
                        />
                        <button 
                          type="button"
                          onClick={() => removeFeature(idx)}
                          className="remove-feature-btn"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <button type="button" onClick={addFeature} className="add-feature-btn">
                      + Add Custom Feature
                    </button>
                  </div>

                  {/* Infos auto-générées */}
                  <div className="auto-info">
                    <div className="info-row">
                      <label>Best For:</label>
                      <input 
                        type="text" 
                        name="bestFor"
                        value={editForm.bestFor}
                        onChange={handleEditChange}
                        className="edit-input"
                      />
                    </div>
                    <div className="info-row">
                      <label>Support:</label>
                      <input 
                        type="text" 
                        name="support"
                        value={editForm.support}
                        onChange={handleEditChange}
                        className="edit-input"
                      />
                    </div>
                  </div>

                  <div className="edit-row checkboxes">
                    <label className="edit-checkbox">
                      <input
                        type="checkbox"
                        name="popular"
                        checked={editForm.popular}
                        onChange={handleEditChange}
                      />
                      ⭐ Mark as Popular
                    </label>
                  </div>

                  <div className="edit-actions">
                    <button className="save-btn" onClick={saveEdit}>
                      💾 Save Changes
                    </button>
                    <button className="cancel-btn" onClick={cancelEdit}>
                      ❌ Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // ========== MODE AFFICHAGE ==========
                <>
                  <div className="info-main">
                    <div className="category-row">
                      <PlanIcon categoryName={item.category} size="small" />
                      <span className="category">{item.category}</span>
                      {item.subCategory && <span className="subCategory">• {item.subCategory}</span>}
                    </div>
                    <h3>{item.name}</h3>
                    {item.subtitle && <p className="subtitle">{item.subtitle}</p>}
                  </div>
                  
                  <div className="program-meta">
                    <span className={`level-badge level-${item.level?.toLowerCase()}`}>
                      {item.level}
                    </span>
                    <span className="duration">{item.duration}</span>
                    {item.features && (
                      <span className="features-count">{item.features.length} features</span>
                    )}
                  </div>
                  
                  <div className="price">{currency}{item.price}</div>
                  
                  <div className="card-actions">
                    <button 
                      className="edit-btn"
                      onClick={() => startEdit(item)}
                      style={{ 
                        background: CATEGORY_ICONS[item.category]?.color || '#3498db'
                      }}
                    >
                      ✏️ Edit
                    </button>
                    <button 
                      className="remove-btn"
                      onClick={() => removeProgram(item._id)}
                    >
                      🗑️ Remove
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default List;