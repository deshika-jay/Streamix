import { useEffect, useState, useMemo } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Movie } from '../types';
import { Search, PlayCircle, Film } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Home() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('All');

  useEffect(() => {
    const q = query(collection(db, 'movies'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMovies = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Movie[];
      setMovies(fetchedMovies);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching movies:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const genres = useMemo(() => {
    const allGenres = new Set<string>();
    movies.forEach(movie => {
      if (movie.genres) {
        movie.genres.forEach(g => allGenres.add(g));
      }
    });
    return Array.from(allGenres).sort();
  }, [movies]);

  const filteredMovies = useMemo(() => {
    return movies.filter(movie => {
      const matchesSearch = movie.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGenre = selectedGenre === 'All' || (movie.genres && movie.genres.includes(selectedGenre));
      return matchesSearch && matchesGenre;
    });
  }, [movies, searchQuery, selectedGenre]);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center relative z-10">
        <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-12 space-y-8 pb-12 w-full relative z-10">
      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="relative w-full md:w-64 shrink-0">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search titles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-full py-1.5 px-4 pl-10 text-sm focus:outline-none focus:ring-1 focus:ring-red-600 transition-all font-sans text-white focus:bg-white/10 placeholder-gray-500"
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 scrollbar-none items-center">
          <button
            onClick={() => setSelectedGenre('All')}
            className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest transition-colors border ${
              selectedGenre === 'All' 
                ? 'bg-red-600 text-white border-red-600 shadow-[0_0_10px_rgba(220,38,38,0.3)]' 
                : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            All
          </button>
          {genres.map(genre => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-colors border ${
                selectedGenre === genre 
                  ? 'bg-red-600 text-white border-red-600 shadow-[0_0_10px_rgba(220,38,38,0.3)]' 
                  : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between mb-4 mt-8">
        <h3 className="text-lg font-bold tracking-tight text-white/90">Library</h3>
      </div>

      {/* Grid */}
      {filteredMovies.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-gray-500 text-sm font-medium uppercase tracking-widest">No movies found matching your search.</p>
        </div>
      ) : (
        <motion.div 
          layout
          className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4"
        >
          <AnimatePresence>
            {filteredMovies.map((movie) => (
              <motion.a
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                key={movie.id}
                href={movie.streamLink}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative cursor-pointer flex flex-col gap-2"
              >
                <div className="aspect-[2/3] rounded-lg overflow-hidden border border-white/10 bg-zinc-900 shadow-2xl transition-transform group-hover:scale-[1.02] relative">
                  {movie.posterPath ? (
                    <img 
                      src={`https://image.tmdb.org/t/p/w500${movie.posterPath}`} 
                      alt={movie.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-600 p-4 text-center bg-gradient-to-br from-zinc-900 to-black">
                      <Film className="w-6 h-6 mb-2 opacity-50" />
                      <span className="text-xs uppercase font-bold tracking-widest">{movie.title}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-sm">
                    <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(220,38,38,0.6)]">
                      <PlayCircle className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-bold truncate text-white uppercase group-hover:text-red-500 transition-colors">
                    {movie.title}
                  </h3>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wide">{movie.releaseDate?.substring(0, 4) || 'Unknown'}</span>
                    {movie.genres && movie.genres[0] && (
                      <>
                        <span className="text-gray-600 text-[10px]">•</span>
                        <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wide truncate">{movie.genres[0]}</span>
                      </>
                    )}
                  </div>
                </div>
              </motion.a>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
