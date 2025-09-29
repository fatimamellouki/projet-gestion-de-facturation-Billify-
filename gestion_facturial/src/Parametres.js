import React, { useEffect, useState } from "react";
import "./Parametres.css"; // tu peux personnaliser ça

const Parametres = () => {
  const [profil, setProfil] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const token = sessionStorage.getItem("token");

  // Charger le profil de l'utilisateur
  const fetchUserProfile = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/me", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) throw new Error("Erreur lors du chargement du profil");

      const data = await response.json();
      setProfil({
  ...data.utilisateur,
  passwordLogin: "", // 🛡️ Ne jamais préremplir
});
    } catch (error) {
      console.error(error);
      setMessage("❌ Erreur lors du chargement du profil.");
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour le profil
  const updateUserProfile = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:8000/api/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify(profil),
      });
console.log(profil);
      const result = await response.json();

      if (!response.ok) {
        if (result.errors) {
          setMessage("❌ Erreurs : " + Object.values(result.errors).flat().join(", "));
        } else {
          setMessage("❌ " + (result.message || "Erreur lors de la mise à jour."));
        }
        return;
      }

      setMessage("✅ Profil mis à jour avec succès !");
    } catch (error) {
      console.error(error);
      setMessage("❌ Une erreur s'est produite.");
    }
  };

  useEffect(() => {
    if (token) fetchUserProfile();
  }, [token]);

  const handleChange = (e) => {
    setProfil({
      ...profil,
      [e.target.name]: e.target.value,
    });
  };
const togglePasswordVisibility = () => {
    setPasswordVisible((prev) => !prev);
  };

  if (loading) return <p>Chargement du profil...</p>;

  if (!profil) return <p>Profil non disponible</p>;

  return (
    <div className="profil-container">
      <h2>👤 Paramètres du profil</h2>
      {message && <p className="message">{message}</p>}

      <form onSubmit={updateUserProfile}>
        <div>
          <label>Nom :</label>
          <input type="text" name="name" value={profil.name || ""} onChange={handleChange} />
        </div>
        <div>
          <label>Prénom :</label>
          <input type="text" name="lastName" value={profil.lastName || ""} onChange={handleChange} />
        </div>
        <div>
          <label>Email :</label>
          <input type="email" name="email" value={profil.email || ""} onChange={handleChange} />
        </div>
        <div>
          <label>Téléphone :</label>
          <input type="text" name="telephone" value={profil.telephone || ""} onChange={handleChange} />
        </div>
        <div>
          <label>Adresse :</label>
          <input type="text" name="address" value={profil.address || ""} onChange={handleChange} />
        </div>
        <div>
          <label>Identifiant :</label>
          <input type="text" name="login" value={profil.login || ""} onChange={handleChange} />
        </div>
        <div className="password-group">
          <label>Nouveau mot de passe :</label>
          <div style={{ position: "relative" }}>
          <input
  type={passwordVisible ? "text" : "password"}
  placeholder="Laisser vide pour ne pas changer"
  name="passwordLogin"
  value={profil.passwordLogin || ""}
  onChange={handleChange}
/>

            <span
              onClick={togglePasswordVisibility}
              style={{
                position: "absolute",
                right: 10,
                top: "50%",
                transform: "translateY(-50%)",
                cursor: "pointer",
                color: "#007bff",
              }}
            >
              {passwordVisible ? "🙈" : "👁️"}
            </span>
          </div>
        </div>
        <button type="submit">💾 Enregistrer</button>
      </form>
    </div>
  );
};

export default Parametres;
