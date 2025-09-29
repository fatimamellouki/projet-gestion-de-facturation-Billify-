import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FetchError } from "./utils/fetchError";
import { FaUserPlus, FaCheck, FaTimes } from 'react-icons/fa';

export default function Inscription() {
  const navigate = useNavigate();
  const location = useLocation();
  const [entreprises, setEntreprises] = useState([]);
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    uppercase: false,
    number: false,
    specialChar: false
  });
  const [accesAutorise, setAccesAutorise] = useState(false);
  const [loading, setLoading] = useState(true);
  const [allValid, setAllValid] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    email: '',
    role: '',
    telephone: '',
    address: '',
    login: '',
    passwordLogin: '',
    confirmPasswordLogin: '',
    entreprise_id: '',
  });

  // Vérification de la clé d'accès
  useEffect(() => {
    const verifyAccessKey = async () => {
      const params = new URLSearchParams(location.search);
      const key = params.get("key");

      if (!key) {
        alert("Accès non autorisé : clé manquante !");
        navigate("/");
        return;
      }

      try {
        const response = await fetch(`http://127.0.0.1:8000/api/inscription_secure_programer?key=${key}`, {
          method: "GET",
          credentials: "include"
        });

        if (!response.ok) {
          throw new Error("Accès refusé");
        }

        setAccesAutorise(true);
      } catch (error) {
        console.error("Erreur de vérification :", error);
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    verifyAccessKey();
  }, [location, navigate]);

  // Chargement des entreprises selon le rôle
  useEffect(() => {
    if (formData.role && formData.role !== 'admin') {
      const fetchEntreprises = async () => {
        try {
          const response = await fetch('http://127.0.0.1:8000/api/entreprises', {
            method: 'GET',
            credentials: 'include',
          });

          if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
          }

          const data = await response.json();
          setEntreprises(data);
        } catch (err) {
          console.error('Erreur chargement entreprises:', err);
        }
      };

      fetchEntreprises();
    } else {
      setEntreprises([]);
      setFormData(prev => ({ ...prev, entreprise_id: '' }));
    }
  }, [formData.role]);

  // Validation du mot de passe en temps réel
  useEffect(() => {
    const validations = {
      length: formData.passwordLogin.length >= 8,
      uppercase: /[A-Z]/.test(formData.passwordLogin),
      number: /\d/.test(formData.passwordLogin),
      specialChar: /[\W_]/.test(formData.passwordLogin)
    };

    setPasswordValidation(validations);
    setAllValid(Object.values(validations).every(Boolean));
  }, [formData.passwordLogin]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes("password") ? value : value.trimStart()
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation des mots de passe
    if (formData.passwordLogin !== formData.confirmPasswordLogin) {
      alert("Les mots de passe ne correspondent pas.");
      return;
    }

    if (!allValid) {
      alert(
        "Le mot de passe doit contenir au moins :\n" +
        "- 8 caractères\n" +
        "- 1 majuscule\n" +
        "- 1 chiffre\n" +
        "- 1 caractère spécial"
      );
      return;
    }

    try {
      const { confirmPasswordLogin, ...dataToSend } = formData;

      const response = await fetch('http://127.0.0.1:8000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new FetchError(
          errorData.message || 'Erreur serveur',
          response.status,
          errorData,
        );
      }

      const result = await response.json();

      // Stockage des informations de session
      if (result.token) {
        sessionStorage.setItem('token', result.token);
      }
      sessionStorage.setItem('utilisateur_id', result.utilisateur_id);
      sessionStorage.setItem('role', formData.role);

      // Réinitialisation du formulaire
      setFormData({
        name: '',
        lastName: '',
        email: '',
        role: '',
        telephone: '',
        address: '',
        login: '',
        passwordLogin: '',
        confirmPasswordLogin: '',
        entreprise_id: '',
      });

      // Redirection selon le rôle
      navigate(formData.role === 'admin' ? '/entreprise' : '/login', {
        state: { utilisateur_id: result.utilisateur_id }
      });

    } catch (error) {
      console.error("Erreur lors de l'inscription :", error);

      let errorMessage = "Erreur réseau ou serveur";
      if (error.status) {
        const errors = error.data?.errors;
        errorMessage = errors 
          ? Object.values(errors).flat().join('\n')
          : error.data?.message || `Erreur ${error.status}`;
      } else if (error.message) {
        errorMessage = error.message;
      }

      alert(`Erreur inscription :\n${errorMessage}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-blue-600"></div>
          <p className="mt-4">Vérification de l'accès en cours...</p>
        </div>
      </div>
    );
  }

  if (!accesAutorise) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-red-600">Accès refusé</h2>
          <p className="mt-2">Vous n'avez pas l'autorisation d'accéder à cette page.</p>
          <button 
            onClick={() => navigate("/")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 pt-24 pb-16 md:pt-32 md:pb-24 flex items-center justify-center p-4" style={{marginTop:"80px"}}>
     
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-center text-white">
          <div className="flex items-center justify-center space-x-3">
            <FaUserPlus className="text-2xl" />
            <h1 className="text-2xl font-bold">Inscription</h1>
          </div>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nom:</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Prénom:</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email:</label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="telephone" className="block text-sm font-medium text-gray-700 mb-1">Téléphone:</label>
              <input
                type="tel"
                id="telephone"
                name="telephone"
                required
                value={formData.telephone}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Adresse:</label>
              <input
                type="text"
                id="address"
                name="address"
                required
                value={formData.address}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="login" className="block text-sm font-medium text-gray-700 mb-1">Login</label>
              <input
                type="text"
                id="login"
                name="login"
                required
                value={formData.login}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="passwordLogin" className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
              <input
                type="password"
                id="passwordLogin"
                name="passwordLogin"
                required
                value={formData.passwordLogin}
                onChange={handleChange}
                className={`w-full px-4 py-2 border ${
                  formData.passwordLogin && !allValid
                    ? 'border-yellow-500'
                    : 'border-gray-300'
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />

              <div className="mt-2 space-y-1">
                <PasswordRule valid={passwordValidation.length} text="Minimum 8 caractères" />
                <PasswordRule valid={passwordValidation.uppercase} text="Au moins 1 majuscule" />
                <PasswordRule valid={passwordValidation.number} text="Au moins 1 chiffre" />
                <PasswordRule valid={passwordValidation.specialChar} text="Au moins 1 caractère spécial" />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPasswordLogin" className="block text-sm font-medium text-gray-700 mb-1">Confirmer le mot de passe</label>
              <input
                type="password"
                id="confirmPasswordLogin"
                name="confirmPasswordLogin"
                required
                value={formData.confirmPasswordLogin}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Rôle:</label>
              <select
                id="role"
                name="role"
                required
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sélectionnez le rôle</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {formData.role && formData.role !== 'admin' && (
              <div>
                <label htmlFor="entreprise_id" className="block text-sm font-medium text-gray-700 mb-1">Entreprise:</label>
                <select
                  id="entreprise_id"
                  name="entreprise_id"
                  required={formData.role !== 'admin'}
                  value={formData.entreprise_id}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sélectionnez une entreprise</option>
                  {entreprises.map(entreprise => (
                    <option key={entreprise.id} value={entreprise.id}>
                      {entreprise.nom}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={!allValid}
              className={`w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-4 rounded-md transition duration-200 shadow-md ${
                !allValid ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              S'inscrire
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// Composant pour afficher les règles de mot de passe
function PasswordRule({ valid, text }) {
  return (
    <div className="flex items-center">
      {valid ? (
        <FaCheck className="text-green-500 mr-2" />
      ) : (
        <FaTimes className="text-red-500 mr-2" />
      )}
      <span className={`text-xs ${valid ? 'text-green-600' : 'text-gray-500'}`}>
        {text}
      </span>
    </div>
  );
}