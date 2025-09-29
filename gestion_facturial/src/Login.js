import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaSignInAlt, FaUser, FaLock, FaSpinner } from 'react-icons/fa';

export default function Login() {
  const navigate = useNavigate();
  const [formDataLogin, setFormDataLogin] = useState({
    login: '',
    passwordLogin: '',
  });
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const [loginError, setLoginError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  function handleChangeLogin(e) {
    const { name, value } = e.target;
    setFormDataLogin((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Reset les erreurs en tapant
    if (name === 'login') setLoginError('');
    if (name === 'passwordLogin') setPasswordError('');
  }

  const handleSubmitLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setGlobalError('');
    setLoginError('');
    setPasswordError('');

    try {
      const response = await fetch('http://127.0.0.1:8000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formDataLogin),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401 || response.status === 422) {
          if (data?.message?.toLowerCase().includes('identifiant')) {
            setLoginError('Identifiant incorrect ou inexistant');
          } else if (data?.message?.toLowerCase().includes('mot de passe')) {
            setPasswordError('Mot de passe incorrect');
          } else {
            setGlobalError(data.message || 'Erreur de connexion');
          }
        } else {
          setGlobalError(data.message || 'Erreur inconnue');
        }
        throw new Error(data.message);
      }

      // Si succès
      const utilisateur = data.utilisateur;
      const token = data.token;

      if (!utilisateur || !token) throw new Error("Réponse invalide");

      sessionStorage.setItem('token', token);
      localStorage.setItem('role', utilisateur.role);

      if (utilisateur.role === 'client') {
        navigate('/client');
      } else if (['admin', 'comptable', 'franchise'].includes(utilisateur.role)) {
        navigate('/gestionnaire');
      } else {
        navigate('/');
      }

      setFormDataLogin({ login: '', passwordLogin: '' });
    } catch (err) {
      console.error('Erreur :', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4" style={{marginTop:'80px'}}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
          {/* En-tête avec gradient */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-center">
            <div className="flex items-center justify-center space-x-3">
              <FaSignInAlt className="text-white text-2xl" />
              <h1 className="text-2xl font-bold text-white">Connexion</h1>
            </div>
          </div>

          {/* Contenu du formulaire */}
          <div className="p-8">
            {globalError && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm"
              >
                {globalError}
              </motion.div>
            )}

            <form onSubmit={handleSubmitLogin} className="space-y-6">
              <div>
                <label htmlFor="login" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Identifiant
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="login"
                    name="login"
                    required
                    value={formDataLogin.login}
                    onChange={handleChangeLogin}
                    disabled={loading}
                    className={`w-full pl-10 pr-3 py-3 rounded-lg border ${
                      loginError ? 'border-red-500' : 'border-gray-300'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500 `}
                    placeholder="nom d'utilisateur"
                  />
                </div>
                {loginError && (
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-1 text-sm text-red-600 dark:text-red-400"
                  >
                    {loginError}
                  </motion.p>
                )}
              </div>

              <div>
                <label htmlFor="passwordLogin" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Mot de passe
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="text-gray-400" />
                  </div>
                  <input
                    type="password"
                    id="passwordLogin"
                    name="passwordLogin"
                    required
                    value={formDataLogin.passwordLogin}
                    onChange={handleChangeLogin}
                    disabled={loading}
                    className={`w-full pl-10 pr-3 py-3 border ${
                      passwordError ? 'border-yellow-500' : 'border-gray-300'
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="••••••••"
                  />
                </div>
                {passwordError && (
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-1 text-sm text-red-600 dark:text-red-400"
                  >
                    {passwordError}
                  </motion.p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Se souvenir de moi
                  </label>
                </div>

                <div className="text-sm">
                  <Link 
                    to="/ForgotPassword" 
                    className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Mot de passe oublié ?
                  </Link>
                </div>
              </div>

              <div>
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${loading 
                              ? 'bg-blue-400' 
                              : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                          } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200`}>
                  {loading ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Connexion en cours...
                    </>
                  ) : (
                    <>
                      <FaSignInAlt className="mr-2" />
                      Se connecter
                    </>
                  )}
                </motion.button>
              </div>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                    Nouveau sur Billify ?
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <Link
                  to="/demandeAcces"
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Créer un compte
                </Link>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}