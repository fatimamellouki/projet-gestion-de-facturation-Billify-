import React, { useEffect, useState } from "react";
import FormulaireInscription from "./FormulaireInscription";

export default function ListFranchise() {
  const [franchises, setFranchises] = useState([]);
  const [editingFranchise, setEditingFranchise] = useState(null);
  const [formEditData, setFormEditData] = useState({
    name: '',
    lastName: '',
    email: '',
    telephone: '',
    address: '',
  });
  const token = sessionStorage.getItem('token');

  // Charger les franchises
  const fetchFranchises = () => {
    fetch("http://127.0.0.1:8000/api/utilisateurs/franchises", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json"
      }
    })
      .then((res) => res.json())
      .then((data) => {
        setFranchises(data);
        console.log(data);
      })
      .catch((err) => console.error("Erreur lors du chargement des franchises :", err));
  };

  useEffect(() => {
    fetchFranchises();
  }, [token]);

  // Pour ouvrir le formulaire et pré-remplir les champs
  const handleEdit = (franchise) => {
    setEditingFranchise(franchise);
    setFormEditData({
      name: franchise.name || '',
      lastName: franchise.lastName || '',
      email: franchise.email || '',
      telephone: franchise.telephone || '',
      address: franchise.address || '',
    });
  };

  // Supprimer un franchise
  const handleDelete = (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cette franchise ?")) return;

    fetch(`http://127.0.0.1:8000/api/utilisateurs/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json"
      }
    })
      .then(res => {
        if (res.ok) {
          alert("Franchise supprimée avec succès.");
          fetchFranchises();
        } else {
          alert("Erreur lors de la suppression.");
        }
      })
      .catch(() => alert("Erreur réseau lors de la suppression."));
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setFormEditData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingFranchise) return;

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/utilisateurs/${editingFranchise.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json"
        },
        body: JSON.stringify(formEditData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert("Erreur lors de la modification : " + (errorData.message || response.status));
        return;
      }

      alert("Franchise modifiée avec succès !");
      setEditingFranchise(null);
      fetchFranchises();
    } catch (error) {
      alert("Erreur réseau lors de la modification");
      console.error(error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <FormulaireInscription role="franchise" buttonLabel="+ Ajouter une franchise" />

      <h2 className="text-2xl font-bold mb-4">Liste des Franchises</h2>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Téléphone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Adresse</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entreprise</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {franchises.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">Aucune franchise trouvée.</td>
              </tr>
            ) : (
              franchises.map((franchise) => (
                <tr key={franchise.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">{franchise.name} {franchise.lastName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{franchise.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{franchise.telephone}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{franchise.address}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{franchise.entreprise_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap space-x-2">
                    <button 
                      onClick={() => handleEdit(franchise)}
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(franchise.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Formulaire de modification */}
      {editingFranchise && (
        <div className="mt-5 p-4 border border-gray-300 rounded-lg">
          <h3 className="text-xl font-semibold mb-3">
            Modifier la franchise : {editingFranchise.name} {editingFranchise.lastName}
          </h3>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nom:</label>
              <input
                type="text"
                name="name"
                value={formEditData.name}
                onChange={handleEditChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Prénom:</label>
              <input
                type="text"
                name="lastName"
                value={formEditData.lastName}
                onChange={handleEditChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email:</label>
              <input
                type="email"
                name="email"
                value={formEditData.email}
                onChange={handleEditChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Téléphone:</label>
              <input
                type="tel"
                name="telephone"
                value={formEditData.telephone}
                onChange={handleEditChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Adresse:</label>
              <input
                type="text"
                name="address"
                value={formEditData.address}
                onChange={handleEditChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              />
            </div>
            <div className="flex space-x-3">
              <button 
                type="submit"
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Enregistrer
              </button>
              <button 
                type="button" 
                onClick={() => setEditingFranchise(null)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}