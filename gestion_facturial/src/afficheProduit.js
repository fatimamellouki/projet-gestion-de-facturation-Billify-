import React, { useEffect, useState } from 'react';
import './AfficheProduit.css';

function AfficheProduit() {
  const [produits, setProduits] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategorieId, setSelectedCategorieId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const token = sessionStorage.getItem('token');

  // Charger les produits
  useEffect(() => {
    fetch('http://localhost:8000/api/produits', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    })
      .then(async res => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Erreur HTTP ${res.status} : ${text.substring(0, 100)}...`);
        }
        return res.json();
      })
      .then(data => {
        setProduits(data);
      })
      .catch(err => {
        console.error('Erreur lors de la récupération des produits :', err);
      });
  }, [token]);

  // Charger les catégories
  useEffect(() => {
    fetch("http://localhost:8000/api/categories", {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    })
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error("Erreur chargement catégories", err));
  }, []);

  // Filtrage des produits par catégorie et recherche
  const produitsFiltres = produits.filter((p) => {
    const matchCategorie = selectedCategorieId ? p.categorie_id === selectedCategorieId : true;
    const matchSearch = p.nom.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategorie && matchSearch;
  });

  return (
    <div className="affiche-container bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
      <h1>Liste des Produits</h1>

      {/* Barre de recherche */}
      <input
        type="text"
        placeholder="Rechercher un produit..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-bar"
      />

      {/* Boutons filtres par catégorie */}
      <div className="categorie-buttons">
        <button
          onClick={() => setSelectedCategorieId(null)}
          className={selectedCategorieId === null ? "active" : ""}
        >
          Tous
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id_categorie}
            onClick={() => setSelectedCategorieId(cat.id_categorie)}
            className={selectedCategorieId === cat.id_categorie ? "active" : ""}
          >
            {cat.nom}
          </button>
        ))}
      </div>

      {/* Affichage des produits */}
      <div className="card-body">
        {produitsFiltres.length === 0 ? (
          <p>Aucun produit trouvé.</p>
        ) : (
          <div className="product-grid">
            {produitsFiltres.map((produit) => (
              <div key={produit.id_produit} className="product-card">
                {produit.image_url ? (
                  <img
                    src={`http://127.0.0.1:8000/storage/${produit.image_url}`}
                    alt={produit.nom}
                    className="product-image"
                  />
                ) : (
                  <div className="no-image">Pas d'image</div>
                )}
                <h3>{produit.nom}</h3>
                <p>{produit.description}</p>
                <p><strong>{produit.prix_unitaire_ht} € HT</strong></p>
                <p>TVA: {produit.taux_tva} %</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AfficheProduit;
