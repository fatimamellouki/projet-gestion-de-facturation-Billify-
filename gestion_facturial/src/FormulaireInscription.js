import { useState, useEffect } from 'react';
import { FaCheck, FaTimes } from 'react-icons/fa';

const FormulaireInscription = ({ role = 'client', buttonLabel = "+ Ajouter" }) => {
  const [showForm, setShowForm] = useState(false);
  const [entrepriseId, setEntrepriseId] = useState(null);
  const [errors, setErrors] = useState({});
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    uppercase: false,
    number: false,
    specialChar: false
  });
  const [allValid, setAllValid] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    email: '',
    role: role,
    telephone: '',
    address: '',
    login: '',
    passwordLogin: '',
    confirmPasswordLogin: '',
    entreprise_id: '',
  });

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/entreprise/info", {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        Accept: "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setEntrepriseId(data.entreprise_id);
        setFormData((prev) => ({
          ...prev,
          entreprise_id: data.entreprise.id_entreprise,
        }));
      })
      .catch((err) => console.error("Erreur chargement utilisateur:", err));
  }, []);

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
    setErrors({});

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
          'Accept': 'application/json',
          Authorization: `Bearer ${sessionStorage.getItem("token")}`
        },
        body: JSON.stringify(dataToSend),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.errors) {
          setErrors(result.errors);
        } else {
          alert(result.message || "Erreur serveur");
        }
        return;
      }

      setFormData({
        name: '',
        lastName: '',
        email: '',
        role: role,
        telephone: '',
        address: '',
        login: '',
        passwordLogin: '',
        confirmPasswordLogin: '',
        entreprise_id: entrepriseId,
      });
      setShowForm(false);

    } catch (error) {
      console.error("Erreur :", error);
      alert("Erreur : " + error.message);
    }
  };

  // Composant pour afficher les règles de mot de passe
  const PasswordRule = ({ valid, text }) => (
    <div className="flex items-center mt-1">
      {valid ? (
        <FaCheck className="text-green-500 mr-1 text-sm" />
      ) : (
        <FaTimes className="text-red-500 mr-1 text-sm" />
      )}
      <span className={`text-xs ${valid ? 'text-green-600' : 'text-gray-500'}`}>
        {text}
      </span>
    </div>
  );

  return (
    <div className="client-list-container">
      <button 
        onClick={() => setShowForm(!showForm)} 
      className="btn-ajouter 
  bg-blue-500 
  hover:bg-blue-600 
  text-white 
  font-semibold 
  py-2 px-4 
  rounded-lg 
  shadow-md 
  transition-colors duration-300"
      >
        {showForm ? "Annuler" : buttonLabel}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="inscription-form mt-4 p-6 bg-white rounded-lg shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom:</label>
              <input 
                type="text" 
                name="name" 
                required 
                value={formData.name} 
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.name && <small className="text-red-500 text-xs">{errors.name}</small>}
            </div>

            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-1">Prénom:</label>
              <input 
                type="text" 
                name="lastName" 
                required 
                value={formData.lastName} 
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.lastName && <small className="text-red-500 text-xs">{errors.lastName}</small>}
            </div>
          </div>

          <div className="form-group mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email:</label>
            <input 
              type="email" 
              name="email" 
              required 
              value={formData.email} 
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.email && <small className="text-red-500 text-xs">{errors.email}</small>}
          </div>

          <div className="form-group mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone:</label>
            <input 
              type="tel" 
              name="telephone" 
              required 
              value={formData.telephone} 
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.telephone && <small className="text-red-500 text-xs">{errors.telephone}</small>}
          </div>

          <div className="form-group mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Adresse:</label>
            <input 
              type="text" 
              name="address" 
              required 
              value={formData.address} 
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.address && <small className="text-red-500 text-xs">{errors.address}</small>}
          </div>

          <div className="form-group mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Login</label>
            <input 
              type="text" 
              name="login" 
              required 
              value={formData.login} 
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.login && <small className="text-red-500 text-xs">{errors.login}</small>}
          </div>

          <div className="form-group mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
            <input 
              type="password" 
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
            
            <div className="mt-2">
              <PasswordRule valid={passwordValidation.length} text="Minimum 8 caractères" />
              <PasswordRule valid={passwordValidation.uppercase} text="Au moins 1 majuscule" />
              <PasswordRule valid={passwordValidation.number} text="Au moins 1 chiffre" />
              <PasswordRule valid={passwordValidation.specialChar} text="Au moins 1 caractère spécial" />
            </div>
            
            {errors.passwordLogin && <small className="text-red-500 text-xs">{errors.passwordLogin}</small>}
          </div>

          <div className="form-group mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le mot de passe</label>
            <input 
              type="password" 
              name="confirmPasswordLogin" 
              required 
              value={formData.confirmPasswordLogin} 
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.confirmPasswordLogin && <small className="text-red-500 text-xs">{errors.confirmPasswordLogin}</small>}
          </div>

          <input type="hidden" name="role" value={formData.role} />
          <input type="hidden" name="entreprise_id" value={formData.entreprise_id} />

          <button 
            type="submit" 
            disabled={!allValid}
            className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition ${
              !allValid ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            S'inscrire
          </button>
        </form>
      )}
    </div>
  );
};

export default FormulaireInscription;