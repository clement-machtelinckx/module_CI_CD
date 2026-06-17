import React, { useState } from 'react';
import { loginAdmin } from '../services/adminService.js';

export const adminTokenStorageKey = 'adminToken';
export const adminEmailStorageKey = 'adminEmail';

const errorStyle = { color: 'red' };
const successStyle = { color: 'green' };

/**
 * Affiche la connexion administrateur et gere le stockage du token.
 * @param {{ adminSession: {token: string, email: string}|null, onLogin: Function, onLogout: Function }} props Props du composant.
 * @returns {JSX.Element} Formulaire de connexion admin.
 */
export default function AdminLogin({ adminSession, onLogin, onLogout }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            const session = await loginAdmin(email.trim(), password);

            localStorage.setItem(adminTokenStorageKey, session.token);
            localStorage.setItem(adminEmailStorageKey, session.admin.email);
            setPassword('');
            setError('');
            onLogin({
                token: session.token,
                email: session.admin.email,
            });
        } catch (loginError) {
            console.error(loginError);
            setError('Identifiants admin invalides.');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem(adminTokenStorageKey);
        localStorage.removeItem(adminEmailStorageKey);
        setEmail('');
        setPassword('');
        setError('');
        onLogout();
    };

    if (adminSession) {
        return (
            <section>
                <h2>Administration</h2>
                <p role="status" style={successStyle}>Connecté en tant que {adminSession.email}</p>
                <button className="button" type="button" onClick={handleLogout}>Déconnexion</button>
            </section>
        );
    }

    return (
        <section>
            <h2>Administration</h2>

            <form onSubmit={handleSubmit}>
                <label>
                    Email admin :
                    <input
                        className="form-input-text"
                        type="email"
                        name="adminEmail"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                    />
                </label>

                <label>
                    Mot de passe admin :
                    <input
                        className="form-input-text"
                        type="password"
                        name="adminPassword"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                    />
                </label>

                <button className="button" type="submit">Connexion admin</button>
                {error && <p role="alert" style={errorStyle}>{error}</p>}
            </form>
        </section>
    );
}
