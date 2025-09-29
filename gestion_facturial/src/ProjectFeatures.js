import React from 'react';
import { FaUsers, FaFileInvoiceDollar, FaFileDownload, FaEnvelope, FaQuoteRight, FaExchangeAlt, FaChartBar, FaCalculator, FaBoxes, FaTags, FaUserTie, FaUserShield, FaBell } from 'react-icons/fa';
// import { Navigate } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import Footer from './FooterSection';

const FeatureCard = ({ icon, title, description }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
      <div className="text-3xl text-blue-600 mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

const ProjectFeature = () => {
    const navigate = useNavigate();

  const features = [
    {
      icon: <FaUsers />,
      title: "Gestion des clients",
      description: "Gestion complète du portefeuille clients avec historique des interactions, factures et paiements."
    },
    {
      icon: <FaFileInvoiceDollar />,
      title: "Création de factures",
      description: "Génération de factures selon deux modèles différents avec personnalisation avancée."
    },
    {
      icon: <FaFileDownload />,
      title: "Téléchargement de documents",
      description: "Export des factures et devis en PDF selon deux formats différents (simplifié et détaillé)."
    },
    {
      icon: <FaEnvelope />,
      title: "Envoi par email",
      description: "Envoi automatique ou manuel des documents par email avec deux modèles de messages."
    },
    {
      icon: <FaQuoteRight />,
      title: "Gestion des devis",
      description: "Création et suivi des devis, transformation automatique en facture lorsqu'ils sont acceptés."
    },
    {
      icon: <FaExchangeAlt />,
      title: "Gestion des avoirs",
      description: "Création et suivi des avoirs pour les retours et remboursements."
    },
    {
      icon: <FaChartBar />,
      title: "Statistiques avancées",
      description: "Tableaux de bord et rapports personnalisables pour analyser les performances."
    },
    {
      icon: <FaCalculator />,
      title: "Calculs automatiques",
      description: "Calcul automatique des montants avec gestion des remises, TVA et taxes diverses."
    },
    {
      icon: <FaBoxes />,
      title: "Gestion des produits",
      description: "CRUD complet pour les produits avec gestion des stocks et des variations."
    },
    {
      icon: <FaTags />,
      title: "Gestion des catégories",
      description: "Organisation des produits par catégories et sous-catégories."
    },
    {
      icon: <FaUserTie />,
      title: "Gestion des franchisés",
      description: "Espace dédié pour les franchisés avec accès contrôlé."
    },
    {
      icon: <FaUserShield />,
      title: "Gestion des comptables",
      description: "Interface spécifique pour les comptables avec outils dédiés."
    },
    {
      icon: <FaBell />,
      title: "Relances automatiques",
      description: "Système de relance pour les clients en retard de paiement avec personnalisation des messages."
    },
    {
      icon: <FaFileInvoiceDollar />,
      title: "Modèles personnalisables",
      description: "Personnalisation des modèles de factures, devis et emails selon vos besoins."
    },
    {
      icon: <FaChartBar />,
      title: "Analyse financière",
      description: "Outils d'analyse des flux de trésorerie, chiffre d'affaires et prévisions."
    },
    {
      icon: <FaUserTie />,
      title: "Multi-utilisateurs",
      description: "Gestion des rôles et permissions pour un travail collaboratif sécurisé."
    }
  ];

  return (
    <div  className=" min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 pt-24 pb-16 md:pt-32 md:pb-2" style={{paddingTop:"80px"}}>
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="relative inline-block">
            <h1 className="text-4xl font-extrabold text-gray-900  dark:text-gray-50   sm:text-5xl sm:tracking-tight lg:text-6xl relative z-10">
              Solution Complète de Gestion Financière
            </h1>
            <div className="absolute -bottom-2 left-0 right-0 h-3 bg-blue-100 opacity-70 -z-0"></div>
          </div>
          <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-600 leading-relaxed">
            Découvrez toutes les fonctionnalités puissantes de notre application de facturation et gestion client.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => (
            <FeatureCard 
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>

        {/* Advanced Features Section */}
        <div className="mt-16 bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8 md:p-12 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
            <h2 className="text-3xl font-bold mb-2">Fonctionnalités Avancées</h2>
            <p className="text-blue-100 max-w-2xl">Tout ce dont vous avez besoin pour une gestion financière optimale</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 p-8">
            <div className="p-6 hover:bg-gray-50 rounded-xl transition-colors duration-300">
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-blue-100 p-3 rounded-lg text-blue-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Workflow complet</h3>
                  <p className="mt-2 text-gray-600">
                    De la création du devis à la facturation finale, notre application couvre l'ensemble du cycle de vente.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 hover:bg-gray-50 rounded-xl transition-colors duration-300">
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-indigo-100 p-3 rounded-lg text-indigo-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Personnalisation</h3>
                  <p className="mt-2 text-gray-600">
                    Modèles de documents, emails, calculs des taxes - tout est personnalisable selon vos besoins.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 hover:bg-gray-50 rounded-xl transition-colors duration-300">
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-purple-100 p-3 rounded-lg text-purple-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Automatisation</h3>
                  <p className="mt-2 text-gray-600">
                    Automatisez les tâches répétitives comme les relances et les transformations devis→facture.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 hover:bg-gray-50 rounded-xl transition-colors duration-300">
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-green-100 p-3 rounded-lg text-green-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Sécurité et collaboration</h3>
                  <p className="mt-2 text-gray-600">
                    Gestion fine des permissions pour chaque membre de l'équipe avec accès contrôlé.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <button 
            className="relative inline-flex items-center px-8 py-4 border border-transparent text-lg font-bold rounded-xl shadow-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 transform hover:scale-105"
            onClick={() => navigate('/demandeAcces')}
          >
            <span className="relative z-10">Démarrer maintenant</span>
            <span className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-700 rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-300"></span>
          </button>
          
          <p className="mt-4 text-gray-500">
            Essayez gratuitement pendant 14 jours. Aucune carte de crédit requise.
          </p>
        </div>
      </div>
    </div>
  );
};

export default  function ProjectFeatures(){
  return (
    <>
      <ProjectFeature />
      <Footer />
    </>
  );
}