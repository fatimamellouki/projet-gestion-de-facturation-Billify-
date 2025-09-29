// src/App.js
import React from 'react';
import './index.css'; // ou ./tailwind.css selon le nom que tu as donné

import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from 'react-router-dom';
import Contact from './Contact';
import { match } from 'path-to-regexp';
import ListeDevis from './ListeDevis';
import DevisForm from './DevisForm';
import Login from './Login';
import Admin from './Admin'; // Page d’accueil admin
import Client from './Client';
import Inscription from './Inscription';
import PrivateRoute from './PrivateRoute';
import Forbidden from './Forbidden';
import FeaturesSection from './FeaturesSection';
import PricingSection from './PricingSection';
import FormulaireEntreprise from './FormulaireEntreprise';
import GestionProduits from './GestionProduits';
// import ListeFacturesClients from './ListeFacturesClients';
import HomePage from './HomePage';
import Produit from './Produit';
import ListClient from './ListClient'
import ListeFactures from './ListeFactures';
import Statistique from './Statistique';
import Avoir from './Avoir';
import AvoirForm from './AvoirForm'
import Modal from 'react-modal';
import TelechargementFacture from './TelechargementFacture';
import EnvoyerFacture from './EnvoyerFacture';
import AfficheProduit from './afficheProduit';
import InfoEntreprise from './InfoEntreprise';
import MesDevis from './MesDevis';
import AdminLayout from './AdminLayout';
import Header from './Header';
import ListFranchise from './ListFranchise';
import ListComptable from './ListComptable';
import DemandeAcces from './DemandeAcces';
import ForgotPassword from './ForgotPassword';
import ResetPassword from './ResetPassword';
import StandardInvoice from './StandardInvoice';
import CustomInvoice from './CustomInvoice';
import InvoiceSelection from './InvoiceSelection';
import Parametres from './Parametres';
import ProjectFeatures from './ProjectFeatures';
import CustomDevis from './CustomDevis';
import TelechargementDevis from './TelechargementDevis';
import EnvoyerDevis from './EnvoyerDevis';
import DevisSelection from './DevisSelection';
import FooterSection from './FooterSection';

Modal.setAppElement('#root');
function AppContent() {
  const location = useLocation();

  const hideHeaderPaths = [
    "/gestionnaire",
    "/gestionnaire/liste",
    "/gestionnaire/produits",
    "/gestionnaire/factures",
    "/gestionnaire/stats",
    "/gestionnaire/facture/:id/telecharger",
    "/gestionnaire/avoirs",
    "/gestionnaire/avoirs/nouvel",
    "/gestionnaire/factures/nouvelle",
    "/gestionnaire/afficheProduit",
    "/client/mesDevis",
    "/client",
    "/client/afficherProduit",
    "/gestionnaire/parametres",
    "/client/afficheProduit",
    "/gestionnaire/listFranchises",
    "/gestionnaire/devis/nouvel",
    "/gestionnaire/devis",
    "/gestionnaire/listComptables",
    "/gestionnaire/devis/personnalise",
    "/gestionnaire/devis/standard",
    "/gestionnaire/InfoEntreprise"
  ];

const shouldHideHeader = hideHeaderPaths.some(pathPattern => {
  const matcher = match(pathPattern, { decode: decodeURIComponent });
  return !!matcher(location.pathname);
});
  return (
    <>
      {!shouldHideHeader && <Header />}

      <Routes>
        {/* Routes publiques */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/ForgotPassword" element={<ForgotPassword />} />
        <Route path="/demandeAcces" element={<DemandeAcces />} />
        <Route path="/inscription_secure_programer" element={<Inscription />} />
        <Route path="/features" element={<FeaturesSection />} />
        <Route path="/pricing" element={<PricingSection />} />
        <Route path="/entreprise" element={<FormulaireEntreprise />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/services" element={<ProjectFeatures/>}/>
        <Route path="/FooterSection" element={<FooterSection />} />
        <Route path="/contact" element={<Contact />} />
        {/* Routes protégées client */}
       <Route
  path="/client"
  element={
    <PrivateRoute allowedRoles={['client']}>
      <Client />
    </PrivateRoute>
  }
>
  <Route path='/client/afficherProduit' element={<AfficheProduit/>}/>

  <Route path="mesDevis" element={<MesDevis />} />
</Route>


        {/* Route gestionnaire imbriquée avec layout */}
        <Route
          path="/gestionnaire"
          element={
            <PrivateRoute allowedRoles={['admin', 'franchise', 'comptable']}
            >
              <AdminLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Admin />} />
          <Route path='/gestionnaire/produits' element={<Produit />} />
          <Route path='/gestionnaire/afficheProduit' element={<AfficheProduit/>}/>
          <Route path='/gestionnaire/liste' element={<ListClient/>}/>
          <Route path='/gestionnaire/listFranchises' element={<ListFranchise/>}/>
          <Route path='/gestionnaire/listComptables' element={<ListComptable/>}/>
          <Route path='/gestionnaire/factures' element={<ListeFactures/>}/>
          <Route path="/gestionnaire/facture/:id/telecharger" element={<TelechargementFacture />} />
          <Route path="/gestionnaire/factures/:id/envoyer" element={<EnvoyerFacture/>} />
          <Route path="/gestionnaire/factures/nouvelle" element={<InvoiceSelection/>} />
        <Route path="/gestionnaire/nouvelle-facture/standard" element={<StandardInvoice />} />
        <Route path="/gestionnaire/nouvelle-facture/personnalise" element={<CustomInvoice />} />
          <Route path='/gestionnaire/stats' element={<Statistique/>} />
          <Route path="/gestionnaire/devis" element={<ListeDevis />} />
          <Route path="/gestionnaire/devis/nouvel" element={<DevisSelection />} />
          <Route path='/gestionnaire/devis/standard' element={<DevisForm/>}/>
          <Route path='/gestionnaire/devis/personnalise' element={<CustomDevis/>}/>
            <Route path="/gestionnaire/devis/:id/telecharger" element={<TelechargementDevis />} />
          <Route path="/gestionnaire/devis/:id/envoyer" element={<EnvoyerDevis/>} />
          <Route path="/gestionnaire/avoirs" element={<Avoir />} />
          <Route path='/gestionnaire/InfoEntreprise'element={<InfoEntreprise/>}/>
          <Route path='parametres' element={<Parametres/>}/>  
          <Route path="/gestionnaire/avoirs/nouvel" element={<AvoirForm />} />

        </Route>

        {/* Page interdite */}
        <Route path="/forbidden" element={<Forbidden />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
