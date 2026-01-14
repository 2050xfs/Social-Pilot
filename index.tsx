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
            // Trigger "Post" event
            postNextPendingItem();
            return 60; // Reset timer for simulation (1 minute per "day" simulation)
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

  const startAnalysis = async () => {
    if (!niche.trim()) return;
    setLoading(true);
    setStep('research');
    
    try {
      setLoadingMessage(`Analyzing top competitors for ${campaignGoal} in "${niche}"...`);
      const personaResponse = await aiRef.current.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Research the top 3 most successful social media personas for a ${campaignGoal} in the niche: "${niche}". 
        Analyze their content strategy, hook styles, and visual aesthetic. 
        Format the response as JSON.`,
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

      setLoadingMessage("Architecting 30 days of high-converting content...");
      const planResponse = await aiRef.current.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Act as a world-class social media strategist. Niche: "${niche}". Goal: ${campaignGoal}. 
        Based on these personas: ${JSON.stringify(researchedPersonas)}, 
        create a 30-day viral content blueprint. 
        Ensure days 1-7 focus on growth/hooks, 8-21 on building community trust, and 22-30 on conversion/sales.
        Format as JSON list of 30 items.`,
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
        status: 'Scheduled'
      }));
      setContentPlan(generatedPlan);
      setStep('dashboard');
    } catch (error) {
      console.error("Analysis failed:", error);
      alert("Something went wrong during research. Please try a more specific niche.");
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
          parts: [{ text: `Social media ${item.type} for ${niche}. Visual: ${item.visualPrompt}. Style: ${personas[0]?.visualAesthetic || 'professional'}` }]
        },
        config: {
          imageConfig: { aspectRatio: item.type === 'Reel' || item.type === 'Story' ? "9:16" : "1:1" }
        }
      });

      const b64 = response.candidates[0].content.parts.find(p => p.inlineData)?.inlineData?.data;
      if (b64) {
        const finalPlan = [...contentPlan];
        finalPlan[index].imageUrl = `data:image/png;base64,${b64}`;
        finalPlan[index].status = item.status === 'Posted' ? 'Posted' : 'Scheduled';
        setContentPlan(finalPlan);
      }
    } catch (e) {
      console.error(e);
      const resetPlan = [...contentPlan];
      resetPlan[index].status = 'Scheduled';
      setContentPlan(resetPlan);
    }
  };

  const generateAllVisibleImages = async () => {
    const pendingIndices = contentPlan
      .map((item, idx) => item.imageUrl ? -1 : idx)
      .filter(idx => idx !== -1)
      .slice(0, 3); // Do batches of 3 for demo purposes
    
    for (const idx of pendingIndices) {
      await generateImage(idx);
    }
  };

  const connectAccount = () => {
    setLoading(true);
    setTimeout(() => {
      setConnected(true);
      setLoading(false);
    }, 1200);
  };

  // --- View Helper ---
  const stats = useMemo(() => {
    const posted = contentPlan.filter(i => i.status === 'Posted').length;
    return {
      posted,
      remaining: contentPlan.length - posted,
      progress: Math.round((posted / contentPlan.length) * 100) || 0
    };
  }, [contentPlan]);

  if (step === 'input') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#0a0a0c] overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none opacity-20">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600 rounded-full blur-[120px]"></div>
        </div>
        
        <div className="max-w-3xl w-full">
          <div className="flex justify-center mb-8">
            <div className="accent-gradient p-4 rounded-3xl shadow-2xl shadow-indigo-500/20">
               <i className="fa-solid fa-brain text-white text-3xl"></i>
            </div>
          </div>
          
          <h1 className="text-6xl font-black mb-4 tracking-tight text-center">
            Go Viral on <span className="text-gradient">Auto-Pilot</span>
          </h1>
          <p className="text-zinc-500 text-xl mb-12 text-center max-w-xl mx-auto">
            Choose your niche, set your goal, and let AI architect, design, and post your entire strategy.
          </p>
          
          <div className="glass p-8 rounded-[32px] border-white/10 space-y-8">
            <div className="grid grid-cols-2 gap-4">
              {(['Instagram Theme Page', 'Personal Brand/Creator', 'Product Sales', 'B2B Marketing'] as CampaignGoal[]).map((goal) => (
                <button
                  key={goal}
                  onClick={() => setCampaignGoal(goal)}
                  className={`px-6 py-4 rounded-2xl text-sm font-bold border transition-all ${campaignGoal === goal ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400' : 'bg-white/5 border-white/5 text-zinc-500 hover:bg-white/10'}`}
                >
                  {goal}
                </button>
              ))}
            </div>

            <div className="relative">
              <input 
                type="text" 
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                placeholder="Describe your niche (e.g. Minimalist Home Decor)..."
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-5 text-xl outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-zinc-700"
                onKeyDown={(e) => e.key === 'Enter' && startAnalysis()}
              />
              <button 
                onClick={startAnalysis}
                disabled={!niche.trim() || loading}
                className="absolute right-3 top-3 bottom-3 accent-gradient px-8 rounded-xl font-bold hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
              >
                Launch Engine
              </button>
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
                <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(99, 102, 241, 0.1)" strokeWidth="8" />
                <circle cx="50" cy="50" r="45" fill="none" stroke="url(#grad1)" strokeWidth="8" strokeDasharray="200 100" />
                <defs>
                  <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#6366f1' }} />
                    <stop offset="100%" style={{ stopColor: '#a855f7' }} />
                  </linearGradient>
                </defs>
             </svg>
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">{loadingMessage}</h2>
            <p className="text-zinc-500 font-medium">This usually takes about 20-30 seconds.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#050507] text-white">
      {/* Sidebar */}
      <aside className="w-80 glass border-r border-white/5 flex flex-col p-8 sticky top-0 h-screen">
        <div className="flex items-center gap-4 mb-12">
          <div className="w-12 h-12 accent-gradient rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <i className="fa-solid fa-paper-plane text-white text-xl"></i>
          </div>
          <div>
            <span className="font-black text-2xl tracking-tighter block leading-none">SocialPilot</span>
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">AI Engine v2.0</span>
          </div>
        </div>

        <nav className="space-y-2 flex-grow">
          <button onClick={() => setActiveTab('calendar')} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${activeTab === 'calendar' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-zinc-500 hover:bg-white/5'}`}>
            <i className="fa-solid fa-calendar-alt"></i>
            <span className="font-bold">30-Day Blueprint</span>
          </button>
          <button onClick={() => setActiveTab('personas')} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${activeTab === 'personas' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-zinc-500 hover:bg-white/5'}`}>
            <i className="fa-solid fa-users-viewfinder"></i>
            <span className="font-bold">Persona Insights</span>
          </button>
          <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${activeTab === 'settings' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-zinc-500 hover:bg-white/5'}`}>
            <i className="fa-solid fa-sliders"></i>
            <span className="font-bold">Automation</span>
          </button>
        </nav>

        <div className="mt-auto space-y-6 pt-8 border-t border-white/5">
          {autoPilotActive && (
            <div className="bg-indigo-500/5 rounded-2xl p-5 border border-indigo-500/20">
               <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-black text-indigo-400 uppercase tracking-widest">Active Simulation</span>
                  <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></div>
               </div>
               <div className="text-sm font-medium text-zinc-400">Next post in:</div>
               <div className="text-2xl font-black text-white">00:{nextPostTimer < 10 ? `0${nextPostTimer}` : nextPostTimer}</div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
               <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{connected ? 'Meta Linked' : 'Offline'}</span>
            </div>
          </div>
          
          <button 
            disabled={!connected}
            onClick={() => setAutoPilotActive(!autoPilotActive)}
            className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${!connected ? 'bg-white/5 text-zinc-700' : autoPilotActive ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'accent-gradient text-white shadow-xl shadow-indigo-500/20 hover:scale-[1.02]'}`}
          >
            {autoPilotActive ? 'Deactivate Pilot' : 'Ignite Auto-Pilot'}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow overflow-y-auto px-12 py-12">
        <header className="flex justify-between items-center mb-16">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-indigo-400 text-xs font-black uppercase tracking-widest">Workspace</span>
              <span className="text-zinc-700 text-xs">/</span>
              <span className="text-zinc-500 text-xs font-bold">{niche}</span>
            </div>
            <h2 className="text-4xl font-black tracking-tighter">Day {simulationDay} Overview</h2>
          </div>
          
          <div className="flex gap-6">
             <div className="glass px-8 py-4 rounded-[24px] text-center border-white/5">
                <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Queue Status</div>
                <div className="text-xl font-black">{stats.posted}/{contentPlan.length} <span className="text-zinc-600 text-sm">Posts</span></div>
             </div>
             <div className="glass px-8 py-4 rounded-[24px] text-center border-white/5">
                <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Global Reach</div>
                <div className="text-xl font-black text-indigo-400">+{Math.floor(stats.posted * 1.4)}K</div>
             </div>
          </div>
        </header>

        {activeTab === 'calendar' && (
          <div className="space-y-10">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold flex items-center gap-3">
                <i className="fa-solid fa-timeline text-indigo-500"></i>
                Campaign Roadmap
              </h3>
              <button 
                onClick={generateAllVisibleImages}
                className="text-xs font-black uppercase tracking-widest text-indigo-400 hover:text-white transition-colors"
              >
                Batch Generate Visuals
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {contentPlan.map((item, idx) => (
                <div 
                  key={idx} 
                  onClick={() => setSelectedPost(item)}
                  className={`glass rounded-[32px] overflow-hidden group border-white/5 hover:border-indigo-500/30 transition-all cursor-pointer ${item.status === 'Posted' ? 'opacity-80' : ''}`}
                >
                  <div className="aspect-[4/5] bg-zinc-900/50 relative">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center space-y-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${item.status === 'Processing' ? 'animate-spin border-2 border-indigo-500 border-t-transparent' : 'bg-white/5 text-zinc-700'}`}>
                          {item.status !== 'Processing' && <i className="fa-solid fa-image"></i>}
                        </div>
                        <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Pending Visual Gen</p>
                      </div>
                    )}
                    
                    <div className="absolute top-6 left-6 flex gap-2">
                       <span className="glass px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-white border-white/10">Day {item.day}</span>
                       <span className="glass px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-indigo-400 border-indigo-500/20">{item.type}</span>
                    </div>

                    {item.status === 'Posted' && (
                       <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center">
                          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-3 shadow-2xl shadow-green-500/40">
                             <i className="fa-solid fa-check text-white text-2xl"></i>
                          </div>
                          <span className="text-xs font-black uppercase tracking-widest text-green-500">Live on Instagram</span>
                       </div>
                    )}
                  </div>

                  <div className="p-8 space-y-4">
                    <h4 className="font-black text-xl leading-tight line-clamp-1">{item.topic}</h4>
                    <p className="text-zinc-500 text-sm line-clamp-2 leading-relaxed">"{item.hook}"</p>
                    
                    <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                      <div className="flex -space-x-2">
                         {[1,2,3].map(i => <div key={i} className="w-6 h-6 rounded-full border-2 border-[#050507] bg-zinc-800"></div>)}
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">{item.status}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'personas' && (
          <div className="space-y-12">
             <div className="grid grid-cols-1 gap-12">
               {personas.map((p, idx) => (
                 <div key={idx} className="glass rounded-[40px] p-12 flex flex-col md:flex-row gap-12 border-white/5">
                   <div className="w-32 h-32 accent-gradient rounded-[32px] flex items-center justify-center text-4xl font-black flex-shrink-0 shadow-2xl shadow-indigo-500/20">
                     {p.name.charAt(0)}
                   </div>
                   <div className="flex-grow space-y-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-3xl font-black mb-2">{p.name}</h3>
                          <div className="text-indigo-400 font-mono text-sm font-bold">{p.handle}</div>
                        </div>
                        <div className="glass px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest text-indigo-300 border-indigo-500/20">
                          Primary Mock Target
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                         <div className="space-y-3">
                            <span className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">Content Philosophy</span>
                            <p className="text-zinc-400 text-sm leading-relaxed font-medium">{p.strategy}</p>
                         </div>
                         <div className="space-y-3">
                            <span className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">Visual DNA</span>
                            <p className="text-zinc-400 text-sm leading-relaxed font-medium">{p.visualAesthetic}</p>
                         </div>
                      </div>

                      <div className="pt-6 flex gap-3">
                         <span className="px-4 py-2 bg-white/5 rounded-xl text-xs font-bold text-zinc-500">Hook Pattern: {p.hookStyle}</span>
                         <span className="px-4 py-2 bg-white/5 rounded-xl text-xs font-bold text-zinc-500">High Retention Factor</span>
                      </div>
                   </div>
                 </div>
               ))}
             </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-2xl">
            <div className="glass rounded-[40px] p-12 space-y-12 border-white/5">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400">
                    <i className="fa-solid fa-plug-circle-bolt"></i>
                 </div>
                 <h3 className="text-2xl font-black">Link Platforms</h3>
              </div>

              {!connected ? (
                 <div className="bg-white/5 rounded-3xl p-10 text-center space-y-6 border border-white/5">
                    <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mx-auto text-3xl text-zinc-700">
                       <i className="fa-brands fa-instagram"></i>
                    </div>
                    <div className="space-y-2">
                       <h4 className="font-bold text-xl">Instagram Integration</h4>
                       <p className="text-zinc-500 text-sm">Requires a Professional or Creator account linked to a Meta Page.</p>
                    </div>
                    <button 
                      onClick={connectAccount}
                      className="w-full bg-white text-black py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-zinc-200 transition-colors"
                    >
                      Authenticate with Meta
                    </button>
                 </div>
              ) : (
                <div className="space-y-8">
                   <div className="flex items-center justify-between p-6 glass rounded-3xl border-indigo-500/30">
                      <div className="flex items-center gap-4">
                         <i className="fa-brands fa-instagram text-3xl text-pink-500"></i>
                         <div>
                            <div className="font-bold">Instagram Creator</div>
                            <div className="text-[10px] text-green-500 font-black uppercase">Connected & Verified</div>
                         </div>
                      </div>
                      <button className="text-xs text-zinc-500 font-bold hover:text-red-500 transition-colors">Disconnect</button>
                   </div>
                   
                   <div className="space-y-6">
                      <div className="flex items-center justify-between">
                         <span className="font-bold">Auto-Image Generation</span>
                         <div className="w-12 h-6 bg-indigo-600 rounded-full relative">
                            <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1"></div>
                         </div>
                      </div>
                      <div className="flex items-center justify-between">
                         <span className="font-bold">Smart Hashtagging</span>
                         <div className="w-12 h-6 bg-indigo-600 rounded-full relative">
                            <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1"></div>
                         </div>
                      </div>
                   </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Post Detail Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-black/80 backdrop-blur-xl">
           <div className="glass w-full max-w-5xl rounded-[48px] overflow-hidden flex flex-col md:flex-row h-[80vh] border-white/10 shadow-3xl">
              <div className="md:w-1/2 bg-zinc-900 flex items-center justify-center relative">
                 {selectedPost.imageUrl ? (
                   <img src={selectedPost.imageUrl} className="w-full h-full object-cover" />
                 ) : (
                   <div className="text-center space-y-4">
                      <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                        <i className="fa-solid fa-image text-zinc-700"></i>
                      </div>
                      <span className="text-[10px] font-black uppercase text-zinc-600">Visual Missing</span>
                   </div>
                 )}
                 <button onClick={() => setSelectedPost(null)} className="absolute top-8 left-8 w-12 h-12 glass rounded-full flex items-center justify-center hover:bg-white/10">
                    <i className="fa-solid fa-xmark"></i>
                 </button>
              </div>
              <div className="md:w-1/2 p-12 overflow-y-auto space-y-10">
                 <div className="space-y-2">
                    <div className="flex gap-2">
                       <span className="text-indigo-400 text-xs font-black uppercase">Day {selectedPost.day}</span>
                       <span className="text-zinc-700 text-xs font-bold">•</span>
                       <span className="text-zinc-500 text-xs font-bold uppercase">{selectedPost.type}</span>
                    </div>
                    <h3 className="text-4xl font-black tracking-tight">{selectedPost.topic}</h3>
                 </div>

                 <div className="space-y-4">
                    <span className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">Hook</span>
                    <p className="text-2xl font-bold leading-tight text-indigo-400">"{selectedPost.hook}"</p>
                 </div>

                 <div className="space-y-4">
                    <span className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">Caption & Tags</span>
                    <div className="bg-white/5 rounded-3xl p-6 text-zinc-400 leading-relaxed text-sm italic">
                       {selectedPost.caption}
                       <div className="mt-4 text-indigo-400 not-italic font-bold">
                          {selectedPost.hashtags.map(tag => `#${tag} `)}
                       </div>
                    </div>
                 </div>

                 <div className="pt-8 border-t border-white/5 flex gap-4">
                    <button className="flex-grow accent-gradient py-4 rounded-2xl font-black text-sm uppercase tracking-widest">Save Changes</button>
                    <button className="px-8 glass py-4 rounded-2xl font-black text-sm uppercase tracking-widest text-zinc-500">Regenerate</button>
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
