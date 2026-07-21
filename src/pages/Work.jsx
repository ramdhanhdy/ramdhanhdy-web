import { useSearchParams } from 'react-router-dom';
import Overview3D from '../components/work/Overview3D';
import IndexList from '../components/work/IndexList';
import Meta from '../components/Meta';

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
    <div className="page-bg w-full h-screen h-dvh overflow-hidden flex flex-col relative bg-black">
      <Meta />

      {/* View Toggle */}
      <div className="absolute bottom-5 right-4 sm:bottom-8 sm:right-8 z-40 flex gap-1 sm:gap-2 mix-blend-difference light:mix-blend-normal p-1 rounded-full dark:bg-zinc-900/50 dark:backdrop-blur-md light:bg-[rgba(226,225,217,0.82)] light:backdrop-blur-md light:border light:border-[rgba(25,28,22,0.10)] light:shadow-[0_6px_18px_rgba(30,32,25,0.05)]">
        <button
          onClick={() => handleViewChange('overview')}
          className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-colors ${
            view === 'overview' ? 'bg-neon text-black' : 'text-zinc-400 hover:text-neon'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => handleViewChange('index')}
          className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-colors ${
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
