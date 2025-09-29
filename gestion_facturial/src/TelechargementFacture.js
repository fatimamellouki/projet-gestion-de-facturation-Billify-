import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

export default function TelechargementFacture() {
  const { id } = useParams();
  const [options, setOptions] = useState({
    afficher_logo: true,
    afficher_signature: true,
    afficher_footer: true,
    afficher_header: true,
  });

  const handleChange = (e) => {
    const { name, checked } = e.target;
    setOptions({ ...options, [name]: checked });
  };

  const downloadFacture = (type = 'standard') => {
    const endpoint = type === 'personnalisee'
      ? `http://127.0.0.1:8000/api/factures/${id}/CustomTelecharger`
      : `http://127.0.0.1:8000/api/factures/${id}/telecharger`;

    fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sessionStorage.getItem("token")}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    })
      .then(response => {
        if (!response.ok) throw new Error('Erreur serveur');
        return response.blob();
      })
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `facture_${id}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      })
      .catch(() => alert('Erreur lors du téléchargement'));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-blue-700 p-6 text-white">
          <h2 className="text-2xl font-bold flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Personnaliser la facture
          </h2>
        </div>

        <div className="p-6">
          <form className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center">
                <input 
                  id="afficher_logo"
                  type="checkbox" 
                  name="afficher_logo" 
                  checked={options.afficher_logo} 
                  onChange={handleChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="afficher_logo" className="ml-3 block text-sm font-medium text-gray-700">
                  Afficher le logo
                </label>
              </div>

              <div className="flex items-center">
                <input 
                  id="afficher_signature"
                  type="checkbox" 
                  name="afficher_signature" 
                  checked={options.afficher_signature} 
                  onChange={handleChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="afficher_signature" className="ml-3 block text-sm font-medium text-gray-700">
                  Afficher la signature
                </label>
              </div>

              <div className="flex items-center">
                <input 
                  id="afficher_footer"
                  type="checkbox" 
                  name="afficher_footer" 
                  checked={options.afficher_footer} 
                  onChange={handleChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="afficher_footer" className="ml-3 block text-sm font-medium text-gray-700">
                  Afficher le pied de page
                </label>
              </div>

              <div className="flex items-center">
                <input 
                  id="afficher_header"
                  type="checkbox" 
                  name="afficher_header" 
                  checked={options.afficher_header} 
                  onChange={handleChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="afficher_header" className="ml-3 block text-sm font-medium text-gray-700">
                  Afficher l'en-tête de page
                </label>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => downloadFacture('standard')}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md shadow-sm flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Standard
              </button>

              <button
                type="button"
                onClick={() => downloadFacture('personnalisee')}
                className="flex-1 bg-white hover:bg-gray-50 text-indigo-600 py-2 px-4 border border-indigo-600 rounded-md shadow-sm flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Personnalisée
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}