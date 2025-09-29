import React, { useEffect, useState, useMemo } from 'react';
import Modal from 'react-modal';
import { useNavigate } from "react-router-dom";

Modal.setAppElement('#root');

export default function ListeDevis() {
  const [devis, setDevis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDevis, setSelectedDevis] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [editModalIsOpen, setEditModalIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [devisToDelete, setDevisToDelete] = useState(null);
  const [etat, setEtat] = useState('');
  const navigate = useNavigate();
  
  const token = sessionStorage.getItem("token");

  useEffect(() => {
    fetchDevis();
  }, [token]);

  const fetchDevis = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/devis', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
      });
      
      if (!response.ok) {
        throw new Error("Erreur lors du chargement des devis");
      }
      
      const data = await response.json();
      setDevis(data);
      setError(null);
    } catch (error) {
      setError(error.message);
      console.error("Erreur :", error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les devis selon le terme de recherche
  const filteredDevis = useMemo(() => {
    return devis.filter(devisItem => {
      const matchesSearch = 
        devisItem.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (devisItem.client?.nom?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        devisItem.etat.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [devis, searchTerm]);

  // Télécharger le devis PDF
  const handleDownload = (id) => {
    navigate(`/gestionnaire/devis/${id}/telecharger`);
  };

  const handleEnvoyerEmail = (id) => {
    navigate(`/gestionnaire/devis/${id}/envoyer`);
  };

  const openDetailsModal = (devis) => {
    setSelectedDevis(devis);
    setModalIsOpen(true);
  };

  const openEditModal = (devis) => {
    setSelectedDevis(devis);
    setEtat(devis.etat);
    setEditModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setEditModalIsOpen(false);
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:8000/api/devis/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression du devis');
      }

      setDevis(devis.filter(d => d.id !== id));
      setConfirmDelete(false);
      alert('Devis supprimé avec succès');
    } catch (err) {
      console.error('Erreur:', err);
      alert(`Erreur lors de la suppression: ${err.message}`);
    }
  };

  const handleUpdateEtat = async (e) => {
  e.preventDefault();
  try {
    const response = await fetch(`http://localhost:8000/api/devis/${selectedDevis.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ etat }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Erreur lors de la mise à jour du devis");
    }

    // Mettre à jour la liste des devis
    await fetchDevis();
    setEditModalIsOpen(false);
    alert('État du devis mis à jour avec succès');
  } catch (err) {
    console.error('Erreur:', err);
    alert(`Erreur lors de la mise à jour: ${err.message}`);
  }
};
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">Aucun devis trouvé</h3>
          <p className="mt-1 text-gray-500">Commencez par créer votre premier devis</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex items-center mb-4 md:mb-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h1 className="text-2xl font-bold">Liste des devis</h1>
              </div>
              <div className="relative w-full md:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-blue-200" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-transparent rounded-md leading-5 bg-blue-500 bg-opacity-20 text-blue-100 placeholder-blue-200 focus:outline-none focus:bg-white focus:ring-2 focus:ring-white focus:text-gray-900 transition duration-150 ease-in-out"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <p className="mt-1 text-blue-100">Gestion de tous vos devis en un seul endroit</p>
          </div>

          <div className="p-6">
            {filteredDevis.length === 0 ? (
              <div className="text-center py-12">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  {searchTerm ? "Aucun devis ne correspond à votre recherche" : "Aucun devis trouvé"}
                </h3>
                <p className="mt-1 text-gray-500">
                  {searchTerm ? "Essayez avec d'autres termes" : "Commencez par créer votre premier devis"}
                </p>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Réinitialiser la recherche
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Numéro</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total TTC</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">État</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredDevis.map(d => (
                      <tr key={d.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{d.numero}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-900">{d.client?.nom || `Client #${d.client_id}`}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">{new Date(d.date_devis).toLocaleDateString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-medium">{d.total_ttc} MAD</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${d.etat === 'signé' ? 'bg-green-100 text-green-800' : 
                              d.etat === 'refusé' ? 'bg-red-100 text-red-800' : 
                              d.etat === 'brouillon' ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-gray-100 text-gray-800'}`}>
                            {d.etat}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            {/* Bouton Télécharger */}
                            <button 
                              onClick={() => handleDownload(d.id)}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-100"
                              title="Télécharger PDF"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                            </button>
                            
                            {/* Bouton Modifier */}
                            <button 
                              onClick={() => openEditModal(d)}
                              className="text-indigo-600 hover:text-indigo-900 p-1 rounded-full hover:bg-indigo-100"
                              title="Modifier"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            
                            {/* Bouton Supprimer */}
                            <button 
                              onClick={() => {
                                setDevisToDelete(d.id);
                                setConfirmDelete(true);
                              }}
                              className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-100"
                              title="Supprimer"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                            
                            {/* Bouton Envoyer Email */}
                            <button 
                              onClick={() => handleEnvoyerEmail(d.id)}
                              className="text-green-600 hover:text-green-900 p-1 rounded-full hover:bg-green-100"
                              title="Envoyer par email"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                            </button>
                            
                            {/* Bouton Voir Détails */}
                            <button 
                              onClick={() => openDetailsModal(d)}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-100"
                              title="Voir détails"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal pour les détails */}
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

      {/* Modal pour modifier l'état */}
      <Modal
        isOpen={editModalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Modifier l'état du devis"
        className="modal-content-outline"
        overlayClassName="modal-overlay"
      >
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
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
            <div>
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 -mx-6 -mt-6 p-6 rounded-t-lg text-white">
                <h2 className="text-xl font-bold">Modifier l'état du devis #{selectedDevis.numero}</h2>
              </div>

              <form onSubmit={handleUpdateEtat} className="mt-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nouvel état</label>
                  <select 
                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    value={etat} 
                    onChange={(e) => setEtat(e.target.value)}
                    required
                  >
                    <option value="brouillon">brouillon</option>
                    <option value="signé">signé</option>
                    <option value="refusé">Refusé</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button 
                    type="button" 
                    onClick={closeModal}
                    className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Annuler
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Enregistrer
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </Modal>

      {/* Modal de confirmation de suppression */}
      <Modal
        isOpen={confirmDelete}
        onRequestClose={() => setConfirmDelete(false)}
        contentLabel="Confirmation de suppression"
        className="modal-content-outline"
        overlayClassName="modal-overlay"
      >
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              onClick={() => setConfirmDelete(false)}
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mt-4">Confirmer la suppression</h3>
            <p className="mt-2 text-gray-500">Êtes-vous sûr de vouloir supprimer ce devis ? Cette action est irréversible.</p>
            
            <div className="mt-6 flex justify-center space-x-4">
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDelete(devisToDelete)}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}