import React, { useState } from "react";
import { useLocation } from 'react-router-dom';
import { FetchError } from "./utils/fetchError"; // Assurez-vous que le chemin est correct
import './FormulaireEntreprise.css'; // si tu veux styliser
import { useNavigate } from "react-router-dom"; // pour redirection
export default function FormulaireEntreprise() {
  const location = useLocation();
const utilisateurId = location.state?.utilisateur_id;
    const navigate = useNavigate(); // hook de navigation
  const [entrepriseData, setEntrepriseData] = useState({
    matricule_fiscale: "",
    identifiant_unique: "",
    nom: "",
    raison_sociale: "",
    adresse: "",
    zone_geographique: "",
    type_entreprise: "PME", // valeur par défaut
    email: "",
    logo_url: null,
    signature_url: null, // nouveau champ pour la signature
    entete_facture: null,
    pied_facture: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEntrepriseData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setEntrepriseData(prev => ({
      ...prev,
      [name]: files[0] || null, // premier fichier ou null si rien
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
  const token = sessionStorage.getItem('token');
  console.log("Token récupéré :", token);
  const formData = new FormData();
  formData.append('matricule_fiscale', entrepriseData.matricule_fiscale);
  formData.append('identifiant_unique', entrepriseData.identifiant_unique);
  formData.append('nom', entrepriseData.nom);
  formData.append('raison_sociale', entrepriseData.raison_sociale);
  formData.append('adresse', entrepriseData.adresse);
  formData.append('zone_geographique', entrepriseData.zone_geographique);
  formData.append('type_entreprise', entrepriseData.type_entreprise);
  formData.append('email', entrepriseData.email);

  if (entrepriseData.logo_url) {
    formData.append('logo_url', entrepriseData.logo_url);
  }
  if (entrepriseData.signature_url) {
    formData.append('signature_url', entrepriseData.signature_url); 
  }
  if (entrepriseData.entete_facture) {
    formData.append('entete_facture', entrepriseData.entete_facture);
  }
  if (entrepriseData.pied_facture) {
    formData.append('pied_facture', entrepriseData.pied_facture);
  }

  if (utilisateurId) {
    formData.append('utilisateur_id', utilisateurId);
  } else {
    alert('Erreur: utilisateur_id manquant');
    return;
  }

  const response = await fetch("http://127.0.0.1:8000/api/entreprise", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      'Accept': 'application/json',
      // Ne PAS mettre Content-Type ici
    },
    credentials: "include",
    body: formData,
  });

  // Vérifie si la réponse est ok (status 200-299)
  if (!response.ok) {
    const errorData = await response.json();
    throw new FetchError(
      errorData.message || 'Erreur serveur',
      response.status,
       errorData,
    );
  }

  const result = await response.json();
  console.log("Entreprise enregistrée :", result);

  navigate('/login');

} catch (error) {
  console.error("Erreur complète :", error);

  if (error.status) {
    const message =
      error.data?.message ||
      Object.values(error.data?.errors || {}).flat().join('\n') ||
      `Erreur ${error.status} : ${error.statusText}`;
    alert("Erreur :\n" + message);
  } else {
    alert("Erreur réseau ou serveur : " + (error.message || "Erreur inconnue"));
  }
}

  };

  return (
    <div className="entreprise-form-container bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
      <h2>Informations sur l'entreprise</h2>
      <form onSubmit={handleSubmit} className="entreprise-form" encType="multipart/form-data">
        <input type="text" name="matricule_fiscale" placeholder="Matricule fiscale" onChange={handleChange} value={entrepriseData.matricule_fiscale} />
        <input type="text" name="identifiant_unique" placeholder="Identifiant unique" onChange={handleChange} value={entrepriseData.identifiant_unique} />
        <input type="text" name="nom" placeholder="Nom de l'entreprise" onChange={handleChange} value={entrepriseData.nom} />
        <input type="text" name="raison_sociale" placeholder="Raison sociale" onChange={handleChange} value={entrepriseData.raison_sociale} />
        <textarea name="adresse" placeholder="Adresse" onChange={handleChange} value={entrepriseData.adresse}></textarea>
        <input type="text" name="zone_geographique" placeholder="Zone géographique" onChange={handleChange} value={entrepriseData.zone_geographique} />

        <select name="type_entreprise" onChange={handleChange} value={entrepriseData.type_entreprise}>
          <option value="PME">PME</option>
          <option value="ETI">ETI</option>
          <option value="Grand compte">Grand compte</option>
        </select>

        <input type="email" name="email" placeholder="Email" onChange={handleChange} value={entrepriseData.email} />

        <label htmlFor="logo_url">Logo de l'entreprise :</label>
        <input
          type="file"
          name="logo_url"
          onChange={handleFileChange}
          accept="image/*"
        />
        <label htmlFor="logo_url">signature de l'entreprise :</label>
        <input
          type="file"
          name="signature_url"
          onChange={handleFileChange}
          accept="image/*"
        />

        <label htmlFor="entete_facture">En-tête de facture :</label>
        <input
          type="file"
          name="entete_facture"
          onChange={handleFileChange}
          accept=".txt,.html,.pdf,image/*"
        />

        <label htmlFor="pied_facture">Pied de facture :</label>
        <input
          type="file"
          name="pied_facture"
          onChange={handleFileChange}
          accept=".txt,.html,.pdf,image/*"
        />

        <button type="submit" className="btn-save">Enregistrer</button>
      </form>
    </div>
  );
}
