import { Routes, Route, Link } from "react-router-dom";
import { Film, Settings } from "lucide-react";
import Home from "./pages/Home";
import Admin from "./pages/Admin";

export default function App() {
  return (
    <div className="w-full min-h-screen bg-[#050505] text-white flex flex-col font-sans selection:bg-red-600/30 overflow-x-hidden">
      <header className="h-16 flex items-center justify-between px-4 md:px-8 border-b border-white/10 shrink-0 bg-black/40 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center shadow-[0_0_15px_rgba(220,38,38,0.5)]">
              <Film className="w-5 h-5 text-white" fill="currentColor" />
            </div>
            <span className="text-xl font-bold tracking-tighter">STREAM<span className="text-red-600">IX</span></span>
          </Link>
        </div>
        <nav className="flex items-center gap-6">
          <Link 
            to="/admin" 
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest bg-white/10 px-4 py-2 rounded border border-white/10 hover:bg-white/20 transition-colors"
          >
            <Settings className="w-4 h-4" />
            Admin
          </Link>
        </nav>
      </header>

      <main className="flex-1 relative flex flex-col pt-8">
        <div className="absolute inset-0 z-0 pointer-events-none fixed">
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent z-10"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-transparent to-transparent z-10"></div>
        </div>
        <div className="relative z-20 w-full max-w-7xl mx-auto flex-1 pb-16">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
        </div>
      </main>
      
      <footer className="h-8 px-4 md:px-8 border-t border-white/5 flex items-center justify-between text-[10px] text-gray-500 uppercase tracking-widest bg-[#050505]/90 mt-auto relative z-20 shrink-0 select-none">
        <div className="flex gap-6">
          <span>v1.0.0 Stable</span>
          <span>Cloud Sync: Active</span>
        </div>
        <div className="flex gap-6 hidden sm:flex">
          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Firebase connected</span>
          <span>TMDB API Ready</span>
        </div>
      </footer>
    </div>
  );
}
