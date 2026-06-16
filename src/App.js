import { useEffect, useState } from 'react';
import axios from 'axios';
import Count from './Composants/Count.jsx';
import Form from './Composants/Form.jsx';
import './App.css';

/**
 * Assemble les composants principaux de l'application.
 * @returns {JSX.Element} Application React.
 */
function App() {
  const [usersCount, setUsersCount] = useState(0);
  const [apiError, setApiError] = useState('');
  const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  useEffect(() => {
    async function fetchUsers() {
      try {
        const api = axios.create({
          baseURL: apiBaseUrl,
        });

        const response = await api.get('/users');
        const users = response.data.users;

        if (Array.isArray(users)) {
          setUsersCount(users.length);
        }
      } catch (error) {
        console.error(error);
        setApiError("Impossible de récupérer les utilisateurs depuis l'API.");
      }
    }

    fetchUsers();
  }, [apiBaseUrl]);

  return (
    <div className="App">
      <div className="count">
        <Count />

        <h1>Users manager</h1>
        <p>{usersCount} utilisateur(s) récupéré(s) depuis l'API</p>
        {apiError && <p role="alert">{apiError}</p>}

        <h1>test deployment 2</h1>

        <a
          href={`${process.env.PUBLIC_URL}/docs/`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Voir la documentation
        </a>

        <Form />
      </div>
    </div>
  );
}

export default App;
