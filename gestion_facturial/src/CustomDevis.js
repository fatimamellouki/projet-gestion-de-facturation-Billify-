import React, { useEffect, useState,useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash } from 'lucide-react';
import CustomToolbar from './CustomToolbar'; 
import ReactQuill from 'react-quill';

export default function CustomDevis() {
  const token = sessionStorage.getItem('token');
  const navigate = useNavigate();
  const quillRefs = useRef([]);

  // États
  const [devisInfo, setDevisInfo] = useState({
    numero: '',
    date_devis: new Date().toISOString().split('T')[0],
    client_id: null,
    etat: 'brouillon',
    objet: 'Devis pour prestations de services',
    note: ''
  });
  
  const [clients, setClients] = useState([]);
  const [lignes, setLignes] = useState([
    { produit_id: null, designation: '', quantite: 1, prix_unitaire_ht: 0, taux_tva: 20, remise_pourcentage: 0 }
  ]);
  
  const [isFirstDevis, setIsFirstDevis] = useState(false);

  // Totaux
  const totalHT = lignes.reduce(
    (sum, l) => sum + l.quantite * l.prix_unitaire_ht * (1 - l.remise_pourcentage / 100), 
    0
  );
  
  const totalTVA = lignes.reduce(
    (sum, l) => sum + (l.quantite * l.prix_unitaire_ht * (1 - l.remise_pourcentage / 100)) * (l.taux_tva / 100), 
    0
  );
  
  const totalTTC = totalHT + totalTVA;
const formats = [
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet'
  ];

  useEffect(() => {
    if (!token) return;
    fetchClients();
    fetchEntrepriseInfo();
  }, [token]);

  const fetchClients = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/utilisateurs/clients', {
        headers: { 
          'Accept': 'application/json', 
          Authorization: `Bearer ${token}` 
        }
      });
      const data = await res.json();
      setClients(data);
    } catch (err) {
      console.error('Erreur clients:', err);
    }
  };

  const fetchEntrepriseInfo = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/entreprise/info', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const { entreprise } = await res.json();
      if (!entreprise?.id_entreprise) return;
      
      // Compter les devis existants
      const countRes = await fetch(
        `http://localhost:8000/api/entreprises/${entreprise.id_entreprise}/devis/count`, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const { count } = await countRes.json();
      
      setIsFirstDevis(count === 0);
      
      if (count > 0) {
        const lastRes = await fetch(
          `http://localhost:8000/api/entreprises/${entreprise.id_entreprise}/devis/last-id`, 
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const { last_id } = await lastRes.json();
        setDevisInfo(prev => ({ 
          ...prev, 
          numero: `DEV-${String(last_id + 1).padStart(4, '0')}` 
        }));
      }
    } catch (err) {
      console.error('Erreur entreprise:', err);
    }
  };

  const handleLigneChange = (index, field, value) => {
    setLignes(prev => {
      const copy = [...prev];
      copy[index][field] = field === 'designation' 
        ? value 
        : parseFloat(value) || 0;
      return copy;
    });
  };
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
  const ajouterLigne = () => {
    setLignes(prev => [...prev, { 
      produit_id: null, 
      designation: '', 
      quantite: 1, 
      prix_unitaire_ht: 0, 
      taux_tva: 20, 
      remise_pourcentage: 0 
    }]);
  };

  const supprimerLigne = index => {
    setLignes(prev => prev.filter((_, i) => i !== index));
  };

  const envoyerDevis = async e => {
    e.preventDefault();
    if (!devisInfo.client_id) return alert('Sélectionnez un client');
    if (isFirstDevis && !devisInfo.numero) return alert('Numéro requis pour premier devis');
    
    const payload = {
      ...devisInfo,
      lignes: lignes.map(l => ({
        produit_id: null,
        designation: l.designation,
        quantite: l.quantite,
        prix_unitaire_ht: l.prix_unitaire_ht,
        taux_tva: l.taux_tva,
        remise_pourcentage: l.remise_pourcentage
      })),
      total_ht: totalHT,
      total_tva: totalTVA,
      total_ttc: totalTTC
    };
    
    try {
      const res = await fetch('http://localhost:8000/api/devis', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Accept': 'application/json', 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) {
        const err = await res.json();
        console.error('Erreur API:', err);
        return alert('Erreur: ' + (err.message || 'Échec de création'));
      }
      
      alert('Devis créé avec succès !');
      // Réinitialisation
      setDevisInfo({ 
        numero: '', 
        date_devis: new Date().toISOString().split('T')[0], 
        client_id: null, 
        etat: 'brouillon', 
        objet: 'Devis pour prestations de services', 
        note: '' 
      });
      
      setLignes([{ 
        produit_id: null, 
        designation: '', 
        quantite: 1, 
        prix_unitaire_ht: 0, 
        taux_tva: 20, 
        remise_pourcentage: 0 
      }]);
      
      setIsFirstDevis(false);
    } catch (err) {
      console.error('Erreur réseau:', err);
      alert('Problème de connexion au serveur');
    }
  };

  // Calcul du montant TTC par ligne
  const calculerTotalLigne = (ligne) => {
    const montantHT = ligne.quantite * ligne.prix_unitaire_ht * (1 - ligne.remise_pourcentage / 100);
    const tva = montantHT * (ligne.taux_tva / 100);
    return (montantHT + tva).toFixed(2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50  py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Nouveau Devis (Modèle Personnalisé)
              </h1>
              <p className="mt-1 text-blue-100">Saisie manuelle complète avec mise en forme</p>
            </div>
            <button 
              onClick={() => navigate('/gestionnaire/devis/nouvel')}
              className="text-blue-100 hover:text-white flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Retour
            </button>
          </div>
        </div>
</div>
        <form onSubmit={envoyerDevis} className="p-6">
          {/* Section En-tête */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Numéro</label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                value={devisInfo.numero}
                onChange={(e) => setDevisInfo({ ...devisInfo, numero: e.target.value })}
                readOnly={!isFirstDevis}
                placeholder={isFirstDevis ? "DEV-0001" : "Numéro généré automatiquement"}
                required
              />
              {isFirstDevis && (
                <p className="mt-1 text-xs text-gray-500">Saisissez le numéro du premier devis</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date du devis</label>
              <input
                type="date"
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                value={devisInfo.date_devis}
                onChange={(e) => setDevisInfo({ ...devisInfo, date_devis: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                value={devisInfo.client_id || ''}
                onChange={(e) => setDevisInfo({ ...devisInfo, client_id: parseInt(e.target.value, 10) })}
                required
              >
                <option value="">Sélectionnez un client</option>
                {clients.map(c => (
                  <option key={c.id_client} value={c.id_client}>
                    {c.nom}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Etat</label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                value={devisInfo.etat}
                onChange={(e) => setDevisInfo({ ...devisInfo, etat: e.target.value })}
                required
              >
                <option value="brouillon">Brouillon</option>
                <option value="Envoyé">Envoyé</option>
                <option value="signé">signé</option>
                <option value="refusé">refusé</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Objet du devis</label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                value={devisInfo.objet}
                onChange={(e) => setDevisInfo({ ...devisInfo, objet: e.target.value })}
                placeholder="Ex: Devis pour développement d'application"
                required
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                value={devisInfo.note}
                onChange={(e) => setDevisInfo({ ...devisInfo, note: e.target.value })}
                rows="2"
                placeholder="Informations complémentaires..."
              ></textarea>
            </div>
          </div>

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
                <tbody className="bg-white divide-y divide-gray-200">
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
                          value={ligne.prix_unitaire_ht}
                          onChange={(e) => handleLigneChange(index, 'prix_unitaire_ht', e.target.value)}
                        />
                      </td>
                      
                      <td className="px-6 py-4">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          className="w-20 border border-gray-300 rounded-md p-2"
                          value={ligne.remise_pourcentage}
                          onChange={(e) => handleLigneChange(index, 'remise_pourcentage', e.target.value)}
                        />
                      </td>
                      
                      <td className="px-6 py-4">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          className="w-20 border border-gray-300 rounded-md p-2"
                          value={ligne.taux_tva}
                          onChange={(e) => handleLigneChange(index, 'taux_tva', e.target.value)}
                        />
                      </td>
                      
                      <td className="px-6 py-4 font-medium">
                        {calculerTotalLigne(ligne)} DH
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
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
              </svg>
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
                  <p className="text-xl font-bold">Total TTC: <span className="text-blue-600">{totalTTC.toFixed(2)} DH</span></p>
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
                  Enregistrer le devis
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    // </div>
  );
}