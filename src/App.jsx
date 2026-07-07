import { lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';

// Route-level code splitting: each page (and its animation deps) loads on
// demand. Framer Motion ships only with the Blog chunk; the curtain wipe
// covers the viewport while chunks fetch, so transitions stay seamless.
const Work = lazy(() => import('./pages/Work'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Blog = lazy(() => import('./pages/Blog'));
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'));
const PostDetail = lazy(() => import('./pages/PostDetail'));
const NotFound = lazy(() => import('./pages/NotFound'));

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Child Routes */}
        <Route index element={<Work />} />
        <Route path="work/:slug" element={<ProjectDetail />} />
        <Route path="about" element={<About />} />
        <Route path="blog" element={<Blog />} />
        <Route path="blog/:slug" element={<PostDetail />} />
        <Route path="contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;
