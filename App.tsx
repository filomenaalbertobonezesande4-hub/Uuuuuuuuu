
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, Upload, Search, History, Loader2, Sparkles, Utensils, X, Image as ImageIcon, AlertTriangle, ChevronRight, ShieldCheck } from 'lucide-react';
import { analyzeFood } from './services/geminiService';
import { FoodAnalysisResult, AnalysisHistoryItem } from './types';
import AnalysisResult from './components/AnalysisResult';

// 20 Sugestões de alimentos padrão para o usuário explorar
const DEFAULT_FOOD_EXAMPLES = [
  { name: 'Maçã Gala', image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&h=400&fit=crop' },
  { name: 'Pizza Margherita', image: 'https://images.unsplash.com/photo-1574071318508-1cdbad80ad38?w=400&h=400&fit=crop' },
  { name: 'Salada Caesar', image: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=400&h=400&fit=crop' },
  { name: 'Sushi Combo', image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&h=400&fit=crop' },
  { name: 'Hambúrguer Gourmet', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=400&fit=crop' },
  { name: 'Macarrão Carbonara', image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400&h=400&fit=crop' },
  { name: 'Salmão Grelhado', image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=400&fit=crop' },
  { name: 'Abacate com Ovo', image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400&h=400&fit=crop' },
  { name: 'Omelete de Espinafre', image: 'https://images.unsplash.com/photo-1510629954389-c1e0da47d4ec?w=400&h=400&fit=crop' },
  { name: 'Smoothie de Frutas', image: 'https://images.unsplash.com/photo-1502741224143-90386d7f8c82?w=400&h=400&fit=crop' },
  { name: 'Croissant Recheado', image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&h=400&fit=crop' },
  { name: 'Picanha com Fritas', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=400&fit=crop' },
  { name: 'Tacos Mexicanos', image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=400&h=400&fit=crop' },
  { name: 'Açaí na Tigela', image: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400&h=400&fit=crop' },
  { name: 'Ramen Shoyu', image: 'https://images.unsplash.com/photo-1552611052-33e04de081de?w=400&h=400&fit=crop' },
  { name: 'Curry de Frango', image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&h=400&fit=crop' },
  { name: 'Iogurte com Granola', image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=400&fit=crop' },
  { name: 'Quinoa com Legumes', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=400&fit=crop' },
  { name: 'Panquecas de Mel', image: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=400&h=400&fit=crop' },
  { name: 'Salada de Frutas', image: 'https://images.unsplash.com/photo-1519996529931-28324d5a630e?w=400&h=400&fit=crop' },
];

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<FoodAnalysisResult | null>(null);
  const [history, setHistory] = useState<AnalysisHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [inputImage, setInputImage] = useState<string | null>(null);
  const [textQuery, setTextQuery] = useState('');
  const [cycleIndex, setCycleIndex] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Efeito para rotacionar a imagem de exemplo no card de câmera
  useEffect(() => {
    const interval = setInterval(() => {
      setCycleIndex((prev) => (prev + 1) % DEFAULT_FOOD_EXAMPLES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleAnalysis = async (img?: string, query?: string) => {
    setLoading(true);
    setError(null);
    try {
      const analysisResult = await analyzeFood(img, query);
      setResult(analysisResult);
      
      const newItem: AnalysisHistoryItem = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        image: img,
        result: analysisResult
      };
      setHistory(prev => [newItem, ...prev].slice(0, 20));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro inesperado.");
    } finally {
      setLoading(false);
    }
  };

  const onFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const b64 = event.target?.result as string;
        setInputImage(b64);
        handleAnalysis(b64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (textQuery.trim()) {
      handleAnalysis(undefined, textQuery);
    }
  };

  const clearResults = () => {
    setResult(null);
    setInputImage(null);
    setTextQuery('');
    setError(null);
  };

  return (
    <div className="min-h-screen pb-20 md:pb-8 bg-slate-50/50">
      {/* Navigation Header */}
      <nav className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 cursor-pointer flex-shrink-0" onClick={clearResults}>
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <Utensils className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg text-slate-800 tracking-tight hidden sm:block">NutriLens<span className="text-indigo-600">AI</span></span>
          </div>

          {/* Global Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-lg relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            </div>
            <input
              type="text"
              value={textQuery}
              onChange={(e) => setTextQuery(e.target.value)}
              placeholder="Pesquise qualquer alimento..."
              className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-full bg-slate-100/50 text-sm text-black placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-transparent transition-all"
            />
          </form>

          <button 
            onClick={() => setShowHistory(!showHistory)}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors relative flex-shrink-0"
          >
            <History className="w-6 h-6 text-slate-600" />
            {history.length > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-indigo-500 rounded-full border-2 border-white" />
            )}
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 pt-4">
        {!result && !loading && (
          <div className="space-y-8 animate-in fade-in duration-700">
            
            {/* Health Director Hero Image Section */}
            <div className="relative w-full h-[400px] md:h-[500px] rounded-[40px] overflow-hidden shadow-2xl group">
              <img 
                src="https://images.unsplash.com/photo-1559839734-2b71f15367ef?q=80&w=2070&auto=format&fit=crop" 
                alt="Diretor de Saúde" 
                className="w-full h-full object-cover object-top transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent flex flex-col justify-end p-8 md:p-16">
                <div className="max-w-xl space-y-4">
                  <div className="flex items-center gap-2 bg-indigo-600/90 text-white px-3 py-1 rounded-full text-xs font-black w-fit uppercase tracking-widest backdrop-blur-sm">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Direção Técnica de Saúde
                  </div>
                  <h1 className="text-4xl md:text-6xl font-black text-white leading-tight">
                    Comer bem é a sua <span className="text-indigo-400">melhor decisão.</span>
                  </h1>
                  <p className="text-lg md:text-xl text-slate-200 font-medium">
                    "Nossa missão é usar tecnologia de ponta para traduzir a complexidade nutricional em saúde real para o seu dia a dia."
                  </p>
                  <div className="pt-4 flex items-center gap-4">
                    <div className="h-10 w-1 bg-indigo-500 rounded-full"></div>
                    <div className="text-white">
                      <p className="font-bold text-lg">Dr. Carlos Alberto</p>
                      <p className="text-indigo-300 text-sm font-semibold uppercase">Diretor de Estratégia Nutricional</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="max-w-4xl mx-auto space-y-8">
              {/* Main Action Cards */}
              <div className="grid md:grid-cols-2 gap-6">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="group relative h-48 bg-white rounded-3xl border-2 border-dashed border-slate-200 hover:border-indigo-400 hover:shadow-xl hover:shadow-indigo-100 transition-all overflow-hidden flex flex-col items-center justify-center p-6 text-center"
                >
                  <div className="absolute inset-0 z-0 opacity-10 group-hover:opacity-20 transition-opacity duration-700">
                    <img 
                      src={DEFAULT_FOOD_EXAMPLES[cycleIndex].image} 
                      alt="Food preview" 
                      className="w-full h-full object-cover transition-all duration-1000 scale-105 group-hover:scale-110"
                    />
                  </div>
                  
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 shadow-lg shadow-indigo-200 transition-transform">
                      <Camera className="w-7 h-7" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-1">Escaneie com Foto</h3>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Câmera ou Galeria</p>
                  </div>

                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={onFileUpload}
                  />
                </button>

                <div className="h-48 bg-white rounded-3xl border border-slate-200 p-6 flex flex-col relative overflow-hidden group hover:border-amber-200 transition-all shadow-sm">
                  <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Search className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-1">Busca Direta</h3>
                  <p className="text-xs text-slate-500 mb-3 font-medium uppercase tracking-wider">Digite ingredientes ou pratos</p>
                  <form onSubmit={handleSearch} className="relative mt-auto">
                    <input 
                      type="text" 
                      value={textQuery}
                      onChange={(e) => setTextQuery(e.target.value)}
                      placeholder="Ex: Risoto de cogumelos..."
                      className="w-full h-11 bg-slate-100 border-none rounded-xl pl-4 pr-12 text-sm text-black font-semibold focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-inner"
                    />
                    <button 
                      type="submit"
                      className="absolute right-1.5 top-1.5 w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center hover:bg-indigo-700 transition-colors shadow-lg"
                    >
                      <Sparkles className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </div>

              {/* Suggestions Section - 20 Default Examples */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <Utensils className="w-5 h-5 text-indigo-500" />
                    Explorar Base de Alimentos
                  </h2>
                  <span className="text-xs text-slate-500 font-bold bg-slate-100 px-3 py-1 rounded-full border border-slate-200">20 SUGESTÕES</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {DEFAULT_FOOD_EXAMPLES.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setTextQuery(item.name);
                        handleAnalysis(undefined, item.name);
                      }}
                      className="group flex flex-col items-center gap-2 p-2 bg-white rounded-2xl border border-slate-100 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-100 transition-all text-center"
                    >
                      <div className="w-full aspect-square rounded-xl overflow-hidden bg-slate-100 relative shadow-sm">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                          <ChevronRight className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity translate-x-1 group-hover:translate-x-0" />
                        </div>
                      </div>
                      <span className="text-xs font-bold text-slate-700 truncate w-full px-1">{item.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-4xl mx-auto">
          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-24 space-y-6">
              <div className="relative">
                <div className="absolute inset-0 rounded-full border-4 border-indigo-100 animate-pulse"></div>
                <Loader2 className="w-16 h-16 text-indigo-600 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Utensils className="w-6 h-6 text-indigo-400" />
                </div>
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-bold text-slate-800">Analisando sua escolha...</h2>
                <p className="text-slate-500 mt-1 max-w-xs mx-auto text-sm">Nossa inteligência artificial está processando cada detalhe nutricional para você.</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 p-6 rounded-2xl flex items-start gap-4 animate-in slide-in-from-top duration-300">
              <div className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                <X className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-red-800">Não foi possível completar</h3>
                <p className="text-red-600 mt-1 text-sm font-medium">{error}</p>
                <button 
                  onClick={clearResults}
                  className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-bold hover:bg-red-200 transition-colors"
                >
                  Tentar novamente
                </button>
              </div>
            </div>
          )}

          {/* Results Page */}
          {result && !loading && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-500">
              <div className="flex items-center justify-between mb-2">
                <button 
                  onClick={clearResults}
                  className="text-slate-500 hover:text-slate-800 font-bold flex items-center gap-2 text-sm group bg-white px-4 py-2 rounded-full border border-slate-200 transition-all shadow-sm"
                >
                  <X className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                  Nova Análise
                </button>
                <div className="flex gap-2">
                  <button 
                     onClick={() => window.print()}
                     className="px-4 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors text-sm font-bold shadow-lg shadow-indigo-100"
                  >
                    Exportar Relatório
                  </button>
                </div>
              </div>
              <AnalysisResult result={result} imageUrl={inputImage || undefined} />
            </div>
          )}
        </div>
      </main>

      {/* History Drawer */}
      {showHistory && (
        <>
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity"
            onClick={() => setShowHistory(false)}
          />
          <aside className="fixed right-0 top-0 h-full w-full max-w-sm bg-white z-50 shadow-2xl animate-in slide-in-from-right duration-300">
            <div className="p-6 h-full flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                  <History className="w-6 h-6 text-indigo-600" />
                  Histórico
                </h2>
                <button onClick={() => setShowHistory(false)} className="p-2 hover:bg-slate-100 rounded-full">
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                {history.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 opacity-60">
                    <History className="w-12 h-12 mb-4" />
                    <p className="font-bold">Sem análises recentes.</p>
                  </div>
                ) : (
                  history.map((item) => (
                    <button 
                      key={item.id}
                      onClick={() => {
                        setResult(item.result);
                        setInputImage(item.image || null);
                        setShowHistory(false);
                      }}
                      className="w-full bg-slate-50 p-3 rounded-2xl flex items-center gap-4 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 transition-all group shadow-sm"
                    >
                      <div className="w-14 h-14 bg-slate-200 rounded-xl overflow-hidden flex-shrink-0">
                        {item.image ? (
                          <img src={item.image} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-400">
                            <ImageIcon className="w-6 h-6" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 text-left overflow-hidden">
                        <h4 className="font-bold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">
                          {item.result.foodName}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold uppercase tracking-tighter">
                          <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300" />
                          <span className="text-orange-600">{item.result.calories} kcal</span>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
              
              {history.length > 0 && (
                <button 
                  onClick={() => setHistory([])}
                  className="mt-4 w-full py-3 border border-slate-200 rounded-xl text-slate-500 font-bold hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-colors"
                >
                  Limpar Histórico
                </button>
              )}
            </div>
          </aside>
        </>
      )}

      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #e2e8f0;
          border-radius: 20px;
        }
      `}</style>
    </div>
  );
};

export default App;
