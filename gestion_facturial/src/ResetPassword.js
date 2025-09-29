import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import './AuthForms.css';

const ResetPassword = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token");
  const email = params.get("email");

  const [password, setPassword] = useState('');
  const [password_confirmation, setPasswordConfirmation] = useState('');
  const [message, setMessage] = useState('');

  const handleReset = async (e) => {
    e.preventDefault();

    const response = await fetch('http://localhost:8000/api/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, email, password, password_confirmation }),
    });

    const data = await response.json();

    if (response.ok) {
      setMessage('Mot de passe réinitialisé avec succès.');
      setTimeout(() => navigate('/login'), 2000);
    } else {
      setMessage(data.message || 'Erreur lors de la réinitialisation.');
    }
  };

  return (
    <div className='container_auth bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800'>
    <div className="auth-form-container">
      <h2>🔒 Réinitialiser le mot de passe</h2>
      <form onSubmit={handleReset}>
        <input
          type="password"
          placeholder="Nouveau mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Confirmer le mot de passe"
          value={password_confirmation}
          onChange={(e) => setPasswordConfirmation(e.target.value)}
          required
        />
        <button type="submit">Réinitialiser</button>
        {message && <p>{message}</p>}
      </form>
    </div>
    </div>
  );
};

export default ResetPassword;
