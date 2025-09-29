import React, { useEffect, useState } from 'react';

export default function InvoiceForm() {
  const token = sessionStorage.getItem("token");
  const [factureInfo, setFactureInfo] = useState({
    numero: '',
    date_emission: '',
    date_echeance: '',
    id_client: '',
    id_entreprise: '',
    statut: 'brouillon'
  });

  const [Clients, setClients] = useState([]);
  const [produits, setProduits] = useState([]);
  const [lignes, setLignes] = useState([
    { id_produit: '', designation: '', quantite: 1, prixUnitaire: 0, tva: 20, remise: 0, montant_total_ttc: 0 }
  ]);
  const [isFirstFacture, setIsFirstFacture] = useState(false);
  
  // État pour le paiement
  const [moyenPaiement, setMoyenPaiement] = useState('');
  const [datePaiement, setDatePaiement] = useState('');
  const [montantPaiement, setMontantPaiement] = useState('');

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

  useEffect(() => {
    fetchProduits();
    fetchEntreprise();
  }, [token]);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/utilisateurs/clients", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setClients(data);
      } catch (err) {
        console.error("Erreur lors du chargement des clients :", err);
      }
    };

    fetchClients();
  }, [token]);

  const fetchProduits = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/produits", {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json"
        },
      });
      const data = await res.json();
      setProduits(data.produits ?? data);
    } catch (err) {
      console.error("Erreur chargement produits :", err);
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

  const handleChange = (index, field, value) => {
    const updated = [...lignes];
    if (field === 'id_produit') {
      const produit = produits.find(p => p.id_produit === parseInt(value));
      if (produit) {
        updated[index] = {
          ...updated[index],
          id_produit: value,
          designation: produit.nom,
          prixUnitaire: parseFloat(produit.prix_unitaire_ht),
          tva: parseFloat(produit.taux_tva),
        };
      }
    } else {
      updated[index][field] = value === '' ? 0 : parseFloat(value);
    }
    setLignes(updated);
  };

  const ajouterLigne = () => {
    setLignes([...lignes, {
      id_produit: '', designation: '', quantite: 1,
      prixUnitaire: 0, tva: 20, remise: 0, montant_total_ttc: 0
    }]);
  };

  const supprimerLigne = (index) => {
    setLignes(lignes.filter((_, i) => i !== index));
  };

  const totalHT = lignes.reduce((acc, l) => acc + (l.quantite * l.prixUnitaire * (1 - l.remise / 100)), 0);
  const totalTVA = lignes.reduce((acc, l) => acc + ((l.quantite * l.prixUnitaire * (1 - l.remise / 100)) * l.tva / 100), 0);
  const totalTTC = totalHT + totalTVA;

 const telechargerFacture = async (factureId) => {
  try {
    const response = await fetch(`http://127.0.0.1:8000/api/factures/${factureId}/telecharger`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/pdf',
      },
    });

    if (!response.ok) {
      throw new Error('Erreur lors du téléchargement');
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
  } catch (error) {
    console.error('Erreur de téléchargement:', error);
  }
};


  const handleSubmit = async (e) => {
    e.preventDefault();

    const lignesPayload = lignes.map(l => {
      const prixLigne = l.quantite * l.prixUnitaire;
      const remise = prixLigne * (l.remise || 0) / 100;
      const htAvecRemise = prixLigne - remise;
      const tva = htAvecRemise * (l.tva || 0) / 100;
      const montant_total_ttc = htAvecRemise + tva;

      return {
        id_produit: l.id_produit,
        designation: l.designation,
        quantite: l.quantite,
        prixUnitaire: l.prixUnitaire,
        tva: l.tva,
        remise: l.remise,
        montant_total_ttc
      };
    });

    const payload = {
      ...factureInfo,
      lignes: lignesPayload,
      total_ht: totalHT,
      total_tva: totalTVA,
      total_ttc: totalTTC
    };
        console.log("les info de payload",payload);

    try {
      // Enregistrement de la facture
      const res = await fetch('http://127.0.0.1:8000/api/factures', {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        alert("❌ Erreur lors de l'enregistrement");
        console.error(data);
        return;
      }

      // Si la facture est payée, enregistrer le paiement
      if (factureInfo.statut === 'payee') {
        const paiementPayload = {
          date_paiement: datePaiement || new Date().toISOString(),
          montant: montantPaiement || totalTTC,
          moyen: moyenPaiement,
          id_facture: data.facture.id_facture
        };

        const resPaiement = await fetch('http://127.0.0.1:8000/api/paiements', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(paiementPayload),
        });

        if (!resPaiement.ok) {
          throw new Error("Erreur lors de l'enregistrement du paiement");
        }
      }

      alert("✅ Facture enregistrée avec succès !");
      telechargerFacture(data.facture.id_facture);
    } catch (err) {
      console.error("Erreur réseau ou serveur :", err);
      alert(`❌ Erreur: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screenbg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
          <h1 className="text-3xl font-bold flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Nouvelle Facture
          </h1>
          <p className="mt-1 text-blue-100">Créez et gérez vos factures en toute simplicité</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Numéro</label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                value={factureInfo.numero}
                onChange={(e) => setFactureInfo({ ...factureInfo, numero: e.target.value })}
                readOnly={!isFirstFacture}
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
                {Clients.map(c => (
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
          </div>

          {/* Section Paiement - visible seulement si statut = payée */}
          {factureInfo.statut === 'payee' && (
            <div className="bg-blue-50 rounded-lg p-6 mb-8 border border-blue-200">
              <h3 className="text-xl font-semibold text-blue-800 mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                  <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                </svg>
                Informations de Paiement
              </h3>
              
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
                    placeholder={totalTTC.toFixed(2)}
                    required
                  />
                </div>
              </div>
            </div>
          )}

          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
              </svg>
              Articles
            </h3>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Désignation</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qté</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix HT</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remise %</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TVA %</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total TTC</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {lignes.map((ligne, index) => {
                    const prixLigne = ligne.quantite * ligne.prixUnitaire;
                    const remise = prixLigne * (ligne.remise || 0) / 100;
                    const htAvecRemise = prixLigne - remise;
                    const tvaMontant = htAvecRemise * (ligne.tva || 0) / 100;
                    const totalLigneTTC = htAvecRemise + tvaMontant;

                    return (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            className="w-full px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            value={ligne.id_produit}
                            onChange={(e) => handleChange(index, 'id_produit', e.target.value)}
                          >
                            <option value="">Choisir produit</option>
                            {produits.map(p => (
                              <option key={p.id_produit} value={p.id_produit}>
                                {p.nom} - {p.prix_unitaire_ht} DH - TVA {p.taux_tva}%
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input 
                            type="number" 
                            min="1" 
                            className="w-20 px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            value={ligne.quantite} 
                            onChange={(e) => handleChange(index, 'quantite', e.target.value)} 
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input 
                            type="number" 
                            step="0.01" 
                            className="w-24 px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                            value={ligne.prixUnitaire} 
                            readOnly 
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input 
                            type="number" 
                            className="w-20 px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            value={ligne.remise} 
                            onChange={(e) => handleChange(index, 'remise', e.target.value)} 
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input 
                            type="number" 
                            className="w-20 px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                            value={ligne.tva} 
                            readOnly 
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-medium">
                          {totalLigneTTC.toFixed(2)} DH
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button 
                            type="button" 
                            onClick={() => supprimerLigne(index)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
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

          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <div className="flex justify-end mb-4">
              <div className="text-right">
                <p className="text-gray-600">Total HT: <span className="font-semibold text-lg">{totalHT.toFixed(2)} DH</span></p>
                <p className="text-gray-600">Total TVA: <span className="font-semibold text-lg">{totalTVA.toFixed(2)} DH</span></p>
                <p className="text-xl font-bold mt-2">Total TTC: <span className="text-blue-600">{totalTTC.toFixed(2)} DH</span></p>
              </div>
            </div>

            <div className="flex justify-end">
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
        </form>
      </div>
    </div>
  );
}