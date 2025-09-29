
import { useEffect, useState } from 'react';
import { useNavigate, Outlet, Link, useLocation } from 'react-router-dom';
import Modal from 'react-modal';
import './Client.css';
import { 
  FaUser, FaEdit, FaBox, FaFileInvoice, FaSignOutAlt, 
  FaFileDownload, FaSearch, FaTimes, FaFileAlt,
  FaChevronDown, FaChevronUp, FaBars
} from 'react-icons/fa';
import { motion } from 'framer-motion';

Modal.setAppElement('#root');

export default function Client() {
  const [client, setClient] = useState(null);
  const [factures, setFactures] = useState([]);
  const [activeTab, setActiveTab] = useState('profil');
  const [selectedFacture, setSelectedFacture] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [openMenu, setOpenMenu] = useState('');
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const token = sessionStorage.getItem("token");

  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
  };

  useEffect(() => {
    const fetchClientData = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/api/client/profile', {
          headers,
          credentials: 'include',
        });
        const data = await res.json();
        setClient(data.client);
      } catch (err) {
        console.error("Erreur profil:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClientData();
  }, [token]);

  const fetchFactures = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/client/factures', { headers });
      const data = await res.json();
      setFactures(data.factures);
    } catch (err) {
      console.error("Erreur factures:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    navigate("/");
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    form.append('_method', 'PUT');

    try {
      const res = await fetch('http://127.0.0.1:8000/api/client/update', {
        method: "POST",
        headers,
        body: form,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(JSON.stringify(error));
      }

      const data = await res.json();
      alert("Profil mis à jour !");
      setClient(data.client);
      setActiveTab('profil');
    } catch (err) {
      alert("Erreur : " + err.message);
    }
  };

  useEffect(() => {
    if (activeTab === 'factures') {
      fetchFactures();
    }
  }, [activeTab]);

  const telechargerFacture = async (factureId) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/factures/${factureId}/telecharger`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/pdf',
        },
      });

      if (!response.ok) throw new Error("Erreur lors du téléchargement");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `facture_${factureId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Erreur de téléchargement :", err);
      alert("❌ Échec du téléchargement de la facture");
    }
  };

  const openModal = (facture) => {
    setSelectedFacture(facture);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const toggleMenu = (menu) => {
    setOpenMenu(prev => (prev === menu ? '' : menu));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const menuItems = [
    {
      key: 'profil',
      icon: <FaUser className="menu-icon" />,
      label: 'Voir profil',
      to: '/client'
    },
    {
      key: 'edit',
      icon: <FaEdit className="menu-icon" />,
      label: 'Modifier profil',
      to: '/client'
    },
    {
      key: 'produits',
      icon: <FaBox className="menu-icon" />,
      label: 'Catalogue produits',
      sub: [
        { to: '/client/afficherProduit', label: 'Tous les produits' }
      ]
    },
    {
      key: 'factures',
      icon: <FaFileInvoice className="menu-icon" />,
      label: 'Mes factures',
      to: '/client'
    },
    {
      key: 'devis',
      icon: <FaFileAlt className="menu-icon" />,
      label: 'Mes Devis',
      sub: [
        { to: '/client/mesDevis', label: 'Liste des devis' }
      ]
    }
  ];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
      {/* Sidebar avec le nouveau style */}
      <aside className={`sidebar-admin ${collapsed ? 'collapsed' : ''}`}>
        {/* En-tête condensé */}
        <div className="sidebar-header">
          <button
            className="collapse-toggle"
            onClick={() => setCollapsed(c => !c)}
            title={collapsed ? 'Ouvrir' : 'Fermer'}
            aria-label={collapsed ? 'Ouvrir menu' : 'Fermer menu'}
          >
            <FaBars />
          </button>
          {!collapsed && (
            <div className="logo-container-sidebar">
              <div className="sidebar-logo">Billify</div>
            </div>
          )}
        </div>

        {/* Section utilisateur */}
          <div className="sidebar-user">
        <div className="avatar-container_client">
          <img
            src={client?.photo_contact_url 
              ? `http://127.0.0.1:8000/storage/${client.photo_contact_url}` 
              : "/default-avatar.png"}
            alt="Profil"
            className="avatar_client"
          />
        </div>
        {!collapsed && (
          <div className="user-info">
            <p className="welcome">Bienvenue</p>
            <p className="company-name">{client?.nom || 'Client'}</p>
          </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {menuItems.map(item => {
            const isOpen = openMenu === item.key;
            const isActive = pathname.startsWith(item.to) || 
              (item.sub && item.sub.some(subItem => pathname.startsWith(subItem.to)));
            
            return (
              <div 
                key={item.key} 
                className={`menu-item ${isActive ? 'active' : ''}`}
              >
                {item.sub ? (
                  <>
                    <div
                      className="menu-title"
                      onClick={() => toggleMenu(item.key)}
                      title={item.label}
                    >
                      <div className="icon-title">
                        {item.icon}
                        {!collapsed && <span>{item.label}</span>}
                      </div>
                      {!collapsed && item.sub && (
                        <div className="chevron">
                          {isOpen ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                        </div>
                      )}
                    </div>
                    
                    {isOpen && !collapsed && (
                      <ul className="submenu">
                        {item.sub.map(s => (
                          <li key={s.to} className="submenu-item">
                            <Link
                              to={s.to}
                              className={pathname.startsWith(s.to) ? 'active' : ''}
                              onClick={() => setActiveTab(item.key)}
                            >
                              {s.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  <Link
                    to={item.to}
                    className="menu-title"
                    onClick={() => {
                      setActiveTab(item.key);
                      setOpenMenu('');
                    }}
                    title={item.label}
                  >
                    <div className="icon-title">
                      {item.icon}
                      {!collapsed && <span>{item.label}</span>}
                    </div>
                  </Link>
                )}
              </div>
            );
          })}
        </nav>

        {/* Pied de page */}
        <div className="sidebar-footer">
          {!collapsed && (
            <button onClick={handleLogout} className="logout-btn">
              <FaSignOutAlt className="logout-icon" />
              <span>Déconnexion</span>
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className={`main-content ${collapsed ? 'collapsed' : ''}`}>
        {activeTab === 'profil' && client && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
          >
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
              <FaUser className="mr-2 text-blue-500" />
              Profil Client
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Nom</label>
                  <p className="mt-1 text-lg text-gray-800 dark:text-gray-200">{client.nom}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Email</label>
                  <p className="mt-1 text-lg text-gray-800 dark:text-gray-200">{client.email}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Adresse</label>
                  <p className="mt-1 text-lg text-gray-800 dark:text-gray-200">{client.adresse}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Téléphone</label>
                  <p className="mt-1 text-lg text-gray-800 dark:text-gray-200">{client.telephone}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'edit' && client && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
          >
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
              <FaEdit className="mr-2 text-blue-500" />
              Modifier Profil
            </h2>
            
            <form onSubmit={handleEdit} encType="multipart/form-data" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom</label>
                  <input
                    type="text"
                    name="nom"
                    defaultValue={client.nom}
                    className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    defaultValue={client.email}
                    className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Adresse</label>
                  <input
                    type="text"
                    name="adresse"
                    defaultValue={client.adresse}
                    className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Téléphone</label>
                  <input
                    type="text"
                    name="telephone"
                    defaultValue={client.telephone}
                    className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Photo de profil</label>
                <input
                  type="file"
                  name="photo_contact_url"
                  accept="image/*"
                  className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                Enregistrer les modifications
              </button>
            </form>
          </motion.div>
        )}

        {activeTab === 'factures' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
          >
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
              <FaFileInvoice className="mr-2 text-blue-500" />
              Mes Factures
            </h2>
            
            {factures.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                Aucune facture trouvée.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Numéro</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Statut</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Montant</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {factures.map((f) => (
                      <tr key={f.id_facture} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">{f.numero}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">{f.date_emission}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                f.statut === 'payee' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                f.statut === 'en_retard' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              }`}>
                                {f.statut}
                              </span>
                                    </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">{f.total_ttc} DH</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => telechargerFacture(f.id_facture)}
                              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
                              title="Télécharger"
                            >
                              <FaFileDownload className="mr-1" />
                            </button>
                            <button
                              onClick={() => openModal(f)}
                              className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 flex items-center"
                              title="Détails"
                            >
                              <FaSearch className="mr-1" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}

        <Outlet />
      </main>

      {/* Modal pour les détails de facture */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Détails de la facture"
        className="modal-content bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-auto my-12 p-6 outline-none"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      >
        {selectedFacture && selectedFacture.lignes && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                Détails de la facture #{selectedFacture.numero}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <FaTimes />
              </button>
            </div>

           {/* Dans la partie détails de la facture */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
  <div className="space-y-2">
    <p><strong className="text-gray-700 dark:text-gray-300">Date d'émission:</strong> {selectedFacture.date_emission}</p>
    <p><strong className="text-gray-700 dark:text-gray-300">Date d'échéance:</strong> {selectedFacture.date_echeance}</p>
    <p><strong className="text-gray-700 dark:text-gray-300">Client:</strong> {selectedFacture.client?.nom || "N/A"}</p>
  </div>
  <div className="space-y-2">
    <p><strong className="text-gray-700 dark:text-gray-300">Statut:</strong> 
      <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
        selectedFacture.statut === 'payee' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
        selectedFacture.statut === 'partiellement payée' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
        'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      }`}>
        {selectedFacture.statut}
                   </span>
                </p>
                <p><strong className="text-gray-700 dark:text-gray-300">Total HT:</strong> {selectedFacture.total_ht} DH</p>
                <p><strong className="text-gray-700 dark:text-gray-300">TVA:</strong> {selectedFacture.total_tva} DH</p>
                <p><strong className="text-gray-700 dark:text-gray-300">Remise:</strong> {selectedFacture.total_remise} DH</p>
                <p><strong className="text-gray-700 dark:text-gray-300">Total TTC:</strong> {selectedFacture.total_ttc} DH</p>
                </div>
            </div>

            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Lignes de la facture</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Désignation</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Quantité</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Prix Unitaire</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">TVA</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Remise</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {selectedFacture.lignes.map((ligne, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">{ligne.designation}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">{ligne.quantite}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">{ligne.prix_unitaire_ht}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">{ligne.montant_tva}%</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">{ligne.remise_pourcentage}%</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">{ligne.montant_total_ttc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => telechargerFacture(selectedFacture.id_facture)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center"
              >
                <FaFileDownload className="mr-2" />
                Télécharger la facture
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}