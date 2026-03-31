import { useState, useEffect } from 'react';
import { CheckCircle, PlayCircle, Download, Calculator, Lock, LayoutDashboard, ChevronRight, Award, Trophy, Check, Settings, Save, AlertTriangle, Edit3 } from 'lucide-react';

import defaultData from './data.json';

// Types
type ProjectData = {
  id: number;
  name: string;
  time: string;
  cost: string;
  videoUrl: string;
  materials: string[];
};

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // We initialize the App with data coming from the src/data.json file.
  // During run-time, the Admin can change this state, but to persist they MUST click "Exportar Atualização"
  // And upload the file to GitHub.
  const [appData, setAppData] = useState<ProjectData[]>(defaultData.projects);

  // User Local Progress Tracking (Saved in localStorage on their browser)
  // Maps projectId -> array of booleans matching materials Checklist
  const [progressData, setProgressData] = useState<Record<string, boolean[]>>({});

  const [adminClickCount, setAdminClickCount] = useState(0);

  // Initialize progress arrays based on the loaded data length
  useEffect(() => {
    const saved = localStorage.getItem('rural_progress');
    const initialProgress: Record<string, boolean[]> = {};
    
    appData.forEach(p => {
       initialProgress[p.id.toString()] = new Array(p.materials.length).fill(false);
    });

    if (saved) {
       const parsed = JSON.parse(saved);
       // Merge saved with new data structure in case Admin added new materials
       appData.forEach(p => {
          const id = p.id.toString();
          if (parsed[id]) {
             // Keep existing truthy values up to the new length
             initialProgress[id] = initialProgress[id].map((_, i) => parsed[id][i] || false);
          }
       });
    }
    setProgressData(initialProgress);
  }, [appData]);

  // Save Progress to Local Storage whenever it changes
  useEffect(() => {
    if (Object.keys(progressData).length > 0) {
       localStorage.setItem('rural_progress', JSON.stringify(progressData));
    }
  }, [progressData]);

  const handleToggleChecklist = (projectId: string, index: number) => {
    setProgressData(prev => {
      const newArray = [...prev[projectId]];
      newArray[index] = !newArray[index];
      return { ...prev, [projectId]: newArray };
    });
  };

  const getProjProgress = (id: number) => {
    const arr = progressData[id.toString()];
    if (!arr || arr.length === 0) return 0;
    return Math.round((arr.filter(Boolean).length / arr.length) * 100);
  };

  const totalTasks = Object.values(progressData).flat().length || 1;
  const completedTasks = Object.values(progressData).flat().filter(Boolean).length;
  const globalProgress = Math.round((completedTasks / totalTasks) * 100);

  // Secret Admin Login trigger (Click avatar 5 times)
  const handleAvatarClick = () => {
     if (adminClickCount + 1 >= 5) {
        setActiveTab('admin');
        setAdminClickCount(0);
     } else {
        setAdminClickCount(prev => prev + 1);
     }
  };
  
  return (
    <div className="min-h-screen flex bg-[#0a0f0a] text-zinc-100 font-dmsans selection:bg-brand/30">
      {/* Sidebar - Desktop Only */}
      <aside className="w-64 bg-surface-1 border-r border-white/5 flex-col hidden md:flex h-screen sticky top-0 shrink-0">
        <div className="p-6 border-b border-white/5">
          <h1 className="text-xl font-sora font-bold text-brand">5 Projetos Rurais</h1>
          <p className="text-xs text-zinc-400 mt-1">Área de Membros Premium</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
          <NavItem active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard size={20} />} label="Visão Geral" />
          <div className="pt-6 pb-2">
            <p className="px-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Aulas & Projetos</p>
          </div>
          {appData.map(p => (
            <NavItem key={p.id} active={activeTab === `proj-${p.id}`} onClick={() => setActiveTab(`proj-${p.id}`)} icon={<PlayCircle size={20} />} label={p.name} />
          ))}
          <div className="pt-6 pb-2">
            <p className="px-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Ferramentas extras</p>
          </div>
          <NavItem active={activeTab === 'calculator'} onClick={() => setActiveTab('calculator')} icon={<Calculator size={20} />} label="Calculadora de Custo" />
          <NavItem active={activeTab === 'downloads'} onClick={() => setActiveTab('downloads')} icon={<Download size={20} />} label="Baixar Plantas (PDF)" />
          <div className="pt-6 pb-2">
            <p className="px-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Conquistas</p>
          </div>
          <NavItem active={activeTab === 'certificate'} onClick={() => setActiveTab('certificate')} icon={<Award size={20} />} label="Certificado" />
          
          {/* Secret Admin Menu Item if they are on Admin tab */}
          {activeTab === 'admin' && (
             <div className="pt-6">
                <NavItem active={true} onClick={() => {}} icon={<Settings size={20} />} label="Modo Administrador" />
             </div>
          )}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen min-w-0">
         {/* Top Header */}
         <header className="h-16 border-b border-white/5 bg-surface-1/80 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between px-4 sm:px-8">
            <div className="flex items-center text-xs sm:text-sm text-zinc-400">
              <span className="font-semibold text-zinc-200 hidden sm:block">Progresso Global:</span>
              <div className="ml-0 sm:ml-4 w-24 sm:w-48 h-2 sm:h-2.5 bg-zinc-800 rounded-full overflow-hidden border border-white/5 relative">
                 <div className="h-full bg-gradient-to-r from-brand-dark to-brand transition-all duration-500" style={{ width: `${globalProgress}%` }} />
                 {globalProgress === 100 && <span className="absolute inset-0 bg-white/20 animate-pulse"></span>}
              </div>
              <span className={`ml-3 font-medium transition-colors ${globalProgress === 100 ? 'text-brand drop-shadow-[0_0_10px_rgba(139,195,74,0.8)]' : 'text-zinc-300'}`}>{globalProgress}%</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden sm:flex px-3 py-1 rounded-full bg-[#FFD700]/10 text-[#FFD700] text-xs font-bold border border-[#FFD700]/20 items-center gap-1">
                 ★ PREMIUM
              </span>
              <button 
                onClick={handleAvatarClick} 
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-surface-3 flex items-center justify-center border border-white/10 text-sm hover:scale-105 transition-transform"
                title="Avatar (Clique secreto para Admin)"
              >👤</button>
            </div>
         </header>

         {/* Content Area */}
         {/* Paddings reduced for mobile (p-4) vs desktop (p-8) */}
         <div className="flex-1 overflow-auto p-4 sm:p-8">
            <div className="max-w-5xl mx-auto pb-24 sm:pb-8">
               {activeTab === 'dashboard' && <DashboardView projects={appData} onNavigate={(id: number) => setActiveTab(`proj-${id}`)} getProjProgress={getProjProgress} />}
               {activeTab === 'calculator' && <CalculatorView projects={appData} />}
               {activeTab === 'downloads' && <DownloadsView />}
               {activeTab === 'certificate' && <CertificateView progress={globalProgress} />}
               {activeTab === 'admin' && <AdminDashboardView projects={appData} onUpdateProjects={setAppData} />}
               {activeTab.startsWith('proj-') && progressData[activeTab.replace('proj-', '')] && (
                  <ProjectDetailView 
                     project={appData.find(p => p.id.toString() === activeTab.replace('proj-', ''))!} 
                     progress={progressData[activeTab.replace('proj-', '')]} 
                     onToggle={(idx: number) => handleToggleChecklist(activeTab.replace('proj-', ''), idx)} 
                  />
               )}
            </div>
         </div>
         
         {/* Mobile Nav (Bottom Bar) */}
         <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-surface-1 border-t border-white/5 flex items-center justify-around z-50">
             <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center justify-center w-16 h-full ${activeTab === 'dashboard' ? 'text-brand' : 'text-zinc-500'}`}>
                 <LayoutDashboard size={20} />
                 <span className="text-[10px] mt-1 font-medium">Início</span>
             </button>
             <button onClick={() => setActiveTab('proj-1')} className={`flex flex-col items-center justify-center w-16 h-full ${activeTab.startsWith('proj-') ? 'text-brand' : 'text-zinc-500'}`}>
                 <PlayCircle size={20} />
                 <span className="text-[10px] mt-1 font-medium">Aulas</span>
             </button>
             <button onClick={() => setActiveTab('calculator')} className={`flex flex-col items-center justify-center w-16 h-full ${activeTab === 'calculator' ? 'text-brand' : 'text-zinc-500'}`}>
                 <Calculator size={20} />
                 <span className="text-[10px] mt-1 font-medium">Custos</span>
             </button>
         </div>
      </main>
    </div>
  );
}

// ==========================================
// Reusable Components
// ==========================================
function NavItem({ active, icon, label, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${active ? 'bg-brand/10 text-brand' : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'}`}
    >
      {icon}
      {label}
    </button>
  );
}

