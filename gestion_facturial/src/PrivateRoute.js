// src/PrivateRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

export default function PrivateRoute({ children, allowedRoles }) {
  const token = sessionStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token) {
    // Pas connecté : redirige vers la page de login
    return <Navigate to="/" />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // Connecté mais rôle non autorisé : redirige vers page 403
    return <Navigate to="/forbidden" />;
  }

  // Tout est ok : affiche le composant enfant
  return children;
}
