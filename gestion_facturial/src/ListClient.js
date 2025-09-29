import React, { useEffect, useState } from "react";
import FormulaireInscription from "./FormulaireInscription";

export default function ListClient() {
  const [clients, setClients] = useState([]);
  const [editingClient, setEditingClient] = useState(null);
  const [formEditData, setFormEditData] = useState({
    nom: '',
    email: '',
    telephone: '',
    adresse: '',
  });
  const token = sessionStorage.getItem('token');

  const fetchClients = () => {
    fetch("http://127.0.0.1:8000/api/utilisateurs/clients", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json"
      }
    })
      .then((res) => res.json())
      .then((data) => setClients(data))
      .catch((err) => console.error("Erreur lors du chargement des clients :", err));
  };

  useEffect(() => { fetchClients(); }, [token]);

  const handleDelete = (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer ce client ?")) return;

    fetch(`http://127.0.0.1:8000/api/clients/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json"
      }
    })
      .then(res => {
        if (res.ok) {
          alert("Client supprimé avec succès.");
          fetchClients();
        } else {
          alert("Erreur lors de la suppression.");
        }
      })
      .catch(() => alert("Erreur réseau lors de la suppression."));
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setFormEditData(prev => ({ ...prev, [name]: value }));
  };

  const handleEdit = (client) => {
    setEditingClient(client);
    setFormEditData({
      nom: client.nom || '',
      email: client.email || '',
      telephone: client.telephone || '',
      adresse: client.adresse || '',
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingClient) return;

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/clients/${editingClient.id_client}`, {
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

      alert("Client modifié avec succès !");
      setEditingClient(null);
      fetchClients();
    } catch (error) {
      alert("Erreur réseau lors de la modification");
      console.error(error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <FormulaireInscription role="client" buttonLabel="+ Ajouter un client" />

      <h2 className="text-2xl font-bold mb-4">Liste des Clients</h2>
      
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
            {clients.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">Aucun client trouvé.</td>
              </tr>
            ) : (
              clients.map((client) => (
                <tr key={client.id_client} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">{client.nom}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{client.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{client.telephone}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{client.adresse}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{client.entreprise_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button 
                      onClick={() => handleEdit(client)}
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(client.id_client)}
                      className="ml-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
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
      {editingClient && (
        <div className="mt-5 p-4 border border-gray-300 rounded-lg">
          <h3 className="text-xl font-semibold mb-3">Modifier le client : {editingClient.nom}</h3>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nom:</label>
              <input
                type="text"
                name="nom"
                value={formEditData.nom}
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
                name="adresse"
                value={formEditData.adresse}
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
                onClick={() => setEditingClient(null)}
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