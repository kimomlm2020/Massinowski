// src/pages/Transformation.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import WhatsAppFloat from "../components/WhatsAppFloat";
import emailjs from "@emailjs/browser"; 
import "../style/Transformation.scss";

// Composant Transformation principal
function Transformation() {
  const navigate = useNavigate();
  const [stage, setStage] = useState("quiz");
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({ 
    name: "", 
    email: "", 
    goal: "", 
    frequency: "",
    location: "",
    experience: ""
  });
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  // Hide splash screen after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // Questions in English
  const questions = [
    {
      id: "name",
      question: "What is your name?",
      type: "text",
      placeholder: "Your full name"
    },
    {
      id: "email", 
      question: "What is your email address?",
      type: "email",
      placeholder: "your@email.com"
    },
    {
      id: "goal",
      question: "What is your main goal?",
      type: "select",
      options: [
        { value: "weight-loss", label: "Weight loss" },
        { value: "muscle-gain", label: "Muscle gain" },
        { value: "fitness", label: "Get fit" },
        { value: "toning", label: "Toning" },
        { value: "performance", label: "Sports performance" }
      ]
    },
    {
      id: "frequency",
      question: "How often can you train?",
      type: "select", 
      options: [
        { value: "3-times", label: "3 times per week" },
        { value: "4-times", label: "4 times per week" }, 
        { value: "5-times", label: "5 times per week" },
        { value: "daily", label: "Daily" }
      ]
    },
    {
      id: "location",
      question: "Where do you prefer to train?",
      type: "select",
      options: [
        { value: "gym", label: "At the gym" },
        { value: "home", label: "At home" },
        { value: "outdoor", label: "Outdoors" },
        { value: "mixed", label: "Mixed (gym + home)" }
      ]
    },
    {
      id: "experience",
      question: "What is your experience level?",
      type: "select",
      options: [
        { value: "beginner", label: "Beginner" },
        { value: "intermediate", label: "Intermediate" },
        { value: "advanced", label: "Advanced" },
        { value: "expert", label: "Expert" }
      ]
    }
  ];

  const handleAnswer = (field, value) => {
    setAnswers(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleSubmitQuiz();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmitQuiz = () => {
    const requiredFields = ["name", "email", "goal", "frequency", "location", "experience"];
    const missingFields = requiredFields.filter(field => !answers[field]);
    
    if (missingFields.length > 0) {
      alert("Please fill in all required fields");
      return;
    }
    setStage("result");
  };

  const handleSendEmail = async () => {
    setIsLoading(true);
    setStatus("");

    const templateParams = {
      to_name: answers.name,
      to_email: answers.email,
      goal: answers.goal,
      frequency: answers.frequency,
      location: answers.location,
      experience: answers.experience,
      personalized_program: generateProgrammeDescription(answers),
      submission_date: new Date().toLocaleDateString('en-US')
    };

    try {
      await emailjs.send(
        'service_p0eiqj3',
        'template_hnv1uir', 
        templateParams, 
        '29lKWV_D8XOzUAznS'
      );
      
      setStatus("success");
      setTimeout(() => {
        setStage("email-success");
      }, 2000);
      
    } catch (error) {
      setStatus("error");
      console.error("EmailJS Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChatWithCoach = () => {
    const message = "Hello, I'm interested in your coaching programs!";
    
    const whatsappUrl = `https://wa.me/48530428877?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappUrl, '_blank');
    setStatus("chat-redirect");
  };

  const generateProgrammeDescription = (answers) => {
    const programs = {
      "weight-loss": "Weight loss program",
      "muscle-gain": "Muscle gain program",
      "fitness": "Fitness program",
      "toning": "Toning program", 
      "performance": "Sports performance program"
    };

    const frequencyLabel = questions.find(q => q.id === "frequency")?.options.find(o => o.value === answers.frequency)?.label;
    const experienceLabel = questions.find(q => q.id === "experience")?.options.find(o => o.value === answers.experience)?.label;

    return `${programs[answers.goal]} - ${frequencyLabel} - ${experienceLabel}`;
  };

  const getProgress = () => {
    return ((currentStep + 1) / questions.length) * 100;
  };

  const currentQuestion = questions[currentStep];

  const getOptionLabel = (questionId, value) => {
    const question = questions.find(q => q.id === questionId);
    return question?.options.find(o => o.value === value)?.label || value;
  };

  return (
    <div className="transformation-page">
      {/* Navbar */}
      <Navbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

      {/* Splash Screen */}
      <AnimatePresence>
        {showSplash && (
          <motion.div
            className="splash-screen"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          >
            <div className="dumbbell-icon">
              <div className="bar"></div>
            </div>
            <div className="splash-content">
              <h1>Your Transformation Starts Here</h1>
              <p>Preparing your personalized program...</p>
              <div className="loading-dots">
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content - hidden during splash */}
      <div style={{ display: showSplash ? 'none' : 'block' }}>
        <main className="transformation-main">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="page-header"
            >
              <h1>Personalized Transformation Program</h1>
              <p>Answer a few questions to receive your custom program</p>
            </motion.div>

            <div className="transformation-container">
              <AnimatePresence mode="wait">
                {stage === "quiz" && (
                  <motion.div
                    key="quiz"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    className="quiz-screen"
                  >
                    <div className="progress-container">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ width: `${getProgress()}%` }}
                        ></div>
                      </div>
                      <div className="progress-text">
                        Step {currentStep + 1} of {questions.length}
                      </div>
                    </div>

                    <motion.div
                      key={currentStep}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="question-card"
                    >
                      <h2>{currentQuestion.question}</h2>
                      
                      {currentQuestion.type === "text" || currentQuestion.type === "email" ? (
                        <input
                          type={currentQuestion.type}
                          value={answers[currentQuestion.id]}
                          onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                          placeholder={currentQuestion.placeholder}
                          className="input-field"
                        />
                      ) : currentQuestion.type === "select" ? (
                        <div className="options-grid">
                          {currentQuestion.options.map((option) => (
                            <motion.button
                              key={option.value}
                              className={`option-button ${answers[currentQuestion.id] === option.value ? 'selected' : ''}`}
                              onClick={() => handleAnswer(currentQuestion.id, option.value)}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              {option.label}
                            </motion.button>
                          ))}
                        </div>
                      ) : null}
                    </motion.div>

                    <div className="navigation-buttons">
                      {currentStep > 0 && (
                        <button className="btn btn-secondary" onClick={prevStep}>
                          Previous
                        </button>
                      )}
                      <button 
                        className="btn btn-primary"
                        onClick={nextStep}
                        disabled={!answers[currentQuestion.id]}
                      >
                        {currentStep === questions.length - 1 
                          ? "See my program" 
                          : "Next"
                        }
                      </button>
                    </div>
                  </motion.div>
                )}

                {stage === "result" && (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.1 }}
                    className="result-screen"
                  >
                    <div className="success-header">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}
                        className="success-icon"
                      >
                        🎉
                      </motion.div>
                      <h2>Congratulations {answers.name}!</h2>
                      <p>Here is your personalized program based on your answers</p>
                    </div>

                    <div className="programme-summary">
                      <h3>Program Summary</h3>
                      <div className="summary-grid">
                        <div className="summary-item">
                          <strong>Goal</strong>
                          <span>{getOptionLabel("goal", answers.goal)}</span>
                        </div>
                        <div className="summary-item">
                          <strong>Frequency</strong>
                          <span>{getOptionLabel("frequency", answers.frequency)}</span>
                        </div>
                        <div className="summary-item">
                          <strong>Training Location</strong>
                          <span>{getOptionLabel("location", answers.location)}</span>
                        </div>
                        <div className="summary-item">
                          <strong>Experience Level</strong>
                          <span>{getOptionLabel("experience", answers.experience)}</span>
                        </div>
                      </div>
                    </div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="action-buttons"
                    >
                      <button 
                        className={`btn btn-gold ${isLoading ? 'loading' : ''}`}
                        onClick={handleSendEmail}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <div className="spinner"></div>
                            Sending...
                          </>
                        ) : (
                          "Receive by email"
                        )}
                      </button>
                      
                      <button 
                        className="btn btn-outline"
                        onClick={handleChatWithCoach}
                      >
                        Chat with a coach
                      </button>
                    </motion.div>

                    {status === "success" && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="status-message success"
                      >
                        Email sent successfully!
                      </motion.div>
                    )}

                    {status === "error" && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="status-message error"
                      >
                        Error sending email. Please try again.
                      </motion.div>
                    )}

                    {status === "chat-redirect" && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="status-message info"
                      >
                        Redirecting to WhatsApp...
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {stage === "email-success" && (
                  <motion.div
                    key="email-success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="success-screen"
                  >
                    <div className="success-content">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}
                        className="success-animation"
                      >
                        ✉️
                      </motion.div>
                      <h2>Program Sent!</h2>
                      <p>Your personalized program has been sent to:</p>
                      <p className="email-highlight">{answers.email}</p>
                      <p className="success-note">
                        Check your inbox (and spam folder)
                      </p>
                      
                      <div className="additional-actions">
                        <button 
                          className="btn btn-whatsapp"
                          onClick={handleChatWithCoach}
                        >
                          Ask questions on WhatsApp
                        </button>
                        
                        <button 
                          className="btn btn-secondary"
                          onClick={() => setStage("quiz")}
                        >
                          Retake the quiz
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </main>
      </div>

      {/* Footer */}
      <Footer />
      
      {/* WhatsApp Button */}
      <WhatsAppFloat />

      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div 
          className="menu-overlay"
          onClick={() => setMenuOpen(false)}
        />
      )}
    </div>
  );
}

export default Transformation;