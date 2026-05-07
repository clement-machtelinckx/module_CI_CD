import Count from './Composants/Count.jsx';
import Form from './Composants/Form.jsx';
import './App.css';

/**
 * Assemble les composants principaux de l'application.
 * @returns {JSX.Element} Application React.
 */
function App() {
  return (
    <div className="App">
      <div className="count">
        
      <Count />
      <h1>test deployment 2 </h1>
      <Form />
      </div>
    </div>
  );
}

export default App;
