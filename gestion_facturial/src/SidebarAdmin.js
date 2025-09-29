import { useState, useEffect } from 'react';
import { useTheme } from './ThemeContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  FaFileInvoice,
  FaBuilding,
  FaBox,
  FaUsers,
  FaChartBar,
  FaCog,
  FaChevronDown,
  FaChevronUp,
  FaBars,
  FaSignOutAlt
} from 'react-icons/fa';
import { FetchError } from './utils/fetchError';
import './SidebarAdmin.css';

export default function SidebarAdmin() {
  const [entreprise, setEntreprise] = useState({ nom: '', logo_url: '' });
  const [errorMsg, setErrorMsg] = useState('');
  const [loginRole, setLoginRole] = useState('');
  const [openMenu, setOpenMenu] = useState('');
  const [collapsed, setCollapsed] = useState(false);
  const themeContext = useTheme() || {};
  const theme = themeContext.theme || 'light';
  const token = sessionStorage.getItem('token');
  const role = localStorage.getItem('role');
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    // Fetch entreprise info
    fetch('http://localhost:8000/api/entreprise/info', {
      headers: { Authorization: `Bearer ${token}` },
      credentials: 'include',
    })
      .then(async res => {
        if (!res.ok) {
          const err = await res.json();
          throw new FetchError(err.message, res.status, err);
        }
        return res.json();
      })
      .then(data => setEntreprise(data.entreprise))
      .catch(err => setErrorMsg(err.data?.message || err.message || 'Erreur'));
  }, [token]);

  useEffect(() => {
    setLoginRole(['admin','comptable','franchise'].includes(role) ? role : '');
  }, [role]);

  const toggleMenu = menu => {
    setOpenMenu(prev => (prev === menu ? '' : menu));
  };

  const handleLogout = () => {
    sessionStorage.clear();
    localStorage.clear();
    navigate('/');
  };

  const items = [
    {
      key: 'entreprise',
      icon: <FaBuilding className="menu-icon" />,
      label: 'Entreprise',
      sub: [{ to: '/gestionnaire/InfoEntreprise', label: 'Info entreprise' }],
      roles: ['admin'],
    },
    {
      key: 'articles',
      icon: <FaBox className="menu-icon" />,
      label: 'Articles',
      sub: [
        { to: '/gestionnaire/produits', label: 'Gérer Produits', roles: ['admin'] },
        { to: '/gestionnaire/afficheProduit', label: 'Tous les produits' },
      ],
    },
    {
      key: 'clients',
      icon: <FaUsers className="menu-icon" />,
      label: 'Utilisateurs',
      sub: [
        { to: '/gestionnaire/liste', label: 'Liste des clients' },
        { to: '/gestionnaire/listComptables', label: 'Comptables', roles: ['admin'] },
        { to: '/gestionnaire/listFranchises', label: 'Franchises', roles: ['admin'] },
      ],
    },
    {
      key: 'factures',
      icon: <FaFileInvoice className="menu-icon" />,
      label: 'Factures',
      sub: [
        { to: '/gestionnaire/factures', label: 'Liste des factures' },
        { to: '/gestionnaire/factures/nouvelle', label: 'Nouvelle facture' },
      ],
    },
    {
      key: 'avoirs',
      icon: <FaFileInvoice className="menu-icon" />,
      label: 'Avoirs',
      sub: [
        { to: '/gestionnaire/avoirs', label: 'Liste des avoirs' },
        { to: '/gestionnaire/avoirs/nouvel', label: 'Nouvel avoir' },
      ],
    },
    {
      key: 'devis',
      icon: <FaFileInvoice className="menu-icon" />,
      label: 'Devis',
      sub: [
        { to: '/gestionnaire/devis', label: 'Liste des devis' },
        { to: '/gestionnaire/devis/nouvel', label: 'Nouveau devis' },
      ],
    },
    {
      key: 'stats',
      icon: <FaChartBar className="menu-icon" />,
      label: 'Statistiques',
      sub: [{ to: '/gestionnaire/stats', label: 'Tableau de bord' }],
    },
    {
      key: 'parametres',
      icon: <FaCog className="menu-icon" />,
      label: 'Paramètres',
      sub: [{ to: '/gestionnaire/parametres', label: 'Configuration' }],
    },
  ];

  return (
    <aside className={`sidebar-admin ${collapsed ? 'collapsed' : ''} ${theme}`}>
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

      {/* Section utilisateur condensée */}
      <div className="sidebar-user">
        {entreprise.logo_url && (
          <div className="avatar-container">
            <img 
              src={entreprise.logo_url} 
              alt="Logo entreprise" 
              className="avatar" 
            />
          </div>
        )}
        {!collapsed && (
          <div className="user-info">
            <p className="welcome">Bienvenue</p>
            <p className="company-name">{entreprise.nom || 'Votre société'}</p>
            {errorMsg && <p className="error">{errorMsg}</p>}
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {items.map(item => {
          if (item.roles && !item.roles.includes(loginRole)) return null;
          const isOpen = openMenu === item.key;
          const isActive = item.sub.some(subItem => pathname.startsWith(subItem.to));
          
          return (
            <div 
              key={item.key} 
              className={`menu-item ${isActive ? 'active' : ''}`}
            >
              <div
                className="menu-title"
                onClick={() => toggleMenu(item.key)}
                title={item.label}
              >
                <div className="icon-title">
                  {item.icon}
                  {!collapsed && <span>{item.label}</span>}
                </div>
                {!collapsed && (
                  <div className="chevron">
                    {isOpen ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                  </div>
                )}
              </div>
              
            {isOpen && !collapsed && (
  <ul className="submenu">
    {item.sub.map(s =>
      (!s.roles || s.roles.includes(loginRole)) && (
        <li key={s.to} className="submenu-item">
          <Link
            to={s.to}
            className={pathname.startsWith(s.to) ? 'active' : ''}
          >
            {s.label}
          </Link>
        </li>
      )
    )}
  </ul>
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
  );
}