// ==========================================
// Views
// ==========================================

function DashboardView({ projects, onNavigate, getProjProgress }: { projects: ProjectData[], onNavigate: (id: number) => void, getProjProgress: (id: number) => number }) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="inline-block px-3 py-1 bg-brand/10 text-brand rounded-full text-xs font-semibold mb-3 sm:mb-4 border border-brand/20">
         SEU CANTEIRO DE OBRAS
      </div>
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-sora font-bold mb-3 tracking-tight">Bem-vindo, Construtor! 🏗️</h2>
      <p className="text-zinc-400 mb-8 sm:mb-10 text-sm sm:text-lg max-w-2xl leading-relaxed">Escolha um projeto abaixo para começar as aulas. Seu progresso é salvo instantaneamente em cada etapa da construção.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {projects.map((proj) => {
          const progress = getProjProgress(proj.id);
          const isDone = progress === 100;
          return (
          <div key={proj.id} onClick={() => onNavigate(proj.id)} className={`glass-panel p-5 sm:p-6 cursor-pointer hover:border-brand/40 transition-all duration-300 group hover:shadow-[0_8px_30px_rgba(139,195,74,0.05)] md:hover:-translate-y-1 relative overflow-hidden ${isDone ? 'border-brand/30 bg-brand/5' : ''}`}>
            {isDone && <div className="absolute top-0 right-0 w-16 h-16 bg-brand/20 rounded-bl-full translate-x-8 -translate-y-8 flex items-end justify-start pb-4 pl-4 text-brand"><Award size={16}/></div>}
            
            <div className="flex items-start justify-between mb-5 relative z-10">
              <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl border border-white/5 flex items-center justify-center text-xl sm:text-2xl group-hover:scale-110 transition-all duration-300 shadow-inner ${isDone ? 'bg-brand/20' : 'bg-surface-2 group-hover:bg-brand/10'}`}>
                {proj.id === 1 ? '🐔' : proj.id === 2 ? '🌱' : proj.id === 3 ? '🌿' : proj.id === 4 ? '♻️' : '☀️'}
              </div>
              <div className={`text-xs font-bold flex items-center gap-1.5 px-2.5 py-1 rounded-full ${isDone ? 'bg-brand/10 text-brand' : 'bg-surface-3 text-zinc-400'}`}>
                <CheckCircle size={14} /> {progress}%
              </div>
            </div>
            
            <h3 className="text-lg sm:text-xl font-bold font-sora mb-2">{proj.name}</h3>
            <div className="flex flex-wrap items-center gap-3 text-[11px] sm:text-xs text-zinc-400 mb-5">
               <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-zinc-600"></span>{proj.time}</span>
               <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-brand/50"></span>Custo {proj.cost}</span>
            </div>
            
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
               <span className="text-brand text-xs sm:text-sm font-semibold flex items-center group-hover:translate-x-1 transition-transform">
                  Assistir Aula <ChevronRight size={16} className="ml-1" />
               </span>
               <PlayCircle size={20} className="text-zinc-600 group-hover:text-brand transition-colors" />
            </div>
          </div>
        )})}
      </div>
    </div>
  );
}

function ProjectDetailView({ project, progress, onToggle }: { project: ProjectData, progress: boolean[], onToggle: (idx: number) => void }) {
  if (!project) return <div>Projeto não encontrado</div>;

  const currentPercent = Math.round((progress.filter(Boolean).length / progress.length) * 100) || 0;
  const isYoutube = project.videoUrl.includes('youtube');

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
         <div className="flex items-center gap-3 text-brand">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest bg-brand/10 px-3 py-1 rounded-full border border-brand/20">Módulo 0{project.id}</span>
         </div>
         {currentPercent === 100 && (
            <span className="flex items-center gap-2 text-xs sm:text-sm font-bold text-brand bg-brand/10 px-4 py-1.5 rounded-full border border-brand/30 animate-pulse w-fit">
               <Trophy size={16} /> MÓDULO CONCLUÍDO
            </span>
         )}
      </div>
      
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-sora font-bold mb-6 sm:mb-8 tracking-tight">{project.name}</h2>
      
      {/* Video Player */}
      <div className="aspect-video bg-black rounded-xl sm:rounded-2xl border border-white/10 flex items-center justify-center mb-8 sm:mb-10 relative overflow-hidden group w-full shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
         {project.videoUrl && project.videoUrl.trim() !== '' ? (
            <iframe 
               src={project.videoUrl} 
               frameBorder="0" 
               allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" 
               allowFullScreen
               className="w-full h-full absolute inset-0 z-20"
            ></iframe>
         ) : (
            // Placeholder Se não houver video
            <>
               <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-10"></div>
               <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1592424001807-f39b6fc921c3?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center"></div>
               <div className="z-20 text-center px-4">
                  <PlayCircle size={48} className="mx-auto text-zinc-600 mb-3" />
                  <p className="text-zinc-400 font-medium">Nenhum vídeo disponível no momento para este módulo.</p>
               </div>
            </>
         )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
         {/* Checklist Column */}
         <div className="col-span-1 lg:col-span-2 space-y-8">
             <div className="glass-panel p-5 sm:p-8">
                <h3 className="text-lg sm:text-xl font-bold font-sora mb-4 sm:mb-6 flex items-center gap-2"><CheckCircle className="text-brand shrink-0" size={20} /> Seu Checklist de Tarefas</h3>
                <div className="bg-surface-1 rounded-xl p-1 mb-6 border border-white/5 flex gap-1">
                    <button className="flex-1 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg bg-surface-3 text-white">Tarefas da Obra</button>
                    <button className="flex-1 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg text-zinc-500 cursor-not-allowed">Plantas Extras</button>
                </div>
                
                <ul className="space-y-2 sm:space-y-3">
                   {project.materials.map((item, i) => {
                      const isChecked = progress[i];
                      return (
                      <li key={i} onClick={() => onToggle(i)} className={`flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border transition-all cursor-pointer group select-none hover:-translate-y-0.5 ${isChecked ? 'bg-brand/5 border-brand/30' : 'bg-surface-1/50 border-white/5 hover:border-brand/20 hover:bg-surface-2'}`}>
                         <div className={`mt-0.5 shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-md border flex items-center justify-center transition-colors duration-300 ${isChecked ? 'bg-brand border-brand text-black shadow-[0_0_10px_rgba(139,195,74,0.4)]' : 'border-zinc-500 group-hover:border-brand/50 text-transparent'}`}>
                            <Check className="w-3 h-3 sm:w-4 sm:h-4" strokeWidth={4} />
                         </div>
                         <span className={`text-xs sm:text-sm leading-relaxed transition-colors duration-300 ${isChecked ? 'text-zinc-500 line-through' : 'text-zinc-200'}`}>
                            {item}
                         </span>
                      </li>
                   )})}
                </ul>
                {project.materials.length === 0 && (
                   <p className="text-zinc-500 text-sm text-center py-6">Nenhum passo cadastrado ainda.</p>
                )}
             </div>
         </div>

         {/* Side Widgets Column */}
         <div className="space-y-4">
            <div className="glass-panel p-5 sm:p-6 bg-gradient-to-br from-surface-2 to-surface-1">
               <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-brand/10 text-brand flex items-center justify-center mb-4">
                  <Calculator size={20} />
               </div>
               <h3 className="text-base sm:text-lg font-bold font-sora mb-2">Calculadora de Materiais</h3>
               <p className="text-xs sm:text-sm text-zinc-400 mb-6 line-clamp-2">Calcule o custo exato dessa obra na sua cidade.</p>
               <button className="w-full py-2.5 sm:py-3 rounded-lg bg-surface-3 hover:bg-surface-2 text-white text-sm font-medium border border-white/10 transition-colors flex items-center justify-center gap-2">
                  Abrir Ferramenta
               </button>
            </div>

            <div className="glass-panel p-5 sm:p-6 border-brand/20 bg-brand/5 relative overflow-hidden">
               <div className="absolute -right-6 -top-6 w-24 h-24 bg-brand/20 rounded-full blur-2xl"></div>
               <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-brand/20 text-brand flex items-center justify-center mb-4 relative z-10">
                  <Download size={20} />
               </div>
               <h3 className="text-base sm:text-lg font-bold font-sora mb-2 text-brand relative z-10">Plantas Oficiais</h3>
               <p className="text-xs sm:text-sm text-zinc-400 mb-6 relative z-10">Arquivo PDF com os cortes e medidas detalhadas.</p>
               <button className="w-full py-2.5 sm:py-3 rounded-xl bg-brand hover:bg-brand-hover text-black text-sm sm:text-base font-semibold transition-all shadow-[0_0_20px_rgba(139,195,74,0.3)] flex items-center justify-center gap-2 relative z-10">
                  <Download size={18} /> Baixar PDF
               </button>
            </div>
         </div>
      </div>
    </div>
  );
}

function CalculatorView({ projects }: { projects: ProjectData[] }) {
  return (
     <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="mb-4 inline-block px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-[10px] sm:text-xs font-semibold border border-blue-500/20">
           FERRAMENTA PREMIUM ⚡
        </div>
        <h2 className="text-2xl sm:text-3xl font-sora font-bold mb-3 tracking-tight">Calculadora Inteligente</h2>
        <p className="text-zinc-400 mb-8 sm:mb-10 text-sm sm:text-lg max-w-2xl">Evite surpresas pagando caro em lojas agropecuárias. Insira o preço do material na madeireira da sua cidade e veja seu orçamento.</p>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
           <div className="glass-panel p-5 sm:p-8">
              <h3 className="text-lg sm:text-xl font-bold font-sora mb-4 sm:mb-6">Cotação Local (Sua cidade)</h3>
              <div className="space-y-4">
                 {[
                    { label: "Madeira ou Caibro (unid. 2m)", default: 25 },
                    { label: "Plástico Filme / Lona (metro)", default: 12 },
                    { label: "Tela Galvanizada (metro)", default: 8.5 },
                    { label: "Saco de Cimento (50kg)", default: 32 }
                 ].map((item, i) => (
                    <div key={i}>
                       <label className="block text-xs sm:text-sm font-medium text-zinc-300 mb-2">{item.label}</label>
                       <div className="relative group">
                          <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-sm font-medium group-focus-within:text-brand transition-colors">R$</span>
                          <input 
                             type="number" 
                             defaultValue={item.default} 
                             className="w-full bg-surface-3 border border-white/5 rounded-xl py-3 pl-10 sm:pl-12 pr-4 text-sm sm:text-base text-white focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all" 
                          />
                       </div>
                    </div>
                 ))}
              </div>
           </div>

           <div>
               <div className="glass-panel p-5 sm:p-8 bg-gradient-to-br from-brand/10 to-transparent border-brand/20 sticky top-24">
                  <h3 className="text-lg sm:text-xl font-bold mb-6 font-sora text-brand flex items-center gap-2">
                      <Calculator size={20} /> Orçamento Geral
                  </h3>
                  
                  <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                      {projects.slice(0, 3).map(p => (
                         <div key={p.id} className="flex justify-between text-xs sm:text-sm">
                             <span className="text-zinc-400 truncate pr-4">{p.name}</span>
                             <span className="font-medium text-white shrink-0">~ {p.cost}</span>
                         </div>
                      ))}
                      
                      <div className="w-full h-px bg-white/10 my-2"></div>
                      <div className="flex justify-between items-end pt-2">
                          <span className="text-zinc-300 text-xs sm:text-sm font-medium">Economia Construindo*</span>
                          <span className="text-xl sm:text-2xl font-bold text-brand">75%</span>
                      </div>
                  </div>

                  <div className="p-3 sm:p-4 rounded-xl bg-black/40 border border-white/5 flex items-start gap-2 sm:gap-3">
                      <div className="text-lg sm:text-xl mt-0.5">💡</div>
                      <p className="text-[10px] sm:text-xs text-zinc-400 leading-relaxed">
                          *Esta economia é calculada comparando o custo da nossa bioconstrução inteligente vs. a compra de estufas pré-fabricadas caras com maquinário pesado.
                      </p>
                  </div>
               </div>
           </div>
        </div>
     </div>
  )
}

function DownloadsView() {
    return (
       <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-2xl sm:text-3xl font-sora font-bold mb-3 tracking-tight">Central de Downloads</h2>
          <p className="text-zinc-400 mb-8 sm:mb-10 text-sm sm:text-lg">Todos os arquivos vitais em tamanho grande e material de apoio.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {[
                  { name: "Livro Central em PDF", desc: "Digital, alta resolução com fotos.", locked: false },
                  { name: "Cortes e Medidas 3D", desc: "Pacote extra com visão explodida.", locked: false },
                  { name: "Planilha Financeira XLSX", desc: "A mesma calculadora na versão Excel.", locked: true },
                  { name: "Guia Ouro: Monetização", desc: "Como vender excedente da horta.", locked: true },
              ].map((item, i) => (
                  <div key={i} className={`glass-panel p-5 sm:p-6 flex flex-col ${item.locked ? 'opacity-80' : ''}`}>
                      <div className="flex justify-between items-start mb-4">
                          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center ${item.locked ? 'bg-surface-3 text-zinc-500' : 'bg-brand/10 text-brand'}`}>
                              {item.locked ? <Lock size={20} /> : <Download size={20} />}
                          </div>
                          {item.locked && <span className="px-2 sm:px-2.5 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded text-[9px] sm:text-[10px] font-bold uppercase tracking-wider">Upgrade</span>}
                      </div>
                      <h3 className="text-base sm:text-lg font-bold font-sora mb-1 text-white">{item.name}</h3>
                      <p className="text-xs sm:text-sm text-zinc-400 mb-5 sm:mb-6">{item.desc}</p>
                      <button className={`mt-auto w-full py-2.5 sm:py-3 text-sm sm:text-base rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${item.locked ? 'bg-surface-3 text-zinc-500 cursor-not-allowed' : 'bg-brand text-black hover:bg-brand-hover hover:scale-[1.02]'}`}>
                          {item.locked ? 'Exclusivo Plano Premium' : 'Download Direto'}
                      </button>
                  </div>
              ))}
          </div>
       </div>
    )
}

