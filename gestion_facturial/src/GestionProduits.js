import React, { useEffect, useState } from "react";
import axios from "axios";
// import './GestionProduits.css';

export default function GestionProduits() {
  const [produits, setProduits] = useState([]);
  const [formData, setFormData] = useState({
    nom: "",
    description: "",
    prix_unitaire_ht: "",
    taux_tva: "",
  });
  const [editingId, setEditingId] = useState(null);

  const token = localStorage.getItem("token");

  // Charger les produits
  const fetchProduits = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/produits", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProduits(res.data);
    } catch (error) {
      console.error("Erreur chargement produits :", error);
    }
  };

  useEffect(() => {
    fetchProduits();
  }, []);

  // Gérer les changements du formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Ajouter ou modifier un produit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`http://127.0.0.1:8000/api/produits/${editingId}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post("http://127.0.0.1:8000/api/produits", formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      fetchProduits();
      setFormData({ nom: "", description: "", prix_unitaire_ht: "", taux_tva: "" });
      setEditingId(null);
    } catch (error) {
      console.error("Erreur soumission :", error);
    }
  };

  // Modifier un produit
  const handleEdit = (produit) => {
    setEditingId(produit.id_produit);
    setFormData({
      nom: produit.nom,
      description: produit.description,
      prix_unitaire_ht: produit.prix_unitaire_ht,
      taux_tva: produit.taux_tva,
    });
  };

  // Supprimer un produit
  const handleDelete = async (id) => {
    if (window.confirm("Supprimer ce produit ?")) {
      try {
        await axios.delete(`http://127.0.0.1:8000/api/produits/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchProduits();
      } catch (error) {
        console.error("Erreur suppression :", error);
      }
    }
  };

  return (
    <div className="produits-container bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
      <h2>Gestion des Produits</h2>

      <form onSubmit={handleSubmit} className="produit-form">
        <input type="text" name="nom" placeholder="Nom du produit" value={formData.nom} onChange={handleChange} required />
        <input type="text" name="description" placeholder="Description" value={formData.description} onChange={handleChange} />
        <input type="number" step="0.01" name="prix_unitaire_ht" placeholder="Prix HT" value={formData.prix_unitaire_ht} onChange={handleChange} required />
        <input type="number" step="0.01" name="taux_tva" placeholder="TVA (%)" value={formData.taux_tva} onChange={handleChange} required />
        <button type="submit">{editingId ? "Modifier" : "Ajouter"}</button>
      </form>

      <table className="produits-table">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Description</th>
            <th>Prix HT</th>
            <th>TVA</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {produits.map((prod) => (
            <tr key={prod.id_produit}>
              <td>{prod.nom}</td>
              <td>{prod.description}</td>
              <td>{prod.prix_unitaire_ht} DH</td>
              <td>{prod.taux_tva} %</td>
              <td>
                <button onClick={() => handleEdit(prod)}>Modifier</button>
                <button onClick={() => handleDelete(prod.id_produit)}>Supprimer</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
