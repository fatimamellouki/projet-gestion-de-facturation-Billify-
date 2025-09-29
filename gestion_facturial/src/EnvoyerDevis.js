import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

export default function EnvoiDevis() {
  const { id } = useParams();

  const [options, setOptions] = useState({
    afficher_logo: true,
    afficher_signature: true,
    afficher_footer: true,
    afficher_header: true,
  });

  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    const { name, checked } = e.target;
    setOptions({ ...options, [name]: checked });
  };

  const EnvoyerDevis = async (type = 'standard') => {
    setIsSending(true);
    setMessage(null);

    try {
      const endpoint = type === 'personnalise'
        ? `http://127.0.0.1:8000/api/devis/${id}/envoyer?modele=personnalise`
        : `http://127.0.0.1:8000/api/devis/${id}/envoyer?modele=standard`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem("token")}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(options),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Erreur lors de l'envoi");
      }

      setMessage({
        text: data.message || 'devis envoyée avec succès !',
        type: 'success'
      });
    } catch (error) {
      setMessage({
        text: error.message || 'Erreur lors de l\'envoi de la devis',
        type: 'error'
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
          <h2 className="text-2xl font-bold flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Envoyer le Devis par email
          </h2>
        </div>

        <div className="p-6">
          <form className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="afficher_logo"
                    name="afficher_logo"
                    type="checkbox"
                    checked={options.afficher_logo}
                    onChange={handleChange}
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="afficher_logo" className="font-medium text-gray-700">
                    Afficher le logo
                  </label>
                  <p className="text-gray-500">Inclure le logo de votre entreprise</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="afficher_signature"
                    name="afficher_signature"
                    type="checkbox"
                    checked={options.afficher_signature}
                    onChange={handleChange}
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="afficher_signature" className="font-medium text-gray-700">
                    Afficher la signature
                  </label>
                  <p className="text-gray-500">Ajouter votre signature numérique</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="afficher_footer"
                    name="afficher_footer"
                    type="checkbox"
                    checked={options.afficher_footer}
                    onChange={handleChange}
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="afficher_footer" className="font-medium text-gray-700">
                    Afficher le pied de page
                  </label>
                  <p className="text-gray-500">Inclure les mentions légales</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="afficher_header"
                    name="afficher_header"
                    type="checkbox"
                    checked={options.afficher_header}
                    onChange={handleChange}
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="afficher_header" className="font-medium text-gray-700">
                    Afficher l'en-tête de page
                  </label>
                  <p className="text-gray-500">Inclure l'entête avec vos coordonnées</p>
                </div>
              </div>
            </div>

            {message && (
              <div className={`rounded-md p-4 ${message.type === 'success' ? 'bg-green-50' : 'bg-red-50'}`}>
                <div className="flex">
                  <div className="flex-shrink-0">
                    {message.type === 'success' ? (
                      <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="ml-3">
                    <p className={`text-sm font-medium ${message.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
                      {message.text}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => EnvoyerDevis('standard')}
                disabled={isSending}
                className={`flex-1 flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isSending ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isSending ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Modèle standard
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => EnvoyerDevis('personnalise')}
                disabled={isSending}
                className={`flex-1 flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-blue-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isSending ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Modèle personnalisé
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}