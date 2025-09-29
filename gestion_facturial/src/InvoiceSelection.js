import React from 'react';
import { Link } from 'react-router-dom';

export default function InvoiceSelection() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            <span className="block">Choisissez votre modèle de facturation</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Sélectionnez le modèle qui correspond à vos besoins
          </p>
        </div>

        <div className="mt-10 flex flex-col md:flex-row justify-center gap-8">
          {/* Modèle 1 - Auto-remplissage */}
          <div className="flex flex-col rounded-lg shadow-lg overflow-hidden bg-white transform transition-all hover:scale-105 hover:shadow-xl">
            <div className="flex-1 p-6 flex flex-col justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 text-center">Modèle Standard</h3>
                <p className="mt-3 text-base text-gray-500">
                  Les articles sont automatiquement remplis depuis votre catalogue de produits. Idéal pour une facturation rapide.
                </p>
              </div>
              <div className="mt-6">
                <Link
                  to="/gestionnaire/nouvelle-facture/standard"
                  className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Choisir ce modèle
                </Link>
              </div>
            </div>
          </div>

          {/* Modèle 2 - Saisie manuelle */}
          <div className="flex flex-col rounded-lg shadow-lg overflow-hidden bg-white transform transition-all hover:scale-105 hover:shadow-xl">
            <div className="flex-1 p-6 flex flex-col justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 text-center">Modèle Personnalisé</h3>
                <p className="mt-3 text-base text-gray-500">
                  Saisie manuelle complète des articles. Parfait pour les prestations de service ou produits non catalogués.
                </p>
              </div>
              <div className="mt-6">
                <Link
                  to="/gestionnaire/nouvelle-facture/personnalise"
                  className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Choisir ce modèle
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}