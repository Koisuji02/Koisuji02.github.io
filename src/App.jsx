import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Terminal from './pages/Terminal';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/terminal" element={<Terminal />} />
      </Routes>
    </Router>
  );
};

export default App;