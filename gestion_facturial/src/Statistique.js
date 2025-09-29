import React, { useEffect, useState } from "react";
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, CartesianGrid,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";
import './Statistique.css';
import { FiDollarSign, FiUsers, FiPackage, FiFileText, FiTrendingUp, FiPieChart, FiClock } from "react-icons/fi";

const COLORS = ["#3182CE", "#38A169", "#DD6B20", "#805AD5", "#D53F8C", "#319795"];

export default function Statistique() {
  const [stats, setStats] = useState(null);
  const [facturesParMois, setFacturesParMois] = useState([]);
  const [chiffreAffaireParMois, setChiffreAffaireParMois] = useState([]);
  const [devisStats, setDevisStats] = useState([]);
  const [retards, setRetards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    const headers = {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    };

    // Fonction pour fetch une URL
    const getData = async (url, setter) => {
      try {
        const res = await fetch(url, { headers });
        const data = await res.json();
        setter(data);
      } catch (error) {
        console.error("Erreur fetch " + url, error);
      }
    };

    const fetchAllData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          getData("http://localhost:8000/api/statistiques/globales", setStats),
          getData("http://localhost:8000/api/statistiques/factures-par-mois", setFacturesParMois),
          getData("http://localhost:8000/api/statistiques/chiffre-affaire-par-mois", setChiffreAffaireParMois),
          getData("http://localhost:8000/api/statistiques/devis-repartition", setDevisStats),
          getData("http://localhost:8000/api/statistiques/retards-paiement", setRetards)
        ]);
      } catch (error) {
        console.error("Erreur lors du chargement des données", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  if (loading) {
    return (
      <div className="statistique-container bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
        <h2><FiTrendingUp /> Tableau de Bord</h2>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Chargement des statistiques...</p>
        </div>
      </div>
    );
  }

  if (!stats) return <p>Erreur de chargement des statistiques</p>;

  // Formater les montants pour l'affichage
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'MAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="statistique-container bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
      <h2><FiTrendingUp /> Tableau de Bord</h2>

      {/* CARTES */}
      <div className="stat-cards">
        <div className="stat-card blue">
          <h4><FiFileText /> Total Factures</h4>
          <p>{stats.totalFactures}</p>
        </div>
        <div className="stat-card green">
          <h4><FiUsers /> Total Clients</h4>
          <p>{stats.totalClients}</p>
        </div>
        <div className="stat-card purple">
          <h4><FiPackage /> Total Produits</h4>
          <p>{stats.totalProduits}</p>
        </div>
        <div className="stat-card orange">
          <h4><FiDollarSign /> Chiffre d'affaires</h4>
          <p>{formatCurrency(stats.chiffreAffaire)}</p>
        </div>
      </div>

      {/* GRID DE GRAPHIQUES */}
      <div className="chart-grid">
        {/* 📊 GRAPHIQUE BARRES */}
        <div className="chart-container">
          <div className="chart-header">
            <h3><FiFileText /> Factures par Mois</h3>
          </div>
          <div className="chart-content">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={facturesParMois}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="mois" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [value, 'Factures']}
                  labelFormatter={(value) => `Mois: ${value}`}
                />
                <Bar dataKey="total" fill="#3182CE" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 📈 COURBE */}
        <div className="chart-container">
          <div className="chart-header">
            <h3><FiDollarSign /> Chiffre d'Affaires Mensuel</h3>
          </div>
          <div className="chart-content">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chiffreAffaireParMois}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="mois" />
                <YAxis tickFormatter={(value) => formatCurrency(value).replace('MAD', '')} />
                <Tooltip 
                  formatter={(value) => [formatCurrency(value), 'CA']}
                  labelFormatter={(value) => `Mois: ${value}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="chiffre" 
                  stroke="#38A169" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#38A169' }}
                  activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 🥧 PIE CHART */}
        <div className="chart-container">
          <div className="chart-header">
            <h3><FiPieChart /> Devis signés vs non signés</h3>
          </div>
          <div className="chart-content">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={devisStats}
                  cx="50%" 
                  cy="50%"
                  outerRadius={80}
                  innerRadius={60}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {devisStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend 
                  layout="vertical" 
                  verticalAlign="middle" 
                  align="right"
                  formatter={(value, entry, index) => (
                    <span style={{ color: '#4A5568' }}>{value}</span>
                  )}
                />
                <Tooltip formatter={(value) => [value, 'Devis']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 📊 RETARDS DE PAIEMENT */}
        <div className="chart-container">
          <div className="chart-header">
            <h3><FiClock /> Retards de Paiement par Client</h3>
          </div>
          <div className="chart-content">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                layout="vertical" 
                data={retards.map(item => ({
                  ...item, 
                  name: item.client.length > 15 ? `${item.client.substring(0, 15)}...` : item.client
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis 
                  type="number" 
                  tickFormatter={(value) => formatCurrency(value).replace('MAD', '')} 
                />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={100} 
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  formatter={(value) => [formatCurrency(value), 'Montant']}
                  labelFormatter={(value) => `Client: ${retards.find(r => r.name === value)?.client || value}`}
                />
                <Bar dataKey="montant" fill="#DD6B20" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}