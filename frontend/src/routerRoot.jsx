import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/Home';
import BacktestPage from './pages/BackTest';
import PredictionsPage from './pages/Predictions';
import AboutPage from './pages/AboutPage';

const AppRootRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/backtest" element={<BacktestPage />} /> 
      <Route path="/predictions" element={<PredictionsPage />} /> 
      <Route path="/about" element={<AboutPage/>} />
    </Routes>
  );
};

export default AppRootRouter;
