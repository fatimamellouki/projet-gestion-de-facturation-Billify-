import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion'; // Correction ici
import { FiArrowRight } from 'react-icons/fi';
import Img1 from './images/1.png';
import Img2 from './images/2.png';
import Img3 from './images/3.png';
import './HeroSection.css'; // Assurez-vous d'avoir ce fichier CSS pour les styles personnalisés
import ImageOverlay from './ImageOverlay';
const HeroSection = () => {
  const fullText = "Facturez intelligemment avec ";
  const brand = "Billify";

  const [displayedText, setDisplayedText] = useState("");
  const [showBrand, setShowBrand] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  const [textIndex, setTextIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = [Img1, Img2, Img3];

  // Animation texte
  useEffect(() => {
    if (textIndex < fullText.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + fullText[textIndex]);
        setTextIndex((prev) => prev + 1);
      }, 50);
      return () => clearTimeout(timeout);
    } else {
      setShowBrand(true);
      setTimeout(() => {
        setShowButtons(true);
      }, 300);
    }
  }, [textIndex]);

  // Carrousel d'images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Animations
  const leftAnimation = {
    initial: { x: "-25%", opacity: 0 },
    animate: { x: 0, opacity: 1 },
    transition: { duration: 0.8, delay: 0.2, ease: "easeOut" }
  };

  const rightAnimation = {
    initial: { x: "25%", opacity: 0 },
    animate: { x: 0, opacity: 1 },
    transition: { duration: 0.8, delay: 0.4, ease: "easeOut" }
  };

  const buttonAnimation = {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    transition: { duration: 0.5 }
  };

  return (
    <section className=" relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 pt-24 pb-16 md:pt-32 md:pb-2"style={{marginTop: '-80px'}}>
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 right-0 w-full md:w-1/2 h-full bg-gradient-to-l from-blue-100 to-transparent dark:from-gray-800/50 dark:to-transparent"></div>
        <div className="absolute top-20 right-20 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 dark:opacity-20 animate-blob"></div>
        <div className="absolute top-60 left-60 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 dark:opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <motion.div
            {...leftAnimation}
            className="text-center lg:text-left"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 dark:text-white mb-6">
              {displayedText}
              {showBrand && (
                <motion.span 
                  className="text-primary bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  {brand}
                </motion.span>
              )}
            </h1>
            
            <motion.p 
              className="text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-xl mx-auto lg:mx-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              Générez, suivez et archivez vos factures en quelques clics. 
              L'outil de gestion de facturation tout-en-un pour les petites et moyennes entreprises.
            </motion.p>
            
            {showButtons && (
              <motion.div 
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
                initial="initial"
                animate="animate"
                variants={{
                  animate: {
                    transition: {
                      staggerChildren: 0.1
                    }
                  }
                }}
              >
                <motion.a
                  href="/services"
                  className="btn-primary"
                  variants={buttonAnimation}
                >
                  Découvrir les fonctionnalités
                  <FiArrowRight className="ml-2" />
                </motion.a>
                
                <motion.a
                  href="/login"
                  className="btn-secondary"
                  variants={buttonAnimation}
                >
                  Se connecter
                </motion.a>
              </motion.div>
            )}
            
            {/* Stats */}
            <motion.div 
              className="mt-12 grid grid-cols-3 gap-4 max-w-md mx-auto lg:mx-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.2 }}
            >
              <div className="stat-card">
                <div className="stat-number">+5K</div>
                <div className="stat-label">Utilisateurs</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">+1M</div>
                <div className="stat-label">Factures</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">99%</div>
                <div className="stat-label">Satisfaction</div>
              </div>
            </motion.div>
          </motion.div>
          
          {/* <ImageOverlay/> */}
          {/* Right content */}
          <motion.div 
            {...rightAnimation}
            className="relative"
          >
            <div className="relative h-[400px] md:h-[500px] w-full">
             {/* Top image */}
              <img
                src={images[0]}
                alt="Facturation 1"
                className="w-full max-h-[60%] object-contain rounded-t-3xl rounded-b-xl shadow-lg transition-transform duration-300 hover:scale-105"
                style={{ maxHeight: "60%" }}
              />
              {/* Bottom images */}
              <div className="flex w-full gap-4 mt-4">
                <img
                  src={images[1]}
                  alt="Facturation 2"
                  className="w-1/2 object-contain rounded-bl-3xl rounded-tr-xl shadow-md transition-transform duration-300 hover:scale-105"
                  style={{ height: "140px" }}
                />
                <img
                  src={images[2]}
                  alt="Facturation 3"
                  className="w-1/2 object-contain rounded-br-3xl rounded-tl-xl shadow-md transition-transform duration-300 hover:scale-105"
                  style={{ height: "140px" }}
                />
            </div>
              {/* Floating elements */}
              <motion.div 
                className="absolute -bottom-6 -left-6 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-lg z-10"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.5 }}
              >
                <div className="flex items-center">
                  <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg mr-3">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <div>
                    <div className="font-bold text-gray-800 dark:text-white">Gain de temps</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Jusqu'à 70%</div>
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                className="absolute -top-6 -right-6 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-lg z-10"
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.8 }}
              >
                <div className="flex items-center">
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg mr-3">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                    </svg>
                  </div>
                  <div>
                    <div className="font-bold text-gray-800 dark:text-white">Sécurisé</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Données cryptées</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;