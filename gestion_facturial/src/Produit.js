import React, { useEffect, useState } from "react";
import { FaPlus, FaEdit, FaTrash, FaSearch, FaBox, FaTags, FaTimes, FaSave } from "react-icons/fa";
import './Produit.css';

export default function Produit() {
  const token = sessionStorage.getItem('token');
  const [produits, setProduits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [editingProduitId, setEditingProduitId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [entrepriseId, setEntrepriseId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [showProduitForm, setShowProduitForm] = useState(false);
  const [showCategorieForm, setShowCategorieForm] = useState(false);

  const [formProduit, setFormProduit] = useState({
    reference: "",
    nom: "",
    description: "",
    prix_unitaire_ht: "",
    taux_tva: "",
    categorie_id: "",
    image_file: null
  });

  useEffect(() => {
    if (!token) return;
    fetch("http://127.0.0.1:8000/api/entreprise/info", {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Accept": "application/json"
      },
      credentials: 'include',
    })
      .then(res => res.json())
      .then(data => {
        const id = data.entreprise.id_entreprise;
        setEntrepriseId(id);
      });
  }, [token]);

  const loadProduits = () => {
    setLoading(true);
    fetch('http://127.0.0.1:8000/api/produits', {
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
        setLoading(false);
      })
      .catch(err => {
        setErrorMsg("Erreur de chargement : " + err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/api/categories", {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setCategories(data);
      } catch (err) {
        console.error("Error fetching categories:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [token]);

  useEffect(() => {
    if (entrepriseId) loadProduits();
  }, [entrepriseId]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image_file") {
      setFormProduit(prev => ({ ...prev, image_file: files[0] }));
    } else {
      setFormProduit(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!entrepriseId) {
      alert("Entreprise non chargée !");
      return;
    }

    const formData = new FormData();
    formData.append('reference', formProduit.reference);
    formData.append('nom', formProduit.nom);
    formData.append('description', formProduit.description);
    formData.append('prix_unitaire_ht', formProduit.prix_unitaire_ht);
    formData.append('taux_tva', formProduit.taux_tva);
    formData.append('entreprise_id', entrepriseId);
    formData.append('categorie_id', formProduit.categorie_id);

    if (formProduit.image_file) {
      formData.append('image_url', formProduit.image_file);
    }

    const url = editingProduitId
      ? `http://127.0.0.1:8000/api/produits/${editingProduitId}?_method=PUT`
      : `http://127.0.0.1:8000/api/produits`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de l'enregistrement");
      }

      setFormProduit({
        reference: "",
        nom: "",
        description: "",
        prix_unitaire_ht: "",
        taux_tva: "",
        categorie_id: "",
        image_file: null
      });
      setEditingProduitId(null);
      setShowProduitForm(false);
      loadProduits();

    } catch (err) {
      alert("Erreur : " + err.message);
    }
  };

  const handleEdit = (produit) => {
    setEditingProduitId(produit.id_produit);
    setFormProduit({
      reference: produit.reference,
      nom: produit.nom,
      description: produit.description,
      prix_unitaire_ht: produit.prix_unitaire_ht,
      taux_tva: produit.taux_tva,
      categorie_id: produit.categorie_id,
      image_file: null,
    });
    setShowProduitForm(true);
    setShowCategorieForm(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Confirmer la suppression ?")) return;

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/produits/${id}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error("Erreur lors de la suppression");
      loadProduits();

    } catch (err) {
      alert("Erreur : " + err.message);
    }
  };

  const cancelEdit = () => {
    setEditingProduitId(null);
    setShowProduitForm(false);
    setFormProduit({
      reference: "",
      nom: "",
      description: "",
      prix_unitaire_ht: "",
      taux_tva: "",
      categorie_id: "",
      image_file: null
    });
  };

  const toggleProduitForm = () => {
    setShowProduitForm(!showProduitForm);
    setShowCategorieForm(false);
    if (editingProduitId && !showProduitForm) {
      cancelEdit();
    }
  };

  const toggleCategorieForm = () => {
    setShowCategorieForm(!showCategorieForm);
    setShowProduitForm(false);
  };

  const filteredProduits = produits.filter(p =>
    p.nom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="produit-container bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
      <h1 className="page-title">
        <FaBox className="title-icon" /> Gestion des Produits
      </h1>

      <div className="search-bar">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Rechercher un produit..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="action-buttons">
        <button 
          onClick={toggleProduitForm} 
          className={`btn-action ${showProduitForm ? 'active' : ''}`}
        >
          <FaPlus /> {showProduitForm ? 'Fermer le formulaire' : 'Ajouter un produit'}
        </button>
        <button 
          onClick={toggleCategorieForm} 
          className={`btn-action ${showCategorieForm ? 'active' : ''}`}
        >
          <FaTags /> {showCategorieForm ? 'Fermer le formulaire' : 'Ajouter une catégorie'}
        </button>
      </div>

      {loading && <div className="loading-spinner"></div>}
      {errorMsg && <div className="error-message">{errorMsg}</div>}

      {showProduitForm && (
        <div className="form-container slide-in">
          <h2>
            <FaBox /> {editingProduitId ? "Modifier" : "Ajouter"} un produit
          </h2>
          <form onSubmit={handleSubmit} className="produit-form" encType="multipart/form-data">
            <div className="form-group">
              <label>Référence</label>
              <input type="text" name="reference" value={formProduit.reference} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Nom</label>
              <input type="text" name="nom" value={formProduit.nom} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea name="description" value={formProduit.description} onChange={handleChange} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Prix HT (€)</label>
                <input type="number" name="prix_unitaire_ht" value={formProduit.prix_unitaire_ht} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>TVA (%)</label>
                <input type="number" name="taux_tva" value={formProduit.taux_tva} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Catégorie</label>
                <select name="categorie_id" value={formProduit.categorie_id} onChange={handleChange} required>
                  <option value="">-- Sélectionner --</option>
                  {categories.map(cat => (
                    <option key={cat.id_categorie} value={cat.id_categorie}>
                      {cat.nom}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="image_input">Image</label>
              <div className="file-upload">
                  <input
                  type="file"
                  id="image_input"
                  name="image_file"
                  accept="image/*"
                  onChange={handleChange}
                    />
                    </div>

            </div>
            <div className="form-actions">
              <button type="submit" className="btn-submit">
                <FaEdit /> {editingProduitId ? "Mettre à jour" : "Enregistrer"}
              </button>
              {editingProduitId && (
                <button type="button" onClick={cancelEdit} className="btn-cancel">
                  Annuler
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {showCategorieForm && (
  <div className="form-container slide-in">
    <h2>
      <FaTags /> Ajouter une catégorie
    </h2>
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const form = e.target;
        const nomCategorie = form.categorie_nom.value.trim();
        
        if (!nomCategorie) {
          alert("Veuillez entrer un nom de catégorie");
          return;
        }

        try {
          // Show loading state
          form.querySelector('button[type="submit"]').disabled = true;
          
          // Add category
          const response = await fetch("http://127.0.0.1:8000/api/categories", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Accept": "application/json",
              "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({ nom: nomCategorie }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Erreur lors de l'ajout");
          }

          // Refresh categories list
          const updatedResponse = await fetch("http://127.0.0.1:8000/api/categories", {
            headers: {
              "Authorization": `Bearer ${token}`,
            }
          });
          
          if (!updatedResponse.ok) {
            throw new Error("Erreur lors de la récupération des catégories");
          }

          const data = await updatedResponse.json();
          setCategories(data);

          // Reset and close form
          form.reset();
          setShowCategorieForm(false);
          
          // Optional: Show success message
          alert("Catégorie ajoutée avec succès!");

        } catch (error) {
          console.error("Erreur:", error);
          alert(`Erreur: ${error.message}`);
        } finally {
          // Re-enable submit button
          if (form.querySelector('button[type="submit"]')) {
            form.querySelector('button[type="submit"]').disabled = false;
          }
        }
      }}
    >
      <div className="form-group">
        <label htmlFor="categorie_nom">Nom de la catégorie:</label>
        <input
          type="text"
          id="categorie_nom"
          name="categorie_nom"
          required
          maxLength={100}
          placeholder="Ex: Informatique"
        />
      </div>

      <div className="form-actions">
        <button type="submit" className="btn-primary">
          <FaSave /> Enregistrer
        </button>
        <button 
          type="button" 
          className="btn-secondary"
          onClick={() => setShowCategorieForm(false)}
        >
          <FaTimes /> Annuler
        </button>
      </div>
    </form>
  </div>
)}
      <div className="produit-table-container">
        <table className="produit-table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Réf</th>
              <th>Catégorie</th>
              <th>Prix HT</th>
              <th>TVA</th>
              <th>Image</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProduits.map((p) => (
              <tr key={p.id_produit}>
                <td>{p.nom}</td>
                <td>{p.reference}</td>
                <td>{categories.find(c => c.id_categorie === p.categorie_id)?.nom || 'N/A'}</td>
                <td>{p.prix_unitaire_ht} €</td>
                <td>{p.taux_tva} %</td>
                <td>
                  {p.image_url ? (
                    <img
                      src={`http://127.0.0.1:8000/storage/${p.image_url}`}
                      alt={p.nom}
                      className="produit-image"
                    />
                  ) : (
                    <span className="no-image">Pas d'image</span>
                  )}
                </td>
                <td className="actions">
                  <button onClick={() => handleEdit(p)} className="btn-edit">
                    <FaEdit />
                  </button>
                  <button onClick={() => handleDelete(p.id_produit)} className="btn-delete">
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}