function CertificateView({ progress }: { progress: number }) {
   if (progress < 100) {
      return (
         <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col items-center justify-center text-center py-12 sm:py-20 px-2 sm:px-4">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-surface-2 border border-white/5 flex items-center justify-center text-zinc-600 mb-6 shadow-xl relative overflow-hidden">
               <Award className="w-10 h-10 sm:w-12 sm:h-12 relative z-10" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-sora font-bold mb-3 tracking-tight px-4">Certificado Inativo 🔒</h2>
            <p className="text-sm sm:text-base text-zinc-400 max-w-md mx-auto mb-8 px-4">
               Você precisa preencher 100% dos checklists em todas as aulas para liberar o botão de Emissão Automática deste valioso certificado.
            </p>
            <div className="w-full max-w-sm glass-panel p-5 sm:p-6 bg-surface-2/20">
               <div className="flex justify-between text-xs sm:text-sm mb-2">
                  <span className="text-zinc-400">Progresso atual da conta</span>
                  <span className="font-bold text-brand">{progress}%</span>
               </div>
               <div className="w-full h-2 bg-surface-3 rounded-full overflow-hidden">
                  <div className="h-full bg-zinc-600 transition-all duration-700" style={{ width: `${progress}%` }}></div>
               </div>
            </div>
         </div>
      );
   }

   return (
      <div className="animate-in zoom-in-95 duration-500 flex flex-col items-center">
          <div className="mb-4 inline-block px-3 py-1 bg-brand/10 text-brand rounded-full text-[10px] sm:text-xs font-semibold border border-brand/20 animate-pulse">
             PARABÉNS! OBRA FINALIZADA 🎉
          </div>
          <h2 className="text-3xl sm:text-4xl text-center font-sora font-bold mb-3 tracking-tight text-white drop-shadow-[0_0_15px_rgba(139,195,74,0.3)]">Certificado de Conclusão</h2>
          <p className="text-sm sm:text-lg text-zinc-300 mb-8 sm:mb-10 text-center px-4 max-w-lg">Você gabaritou todo o conteúdo rural. Imprima seu mérito ou poste no seu perfil.</p>

          <div className="glass-panel p-1 sm:p-4 bg-gradient-to-br from-brand/5 to-transparent border-brand/30 shadow-[0_0_50px_rgba(139,195,74,0.15)] w-full max-w-3xl overflow-hidden shrink-0">
             <div className="aspect-[1.4/1] bg-white rounded-lg p-4 sm:p-12 relative flex flex-col items-center justify-center text-center border-[6px] sm:border-[12px] border-surface-2/10">
                <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-[#f0eedd] flex items-center justify-center shadow-lg mb-4 sm:mb-6 border-2 sm:border-4 border-brand/20 text-3xl sm:text-4xl">
                   🏆
                </div>
                <h1 className="text-2xl sm:text-4xl md:text-5xl font-serif text-zinc-800 mb-1 sm:mb-2">CERTIFICADO</h1>
                <p className="text-zinc-500 tracking-[0.1em] sm:tracking-[0.2em] uppercase text-[8px] sm:text-xs mb-6 sm:mb-8 font-semibold">de mérito em bioconstrução</p>
                <p className="text-zinc-600 text-sm sm:text-lg mb-2 sm:mb-4">Certificamos com honra que</p>
                <div className="w-[80%] max-w-sm border-b border-zinc-500 pb-2 mb-3 sm:mb-4">
                   <h2 className="text-xl sm:text-3xl font-bold font-sora text-black">Membro Exemplar</h2>
                </div>
                <p className="text-zinc-600 text-[10px] sm:text-sm px-4 max-w-lg">Alcançou sucesso completo no programa **5 Projetos Rurais**, dominando o ciclo construtivo autossuficiente e redução de custos.</p>
                
                <div className="absolute bottom-4 sm:bottom-8 left-4 sm:left-8">
                   <div className="w-20 sm:w-32 h-px bg-zinc-300 mb-1 sm:mb-2"></div>
                   <p className="text-[8px] sm:text-[10px] text-zinc-500 font-bold uppercase">Emissão Automática - v1.0</p>
                </div>
                <div className="absolute bottom-3 sm:bottom-6 right-4 sm:right-8 w-12 h-12 sm:w-20 sm:h-20 bg-brand/10 rounded-full border border-brand/40 flex items-center justify-center rotate-12">
                   <span className="text-brand font-bold text-[6px] sm:text-[9px] text-center px-1">SELO<br/>AUTÊNTICO</span>
                </div>
             </div>
          </div>

          <div className="mt-8 flex justify-center pb-6">
             <button className="px-6 sm:px-8 py-3 sm:py-4 rounded-xl bg-brand hover:bg-brand-hover text-black font-bold text-sm sm:text-lg transition-all shadow-lg flex items-center gap-2 sm:gap-3">
                <Download size={20} /> Baixar PDF Alta Resolução
             </button>
          </div>
      </div>
   );
}


// ==========================================
// Admin Environment View
// ==========================================

function AdminDashboardView({ projects, onUpdateProjects }: { projects: ProjectData[], onUpdateProjects: (data: ProjectData[]) => void }) {
   // Local state for editing in Admin
   const [localData, setLocalData] = useState<ProjectData[]>(() => JSON.parse(JSON.stringify(projects)));

   const handleChange = (id: number, field: keyof ProjectData, value: string) => {
      setLocalData(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
   };

   // Update deep array (materials)
   const handleMaterialChange = (id: number, matIndex: number, val: string) => {
      setLocalData(prev => prev.map(p => {
         if (p.id !== id) return p;
         const newMats = [...p.materials];
         newMats[matIndex] = val;
         return { ...p, materials: newMats };
      }));
   };

   // Add new checklist item
   const addMaterial = (id: number) => {
      setLocalData(prev => prev.map(p => {
         if (p.id !== id) return p;
         return { ...p, materials: [...p.materials, "Nova tarefa (clique para editar)"] };
      }));
   };

   // Remove a checklist item
   const removeMaterial = (id: number, matIndex: number) => {
      setLocalData(prev => prev.map(p => {
         if (p.id !== id) return p;
         const newMats = [...p.materials];
         newMats.splice(matIndex, 1);
         return { ...p, materials: newMats };
      }));
   };

   // Trigger JSON Export download representing the new state
   const handleExportJSON = () => {
      // First, persist to App visual state so Admin sees the change instantly without downloading
      onUpdateProjects(localData);

      // Wrapper to match data.json shape
      const fileData = JSON.stringify({ projects: localData }, null, 2);
      const blob = new Blob([fileData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'data.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
   };

   return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
         <div className="mb-4 inline-block px-3 py-1 bg-red-500/10 text-red-500 rounded-full text-xs font-bold border border-red-500/20 animate-pulse flex items-center justify-center gap-2 w-fit">
           <AlertTriangle size={14} /> MODO ADMINISTRADOR ZERO-BACKEND
         </div>
         <h2 className="text-2xl sm:text-4xl font-sora font-bold mb-3">Painel de Criação de Conteúdo</h2>
         <p className="text-zinc-400 mb-8 max-w-3xl text-sm sm:text-base">
            Configure suas aulas livremente aqui. Quando terminar, aperte no botão **"Exportar Atualização"**. Um arquivo <code className="bg-zinc-800 text-brand px-1 py-0.5 rounded">data.json</code> será baixado pro seu computador. Basta enviar esse único arquivinho para o seu respositório do GitHub, arrastando pelo navegador, e os alunos veram a mágica da autualização na hora!
         </p>

         <div className="sticky top-16 sm:top-20 z-40 bg-surface-1/90 backdrop-blur pb-4 pt-2 mb-6 border-b border-white/5">
            <button 
               onClick={handleExportJSON}
               className="w-full sm:w-auto px-6 py-3 rounded-lg bg-brand hover:bg-brand-hover text-black font-bold flex items-center justify-center gap-2 shadow-lg"
            >
               <Save size={18} /> Salvar & Exportar Atualização (data.json)
            </button>
         </div>

         <div className="space-y-6 sm:space-y-8">
            {localData.map((proj) => (
               <div key={proj.id} className="glass-panel p-4 sm:p-6 border-l-4 border-l-brand/50">
                  <div className="flex items-center gap-2 mb-4 text-brand">
                     <Edit3 size={18} />
                     <h3 className="font-sora font-bold text-lg">Módulo 0{proj.id} - Editor</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                     <div>
                        <label className="block text-xs font-medium text-zinc-400 mb-1">Título do Projeto</label>
                        <input type="text" value={proj.name} onChange={(e) => handleChange(proj.id, 'name', e.target.value)} className="w-full bg-surface-3 border border-white/10 rounded-md py-2 px-3 text-sm text-white focus:outline-none focus:border-brand" />
                     </div>
                     <div>
                        <label className="block text-xs font-medium text-zinc-400 mb-1">Custo Estimado na Calculadora Geral</label>
                        <input type="text" value={proj.cost} onChange={(e) => handleChange(proj.id, 'cost', e.target.value)} className="w-full bg-surface-3 border border-white/10 rounded-md py-2 px-3 text-sm text-white focus:outline-none focus:border-brand" />
                     </div>
                     <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-zinc-400 mb-1">Link do Vídeo (Ex: Embed do YouTube/Vimeo)</label>
                        <input placeholder="Ex: https://www.youtube.com/embed/XXXXXX" type="text" value={proj.videoUrl} onChange={(e) => handleChange(proj.id, 'videoUrl', e.target.value)} className="w-full bg-surface-3 border border-white/10 rounded-md py-2 px-3 text-sm text-brand placeholder:text-zinc-600 focus:outline-none focus:border-brand" />
                        <p className="text-[10px] text-zinc-500 mt-1">Usa o formato de 'Embed' para funcionar na aula (aquele link dentro do iframe).</p>
                     </div>
                  </div>

                  <div className="bg-surface-2 p-4 rounded-xl border border-white/5">
                     <h4 className="text-sm font-bold mb-3 flex items-center gap-2">Checklist de Tarefas (Aparece pro Aluno marcar)</h4>
                     <div className="space-y-2 mb-3">
                        {proj.materials.map((mat, idx) => (
                           <div key={idx} className="flex items-center gap-2">
                              <div className="w-5 h-5 rounded border border-zinc-600 flex items-center justify-center shrink-0"></div>
                              <input 
                                 type="text" 
                                 value={mat} 
                                 onChange={(e) => handleMaterialChange(proj.id, idx, e.target.value)}
                                 className="flex-1 bg-surface-3 border border-transparent hover:border-white/10 rounded py-1.5 px-3 text-sm text-white focus:outline-none focus:border-brand"
                              />
                              <button title="Remover Tarefa" onClick={() => removeMaterial(proj.id, idx)} className="text-red-400 hover:text-red-300 p-1 bg-red-400/10 rounded">✕</button>
                           </div>
                        ))}
                     </div>
                     <button onClick={() => addMaterial(proj.id)} className="text-xs font-semibold text-brand px-3 py-1.5 rounded bg-brand/10 hover:bg-brand/20 transition-colors">+ Adicionar Tarefa ao Checklist</button>
                  </div>
               </div>
            ))}
         </div>
      </div>
   )
}
