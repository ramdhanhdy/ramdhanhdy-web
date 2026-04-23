import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Work from './pages/Work';
import About from './pages/About';
import Contact from './pages/Contact';
import Blog from './pages/Blog';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Child Routes */}
        <Route index element={<Work />} />
        <Route path="about" element={<About />} />
        <Route path="blog" element={<Blog />} />
        <Route path="contact" element={<Contact />} />
      </Route>
    </Routes>
  );
}

export default App;
