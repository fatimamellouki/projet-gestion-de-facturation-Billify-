import { useEffect, useState } from "react";
import { FaBuilding, FaEdit, FaSave, FaTimes, FaUpload } from 'react-icons/fa';
import ConfigSMTP from "./ConfigSMTP";

export default function InfoEntreprise() {
    const [entreprise, setEntreprise] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const token = sessionStorage.getItem('token');
    const role = localStorage.getItem('role');

    useEffect(() => {
        setLoading(true);
        fetch('http://localhost:8000/api/entreprise_show', {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            credentials: 'include',
        })
        .then(async (res) => {
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Erreur serveur');
            }
            return res.json();
        })
        .then(data => {
            setEntreprise(data);
            setError(null);
        })
        .catch(err => {
            setError(err.message || 'Erreur lors du chargement');
        })
        .finally(() => {
            setLoading(false);
        });
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formData = new FormData(e.target);
            formData.append('_method', 'PUT');

            const response = await fetch('http://localhost:8000/api/entreprise', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
                credentials: 'include',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                if (errorData.errors) {
                    const errorMsg = Object.entries(errorData.errors)
                        .map(([field, errors]) => `${field}: ${errors.join(', ')}`)
                        .join('\n');
                    throw new Error(errorMsg);
                }
                throw new Error(errorData.message || 'Erreur serveur');
            }

            const data = await response.json();
            const updatedEntreprise = {
                ...data.entreprise,
                logo_url: data.entreprise.logo_url ? `${data.entreprise.logo_url}?${new Date().getTime()}` : null,
                signature_url: data.entreprise.signature_url ? `${data.entreprise.signature_url}?${new Date().getTime()}` : null,
                entete_facture: data.entreprise.entete_facture ? `${data.entreprise.entete_facture}?${new Date().getTime()}` : null,
                pied_facture: data.entreprise.pied_facture ? `${data.entreprise.pied_facture}?${new Date().getTime()}` : null,
            };

            setEntreprise(updatedEntreprise);
            setEditMode(false);
            setError(null);
            alert('Modifications enregistrées avec succès!');
            
        } catch (err) {
            setError(err.message);
            console.error('Erreur:', err);
            setTimeout(() => setError(null), 5000);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
            <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4 text-lg text-gray-600">Chargement des informations de l'entreprise...</p>
            </div>
        </div>
    );
    
    if (error) return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
            <div className="max-w-md p-6 bg-red-50 border border-red-200 rounded-lg shadow-md">
                <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h2 className="text-xl font-bold text-red-700 mb-2">Erreur</h2>
                <p className="text-red-600">❌ {error}</p>
            </div>
        </div>
    );
    
    if (!entreprise) return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
            <div className="text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Aucune donnée disponible</h3>
                <p className="mt-1 text-gray-500">Les informations de l'entreprise n'ont pas pu être chargées</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screenbg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                {/* En-tête */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl shadow-lg overflow-hidden mb-8">
                    <div className="p-6 text-white flex items-center">
                        <FaBuilding className="h-8 w-8 mr-3" />
                        <div>
                            <h1 className="text-2xl font-bold">Informations de l'entreprise</h1>
                            <p className="text-blue-100">Gestion des informations de votre entreprise</p>
                        </div>
                    </div>
                </div>

                {/* Contenu principal */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
                    <div className="p-6">
                        {!editMode ? (
                            <div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                        <h3 className="text-lg font-semibold text-blue-800 mb-3">Informations générales</h3>
                                        <div className="space-y-3">
                                            <div>
                                                <p className="text-sm text-gray-500">Matricule fiscale</p>
                                                <p className="font-medium">{entreprise.matricule_fiscale}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Identifiant unique</p>
                                                <p className="font-medium">{entreprise.identifiant_unique}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Nom</p>
                                                <p className="font-medium">{entreprise.nom}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Raison sociale</p>
                                                <p className="font-medium">{entreprise.raison_sociale}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-blue-50 p-4 rounded-lg">
                                        <h3 className="text-lg font-semibold text-blue-800 mb-3">Coordonnées</h3>
                                        <div className="space-y-3">
                                            <div>
                                                <p className="text-sm text-gray-500">Adresse</p>
                                                <p className="font-medium">{entreprise.adresse}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Zone géographique</p>
                                                <p className="font-medium">{entreprise.zone_geographique}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Type d'entreprise</p>
                                                <p className="font-medium">{entreprise.type_entreprise}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Email</p>
                                                <p className="font-medium">{entreprise.email}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                        <h3 className="text-lg font-semibold text-blue-800 mb-3">Logo</h3>
                                        {entreprise.logo_url ? (
                                            <div className="flex flex-col items-center">
                                                <img 
                                                    src={entreprise.logo_url} 
                                                    alt="Logo" 
                                                    className="max-w-full h-40 object-contain"
                                                />
                                            </div>
                                        ) : (
                                            <p className="text-gray-500 italic">Aucun logo disponible</p>
                                        )}
                                    </div>

                                    <div className="bg-blue-50 p-4 rounded-lg">
                                        <h3 className="text-lg font-semibold text-blue-800 mb-3">Signature</h3>
                                        {entreprise.signature_url ? (
                                            <div className="flex flex-col items-center">
                                                <img 
                                                    src={entreprise.signature_url} 
                                                    alt="Signature" 
                                                    className="max-w-full h-40 object-contain"
                                                />
                                            </div>
                                        ) : (
                                            <p className="text-gray-500 italic">Aucune signature disponible</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                        <h3 className="text-lg font-semibold text-blue-800 mb-3">Entête de facture</h3>
                                        {entreprise.entete_facture ? (
                                            <div className="flex flex-col items-center">
                                                <img 
                                                    src={entreprise.entete_facture} 
                                                    alt="Entête de facture" 
                                                    className="max-w-full h-40 object-contain"
                                                />
                                            </div>
                                        ) : (
                                            <p className="text-gray-500 italic">Aucune entête de facture disponible</p>
                                        )}
                                    </div>

                                    <div className="bg-blue-50 p-4 rounded-lg">
                                        <h3 className="text-lg font-semibold text-blue-800 mb-3">Pied de facture</h3>
                                        {entreprise.pied_facture ? (
                                            <div className="flex flex-col items-center">
                                                <img 
                                                    src={entreprise.pied_facture} 
                                                    alt="Pied de facture" 
                                                    className="max-w-full h-40 object-contain"
                                                />
                                            </div>
                                        ) : (
                                            <p className="text-gray-500 italic">Aucun pied de facture disponible</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex justify-end mt-8">
                                    <button 
                                        onClick={() => setEditMode(true)}
                                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        <FaEdit className="mr-2" />
                                        Modifier les informations
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                        <h3 className="text-lg font-semibold text-blue-800 mb-3">Informations générales</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Matricule fiscale</label>
                                                <input
                                                    type="text"
                                                    name="matricule_fiscale"
                                                    defaultValue={entreprise.matricule_fiscale}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Identifiant unique</label>
                                                <input
                                                    type="text"
                                                    name="identifiant_unique"
                                                    defaultValue={entreprise.identifiant_unique}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                                                <input
                                                    type="text"
                                                    name="nom"
                                                    defaultValue={entreprise.nom}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Raison sociale</label>
                                                <input
                                                    type="text"
                                                    name="raison_sociale"
                                                    defaultValue={entreprise.raison_sociale}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-blue-50 p-4 rounded-lg">
                                        <h3 className="text-lg font-semibold text-blue-800 mb-3">Coordonnées</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                                                <input
                                                    type="text"
                                                    name="adresse"
                                                    defaultValue={entreprise.adresse}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Zone géographique</label>
                                                <input
                                                    type="text"
                                                    name="zone_geographique"
                                                    defaultValue={entreprise.zone_geographique}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Type d'entreprise</label>
                                                <input
                                                    type="text"
                                                    name="type_entreprise"
                                                    defaultValue={entreprise.type_entreprise}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    defaultValue={entreprise.email}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                        <h3 className="text-lg font-semibold text-blue-800 mb-3">Logo</h3>
                                        {entreprise.logo_url && (
                                            <div className="mb-4">
                                                <p className="text-sm text-gray-700 mb-2">Logo actuel:</p>
                                                <img 
                                                    src={entreprise.logo_url} 
                                                    alt="Logo actuel" 
                                                    className="max-w-full h-32 object-contain"
                                                />
                                            </div>
                                        )}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Changer le logo</label>
                                            <div className="flex items-center">
                                                <label className="flex items-center px-4 py-2 bg-white text-blue-600 rounded-md border border-blue-300 cursor-pointer hover:bg-blue-50">
                                                    <FaUpload className="mr-2" />
                                                    <span>Choisir un fichier</span>
                                                    <input
                                                        type="file"
                                                        name="logo_url"
                                                        accept="image/*"
                                                        className="hidden"
                                                    />
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-blue-50 p-4 rounded-lg">
                                        <h3 className="text-lg font-semibold text-blue-800 mb-3">Signature</h3>
                                        {entreprise.signature_url && (
                                            <div className="mb-4">
                                                <p className="text-sm text-gray-700 mb-2">Signature actuelle:</p>
                                                <img 
                                                    src={entreprise.signature_url} 
                                                    alt="Signature actuelle" 
                                                    className="max-w-full h-32 object-contain"
                                                />
                                            </div>
                                        )}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Changer la signature</label>
                                            <div className="flex items-center">
                                                <label className="flex items-center px-4 py-2 bg-white text-blue-600 rounded-md border border-blue-300 cursor-pointer hover:bg-blue-50">
                                                    <FaUpload className="mr-2" />
                                                    <span>Choisir un fichier</span>
                                                    <input
                                                        type="file"
                                                        name="signature_url"
                                                        accept="image/*"
                                                        className="hidden"
                                                    />
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                        <h3 className="text-lg font-semibold text-blue-800 mb-3">Entête de facture</h3>
                                        {entreprise.entete_facture && (
                                            <div className="mb-4">
                                                <p className="text-sm text-gray-700 mb-2">Entête actuelle:</p>
                                                <img 
                                                    src={entreprise.entete_facture} 
                                                    alt="Entête actuelle" 
                                                    className="max-w-full h-32 object-contain"
                                                />
                                            </div>
                                        )}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Changer l'entête</label>
                                            <div className="flex items-center">
                                                <label className="flex items-center px-4 py-2 bg-white text-blue-600 rounded-md border border-blue-300 cursor-pointer hover:bg-blue-50">
                                                    <FaUpload className="mr-2" />
                                                    <span>Choisir un fichier</span>
                                                    <input
                                                        type="file"
                                                        name="entete_facture"
                                                        accept="image/*"
                                                        className="hidden"
                                                    />
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-blue-50 p-4 rounded-lg">
                                        <h3 className="text-lg font-semibold text-blue-800 mb-3">Pied de facture</h3>
                                        {entreprise.pied_facture && (
                                            <div className="mb-4">
                                                <p className="text-sm text-gray-700 mb-2">Pied actuel:</p>
                                                <img 
                                                    src={entreprise.pied_facture} 
                                                    alt="Pied actuel" 
                                                    className="max-w-full h-32 object-contain"
                                                />
                                            </div>
                                        )}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Changer le pied</label>
                                            <div className="flex items-center">
                                                <label className="flex items-center px-4 py-2 bg-white text-blue-600 rounded-md border border-blue-300 cursor-pointer hover:bg-blue-50">
                                                    <FaUpload className="mr-2" />
                                                    <span>Choisir un fichier</span>
                                                    <input
                                                        type="file"
                                                        name="pied_facture"
                                                        accept="image/*"
                                                        className="hidden"
                                                    />
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-4 mt-8">
                                    <button 
                                        type="button"
                                        className="flex items-center px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                        onClick={() => setEditMode(false)}
                                    >
                                        <FaTimes className="mr-2" />
                                        Annuler
                                    </button>
                                    <button 
                                        type="submit"
                                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                    >
                                        <FaSave className="mr-2" />
                                        Enregistrer
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>

                {/* Composant ConfigSMTP */}
                <ConfigSMTP />
            </div>
        </div>
    );
}