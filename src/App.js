import { useCallback, useState } from 'react';
import AdminLogin, {
  adminEmailStorageKey,
  adminTokenStorageKey,
} from './Composants/AdminLogin.jsx';
import Count from './Composants/Count.jsx';
import Form from './Composants/Form.jsx';
import './App.css';

function getStoredAdminSession() {
  const token = localStorage.getItem(adminTokenStorageKey);
  const email = localStorage.getItem(adminEmailStorageKey);

  if (token && email) {
    return {
      token,
      email,
    };
  }

  return null;
}

/**
 * Assemble les composants principaux de l'application.
 * @returns {JSX.Element} Application React.
 */
function App() {
  const [usersCount, setUsersCount] = useState(0);
  const [adminSession, setAdminSession] = useState(getStoredAdminSession);

  const handleUsersChange = useCallback((count) => {
    setUsersCount(count);
  }, []);

  return (
    <div className="App">
      <div className="count">
        <Count />

        <h1>Users manager</h1>
        <p>{usersCount} utilisateur(s) récupéré(s) depuis l'API</p>

        <h1>test deployment 2</h1>

        <a
          href={`${process.env.PUBLIC_URL}/docs/`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Voir la documentation
        </a>

        <AdminLogin
          adminSession={adminSession}
          onLogin={setAdminSession}
          onLogout={() => setAdminSession(null)}
        />

        <Form
          adminToken={adminSession?.token || ''}
          isAdmin={Boolean(adminSession?.token)}
          onUsersChange={handleUsersChange}
        />
      </div>
    </div>
  );
}

export default App;
