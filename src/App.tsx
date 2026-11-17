import { BrowserRouter, Route, Routes } from 'react-router';
import SearchPage from './pages/SearchPage';
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SearchPage />} />
        <Route path="/search" element={<SearchPage />} />
        {/*<Route path="/documents/:id" element={<DocumentPage />} />
        <Route path="/about" element={<AboutPage />} />*/}
      </Routes>
    </BrowserRouter>
  );

}

export default App
