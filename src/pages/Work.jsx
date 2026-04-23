import { useSearchParams } from 'react-router-dom';
import Overview3D from '../components/work/Overview3D';
import IndexList from '../components/work/IndexList';

export default function Work() {
  const [searchParams, setSearchParams] = useSearchParams();
  const view = searchParams.get('view') === 'index' ? 'index' : 'overview';

  const handleViewChange = (nextView) => {
    if (nextView === 'index') {
      setSearchParams({ view: 'index' }, { replace: true });
      return;
    }

    setSearchParams({}, { replace: true });
  };

  return (
    <div className="w-full h-screen overflow-hidden flex flex-col relative bg-black">
      {/* View Toggle */}
      <div className="absolute bottom-8 right-8 z-40 flex gap-2 mix-blend-difference bg-zinc-900/50 p-1 rounded-full backdrop-blur-md">
        <button
          onClick={() => handleViewChange('overview')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            view === 'overview' ? 'bg-neon text-black' : 'text-zinc-400 hover:text-neon'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => handleViewChange('index')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            view === 'index' ? 'bg-neon text-black' : 'text-zinc-400 hover:text-neon'
          }`}
        >
          Index
        </button>
      </div>

      {/* Render the selected view */}
      {view === 'overview' ? <Overview3D /> : <IndexList />}
    </div>
  );
}
