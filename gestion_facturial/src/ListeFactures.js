import React, { useEffect, useState, useMemo } from "react";
import Modal from 'react-modal';
import { useNavigate } from "react-router-dom";

Modal.setAppElement('#root');

export default function ListeFactures() {
  const [searchTerm, setSearchTerm] = useState('');
  const [factures, setFactures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [selectedFacture, setSelectedFacture] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [statut, setStatut] = useState('');
  const [moyenPaiement, setMoyenPaiement] = useState('');
  const [datePaiement, setDatePaiement] = useState('');
  const [montant, setMontant] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [factureToDelete, setFactureToDelete] = useState(null);
  const token = sessionStorage.getItem("token");
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchFactures = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/factures", {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json"
          }
        });
        if (!res.ok) throw new Error("Erreur lors de la récupération des factures");
        const data = await res.json();
        setFactures(data.factures || data);
      } catch (err) {
        setErreur(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFactures();
  }, [token]);

  const openModal = (facture) => {
    setSelectedFacture(facture);
    setStatut(facture.statut);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const handleTelechargement = (id) => {
    navigate(`/gestionnaire/facture/${id}/telecharger`);
  };

  const handleEnvoyerEmail = (id) => {
    navigate(`/gestionnaire/factures/${id}/envoyer`);
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/factures/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Erreur lors de la suppression de la facture");

      // Rafraîchir la liste des factures
      const resFactures = await fetch("http://127.0.0.1:8000/api/factures", {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json"
        }
      });
      const data = await resFactures.json();
      setFactures(data.factures || data);
      setConfirmDelete(false);
      setFactureToDelete(null);
      alert("✅ Facture supprimée avec succès");
    } catch (err) {
      console.error(err);
      alert(`❌ Erreur: ${err.message}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Mise à jour du statut de la facture
      const resStatut = await fetch(`http://127.0.0.1:8000/api/factures/${selectedFacture.id_facture}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ statut }),
      });

      if (!resStatut.ok) throw new Error("Erreur lors de la mise à jour du statut");

      // Si la facture est payée, on enregistre le paiement
      if (statut === 'payee' && moyenPaiement && montant) {
        const resPaiement = await fetch('http://127.0.0.1:8000/api/paiements', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            date_paiement: datePaiement || new Date().toISOString(),
            montant,
            moyen: moyenPaiement,
            id_facture: selectedFacture.id_facture
          }),
        });

        if (!resPaiement.ok) throw new Error("Erreur lors de l'enregistrement du paiement");
      }

      // Rafraîchir la liste des factures
      const res = await fetch("http://127.0.0.1:8000/api/factures", {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json"
        }
      });
      const data = await res.json();
      setFactures(data.factures || data);

      closeModal();
      alert("✅ Mise à jour effectuée avec succès");
    } catch (err) {
      console.error(err);
      alert(`❌ Erreur: ${err.message}`);
    }
  };

  const filteredFactures = useMemo(() => {
    return factures.filter(facture => {
      const matchesSearch = 
        facture.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (facture.client?.nom?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        facture.statut.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [factures, searchTerm]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-lg text-gray-600">Chargement des factures...</p>
      </div>
    </div>
  );
  
  if (erreur) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md p-6 bg-red-50 border border-red-200 rounded-lg shadow-md">
        <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-red-700 mb-2">Erreur</h2>
        <p className="text-red-600">❌ {erreur}</p>
      </div>
    </div>
  );

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
                <h1 className="text-2xl font-bold">Factures de l'entreprise</h1>
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
            <p className="mt-1 text-blue-100">Gestion des factures et paiements</p>
          </div>

          <div className="p-6">
            {filteredFactures.length === 0 ? (
              <div className="text-center py-12">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  {searchTerm ? "Aucune facture ne correspond à votre recherche" : "Aucune facture trouvée"}
                </h3>
                <p className="mt-1 text-gray-500">
                  {searchTerm ? "Essayez avec d'autres termes" : "Commencez par créer votre première facture"}
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
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date émission</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date échéance</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total TTC</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredFactures.map(f => (
                      <tr key={f.id_facture} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{f.numero}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">{f.date_emission}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">{f.date_echeance}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-900">{f.client?.nom || "N/A"}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-medium">{f.total_ttc} DH</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${f.statut === 'payee' ? 'bg-green-100 text-green-800' : 
                              f.statut === 'en_retard' ? 'bg-red-100 text-red-800' : 
                              f.statut === 'emise' ? 'bg-blue-100 text-blue-800' : 
                              'bg-yellow-100 text-yellow-800'}`}>
                            {f.statut}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {/* Télécharger facture */}
                          <button 
                            onClick={() => handleTelechargement(f.id_facture)}
                            className="mr-3 text-indigo-600 hover:text-indigo-900"
                            title="Télécharger la facture"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                          </button>

                          {/* Modifier facture */}
                          <button 
                            onClick={() => openModal(f)}
                            className="mr-3 text-blue-600 hover:text-blue-900"
                            title="Modifier la facture"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>

                          {/* Supprimer facture */}
                          <button 
                            onClick={() => {
                              setFactureToDelete(f.id_facture);
                              setConfirmDelete(true);
                            }}
                            className="mr-3 text-red-600 hover:text-red-900"
                            title="Supprimer la facture"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>

                          {/* Envoyer par email */}
                          <button 
                            onClick={() => handleEnvoyerEmail(f.id_facture)}
                            className="text-green-600 hover:text-green-900"
                            title="Envoyer la facture par email"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </button>
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

      {/* Modal pour les détails et modification */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Détails de la facture"
        className="modal-content-outline"
        overlayClassName="modal-overlay"
      >
        <div className="relative bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
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
          
          {selectedFacture && (
            <div className="p-6">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 -mx-6 -mt-6 p-6 rounded-t-lg text-white">
                <h2 className="text-xl font-bold flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Détails de la facture #{selectedFacture.numero}
                </h2>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Date d'émission</p>
                  <p className="font-medium">{selectedFacture.date_emission}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Date d'échéance</p>
                  <p className="font-medium">{selectedFacture.date_echeance}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Client</p>
                  <p className="font-medium">{selectedFacture.client?.nom || "N/A"}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Statut</p>
                  <p className="font-medium">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${selectedFacture.statut === 'payee' ? 'bg-green-100 text-green-800' : 
                        selectedFacture.statut === 'en_retard' ? 'bg-red-100 text-red-800' : 
                        selectedFacture.statut === 'emise' ? 'bg-blue-100 text-blue-800' : 
                        'bg-yellow-100 text-yellow-800'}`}>
                      {selectedFacture.statut}
                    </span>
                  </p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Total HT</p>
                  <p className="text-lg font-bold">{selectedFacture.total_ht} DH</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">TVA</p>
                  <p className="text-lg font-bold">{selectedFacture.total_tva} DH</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Total TTC</p>
                  <p className="text-lg font-bold text-blue-600">{selectedFacture.total_ttc} DH</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="mt-8">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                  <select 
                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    value={statut} 
                    onChange={(e) => setStatut(e.target.value)}
                    required
                  >
                    <option value="brouillon">Brouillon</option>
                    <option value="emise">Emise</option>
                    <option value="payee">Payée</option>
                    <option value="en_retard">En retard</option>
                  </select>
                </div>

                {statut === 'payee' && (
                  <div className="bg-blue-50 p-4 rounded-lg mb-6">
                    <h3 className="text-lg font-semibold text-blue-800 mb-3">Informations de paiement</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Moyen de paiement</label>
                        <select 
                          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                          value={moyenPaiement} 
                          onChange={(e) => setMoyenPaiement(e.target.value)}
                          required
                        >
                          <option value="">Sélectionnez</option>
                          <option value="CB">Carte Bancaire</option>
                          <option value="Virement">Virement Bancaire</option>
                          <option value="Cheque">Chèque</option>
                          <option value="Espèces">Espèces</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date de paiement</label>
                        <input 
                          type="date" 
                          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                          value={datePaiement} 
                          onChange={(e) => setDatePaiement(e.target.value)}
                          required
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Montant payé</label>
                        <input 
                          type="number" 
                          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                          value={montant} 
                          onChange={(e) => setMontant(e.target.value)}
                          min="0"
                          step="0.01"
                          max={selectedFacture.total_ttc}
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

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
      {confirmDelete && (
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
              <p className="mt-2 text-gray-500">Êtes-vous sûr de vouloir supprimer cette facture ? Cette action est irréversible.</p>
              
              <div className="mt-6 flex justify-center space-x-4">
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Annuler
                </button>
                <button
                  onClick={() => handleDelete(factureToDelete)}
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}