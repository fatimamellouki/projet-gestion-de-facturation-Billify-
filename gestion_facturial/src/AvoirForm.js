import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './avoirForm.css';

export default function AvoirForm() {
  const [factures, setFactures] = useState([]);
  const [formData, setFormData] = useState({
    numero: '',
    date_emission: '',
    motif: '',
    total_tcc: '',
    id_facture: '',
  });
  const [errorMsg, setErrorMsg] = useState('');
  const token = sessionStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:8000/api/factures', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setFactures(data.factures || []))
      .catch((err) => {
        console.error('Erreur lors du chargement des factures', err);
        setErrorMsg('Erreur lors du chargement des factures');
      });
  }, [token]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const res = await fetch('http://localhost:8000/api/avoirs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    });

    // Si la réponse n'est pas OK (statut 200-299)
    if (!res.ok) {
      const errorText = await res.text(); // Lis d'abord en texte pour éviter des erreurs JSON
      console.error("Erreur API :", errorText);
      throw new Error(`Erreur HTTP ${res.status}: ${errorText}`);
    }

    // Si tout va bien, parse en JSON
    const data = await res.json();
    navigate('/gestionnaire/avoirs'); // Redirige vers la liste des avoirs
    console.log('Avoir créé avec succès:', data);
  } catch (err) {
    console.error("Erreur complète :", err);
    setErrorMsg(err.message || "Erreur lors de la création de l'avoir");
  }
};

  return (
    <div className="avoir-form-container bg-gradient-to-br from-blue-50 to-indigo-50 ">
      <h2>Créer un Avoir</h2>
      {errorMsg && <p className="error">{errorMsg}</p>}
      <form onSubmit={handleSubmit} className="avoir-form">
        <label>
          Numéro :
          <input
            type="text"
            name="numero"
            value={formData.numero}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Date d’émission :
          <input
            type="date"
            name="date_emission"
            value={formData.date_emission}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Motif :
          <textarea
            name="motif"
            value={formData.motif}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Total TTC :
          <input
            type="number"
            step="0.01"
            name="total_tcc"
            value={formData.total_tcc}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Facture liée :
          <select
            name="id_facture"
            value={formData.id_facture}
            onChange={handleChange}
            required
          >
            <option value="">-- Choisir une facture --</option>
            {factures.map((facture) => (
              <option key={facture.id_facture} value={facture.id_facture}>
                Facture n°{facture.numero} - {facture.client?.nom}
              </option>
            ))}
          </select>
        </label>

        <button type="submit">Créer l’Avoir</button>
      </form>
    </div>
  );
}
