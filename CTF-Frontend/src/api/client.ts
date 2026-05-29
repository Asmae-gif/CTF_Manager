import axios from 'axios';

// C'est comme dire : "Voici l'adresse du backend"
const baseURL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, '') ||
  'http://127.0.0.1:8000/api';


// On crée le facteur
export const api = axios.create({
  baseURL, // baseURL est la base de l'URL du backend
  headers: {
    Accept: 'application/json', // Il dit : "Je veux une réponse en JSON"
  },
  withCredentials: false,
});

const TOKEN_KEY = 'ctf_auth_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null): void {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

// On intercepte les requêtes pour ajouter le token (le sésame) dans le header
api.interceptors.request.use((config) => {
  const token = getStoredToken(); // On va chercher le token dans le tiroir
  if (token) {
    config.headers.Authorization = `Bearer ${token}`; // On l'ajoute à l'enveloppe
  }

  if (config.data instanceof FormData) {
    // Laisser le navigateur/axios définir Content-Type avec la boundary correcte
    if (config.headers) {
      delete config.headers['Content-Type'];
      delete config.headers['content-type'];
    }
  } else {
    if (config.headers) {
      config.headers['Content-Type'] = 'application/json';
    }
  }

  return config;
});
