import React, { useState } from 'react';

export default function ConfigSMTP() {
  const [smtp, setSmtp] = useState({
    smtp_host: '',
    smtp_port: '',
    smtp_user: '',
    smtp_password: '',
    smtp_encryption: 'tls'
  });

  const handleChange = (e) => {
    setSmtp({ ...smtp, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/entreprise/config-smtp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
        },
        body: JSON.stringify(smtp),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Erreur API :', data);
        throw new Error(data.message || 'Erreur HTTP');
      }

      alert('✅ Configuration SMTP enregistrée');
    } catch (error) {
      console.error('Erreur JS :', error);
      alert('❌ Échec : ' + error.message);
    }
  };

  const envoyerEmailTest = async () => {
    const email = prompt("Entrez l'adresse email du client");
    const nom = prompt("Entrez le nom du client");

    try {
      const response = await fetch('http://localhost:8000/api/entreprise/envoyer-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionStorage.getItem('token')}`
        },
        body: JSON.stringify({ email, nom })
      });
      const data = await response.json();

      if (!response.ok) {
        console.error('Erreur pour envois :', data);
        throw new Error('Erreur HTTP');
      }
      alert('Email envoyé avec succès !');
    } catch (error) {
      console.error(error);
      alert("Erreur lors de l'envoi de l'email.");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Configuration SMTP</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Serveur SMTP</label>
          <input
            type="text"
            name="smtp_host"
            placeholder="smtp.gmail.com"
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Port SMTP</label>
          <input
            type="text"
            name="smtp_port"
            placeholder="587"
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            name="smtp_user"
            placeholder="votre.email@gmail.com"
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
          <input
            type="password"
            name="smtp_password"
            placeholder="mot de passe d'application"
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Chiffrement</label>
          <select 
            name="smtp_encryption" 
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="tls">TLS</option>
            <option value="ssl">SSL</option>
          </select>
        </div>
      </div>

      <div className="mt-6 flex space-x-4">
        <button 
          onClick={handleSubmit}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center"
        >
          <span className="mr-2">💾</span> Enregistrer
        </button>
        <button 
          onClick={envoyerEmailTest}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center"
        >
          <span className="mr-2">📤</span> Envoyer email test
        </button>
      </div>
    </div>
  );
}
