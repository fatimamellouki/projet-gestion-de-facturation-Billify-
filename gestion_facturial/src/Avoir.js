import React, { useEffect, useState } from "react";
import "./Avoir.css";

export default function Avoir() {
  const [avoirs, setAvoirs] = useState([]);
  const token = sessionStorage.getItem("token");

  useEffect(() => {
  const fetchAvoirs = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/avoirs', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!res.ok) throw new Error('Failed to fetch');
      
      const data = await res.json();
      setAvoirs(data.data);
      
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };

  fetchAvoirs();
}, [token]);

  return (
    <div className="avoir-container bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
      <h2>Liste des Avoirs</h2>
      
      {avoirs.length === 0 ? (
        <p>Aucun avoir trouvé</p>
      ) : (
        <table className="avoir-table">
          <thead>
            <tr>
              <th>Numéro</th>
              <th>Date</th>
              <th>Motif</th>
              <th>Montant</th>
              <th>Facture</th>
            </tr>
          </thead>
          <tbody>
            {avoirs.map(avoir => (
              <tr key={avoir.id_avoir}>
                <td>{avoir.numero}</td>
                <td>{new Date(avoir.date_emission).toLocaleDateString()}</td>
                <td>{avoir.motif}</td>
                <td>{avoir.total_tcc} DH</td>
                <td>{avoir.id_facture}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}