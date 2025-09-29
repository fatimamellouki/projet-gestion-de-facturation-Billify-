import React, { useEffect, useState, useRef } from 'react';

export default function DevisForm() {
  const token = sessionStorage.getItem("token");
  const [clients, setClients] = useState([]);
  const [produits, setProduits] = useState([]);
  const [date_devis, setDateDevis] = useState('');
  const [note, setNote] = useState('');
  const [clientId, setClientId] = useState('');
  const [lignes, setLignes] = useState([
    { produit_id: '', designation: '', quantite: 1, prix_unitaire_ht: 0, taux_tva: 20 },
  ]);
  
  // États pour la fonctionnalité de paiement
  const [etat, setEtat] = useState('brouillon');
// États pour le numéro de devis
  const [numeroDevis, setNumeroDevis] = useState('');
  const [isFirstDevis, setIsFirstDevis] = useState(false);
  const [entrepriseId, setEntrepriseId] = useState('');

  // Calcul des totaux
  const totalHT = lignes.reduce((acc, ligne) => 
    acc + (ligne.quantite * ligne.prix_unitaire_ht), 0);
  
  const totalTVA = lignes.reduce((acc, ligne) => 
    acc + (ligne.quantite * ligne.prix_unitaire_ht * ligne.taux_tva / 100), 0);
  
  const totalTTC = totalHT + totalTVA;

  useEffect(() => {
    fetch('http://localhost:8000/api/utilisateurs/clients', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => setClients(data))
      .catch(err => console.error("Erreur clients:", err));

    fetch('http://localhost:8000/api/produits', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => setProduits(data))
      .catch(err => console.error("Erreur produits:", err));

    // Récupérer l'ID de l'entreprise et vérifier si c'est le premier devis
    fetchEntrepriseInfo();
  }, [token]);

  const fetchEntrepriseInfo = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/entreprise/info', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      
      const entrepriseId = data?.entreprise?.id_entreprise;
      if (!entrepriseId) return;
      
      setEntrepriseId(entrepriseId);
      
      // Vérifier si c'est le premier devis
      const countRes = await fetch(`http://localhost:8000/api/entreprises/${entrepriseId}/devis/count`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const countData = await countRes.json();
      
      setIsFirstDevis(countData.count === 0);
      
      // Si ce n'est pas le premier devis, générer automatiquement le numéro
        const lastRes = await fetch(`http://localhost:8000/api/entreprises/${entrepriseId}/devis/last-id`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const lastData = await lastRes.json();
        const lastId = lastData.last_id || 0;
      
       if (countData.count === 0) {
      // Premier devis - pas de numéro automatique
      setNumeroDevis('');
    } else {
      // Numéro automatique incrémenté
      const nextId = lastId + 1;
      const numeroAuto = 'DEV-' + String(nextId).padStart(4, '0');
      setNumeroDevis(numeroAuto);
    }
    } catch (err) {
      console.error("Erreur chargement entreprise :", err);
    }
  };

  const handleLigneChange = (index, field, value) => {
    const updated = [...lignes];
    if (field === 'produit_id') {
      const produit = produits.find(p => p.id_produit === parseInt(value));
      if (produit) {
        updated[index] = {
          ...updated[index],
          produit_id: produit.id_produit,
          designation: produit.nom,
          prix_unitaire_ht: produit.prix_unitaire_ht,
          taux_tva: produit.taux_tva,
        };
      }
    } else {
      updated[index][field] = field === 'quantite' ? parseInt(value) : value;
    }
    setLignes(updated);
  };

  const ajouterLigne = () => {
    setLignes([...lignes, { produit_id: '', designation: '', quantite: 1, prix_unitaire_ht: 0, taux_tva: 20 }]);
  };

  const supprimerLigne = index => {
    const updated = [...lignes];
    updated.splice(index, 1);
    setLignes(updated);
  };

  const envoyerDevis = async () => {
    try {
      // Validation du numéro de devis pour le premier devis
      if (isFirstDevis && (!numeroDevis || !numeroDevis.startsWith('DEV-'))) {
      alert("Pour le premier devis, veuillez saisir un numéro valide commençant par 'DEV-' (ex: DEV-0001)");
      return;
    }

      const payload = {
        client_id: clientId,
        date_devis,
        note,
        etat,
        numero: numeroDevis,
        lignes
      };
      const response = await fetch("http://localhost:8000/api/devis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const contentType = response.headers.get("content-type");

      if (!response.ok) {
        if (contentType && contentType.includes("application/json")) {
          const err = await response.json();
          console.error("Erreur Laravel:", err);
        } else {
          const html = await response.text();
          console.error("Erreur HTML:", html);
        }
        alert("❌ Une erreur est survenue lors de la création du devis.");
        return;
      }

      const data = await response.json();
      alert("✔️ Devis créé avec succès !");
      console.log(data);

      // Reset
      setClientId('');
      setDateDevis('');
      setNote('');
      setEtat('brouillon');
      setLignes([
        { produit_id: '', designation: '', quantite: 1, prix_unitaire_ht: 0, taux_tva: 20 },
      ]);
      
      // Générer automatiquement le prochain numéro de devis
      if (isFirstDevis) {
        setIsFirstDevis(false);
        // setNumeroDevis('DEV-0002');
        const currentNum = parseInt(numeroDevis.split('-')[1]);
      const nextNum = 'DEV-' + String(currentNum + 1).padStart(4, '0');
      setNumeroDevis(nextNum);
      } else {
        // Incrémenter le numéro de devis
        const currentNum = parseInt(numeroDevis.split('-')[1]);
        const nextNum = 'DEV-' + String(currentNum + 1).padStart(4, '0');
        setNumeroDevis(nextNum);
      }
    } catch (error) {
      console.log("Erreur réseau :", error);
      alert("❌ Problème de connexion.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h1 className="text-2xl font-bold">Créer un nouveau devis</h1>
          </div>
          <p className="mt-1 text-blue-100">Remplissez les détails ci-dessous pour créer un devis</p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Numéro de devis {isFirstDevis && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              value={numeroDevis}
              onChange={(e) => setNumeroDevis(e.target.value)}
              readOnly={!isFirstDevis}
              placeholder={isFirstDevis ? "DEV-0001" : "Numéro généré automatiquement"}
              required
            />
            {isFirstDevis && (
              <p className="mt-1 text-xs text-gray-500">
                Saisissez le numéro du premier devis au format "DEV-0001"
              </p>
            )}
          </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
              <select 
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                value={clientId} 
                onChange={e => setClientId(e.target.value)}
              >
                <option value="">-- Choisir un client --</option>
                {clients.map(c => (
                  <option key={c.id_client} value={c.id_client}>{c.nom}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date du devis</label>
              <input 
                type="date" 
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                value={date_devis} 
                onChange={e => setDateDevis(e.target.value)} 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Etat</label>
              <select 
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                value={etat} 
                onChange={e => setEtat(e.target.value)}
              >
                <option value="brouillon">Brouillon</option>
                <option value="envoye">Envoyé</option>
                <option value="signé">signé</option>
                <option value="refusé">refusé</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
              <textarea 
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                value={note} 
                onChange={e => setNote(e.target.value)}
                rows="2"
              ></textarea>
            </div>
          </div>
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
              </svg>
              Lignes du devis
            </h3>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produit</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantité</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix HT</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TVA %</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total TTC</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {lignes.map((ligne, i) => {
                    const montantLigneHT = ligne.quantite * ligne.prix_unitaire_ht;
                    const montantLigneTVA = montantLigneHT * (ligne.taux_tva / 100);
                    const montantLigneTTC = montantLigneHT + montantLigneTVA;
                    
                    return (
                      <tr key={i}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            className="w-full px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            value={ligne.produit_id}
                            onChange={e => handleLigneChange(i, 'produit_id', e.target.value)}
                          >
                            <option value="">-- Produit --</option>
                            {produits.map(p => (
                              <option key={p.id_produit} value={p.id_produit}>{p.nom}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input 
                            type="number" 
                            min="1" 
                            className="w-20 px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            value={ligne.quantite} 
                            onChange={e => handleLigneChange(i, 'quantite', e.target.value)} 
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input 
                            type="number" 
                            className="w-24 px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                            value={ligne.prix_unitaire_ht} 
                            readOnly 
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input 
                            type="number" 
                            className="w-20 px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                            value={ligne.taux_tva} 
                            readOnly 
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-medium">
                          {montantLigneTTC.toFixed(2)} DH
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button 
                            onClick={() => supprimerLigne(i)}
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <p className="text-sm text-gray-500">Total HT</p>
                <p className="text-xl font-bold">{totalHT.toFixed(2)} DH</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <p className="text-sm text-gray-500">Total TVA</p>
                <p className="text-xl font-bold">{totalTVA.toFixed(2)} DH</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <p className="text-sm text-gray-500">Total TTC</p>
                <p className="text-xl font-bold text-blue-600">{totalTTC.toFixed(2)} DH</p>
              </div>
            </div>

            <div className="flex justify-end">
              <button 
                onClick={envoyerDevis}
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
      </div>
    </div>
  );
}