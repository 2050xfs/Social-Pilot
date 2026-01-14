import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI, Type } from "@google/genai";

// --- Types ---
interface Persona {
  name: string;
  handle: string;
  strategy: string;
  hookStyle: string;
  visualAesthetic: string;
}

interface ContentItem {
  day: number;
  type: 'Reel' | 'Post' | 'Story' | 'Carousel';
  topic: string;
  hook: string;
  caption: string;
  hashtags: string[];
  visualPrompt: string;
  imageUrl?: string;
  status: 'Scheduled' | 'Posted' | 'Generating' | 'Processing';
  postedAt?: Date;
  viralScore: number; // New: Heuristic score 0-100
}

type CampaignGoal = 'Instagram Theme Page' | 'Personal Brand/Creator' | 'Product Sales' | 'B2B Marketing';

// --- App Components ---

const SocialPilot = () => {
  const [niche, setNiche] = useState('');
  const [campaignGoal, setCampaignGoal] = useState<CampaignGoal>('Instagram Theme Page');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'input' | 'research' | 'dashboard'>('input');
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [contentPlan, setContentPlan] = useState<ContentItem[]>([]);
  const [autoPilotActive, setAutoPilotActive] = useState(false);
  const [connected, setConnected] = useState(false);
  const [activeTab, setActiveTab] = useState<'calendar' | 'personas' | 'settings'>('calendar');
  const [loadingMessage, setLoadingMessage] = useState('Initializing AI engine...');
  const [selectedPost, setSelectedPost] = useState<ContentItem | null>(null);
  
  // Batch processing state
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 });

  // Simulated Simulation State
  const [simulationDay, setSimulationDay] = useState(1);
  const [nextPostTimer, setNextPostTimer] = useState(60);

  const aiRef = useRef(new GoogleGenAI({ apiKey: process.env.API_KEY }));

  // --- Auto-Pilot Logic ---
  useEffect(() => {
    let interval: any;
    if (autoPilotActive && connected) {
      interval = setInterval(() => {
        setNextPostTimer((prev) => {
          if (prev <= 1) {
            postNextPendingItem();
            return 60; 
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [autoPilotActive, connected, contentPlan]);

  const postNextPendingItem = () => {
    setContentPlan((prev) => {
      const nextItemIdx = prev.findIndex(item => item.status === 'Scheduled');
      if (nextItemIdx === -1) {
        setAutoPilotActive(false);
        return prev;
      }
      const newPlan = [...prev];
      newPlan[nextItemIdx] = { 
        ...newPlan[nextItemIdx], 
        status: 'Posted',
        postedAt: new Date()
      };
      setSimulationDay(newPlan[nextItemIdx].day + 1);
      return newPlan;
    });
  };

  const calculateViralScore = (item: any) => {
    // Sophisticated heuristic for simulation
    let score = 50;
    if (item.hook.length < 50) score += 15; // Conciseness bonus
    if (item.type === 'Reel') score += 10; // Format bonus
    if (item.hashtags.length > 5 && item.hashtags.length < 15) score += 10; // Optimal tag density
    return Math.min(score + Math.floor(Math.random() * 15), 98);
  };

  const startAnalysis = async () => {
    if (!niche.trim()) return;
    setLoading(true);
    setStep('research');
    
    try {
      setLoadingMessage(`Analyzing top competitors for ${campaignGoal} in "${niche}"...`);
      const personaResponse = await aiRef.current.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Research the top 3 successful social media personas for ${campaignGoal} in "${niche}". Analyze Strategy, Hooks, Aesthetics. JSON format.`,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                handle: { type: Type.STRING },
                strategy: { type: Type.STRING },
                hookStyle: { type: Type.STRING },
                visualAesthetic: { type: Type.STRING },
              },
              required: ["name", "handle", "strategy", "hookStyle", "visualAesthetic"]
            }
          }
        }
      });

      const researchedPersonas = JSON.parse(personaResponse.text);
      setPersonas(researchedPersonas);

      setLoadingMessage("Architecting 3-Phase Funnel Strategy...");
      const planResponse = await aiRef.current.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Create a 30-day social media plan for ${niche}. Stages: Growth (1-7), Trust (8-21), Sales (22-30). Goal: ${campaignGoal}. Context: ${JSON.stringify(researchedPersonas)}. Return JSON.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                day: { type: Type.NUMBER },
                type: { type: Type.STRING, enum: ['Reel', 'Post', 'Story', 'Carousel'] },
                topic: { type: Type.STRING },
                hook: { type: Type.STRING },
                caption: { type: Type.STRING },
                hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
                visualPrompt: { type: Type.STRING }
              },
              required: ["day", "type", "topic", "hook", "caption", "hashtags", "visualPrompt"]
            }
          }
        }
      });

      const generatedPlan = JSON.parse(planResponse.text).map((item: any) => ({
        ...item,
        status: 'Scheduled',
        viralScore: calculateViralScore(item)
      }));
      setContentPlan(generatedPlan);
      setStep('dashboard');
    } catch (error) {
      console.error(error);
      alert("Analysis failed. Try a more specific niche.");
      setStep('input');
    } finally {
      setLoading(false);
    }
  };

  const generateImage = async (index: number) => {
    const item = contentPlan[index];
    if (item.imageUrl || item.status === 'Processing') return;

    const updatedPlan = [...contentPlan];
    updatedPlan[index].status = 'Processing';
    setContentPlan(updatedPlan);

    try {
      const response = await aiRef.current.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: `Social media ${item.type} for ${niche}. Visual: ${item.visualPrompt}. Style: ${personas[0]?.visualAesthetic}` }]
        },
        config: {
          imageConfig: { aspectRatio: item.type === 'Reel' || item.type === 'Story' ? "9:16" : "1:1" }
        }
      });

      const b64 = response.candidates[0].content.parts.find(p => p.inlineData)?.inlineData?.data;
      if (b64) {
        setContentPlan(prev => {
          const final = [...prev];
          final[index].imageUrl = `data:image/png;base64,${b64}`;
          final[index].status = final[index].status === 'Posted' ? 'Posted' : 'Scheduled';
          return final;
        });
        return true;
      }
    } catch (e) {
      console.error(e);
      setContentPlan(prev => {
        const final = [...prev];
        final[index].status = 'Scheduled';
        return final;
      });
    }
    return false;
  };

  const batchGenerateImages = async () => {
    if (isBatchProcessing) return;
    const pending = contentPlan.filter(i => !i.imageUrl).map((_, i) => i).slice(0, 5);
    if (pending.length === 0) return;

    setIsBatchProcessing(true);
    setBatchProgress({ current: 0, total: pending.length });

    for (let i = 0; i < pending.length; i++) {
      const actualIndex = contentPlan.findIndex((item, idx) => !item.imageUrl && idx >= pending[i]);
      if (actualIndex !== -1) {
        await generateImage(actualIndex);
        setBatchProgress(prev => ({ ...prev, current: i + 1 }));
      }
    }
    setIsBatchProcessing(false);
  };

  const connectAccount = () => {
    setLoading(true);
    setTimeout(() => {
      setConnected(true);
      setLoading(false);
    }, 1200);
  };

  const stats = useMemo(() => {
    const posted = contentPlan.filter(i => i.status === 'Posted').length;
    const avgViralScore = Math.round(contentPlan.reduce((acc, curr) => acc + curr.viralScore, 0) / (contentPlan.length || 1));
    return { posted, remaining: contentPlan.length - posted, avgViralScore };
  }, [contentPlan]);

  if (step === 'input') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#0a0a0c] overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full -z-10 pointer-events-none opacity-20">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600 rounded-full blur-[120px]"></div>
        </div>
        
        <div className="max-w-3xl w-full">
          <div className="flex justify-center mb-8">
            <div className="accent-gradient p-4 rounded-3xl shadow-2xl shadow-indigo-500/20">
               <i className="fa-solid fa-brain text-white text-3xl"></i>
            </div>
          </div>
          <h1 className="text-6xl font-black mb-4 tracking-tight text-center uppercase">Social<span className="text-gradient">Pilot</span></h1>
          <p className="text-zinc-500 text-xl mb-12 text-center max-w-xl mx-auto font-medium">Research, strategize, and execute a 30-day viral brand on auto-pilot.</p>
          
          <div className="glass p-10 rounded-[40px] border-white/10 space-y-8">
            <div className="grid grid-cols-2 gap-4">
              {(['Instagram Theme Page', 'Personal Brand/Creator', 'Product Sales', 'B2B Marketing'] as CampaignGoal[]).map((goal) => (
                <button key={goal} onClick={() => setCampaignGoal(goal)} className={`px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest border transition-all ${campaignGoal === goal ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400' : 'bg-white/5 border-white/5 text-zinc-500 hover:bg-white/10'}`}>
                  {goal}
                </button>
              ))}
            </div>
            <div className="relative">
              <input type="text" value={niche} onChange={(e) => setNiche(e.target.value)} placeholder="Enter your niche (e.g. AI SaaS for Lawyers)..." className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-5 text-xl outline-none focus:border-indigo-500 transition-all placeholder:text-zinc-700" onKeyDown={(e) => e.key === 'Enter' && startAnalysis()} />
              <button onClick={startAnalysis} disabled={!niche.trim() || loading} className="absolute right-3 top-3 bottom-3 accent-gradient px-8 rounded-xl font-black uppercase text-xs tracking-widest hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50">Launch Engine</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'research') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050507]">
        <div className="text-center space-y-8">
          <div className="relative w-32 h-32 mx-auto">
             <div className="absolute inset-0 bg-indigo-500 rounded-full blur-3xl opacity-20 pulsing"></div>
             <svg className="w-full h-full animate-spin-slow" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                <circle cx="50" cy="50" r="45" fill="none" stroke="url(#grad1)" strokeWidth="8" strokeDasharray="200 100" />
                <defs><linearGradient id="grad1"><stop offset="0%" stopColor="#6366f1" /><stop offset="100%" stopColor="#a855f7" /></linearGradient></defs>
             </svg>
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-black uppercase tracking-tighter">{loadingMessage}</h2>
            <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-[0.2em]">Agentic processing active</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#050507] text-white selection:bg-indigo-500/30">
      {/* Sidebar */}
      <aside className="w-80 glass border-r border-white/5 flex flex-col p-8 sticky top-0 h-screen">
        <div className="flex items-center gap-4 mb-12">
          <div className="w-12 h-12 accent-gradient rounded-2xl flex items-center justify-center">
            <i className="fa-solid fa-bolt text-white text-xl"></i>
          </div>
          <div>
            <span className="font-black text-2xl tracking-tighter block leading-none uppercase">Pilot</span>
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">v2.1 Stable</span>
          </div>
        </div>

        <nav className="space-y-2 flex-grow">
          <button onClick={() => setActiveTab('calendar')} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${activeTab === 'calendar' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-zinc-500 hover:bg-white/5'}`}>
            <i className="fa-solid fa-calendar-day"></i>
            <span className="font-bold">Content Plan</span>
          </button>
          <button onClick={() => setActiveTab('personas')} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${activeTab === 'personas' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-zinc-500 hover:bg-white/5'}`}>
            <i className="fa-solid fa-dna"></i>
            <span className="font-bold">Persona DNA</span>
          </button>
          <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${activeTab === 'settings' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-zinc-500 hover:bg-white/5'}`}>
            <i className="fa-solid fa-microchip"></i>
            <span className="font-bold">System Status</span>
          </button>
        </nav>

        <div className="mt-auto space-y-6 pt-8 border-t border-white/5">
          {isBatchProcessing && (
            <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
               <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                  <span className="text-indigo-400">Batch Gen</span>
                  <span>{batchProgress.current}/{batchProgress.total}</span>
               </div>
               <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full accent-gradient transition-all duration-500" style={{ width: `${(batchProgress.current / batchProgress.total) * 100}%` }}></div>
               </div>
            </div>
          )}

          {autoPilotActive && (
            <div className="bg-indigo-500/5 rounded-2xl p-5 border border-indigo-500/20">
               <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Auto-Pilot Live</span>
                  <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></div>
               </div>
               <div className="text-sm font-black text-white">Next Post: {nextPostTimer}s</div>
            </div>
          )}

          <button onClick={() => setConnected(!connected)} className={`w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border ${connected ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
            {connected ? 'Platform Linked' : 'Connect Meta'}
          </button>
          
          <button disabled={!connected} onClick={() => setAutoPilotActive(!autoPilotActive)} className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${!connected ? 'bg-white/5 text-zinc-700' : autoPilotActive ? 'bg-red-500 text-white' : 'accent-gradient text-white shadow-xl shadow-indigo-500/20'}`}>
            {autoPilotActive ? 'Abort Mission' : 'Ignite Engine'}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow overflow-y-auto px-12 py-12">
        <header className="flex justify-between items-center mb-16">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-indigo-400 text-[10px] font-black uppercase tracking-widest">Active Project</span>
              <span className="text-zinc-700 text-xs">/</span>
              <span className="text-zinc-500 text-[10px] font-bold uppercase">{niche}</span>
            </div>
            <h2 className="text-5xl font-black tracking-tighter uppercase">Campaign Day {simulationDay}</h2>
          </div>
          <div className="flex gap-6">
             <div className="glass px-8 py-5 rounded-3xl text-center">
                <div className="text-[9px] text-zinc-600 font-black uppercase tracking-widest mb-1">Viral Potential</div>
                <div className="text-2xl font-black text-indigo-400">{stats.avgViralScore}%</div>
             </div>
             <div className="glass px-8 py-5 rounded-3xl text-center">
                <div className="text-[9px] text-zinc-600 font-black uppercase tracking-widest mb-1">Queue Health</div>
                <div className="text-2xl font-black">{stats.posted}/{contentPlan.length}</div>
             </div>
          </div>
        </header>

        {activeTab === 'calendar' && (
          <div className="space-y-12">
            <div className="flex justify-between items-center">
               <h3 className="text-xl font-black uppercase tracking-widest flex items-center gap-3">
                  <div className="w-1 h-6 bg-indigo-500"></div> 30-Day Blueprint
               </h3>
               <button onClick={batchGenerateImages} disabled={isBatchProcessing} className="text-[10px] font-black uppercase tracking-widest px-4 py-2 border border-white/10 rounded-lg hover:bg-white/5 disabled:opacity-30">
                  {isBatchProcessing ? 'Processing Batch...' : 'Batch Generate Visuals'}
               </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {contentPlan.map((item, idx) => (
                <div key={idx} onClick={() => setSelectedPost(item)} className={`glass rounded-[32px] overflow-hidden group border-white/5 hover:border-indigo-500/30 transition-all cursor-pointer ${item.status === 'Posted' ? 'opacity-50 grayscale' : ''}`}>
                  <div className="aspect-[4/5] bg-zinc-900/50 relative">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center space-y-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${item.status === 'Processing' ? 'animate-spin border-2 border-indigo-500 border-t-transparent' : 'bg-white/5 text-zinc-800'}`}>
                          {item.status !== 'Processing' && <i className="fa-solid fa-cloud-arrow-up"></i>}
                        </div>
                        <span className="text-[9px] text-zinc-700 font-black uppercase tracking-widest">Creative Engine Pending</span>
                      </div>
                    )}
                    <div className="absolute top-6 left-6 flex gap-2">
                       <span className="glass px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border-white/10">D{item.day}</span>
                       <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${item.viralScore > 80 ? 'bg-orange-500/20 text-orange-400' : 'bg-indigo-500/20 text-indigo-400'}`}>Viral {item.viralScore}%</span>
                    </div>
                  </div>
                  <div className="p-8 space-y-4">
                    <h4 className="font-black text-xl uppercase tracking-tighter line-clamp-1">{item.topic}</h4>
                    <p className="text-zinc-500 text-sm line-clamp-2 italic">"{item.hook}"</p>
                    <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                       <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600">{item.type}</span>
                       <div className="flex gap-1">
                          {[1,2,3].map(i => <div key={i} className={`w-1.5 h-1.5 rounded-full ${item.status === 'Posted' ? 'bg-green-500' : 'bg-zinc-800'}`}></div>)}
                       </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'personas' && (
          <div className="grid grid-cols-1 gap-12">
            {personas.map((p, idx) => (
              <div key={idx} className="glass rounded-[40px] p-12 flex flex-col md:flex-row gap-12 border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 accent-gradient blur-[120px] opacity-10 pointer-events-none"></div>
                <div className="w-32 h-32 accent-gradient rounded-[32px] flex items-center justify-center text-4xl font-black shadow-2xl shadow-indigo-500/20">
                  {p.name.charAt(0)}
                </div>
                <div className="flex-grow space-y-8">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-4xl font-black uppercase tracking-tighter mb-2">{p.name}</h3>
                      <div className="text-indigo-400 font-mono text-sm font-black uppercase">{p.handle}</div>
                    </div>
                    <div className="glass px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-indigo-300">Base Persona Model</div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-3">
                      <span className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">Growth Philosophy</span>
                      <p className="text-zinc-400 text-sm leading-relaxed font-medium">{p.strategy}</p>
                    </div>
                    <div className="space-y-3">
                      <span className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">Visual DNA Synthetics</span>
                      <p className="text-zinc-400 text-sm leading-relaxed font-medium">{p.visualAesthetic}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-4xl space-y-12">
            <div className="glass rounded-[40px] p-12 space-y-12 border-white/5">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400">
                    <i className="fa-solid fa-code-branch"></i>
                 </div>
                 <h3 className="text-2xl font-black uppercase tracking-tighter">Project Documentation</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="bg-white/5 p-10 rounded-[32px] border border-white/5 hover:border-indigo-500/40 transition-all cursor-pointer group">
                    <div className="text-indigo-400 mb-6 group-hover:scale-110 transition-transform"><i className="fa-solid fa-file-shield text-3xl"></i></div>
                    <h4 className="font-black uppercase tracking-widest text-sm mb-2">Mission Control</h4>
                    <p className="text-xs text-zinc-600 leading-relaxed uppercase font-bold tracking-tighter">View High-Level Vision and E2E Flow Logic</p>
                 </div>
                 <div className="bg-white/5 p-10 rounded-[32px] border border-white/5 hover:border-purple-500/40 transition-all cursor-pointer group">
                    <div className="text-purple-400 mb-6 group-hover:scale-110 transition-transform"><i className="fa-solid fa-microchip text-3xl"></i></div>
                    <h4 className="font-black uppercase tracking-widest text-sm mb-2">Engineering Roadmap</h4>
                    <p className="text-xs text-zinc-600 leading-relaxed uppercase font-bold tracking-tighter">Granular Sprints and Task Lifecycle Status</p>
                 </div>
              </div>
            </div>

            <div className="glass rounded-[40px] p-12 space-y-8 border-white/5">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-500">
                    <i className="fa-solid fa-satellite-dish"></i>
                 </div>
                 <h3 className="text-2xl font-black uppercase tracking-tighter">System Handshakes</h3>
              </div>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-8 bg-black/40 rounded-3xl border border-white/5">
                   <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center text-2xl">
                        <i className="fa-brands fa-meta text-indigo-500"></i>
                      </div>
                      <div>
                        <div className="font-black uppercase tracking-widest text-sm">Meta Graph API</div>
                        <div className="text-[10px] font-bold text-zinc-600">Simulated Tunneling Active</div>
                      </div>
                   </div>
                   <div className="text-[10px] font-black uppercase px-4 py-2 bg-green-500/10 text-green-500 rounded-lg">Operational</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Post Detail Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-black/90 backdrop-blur-2xl">
           <div className="glass w-full max-w-6xl rounded-[48px] overflow-hidden flex flex-col md:flex-row h-[85vh] border-white/10 shadow-3xl">
              <div className="md:w-1/2 bg-black flex items-center justify-center relative">
                 {selectedPost.imageUrl ? (
                   <img src={selectedPost.imageUrl} className="w-full h-full object-cover" />
                 ) : (
                   <div className="text-center space-y-6">
                      <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto text-3xl text-zinc-800">
                        <i className="fa-solid fa-image"></i>
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-700">Awaiting Asset Factory</span>
                   </div>
                 )}
                 <button onClick={() => setSelectedPost(null)} className="absolute top-10 left-10 w-14 h-14 glass rounded-full flex items-center justify-center hover:bg-white/10 text-xl">
                    <i className="fa-solid fa-arrow-left"></i>
                 </button>
              </div>
              <div className="md:w-1/2 p-16 overflow-y-auto space-y-12">
                 <div className="space-y-4">
                    <div className="flex items-center gap-4">
                       <span className="px-4 py-2 glass rounded-xl text-[10px] font-black uppercase tracking-widest text-indigo-400">Day {selectedPost.day}</span>
                       <span className="text-zinc-800">•</span>
                       <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{selectedPost.type}</span>
                       <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${selectedPost.viralScore > 80 ? 'bg-orange-500/20 text-orange-500' : 'bg-green-500/20 text-green-500'}`}>Viral Rank #{selectedPost.viralScore}</span>
                    </div>
                    <h3 className="text-5xl font-black uppercase tracking-tighter leading-none">{selectedPost.topic}</h3>
                 </div>

                 <div className="space-y-4">
                    <span className="text-[10px] text-zinc-700 font-black uppercase tracking-[0.2em]">The Psychological Hook</span>
                    <p className="text-3xl font-black leading-tight text-white italic">"{selectedPost.hook}"</p>
                 </div>

                 <div className="space-y-4">
                    <span className="text-[10px] text-zinc-700 font-black uppercase tracking-[0.2em]">Crafted Copy & Meta-Tags</span>
                    <div className="bg-white/5 rounded-[32px] p-10 text-zinc-400 leading-relaxed font-medium border border-white/5">
                       {selectedPost.caption}
                       <div className="mt-8 flex flex-wrap gap-2">
                          {selectedPost.hashtags.map(tag => <span key={tag} className="text-indigo-400 font-black text-xs">#{tag.toUpperCase()}</span>)}
                       </div>
                    </div>
                 </div>

                 <div className="pt-12 border-t border-white/5 flex gap-4">
                    <button className="flex-grow accent-gradient py-5 rounded-[24px] font-black text-xs uppercase tracking-widest">Update Strategy</button>
                    <button className="px-10 glass py-5 rounded-[24px] font-black text-xs uppercase tracking-widest text-zinc-500">Regenerate Asset</button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(<SocialPilot />);
}
