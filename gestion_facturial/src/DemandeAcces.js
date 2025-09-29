import { useState } from "react";
import { motion } from "framer-motion";
import ReCAPTCHA from "react-google-recaptcha";
import { FaPaperPlane, FaCheckCircle, FaExclamationCircle, FaUser, FaPhone, FaEnvelope, FaMapMarkerAlt, FaEdit } from "react-icons/fa";

const DemandeAcces = () => {
  const initialFormData = {
    nom: "",
    prenom: "",
    telephone: "",
    email: "",
    adresse: "",
    message: "",
    recaptcha: "",
  };

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const siteKey = "6LfzdYkrAAAAAMoU7kD07T_GyuDqbicwg1_PYVWu";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.nom.trim()) newErrors.nom = "Veuillez entrer votre nom";
    if (!formData.prenom.trim()) newErrors.prenom = "Veuillez entrer votre prénom";
    if (!formData.email.trim()) {
      newErrors.email = "Veuillez entrer votre email";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Veuillez entrer un email valide";
    }
    if (!formData.telephone.trim()) newErrors.telephone = "Veuillez entrer votre numéro de téléphone";
    if (!formData.message.trim()) newErrors.message = "Veuillez décrire votre besoin";
    if (!formData.recaptcha) newErrors.recaptcha = "Veuillez valider le reCAPTCHA";
    
    return newErrors;
  };

  const handleCaptcha = (value) => {
    setFormData(prev => ({ ...prev, recaptcha: value }));
    if (errors.recaptcha) {
      setErrors(prev => ({ ...prev, recaptcha: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    setSuccess(false);

    try {
      const res = await fetch("http://localhost:8000/api/demande-acces", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Erreur lors de l'envoi de la demande");
      }

      setSuccess(true);
      setFormData(initialFormData);
    } catch (err) {
      setErrors(prev => ({ ...prev, form: err.message }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8" style={{marginTop:'80px'}}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden"
      >
        {/* En-tête avec gradient */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-center">
          <h2 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
            <FaPaperPlane className="text-white" />
            Demande d'accès
          </h2>
        </div>

        {/* Contenu du formulaire */}
        <div className="p-6 sm:p-8">
          {success && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-6 p-4 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg flex items-center gap-3"
            >
              <FaCheckCircle className="text-xl" />
              <span>Votre demande a été envoyée avec succès !</span>
            </motion.div>
          )}

          {errors.form && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg flex items-center gap-3"
            >
              <FaExclamationCircle className="text-xl" />
              <span>{errors.form}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nom */}
              <div>
                <label htmlFor="nom" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nom*
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="nom"
                    name="nom"
                    value={formData.nom}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-3 py-3 rounded-lg border ${errors.nom ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white`}
                    placeholder="Votre nom"
                  />
                  {errors.nom && <p className="mt-1 text-sm text-red-500">{errors.nom}</p>}
                </div>
              </div>

              {/* Prénom */}
              <div>
                <label htmlFor="prenom" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Prénom*
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="prenom"
                    name="prenom"
                    value={formData.prenom}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-3 py-3 rounded-lg border ${errors.prenom ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white`}
                    placeholder="Votre prénom"
                  />
                  {errors.prenom && <p className="mt-1 text-sm text-red-500">{errors.prenom}</p>}
                </div>
              </div>

              {/* Téléphone */}
              <div>
                <label htmlFor="telephone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Téléphone*
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaPhone className="text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    id="telephone"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-3 py-3 rounded-lg border ${errors.telephone ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white`}
                    placeholder="Votre numéro"
                  />
                  {errors.telephone && <p className="mt-1 text-sm text-red-500">{errors.telephone}</p>}
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email*
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-3 py-3 rounded-lg border ${errors.email ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white`}
                    placeholder="Votre email"
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                </div>
              </div>
            </div>

            {/* Adresse */}
            <div>
              <label htmlFor="adresse" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Adresse
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaMapMarkerAlt className="text-gray-400" />
                </div>
                <input
                  type="text"
                  id="adresse"
                  name="adresse"
                  value={formData.adresse}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Votre adresse"
                />
              </div>
            </div>

            {/* Message */}
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Pourquoi souhaitez-vous un accès ?*
              </label>
              <div className="relative">
                <div className="absolute top-3 left-3">
                  <FaEdit className="text-gray-400" />
                </div>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  className={`w-full pl-10 pr-3 py-3 rounded-lg border ${errors.message ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white`}
                  placeholder="Décrivez votre besoin..."
                />
                {errors.message && <p className="mt-1 text-sm text-red-500">{errors.message}</p>}
              </div>
            </div>

            {/* reCAPTCHA */}
            <div className="flex justify-center flex-col items-center">
              <ReCAPTCHA
                sitekey={siteKey}
                onChange={handleCaptcha}
              />
              {errors.recaptcha && <p className="mt-2 text-sm text-red-500">{errors.recaptcha}</p>}
            </div>

            {/* Bouton de soumission */}
            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                isSubmitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Envoi en cours...
                </>
              ) : (
                <>
                  <FaPaperPlane className="mr-2" />
                  Envoyer la demande
                </>
              )}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default DemandeAcces;