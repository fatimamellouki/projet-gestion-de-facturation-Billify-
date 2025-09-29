import { useEffect, useState } from 'react';
import Modal from 'react-modal';

Modal.setAppElement('#root');

export default function MesDevis() {
  const [devis, setDevis] = useState([]);
  const [selectedDevis, setSelectedDevis] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = sessionStorage.getItem('token');
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/json"
  };

  useEffect(() => {
    console.log(token)
    setLoading(true);
    fetch("http://localhost:8000/api/mes-devis", { headers })
      .then(res => {
        if (!res.ok) {
          throw new Error("Erreur lors du chargement des devis");
        }
        return res.json();
      })
      .then(data => {
        setDevis(data);
        setError(null);
      })
      .catch(err => {
        setError(err.message);
        console.error("Erreur:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

  const accepterDevis = (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir accepter ce devis ?")) return;
    
    fetch(`http://localhost:8000/api/devis/${id}/accepter`, {
      method: 'POST',
      headers,
    })
    .then(res => {
      if (!res.ok) {
        throw new Error("Erreur lors de l'acceptation du devis");
      }
      return res.json();
    })
    .then(() => {
      alert("✅ Devis accepté et transformé en facture !");
      setDevis(prev => prev.map(d => d.id === id ? { ...d, etat: 'signé' } : d));
    })
    .catch(err => {
      alert(`❌ ${err.message}`);
    });
  };

  const refuserDevis = (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir refuser ce devis ?")) return;
    
    fetch(`http://localhost:8000/api/devis/${id}/refuser`, {
      method: 'POST',
      headers,
    })
    .then(res => {
      if (!res.ok) {
        throw new Error("Erreur lors du refus du devis");
      }
      return res.json();
    })
    .then(() => {
      alert("❌ Devis refusé.");
      setDevis(prev => prev.map(d => d.id === id ? { ...d, etat: 'refusé' } : d));
    })
    .catch(err => {
      alert(`❌ ${err.message}`);
    });
  };

  const openModal = (devis) => {
    setSelectedDevis(devis);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des devis...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-md p-6 bg-red-50 border border-red-200 rounded-lg shadow-md">
          <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-red-700 mb-2">Erreur</h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (devis.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">Aucun devis pour le moment</h3>
          <p className="mt-1 text-gray-500">Vous n'avez aucun devis à afficher</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h1 className="text-2xl font-bold">Mes Devis</h1>
            </div>
            <p className="mt-1 text-blue-100">Gestion de tous vos devis en un seul endroit</p>
          </div>

          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Numéro</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entreprise</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">État</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Options</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {devis.map(d => (
                    <tr key={d.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{d.numero}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">{new Date(d.date_devis).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900">{d.entreprise?.nom || `Entreprise #${d.entreprise_id}`}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-medium">{d.total_ttc} MAD</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${d.etat === 'signé' ? 'bg-green-100 text-green-800' : 
                            d.etat === 'refusé' ? 'bg-red-100 text-red-800' : 
                            'bg-yellow-100 text-yellow-800'}`}>
                          {d.etat}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button 
                          onClick={() => openModal(d)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        
                        {d.etat !== 'signé' && (
                          <>
                            <button 
                              onClick={() => accepterDevis(d.id)}
                              className="text-green-600 hover:text-green-900 mr-3"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                            <button 
                              onClick={() => refuserDevis(d.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modal pour les détails*/}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Détails du devis"
        className="modal-content-outline"
        overlayClassName="modal-overlay"
      >
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              onClick={closeModal}
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {selectedDevis && (
            <div className="p-6">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 -mx-6 -mt-6 p-6 rounded-t-lg text-white">
                <h2 className="text-xl font-bold">Détails du devis #{selectedDevis.numero}</h2>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Date du devis</p>
                  <p className="font-medium">{new Date(selectedDevis.date_devis).toLocaleDateString()}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Entreprise</p>
                  <p className="font-medium">{selectedDevis.entreprise?.nom || `Entreprise #${selectedDevis.entreprise_id}`}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Total TTC</p>
                  <p className="font-medium">{selectedDevis.total_ttc} DH</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">État</p>
                  <p className="font-medium">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${selectedDevis.etat === 'signé' ? 'bg-green-100 text-green-800' : 
                        selectedDevis.etat === 'refusé' ? 'bg-red-100 text-red-800' : 
                        'bg-yellow-100 text-yellow-800'}`}>
                      {selectedDevis.etat}
                    </span>
                  </p>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Lignes du devis</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Désignation</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantité</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix Unitaire (DH)</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TVA (%)</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total TTC (DH)</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedDevis.lignes?.map((ligne, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-900">{ligne.designation}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-500">{ligne.quantite}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-500">{ligne.prix_unitaire_ht}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-500">{ligne.taux_tva}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-medium">{ligne.montant_ttc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}