import { useState, useEffect } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut, User } from 'firebase/auth';
import { db, auth } from '../lib/firebase';
import { TMDBMovie } from '../types';
import { Film, LogOut, Plus, Search, Loader2 } from 'lucide-react';

export default function Admin() {
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  
  const [tmdbInput, setTmdbInput] = useState('');
  const [streamLink, setStreamLink] = useState('');
  
  const [isSearching, setIsSearching] = useState(false);
  const [movieData, setMovieData] = useState<TMDBMovie | null>(null);
  const [searchError, setSearchError] = useState('');
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const extractTmdbId = (input: string) => {
    // Matches ID from a URL like https://www.themoviedb.org/movie/550-fight-club or just the ID "550"
    const match = input.match(/(?:movie\/)(\d+)/);
    if (match && match[1]) return match[1];
    if (/^\d+$/.test(input.trim())) return input.trim();
    return null;
  };

  const searchMovie = async () => {
    const id = extractTmdbId(tmdbInput);
    if (!id) {
      setSearchError("Could not extract TMDB ID. Ensure you paste a valid ID or TMDB URL.");
      return;
    }

    setIsSearching(true);
    setSearchError('');
    setMovieData(null);
    setSaveSuccess(false);

    try {
      const res = await fetch(`/api/tmdb/movie/${id}`);
      if (!res.ok) {
        let msg = "Failed to fetch from TMDB";
        try {
          const errData = await res.json();
          if (errData.error) msg = errData.error;
        } catch(e) {}
        throw new Error(msg);
      }
      const data: TMDBMovie = await res.json();
      setMovieData(data);
    } catch (err: any) {
      setSearchError(err.message || 'Error finding movie.');
    } finally {
      setIsSearching(false);
    }
  };

  const saveMovie = async () => {
    if (!movieData || !streamLink.trim() || !user) return;
    
    setIsSaving(true);
    try {
      const movieId = movieData.id.toString();
      const movieDoc = {
        tmdbId: movieId,
        title: movieData.title,
        overview: movieData.overview,
        posterPath: movieData.poster_path,
        backdropPath: movieData.backdrop_path,
        releaseDate: movieData.release_date,
        genres: movieData.genres?.map(g => g.name) || [],
        streamLink: streamLink.trim(),
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      
      await setDoc(doc(db, 'movies', movieId), movieDoc);
      setSaveSuccess(true);
      setTmdbInput('');
      setStreamLink('');
      setMovieData(null);
    } catch (err) {
      console.error("Error saving to Firestore", err);
      alert("Failed to save movie. Check console for details.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loadingAuth) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto mt-24 bg-zinc-900/90 border border-white/10 p-8 rounded-xl shadow-2xl backdrop-blur-xl text-center space-y-6 relative z-10">
        <div className="w-12 h-12 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/30 shadow-[0_0_15px_rgba(220,38,38,0.2)]">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
        </div>
        <div>
            <h4 className="text-xs font-bold text-red-500 uppercase tracking-widest mb-1">Admin Panel</h4>
            <h1 className="text-2xl font-black italic tracking-tighter text-white">AUTHENTICATE</h1>
        </div>
        <p className="text-[11px] text-gray-500 uppercase tracking-widest">Secure access required to modify database.</p>
        <button
          onClick={handleLogin}
          className="w-full bg-white text-black font-bold py-3 rounded text-xs hover:bg-neutral-200 transition-colors uppercase tracking-widest flex items-center justify-center gap-2"
        >
          Proceed with Google
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 space-y-8 pb-12 relative z-10">
      <div className="flex items-end justify-between pb-6 border-b border-white/10">
        <div>
          <h4 className="text-xs font-bold text-red-500 uppercase tracking-widest mb-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            Admin Panel
          </h4>
          <h1 className="text-3xl font-black italic tracking-tighter text-white">DATA ENTRY</h1>
          <p className="text-xs text-gray-500 font-mono mt-2 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"></span> ID: {user.email}</p>
        </div>
        <button 
          onClick={() => signOut(auth)}
          className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-white px-3 py-1.5 rounded border border-white/10 hover:bg-white/10 transition-colors"
        >
          <LogOut className="w-3 h-3" />
          Terminate Session
        </button>
      </div>

      <div className="space-y-6">
        {/* Step 1: TMDB Fetch */}
        <div className="bg-zinc-900/50 border border-white/10 p-6 rounded-xl shadow-xl backdrop-blur-sm space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-white flex items-center gap-2">
            <span className="px-1.5 py-0.5 bg-white/10 rounded text-[9px]">STEP 1</span>
            Import from TMDB
          </h2>
          
          <div className="flex gap-2 flex-col sm:flex-row">
            <input
              type="text"
              value={tmdbInput}
              onChange={(e) => setTmdbInput(e.target.value)}
              placeholder="ENTER TMDB ID OR URL..."
              className="flex-1 bg-black/40 border border-white/10 rounded px-4 py-2 text-xs focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all font-mono placeholder-gray-600 text-white"
            />
            <button
              onClick={searchMovie}
              disabled={isSearching || !tmdbInput.trim()}
              className="px-6 py-2 bg-white/10 hover:bg-white/20 border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded font-bold text-[10px] uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
            >
              {isSearching ? <Loader2 className="w-3 h-3 animate-spin text-white" /> : <Search className="w-3 h-3" />}
              Fetch Data
            </button>
          </div>
          {searchError && <p className="text-red-500 text-[10px] uppercase font-bold tracking-wide">{searchError}</p>}
        </div>

        {/* Step 2: Stream Link & Preview */}
        {movieData && (
          <div className="bg-zinc-900 border border-white/10 p-6 rounded-xl shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-500 relative overflow-hidden flex flex-col gap-6">
            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
              {movieData.backdrop_path && (
                <img src={`https://image.tmdb.org/t/p/w780${movieData.backdrop_path}`} className="w-full h-full object-cover blur-md" alt="" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/80 to-transparent"></div>
            </div>

            <div className="relative z-10 flex gap-6">
              {movieData.poster_path ? (
                <div className="w-24 shrink-0 rounded overflow-hidden border border-white/10 shadow-lg">
                  <img src={`https://image.tmdb.org/t/p/w200${movieData.poster_path}`} alt="Poster" className="w-full h-auto" />
                </div>
              ) : (
                <div className="w-24 shrink-0 aspect-[2/3] bg-black/50 border border-white/10 rounded flex items-center justify-center"><Film className="w-6 h-6 text-gray-700"/></div>
              )}
              <div className="space-y-3">
                <div>
                    <h3 className="text-xl font-black italic tracking-tighter uppercase text-white">{movieData.title}</h3>
                    <p className="text-[10px] text-gray-400 font-mono">{movieData.release_date?.substring(0,4)} • ID: {movieData.id}</p>
                </div>
                <p className="text-[11px] text-gray-300 leading-relaxed font-sans max-w-lg line-clamp-3">{movieData.overview}</p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {movieData.genres?.map(g => (
                    <span key={g.id} className="text-[9px] font-bold uppercase tracking-widest bg-white/10 border border-white/10 px-2 py-0.5 rounded text-gray-300">{g.name}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative z-10 h-px w-full bg-white/10" />

            <div className="relative z-10 space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-widest text-white flex items-center gap-2">
                <span className="px-1.5 py-0.5 bg-red-600/20 text-red-500 rounded text-[9px] border border-red-500/20">STEP 2</span>
                Streaming Link
              </h2>
              <input
                type="url"
                value={streamLink}
                onChange={(e) => setStreamLink(e.target.value)}
                placeholder="HTTPS://..."
                className="w-full bg-black/60 border border-white/10 rounded px-4 py-3 text-sm focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all font-mono placeholder-gray-600 text-white"
              />
            </div>

            <button
              onClick={saveMovie}
              disabled={isSaving || !streamLink.trim()}
              className="relative z-10 w-full py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded font-black text-xs transition-colors shadow-[0_0_20px_rgba(220,38,38,0.4)] uppercase tracking-widest flex items-center justify-center gap-2"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Plus className="w-4 h-4" />}
              Publish to Database
            </button>
          </div>
        )}

        {saveSuccess && (
          <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-400 rounded text-[10px] uppercase font-bold tracking-widest text-center shadow-[0_0_15px_rgba(34,197,94,0.1)] relative z-10">
            Entry added successfully. Database synchronized.
          </div>
        )}
      </div>
    </div>
  );
}
