import { motion, AnimatePresence, useInView } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import './FeaturesSection.css'; 
import { 
  FaFileInvoice, FaUsers, FaRedo, FaMoneyBillWave, FaReceipt, 
  FaChartLine, FaBoxOpen, FaCogs, FaDownload 
} from 'react-icons/fa';
import { Link } from "react-router-dom";
import relance from './images/relances.png';
import invoice from './images/invoice.png';
import payment from './images/payment.png';
import avoir from './images/avoir.png';
import product from './images/product.png';
import numer from './images/numer.png';

const ANIMATION_CONFIG = {
  slideTransition: 0.5,
  autoPlayInterval: 1000,
  hoverTransition: 0.3,
  initialAnimation: 0.6
};

const features = [
  { icon: <FaFileInvoice className="text-blue-500" />, title: 'Création de factures', description: 'Personnalisées, automatiques, prêtes à être envoyées.', image: invoice },
  { icon: <FaUsers className="text-indigo-500" />, title: 'Gestion des clients', description: 'Suivez vos clients et leur historique de facturation.', image: 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?auto=format&fit=crop&w=600&q=80' },
  { icon: <FaRedo className="text-emerald-500" />, title: 'Relances automatiques', description: 'Rappels intelligents pour les paiements en retard.', image: relance },
  { icon: <FaMoneyBillWave className="text-green-500" />, title: 'Suivi des paiements', description: 'Suivi clair des paiements et impayés, avec interface intuitive.', image: payment },
  { icon: <FaReceipt className="text-amber-500" />, title: 'Gestion des avoirs', description: 'Traçabilité des retours ou réductions sur factures.', image: avoir },
  { icon: <FaChartLine className="text-purple-500" />, title: 'Tableau de bord', description: 'Statistiques en temps réel, alertes et indicateurs financiers.', image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80' },
  { icon: <FaBoxOpen className="text-rose-500" />, title: 'Gestion des produits', description: 'Créez, modifiez, organisez les services et produits facturables.', image: product },
  { icon: <FaCogs className="text-gray-500" />, title: 'Paramètres avancés', description: 'Configuration des devises, TVA, numérotation automatique, etc.', image: numer },
  { icon: <FaDownload className="text-blue-400" />, title: 'Téléchargement des factures', description: 'Permet aux clients de télécharger facilement leurs factures au format PDF.', image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=600&q=80' }
];

const FeaturesSection = () => {
  const [index, setIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    const interval = setInterval(() => {
      if (hoveredIndex === null) {
        setIndex(prev => (prev + 1) % features.length);
      }
    }, ANIMATION_CONFIG.autoPlayInterval);
    return () => clearInterval(interval);
  }, [hoveredIndex]);

  const currentFeatures = [
    features[index],
    features[(index + 1) % features.length],
    features[(index + 2) % features.length],
    features[(index + 3) % features.length]
  ];

  return (
    <section className=" relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800  pb-16 md:pt-10 md:pb-2">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 right-0 w-full md:w-1/2 h-full bg-gradient-to-l from-blue-100 to-transparent dark:from-gray-800/50 dark:to-transparent"></div>
        <div className="absolute top-20 right-20 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 dark:opacity-20 animate-blob"></div>
        <div className="absolute top-60 left-60 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 dark:opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-5">
          <motion.h2
            className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: ANIMATION_CONFIG.initialAnimation, ease: "easeOut" }}
          >
            Fonctionnalités <span className="text-blue-600 dark:text-blue-400">exceptionnelles</span>
          </motion.h2>
          <motion.p
            className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          >
            Découvrez comment Billify révolutionne votre gestion financière avec élégance et efficacité.
          </motion.p>
        </div>

        {/* Carrousel */}
        <div ref={ref} className="mb-16 relative h-96 overflow-hidden">
          <div className="relative h-full">
            <AnimatePresence initial={false}>
              {currentFeatures.map((feature, i) => (
                <motion.div
                  key={`${feature.title}-${i}`}
                  className="absolute top-0 w-72 h-full shadow-lg rounded-xl overflow-hidden"
                  initial={{ x: 300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -300, opacity: 0 }}
                  transition={{ 
                    duration: ANIMATION_CONFIG.slideTransition, 
                    ease: "easeInOut" 
                  }}
                  style={{ left: `${i * 320}px`, zIndex: 3 - i }}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <div className="relative w-full h-full">
                    <img 
                      src={feature.image} 
                      alt={feature.title} 
                      className={`w-full h-full object-cover transition-transform duration-300 ${
                        hoveredIndex === i ? 'scale-110' : 'scale-100'
                      }`}
                    />
                    {hoveredIndex === i && (
                      <motion.div
                        className="absolute inset-0 bg-gray-800/80 flex flex-col items-center justify-center p-4 text-center text-white"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: ANIMATION_CONFIG.hoverTransition }}
                      >
                        <div className="text-3xl mb-2">{feature.icon}</div>
                        <h3 className="text-lg font-bold">{feature.title}</h3>
                        <p className="text-sm mt-2 max-w-[80%]">{feature.description}</p>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
        <motion.div 
  className="mt-16 text-center"
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: "-100px" }}
  transition={{ 
    delay: 0.4,
    type: "spring",
    stiffness: 100,
    damping: 10
  }}
>
  <Link
    to="/services"
    className="relative inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-full shadow-lg transition-all duration-300 group overflow-hidden"
  >
    {/* Fond animé au hover */}
    <span className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
    
    {/* Texte et icône */}
    <span className="relative z-10 flex items-center">
      Explorer tous les services
      <svg 
        className="w-5 h-5 ml-3 transition-transform duration-300 group-hover:translate-x-1" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M14 5l7 7m0 0l-7 7m7-7H3" 
        />
      </svg>
    </span>

    {/* Effets de hover */}
    <style jsx>{`
      .group:hover {
        box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.4);
        transform: translateY(-2px);
      }
    `}</style>
  </Link>
</motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
