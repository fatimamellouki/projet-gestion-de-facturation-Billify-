import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Trash } from 'lucide-react';
import CustomToolbar from './CustomToolbar'; 

export default function CustomInvoice() {
  const quillRefs = useRef([]);
  const token = sessionStorage.getItem("token");
  const navigate = useNavigate();

  // États
  const [factureInfo, setFactureInfo] = useState({
    numero: '',
    date_emission: new Date().toISOString().split('T')[0],
    date_echeance: '',
    id_client: '',
    id_entreprise: '',
    statut: 'brouillon',
    objet: 'Application sur mesure (Gestion de station)'
  });

  const [clients, setClients] = useState([]);
  const [lignes, setLignes] = useState([
    { 
      designation: '', 
      quantite: 1, 
      prixUnitaire: 0, 
      tva: 20, 
      remise: 0, 
      montant_total_ttc: 0,
      htmlDesignation: ''
    }
  ]);
  
  const [moyenPaiement, setMoyenPaiement] = useState('');
  const [datePaiement, setDatePaiement] = useState('');
  const [montantPaiement, setMontantPaiement] = useState('');
  const [isFirstFacture, setIsFirstFacture] = useState(false);

  // Formats pour Quill
  const formats = [
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet'
  ];

  const checkIfFirstFacture = async (idEntreprise) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/entreprises/${idEntreprise}/factures/count`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      return data.count === 0;
    } catch (err) {
      console.error("Erreur lors de la vérification des factures :", err);
      return false;
    }
  };
  
  // Handler pour les changements de désignation
  const handleDesignationChange = (index) => (content, delta, source, editor) => {
    const text = editor.getText();
    setLignes(prev => {
      const newLignes = [...prev];
      newLignes[index] = {
        ...newLignes[index],
        htmlDesignation: content,
        designation: text,
      };
      return newLignes;
    });
  };

  // Handler pour les changements de ligne
  const handleLigneChange = (i, field, value) => {
    setLignes(prev => {
      const copy = [...prev];
      copy[i][field] = field === 'designation' ? value : parseFloat(value) || 0;
      
      // Calcul des totaux
      const prix = copy[i].quantite * copy[i].prixUnitaire;
      const remise = prix * copy[i].remise / 100;
      const ht = prix - remise;
      copy[i].montant_total_ttc = ht + (ht * copy[i].tva / 100);
      
      return copy;
    });
  };

  // Calcul des totaux globaux
  const totalHT = lignes.reduce((acc, l) => {
    const prix = l.quantite * l.prixUnitaire;
    const remise = prix * l.remise / 100;
    return acc + (prix - remise);
  }, 0);
  
  const totalTVA = lignes.reduce((acc, l) => {
    const prix = l.quantite * l.prixUnitaire;
    const remise = prix * l.remise / 100;
    const ht = prix - remise;
    return acc + (ht * l.tva / 100);
  }, 0);
  
  const totalTTC = totalHT + totalTVA;

  useEffect(() => {
    fetchClients();
    fetchEntreprise();
  }, [token]);

  const fetchClients = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/utilisateurs/clients", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setClients(data);
    } catch (err) {
      console.error("Erreur clients:", err);
    }
  };

  const fetchEntreprise = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/entreprise/info', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      const entrepriseId = data?.entreprise?.id_entreprise;
      if (!entrepriseId) return;

      setFactureInfo(prev => ({ ...prev, id_entreprise: entrepriseId }));

      const isFirst = await checkIfFirstFacture(entrepriseId);
      setIsFirstFacture(isFirst);

      if (!isFirst) {
        const lastRes = await fetch(`http://127.0.0.1:8000/api/entreprises/${entrepriseId}/factures/last-id`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const lastData = await lastRes.json();
        const nextId = (lastData.last_id || 0) + 1;
        const numeroAuto = 'FAC-' + String(nextId).padStart(4, '0');
        setFactureInfo(prev => ({ ...prev, numero: numeroAuto }));
      }
    } catch (err) {
      console.error("Erreur chargement entreprise :", err);
    }
  };

  const ajouterLigne = () => {
    setLignes([...lignes, {
      designation: '', 
      quantite: 1, 
      prixUnitaire: 0, 
      tva: 20, 
      remise: 0, 
      montant_total_ttc: 0,
      htmlDesignation: ''
    }]);
  };

  const supprimerLigne = (index) => {
    setLignes(lignes.filter((_, i) => i !== index));
  };

  const telechargerFacture = async (factureId) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/factures/${factureId}/CustomTelecharger?objet=${encodeURIComponent(factureInfo.objet)}`,
        {
          headers: {
            Authorization:`Bearer ${token}`,
            'Accept': 'application/pdf'
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors du téléchargement");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `facture_${factureId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Erreur de téléchargement :", err);
      alert("❌ Échec du téléchargement de la facture: " + err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation des données
    if (!factureInfo.id_client) {
      alert("Veuillez sélectionner un client");
      return;
    }

    const payload = {
      ...factureInfo,
      lignes: lignes.map(l => ({
        designation: l.htmlDesignation || l.designation,
        quantite: l.quantite,
        prixUnitaire: l.prixUnitaire,
        tva: l.tva,
        remise: l.remise,
        montant_total_ttc: l.montant_total_ttc
      })),
      total_ht: totalHT,
      total_tva: totalTVA,
      total_ttc: totalTTC
    };

    try {
      const res = await fetch('http://127.0.0.1:8000/api/factures', {
        method: "POST",
        headers: {
          Authorization:`Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Erreur lors de l'enregistrement");
      }

      const data = await res.json();
      
      if (factureInfo.statut === 'payee') {
        const paiementRes = await fetch('http://127.0.0.1:8000/api/paiements', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            date_paiement: datePaiement || new Date().toISOString().split('T')[0],
            montant: montantPaiement || totalTTC,
            moyen: moyenPaiement,
            id_facture: data.facture.id_facture
          }),
        });

        if (!paiementRes.ok) {
          throw new Error("Erreur lors de l'enregistrement du paiement");
        }
      }

      alert("Facture enregistrée avec succès !");
      await telechargerFacture(data.facture.id_facture);
    } catch (err) {
      console.error("Erreur:", err);
      alert("Erreur lors de l'enregistrement: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Nouvelle Facture (Modèle Personnalisé)
              </h1>
              <p className="mt-1 text-indigo-100">Saisie manuelle complète avec mise en forme</p>
            </div>
            <button 
              onClick={() => navigate('/gestionnaire/factures/nouvelle')}
              className="text-indigo-100 hover:text-white flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Retour
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Section En-tête */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Numéro</label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                value={factureInfo.numero}
                onChange={(e) => setFactureInfo({ ...factureInfo, numero: e.target.value })}
                readOnly={!isFirstFacture}
                placeholder={factureInfo.numero}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date d'émission</label>
              <input
                type="date"
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                value={factureInfo.date_emission}
                onChange={(e) => setFactureInfo({ ...factureInfo, date_emission: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date d'échéance</label>
              <input
                type="date"
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                value={factureInfo.date_echeance}
                onChange={(e) => setFactureInfo({ ...factureInfo, date_echeance: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                value={factureInfo.id_client}
                onChange={(e) => setFactureInfo({ ...factureInfo, id_client: e.target.value })}
                required
              >
                <option value="">-- Sélectionner un client --</option>
                {clients.map(c => (
                  <option key={c.id_client} value={c.id_client}>
                    {c.nom}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                value={factureInfo.statut}
                onChange={(e) => setFactureInfo({ ...factureInfo, statut: e.target.value })}
                required
              >
                <option value="brouillon">Brouillon</option>
                <option value="emise">Emise</option>
                <option value="payee">Payée</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Objet de la facture</label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                value={factureInfo.objet}
                onChange={(e) => setFactureInfo({ ...factureInfo, objet: e.target.value })}
                placeholder="Ex: Application sur mesure (Gestion de station)"
                required
              />
            </div>
          </div>

          {/* Section Paiement */}
          {factureInfo.statut === 'payee' && (
            <div className="bg-blue-50 rounded-lg p-6 mb-8 border border-blue-200">
              <h3 className="text-xl font-semibold text-blue-800 mb-4">Informations de Paiement</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Montant payé</label>
                  <input 
                    type="number" 
                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    value={montantPaiement} 
                    onChange={(e) => setMontantPaiement(e.target.value)}
                    min="0"
                    step="0.01"
                    max={totalTTC}
                    placeholder={(totalTTC?? 0).toFixed(2)}
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Section Articles */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Articles</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Désignation</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qté</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix HT</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remise %</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TVA %</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total TTC</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                  </tr>
                </thead>
                <tbody>
                  {lignes.map((ligne, index) => {
                    // Configuration des modules
                    const modules = {
                      toolbar: {
                        container: `#toolbar-${index}`,
                      }
                    };

                    return (
                      <tr key={index}>
                      <td className="px-6 py-4">
  <div className="border border-gray-300 rounded-md" style={{ minWidth: '400px' }}>
    <ReactQuill
      ref={(el) => (quillRefs.current[index] = el)}
      theme="snow"
      value={ligne.htmlDesignation}
      onChange={handleDesignationChange(index)}
      modules={modules}
      formats={formats}
      placeholder="Tapez la désignation ici..."
      className="quill-editor"
    />
        <CustomToolbar id={`toolbar-${index}`} quill={quillRefs.current[index]} />

  </div>
</td>

                        
                        <td className="px-6 py-4">
                          <input
                            type="number"
                            min="1"
                            className="w-20 border border-gray-300 rounded-md p-2"
                            value={ligne.quantite}
                            onChange={(e) => handleLigneChange(index, 'quantite', e.target.value)}
                          />
                        </td>
                        
                        <td className="px-6 py-4">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            className="w-24 border border-gray-300 rounded-md p-2"
                            value={ligne.prixUnitaire}
                            onChange={(e) => handleLigneChange(index, 'prixUnitaire', e.target.value)}
                          />
                        </td>
                        
                        <td className="px-6 py-4">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            className="w-20 border border-gray-300 rounded-md p-2"
                            value={ligne.remise}
                            onChange={(e) => handleLigneChange(index, 'remise', e.target.value)}
                          />
                        </td>
                        
                        <td className="px-6 py-4">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            className="w-20 border border-gray-300 rounded-md p-2"
                            value={ligne.tva}
                            onChange={(e) => handleLigneChange(index, 'tva', e.target.value)}
                          />
                        </td>
                        
                        <td className="px-6 py-4 font-medium">
                          {ligne.montant_total_ttc.toFixed(2)} DH
                        </td>
                        
                        <td className="px-6 py-4 text-center">
                          <button
                            type="button"
                            onClick={() => supprimerLigne(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash size={20} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            <button
              type="button"
              onClick={ajouterLigne}
              className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >
              Ajouter une ligne
            </button>
          </div>
          
          {/* Totaux et bouton de soumission */}
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-2">Récapitulatif</h4>
                <div className="space-y-2">
                  <p className="text-gray-600">Total HT: <span className="font-bold">{totalHT.toFixed(2)} DH</span></p>
                  <p className="text-gray-600">Total TVA: <span className="font-bold">{totalTVA.toFixed(2)} DH</span></p>
                  <p className="text-xl font-bold">Total TTC: <span className="text-indigo-600">{totalTTC.toFixed(2)} DH</span></p>
                </div>
              </div>
              <div className="flex items-end justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Enregistrer la facture
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}