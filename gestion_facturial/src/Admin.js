import './Admin.css';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
export default function Admin() {
 const token=sessionStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/gestionnaire/stats'); // ou le chemin du dashboard
  }, [token]);

  return null; // ou un petit loader
}

