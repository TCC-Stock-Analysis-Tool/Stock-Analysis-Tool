import { BrowserRouter as Router } from 'react-router-dom';
import AppRootRouter from './routerRoot';
import Header from './components/Header'

function App() {
  return (
    <Router>
      <Header />
      <AppRootRouter />
    </Router>
  );
}

export default App;
