
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Person, Preference, ImportantDate, CardStatus, ProductRecommendation } from './types';
import { 
  Heart, Users, Calendar, Plus, ChevronRight, ArrowLeft, Trash2, 
  Gift, Coffee, Sparkles, Info, Settings, Star, ChevronLeft,
  Phone, Mail, MapPin, Bell, User, Send, Bot, Loader2, Mic, MicOff,
  ShoppingBag, ExternalLink, RefreshCw, BookOpen, CalendarPlus, UserPlus,
  Zap, Wind, Waves, Download, Upload
} from 'lucide-react';
import { 
  getRelationshipAdvice, 
  processCommand, 
  getProductRecommendations, 
  generateSoulPortrait, 
  getBondInsight,
  suggestOccasions
} from './services/geminiService';

const THEMES = ['earthy', 'pastel', 'dark', 'bay'];

const TYPICAL_OCCASIONS = [
  'Birthday', 'Anniversary', 'Valentine\'s Day', 'Christmas', 
  'Mother\'s Day', 'Father\'s Day', 'Graduation', 'Milestone', 'Housewarming'
];

const getNextOccurrence = (month: number, day: number) => {
  const now = new Date();
  const year = now.getFullYear();
  let date = new Date(year, month, day);
  if (date < now) {
    date = new Date(year + 1, month, day);
  }
  return date.toISOString().split('T')[0];
};

const HomeView: React.FC<{
  people: Person[],
  chatHistory: { role: 'user' | 'bot', content: string }[],
  chatInput: string,
  setChatInput: (v: string) => void,
  isProcessing: boolean,
  isListening: boolean,
  toggleListening: () => void,
  handleAIChat: (e?: React.FormEvent, directInput?: string) => void,
  setView: (v: 'home' | 'rolodex' | 'settings' | 'manifesto') => void,
  setSelectedPersonId: (id: string | null) => void,
  upcomingEvents: any[],
  onAddRitual: (personId: string, label: string, date: string) => void
}> = ({ 
  people, chatHistory, chatInput, setChatInput, isProcessing, isListening, 
  toggleListening, handleAIChat, setView, setSelectedPersonId, upcomingEvents, onAddRitual
}) => {
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isProcessing]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      <section className="kokoro-card rounded-2xl border-[var(--soft)] p-1 overflow-hidden">
        <div className="bg-[var(--soft)] bg-opacity-10 p-4 border-b border-[var(--soft)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-[var(--primary)]" />
            <span className="text-xs font-bold uppercase tracking-widest opacity-60">Assistant</span>
          </div>
          {isListening && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] uppercase font-bold opacity-40">Listening</span>
            </div>
          )}
        </div>
        <div className="max-h-48 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {chatHistory.length === 0 ? (
            <div className="text-center py-6">
              <Sparkles className="w-6 h-6 mx-auto mb-2 opacity-20 text-[var(--primary)]" />
              <p className="text-sm opacity-40 italic">"Sarah's birthday is tomorrow" or "Remind me Sarah likes tea"</p>
            </div>
          ) : (
            chatHistory.map((chat, i) => (
              <div key={i} className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm shadow-sm ${chat.role === 'user' ? 'bg-[var(--ink)] text-[var(--bg)] rounded-tr-none' : 'bg-[var(--soft)] bg-opacity-20 text-[var(--ink)] rounded-tl-none border border-[var(--soft)] border-opacity-30'}`}>
                  {chat.content}
                </div>
              </div>
            ))
          )}
          {isProcessing && (
            <div className="flex justify-start">
              <div className="bg-[var(--soft)] bg-opacity-20 rounded-2xl px-4 py-2 text-sm animate-pulse border border-[var(--soft)] border-opacity-30">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
        <form onSubmit={handleAIChat} className="p-2 bg-[var(--card)] flex gap-2 items-center">
          <button 
            type="button" 
            onClick={toggleListening}
            className={`p-3 rounded-xl transition-all ${isListening ? 'bg-red-500 text-white animate-pulse shadow-lg' : 'bg-[var(--soft)] bg-opacity-20 text-[var(--ink)] opacity-60 hover:opacity-100'}`}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
          <input 
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder={isListening ? "Listening..." : "Command Kokoro..."}
            className="flex-1 bg-transparent text-sm px-2 py-2 outline-none border-b border-transparent focus:border-[var(--primary)] transition-all"
          />
          <button type="submit" disabled={isProcessing || !chatInput.trim()} className="p-3 bg-[var(--ink)] text-[var(--bg)] rounded-xl hover:opacity-90 disabled:opacity-30 transition-all shadow-md active:scale-95">
            <Send className="w-5 h-5" />
          </button>
        </form>
      </section>

      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => setView('settings')} className="kokoro-card p-4 rounded-2xl flex flex-col items-start gap-1 border-[var(--soft)] transition-all hover:translate-y-[-2px] active:scale-95">
          <div className="flex items-center gap-2 text-[var(--primary)] font-medium"><User className="w-5 h-5" /><span>Circle</span></div>
          <span className="text-[10px] uppercase tracking-wider opacity-40">Profile & Theme</span>
        </button>
        <button onClick={() => setView('rolodex')} className="kokoro-card p-4 rounded-2xl flex flex-col items-start gap-1 border-[var(--soft)] transition-all hover:translate-y-[-2px] active:scale-95">
          <div className="flex items-center gap-2 text-[var(--primary)] font-medium"><Users className="w-5 h-5" /><span>Rolodex</span></div>
          <span className="text-[10px] uppercase tracking-wider opacity-40">All Connections</span>
        </button>
      </div>

      <CalendarView people={people} onSelectPerson={setSelectedPersonId} onAddRitual={onAddRitual} />

      <section className="space-y-3">
        <h3 className="text-[10px] uppercase font-bold opacity-30 tracking-[0.2em] px-2">Upcoming Occasions</h3>
        {upcomingEvents.length > 0 ? (
          <div className="grid gap-3">
            {upcomingEvents.map(e => (
              <div key={e.id} onClick={() => setSelectedPersonId(e.personId)} className="kokoro-card p-5 rounded-2xl cursor-pointer hover:shadow-lg transition-all border-[var(--soft)] flex items-center justify-between group">
                <div>
                  <h4 className="font-serif font-bold text-lg group-hover:text-[var(--primary)] transition-colors">{e.personName}</h4>
                  <p className="text-xs opacity-50">{e.label} • {new Date(e.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
                </div>
                <div className={`status-chip status-${e.status} shadow-sm`}>{e.status}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="kokoro-card p-12 rounded-2xl text-center border-dashed border-2 border-[var(--soft)] bg-transparent opacity-40">
            <p className="text-sm">No rituals scheduled.</p>
          </div>
        )}
      </section>
    </div>
  );
};

const CalendarView: React.FC<{ 
  people: Person[], 
  onSelectPerson: (id: string) => void,
  onAddRitual: (personId: string, label: string, date: string) => void
}> = ({ people, onSelectPerson, onAddRitual }) => {
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [newRitualLabel, setNewRitualLabel] = useState('');
  const [targetPersonId, setTargetPersonId] = useState('');

  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();

  const allEvents = useMemo(() => {
    return people.flatMap(p => p.dates.map(d => ({ ...d, personId: p.id, personName: p.name, dObj: new Date(d.date) })));
  }, [people]);

  const monthEvents = useMemo(() => {
    return allEvents.filter(e => e.dObj.getMonth() === viewDate.getMonth() && e.dObj.getFullYear() === viewDate.getFullYear());
  }, [allEvents, viewDate]);

  const selectedDayEvents = useMemo(() => {
    if (!selectedDate) return [];
    return allEvents.filter(e => e.dObj.toDateString() === selectedDate.toDateString());
  }, [allEvents, selectedDate]);

  const handleDayClick = (day: number) => {
    const clickedDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    if (selectedDate && clickedDate.toDateString() === selectedDate.toDateString()) {
      setSelectedDate(null);
    } else {
      setSelectedDate(clickedDate);
      if (!targetPersonId && people.length > 0) {
        setTargetPersonId(people[0].id);
      }
    }
  };

  const handleScheduleRitual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !targetPersonId || !newRitualLabel.trim()) return;
    
    const dateStr = selectedDate.toISOString().split('T')[0];
    onAddRitual(targetPersonId, newRitualLabel, dateStr);
    setNewRitualLabel('');
  };

  return (
    <div className="kokoro-card p-6 rounded-2xl border-[var(--soft)] shadow-md space-y-6 overflow-hidden">
      <div className="flex items-center justify-between">
        <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))} className="p-2"><ChevronLeft className="w-4 h-4"/></button>
        <h3 className="font-serif text-xl font-bold">{viewDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</h3>
        <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))} className="p-2"><ChevronRight className="w-4 h-4"/></button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {['S','M','T','W','T','F','S'].map((d, i) => <div key={`${d}-${i}`} className="text-center text-[10px] font-bold opacity-30 py-2">{d}</div>)}
        {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} className="aspect-square opacity-5 text-xs flex items-center justify-center">?</div>)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const hits = monthEvents.filter(e => e.dObj.getDate() === day);
          const isToday = new Date().toDateString() === new Date(viewDate.getFullYear(), viewDate.getMonth(), day).toDateString();
          const isSelected = selectedDate && selectedDate.getDate() === day && selectedDate.getMonth() === viewDate.getMonth();
          
          return (
            <div 
              key={day} 
              onClick={() => handleDayClick(day)} 
              className={`aspect-square relative flex flex-col items-center justify-start pt-2 rounded-lg text-sm transition-all cursor-pointer group
                ${isSelected ? 'bg-[var(--primary)] text-white shadow-md' : 'hover:bg-[var(--primary)] hover:bg-opacity-5'}
                ${isToday && !isSelected ? 'border-[var(--primary)] text-[var(--primary)] font-bold' : ''}
              `}
            >
              <span>{day}</span>
              <div className="flex gap-0.5 mt-auto mb-1">
                {hits.slice(0, 3).map((_, idx) => (
                  <div key={idx} className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-[var(--primary)]'}`} />
                ))}
                {hits.length > 3 && <div className={`text-[6px] font-bold ${isSelected ? 'text-white' : 'text-[var(--primary)]'}`}>+</div>}
              </div>
            </div>
          );
        })}
      </div>

      {selectedDate && (
        <div className="animate-in slide-in-from-top-4 duration-300 pt-6 border-t border-[var(--soft)] border-opacity-30 space-y-5">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-serif font-bold italic opacity-60">
              {selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
            </h4>
            <button onClick={() => setSelectedDate(null)} className="text-[10px] uppercase font-bold tracking-widest opacity-30 hover:opacity-100">Close</button>
          </div>

          <div className="space-y-2">
            {selectedDayEvents.length > 0 ? (
              selectedDayEvents.map(e => (
                <div 
                  key={e.id} 
                  onClick={() => onSelectPerson(e.personId)}
                  className="flex items-center justify-between p-3 bg-[var(--soft)] bg-opacity-10 rounded-xl hover:bg-opacity-20 cursor-pointer transition-all border border-transparent hover:border-[var(--soft)]"
                >
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--primary)] mb-0.5">{e.personName}</p>
                    <p className="text-xs font-medium">{e.label}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-20" />
                </div>
              ))
            ) : (
              <p className="text-center text-[11px] italic opacity-30 py-2">Quiet on this day.</p>
            )}
          </div>

          <form onSubmit={handleScheduleRitual} className="space-y-3 bg-[var(--bg)] p-4 rounded-xl border border-[var(--soft)] border-opacity-50">
            <div className="flex items-center gap-2 mb-2">
              <CalendarPlus className="w-3.5 h-3.5 text-[var(--primary)]" />
              <span className="text-[10px] uppercase font-bold tracking-widest opacity-60">Schedule Ritual</span>
            </div>
            
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <div className="relative flex-1">
                   <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 opacity-30" />
                   <select 
                     required
                     value={targetPersonId}
                     onChange={(e) => setTargetPersonId(e.target.value)}
                     className="w-full pl-8 pr-4 py-2 bg-[var(--card)] text-xs border border-[var(--soft)] rounded-lg outline-none appearance-none"
                   >
                     {people.length === 0 && <option value="">No people yet</option>}
                     {people.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                   </select>
                </div>
                <input 
                  required
                  placeholder="Occasion Label"
                  value={newRitualLabel}
                  onChange={(e) => setNewRitualLabel(e.target.value)}
                  className="flex-1 px-3 py-2 bg-[var(--card)] text-xs border border-[var(--soft)] rounded-lg outline-none"
                />
              </div>
              <button 
                type="submit" 
                disabled={!targetPersonId || !newRitualLabel.trim()}
                className="w-full py-2 bg-[var(--ink)] text-[var(--bg)] rounded-lg text-[10px] font-bold uppercase tracking-widest shadow-sm active:scale-95 transition-all disabled:opacity-30"
              >
                Schedule
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

const PersonProfile: React.FC<{ 
  person: Person, onBack: () => void, onUpdate: (updates: Partial<Person>) => void, onDelete: (pid: string) => void
}> = ({ person, onBack, onUpdate, onDelete }) => {
  const [insights, setInsights] = useState<string | null>(null);
  const [bondInsight, setBondInsight] = useState<{ status: string, vibe: string, action: string } | null>(null);
  const [products, setProducts] = useState<ProductRecommendation[]>([]);
  const [suggestedDates, setSuggestedDates] = useState<{ label: string, date: string, reason: string }[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingPortrait, setLoadingPortrait] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [newPref, setNewPref] = useState('');
  const [newDateLabel, setNewDateLabel] = useState('');
  const [newDateValue, setNewDateValue] = useState('');
  const [newDateRecurring, setNewDateRecurring] = useState(true);
  const dateInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchBond = async () => {
      const insight = await getBondInsight(person);
      setBondInsight(insight);
    };
    if (person.notes || person.preferences.length > 0) fetchBond();
  }, [person.id]);

  const fetchInsights = async () => {
    setLoadingInsights(true);
    const res = await getRelationshipAdvice(person);
    setInsights(res);
    setLoadingInsights(false);
  };

  const evolvePortrait = async () => {
    setLoadingPortrait(true);
    const newAvatar = await generateSoulPortrait(person);
    if (newAvatar) onUpdate({ avatar: newAvatar });
    setLoadingPortrait(false);
  };

  const fetchProducts = async () => {
    setLoadingProducts(true);
    const res = await getProductRecommendations(person);
    setProducts(res);
    setLoadingProducts(false);
  };

  const fetchSuggestions = async () => {
    setLoadingSuggestions(true);
    const res = await suggestOccasions(person);
    setSuggestedDates(res);
    setLoadingSuggestions(false);
  };

  const handleAddSuggested = (label: string, mmdd: string) => {
    const [month, day] = mmdd.split('-').map(Number);
    const dateStr = getNextOccurrence(month - 1, day);
    onUpdate({ dates: [...person.dates, { id: crypto.randomUUID(), label, date: dateStr, recurring: true, status: 'PLANNED', leadDays: 7 }] });
    setSuggestedDates(prev => prev.filter(s => s.label !== label));
  };

  const handleQuickOccasion = (occ: string) => {
    setNewDateLabel(occ);
    let auto = false;
    if (occ === 'Christmas') { setNewDateValue(getNextOccurrence(11, 25)); auto = true; }
    else if (occ === 'Valentine\'s Day') { setNewDateValue(getNextOccurrence(1, 14)); auto = true; }
    else setNewDateValue('');
    if (!auto && dateInputRef.current) dateInputRef.current.focus();
  };

  return (
    <div className="py-4 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
      <div className="flex justify-between items-center mb-6">
        <button onClick={onBack} className="flex items-center gap-2 opacity-50 hover:opacity-100 transition-colors group"><ArrowLeft className="w-4 h-4 group-hover:translate-x-[-2px] transition-transform" /><span className="text-sm">Back Home</span></button>
        <button onClick={() => onUpdate({ pinned: !person.pinned })} className="p-2 transition-transform active:scale-125"><Star className={`w-5 h-5 ${person.pinned ? 'text-[var(--primary)] fill-[var(--primary)]' : 'opacity-20'}`} /></button>
      </div>

      <div className="flex items-center gap-6 mb-12">
        <div className="relative group">
          <img src={person.avatar} className="w-24 h-24 rounded-full border-4 border-[var(--card)] shadow-xl object-cover transition-all group-hover:scale-105" />
          <button 
            onClick={evolvePortrait} 
            disabled={loadingPortrait}
            className="absolute -bottom-2 -right-2 p-2 bg-[var(--ink)] text-[var(--bg)] rounded-full shadow-lg transition-transform hover:rotate-45 active:scale-90 disabled:opacity-50"
          >
            {loadingPortrait ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wind className="w-3 h-3" />}
          </button>
        </div>
        <div>
          <h2 className="text-4xl font-serif mb-1">{person.name}</h2>
          <p className="opacity-50 flex items-center gap-2 text-sm"><Sparkles className="w-4 h-4 text-[var(--primary)]" />{person.relationship}</p>
          {bondInsight && (
            <div className="flex items-center gap-1.5 mt-2">
              <div className="w-2 h-2 rounded-full bg-[var(--primary)] animate-pulse shadow-[0_0_8px_var(--primary)]" />
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">{bondInsight.status}</span>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-12">
        {bondInsight && (
          <section className="bg-[var(--soft)] bg-opacity-10 rounded-2xl p-6 border border-[var(--soft)] border-opacity-30">
            <h3 className="text-xs uppercase font-bold tracking-[0.2em] opacity-40 mb-4">Connection Pulse</h3>
            <p className="text-sm italic leading-relaxed opacity-80 mb-6">"{bondInsight.vibe}"</p>
            <div className="flex items-center gap-3 p-4 bg-[var(--card)] rounded-xl border border-[var(--soft)] border-opacity-30">
              <Zap className="w-5 h-5 text-[var(--primary)] shrink-0" />
              <p className="text-xs font-medium leading-relaxed">{bondInsight.action}</p>
            </div>
          </section>
        )}

        <section className="kokoro-card p-6 rounded-2xl space-y-4 border-[var(--soft)] shadow-md">
          <div className="grid grid-cols-1 gap-2">
            {[ { icon: Phone, k: 'phone', l: 'Phone' }, { icon: Mail, k: 'email', l: 'Email' }, { icon: MapPin, k: 'address', l: 'Address' } ].map(item => (
              <div key={item.k} className="flex items-center gap-3 p-3 bg-[var(--bg)] rounded-xl border border-[var(--soft)] focus-within:border-[var(--primary)]">
                <item.icon className="w-4 h-4 opacity-40" />
                <input placeholder={item.l} value={(person as any)[item.k] || ''} onChange={(e) => onUpdate({ [item.k]: e.target.value })} className="bg-transparent text-sm w-full outline-none" />
              </div>
            ))}
          </div>
        </section>

        <section className="kokoro-card p-6 rounded-2xl border-[var(--soft)] shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-[var(--primary)] opacity-60" />
            <h3 className="text-xl font-serif font-bold">Narrative & Observations</h3>
          </div>
          <textarea 
            placeholder="Capture shared memories, context, or quiet observations..."
            value={person.notes || ''}
            onChange={(e) => onUpdate({ notes: e.target.value })}
            className="w-full min-h-[160px] bg-transparent text-sm leading-relaxed border-none outline-none resize-none placeholder:opacity-30 placeholder:italic"
          />
        </section>

        <section>
          <h3 className="text-xl mb-4 font-serif font-bold">Deep Nuances</h3>
          <form onSubmit={(e) => { e.preventDefault(); if (!newPref.trim()) return; onUpdate({ preferences: [...person.preferences, { id: crypto.randomUUID(), category: 'fact', content: newPref, timestamp: Date.now() }] }); setNewPref(''); }} className="mb-4 relative">
            <input value={newPref} onChange={(e) => setNewPref(e.target.value)} placeholder="Add likes, rituals..." className="w-full pl-4 pr-12 py-4 bg-[var(--card)] border border-[var(--soft)] rounded-xl outline-none" />
            <button type="submit" className="absolute right-2 top-2 bottom-2 w-10 flex items-center justify-center bg-[var(--ink)] text-[var(--bg)] rounded-lg"><Plus className="w-5 h-5"/></button>
          </form>
          <div className="flex flex-wrap gap-2">
            {person.preferences.map(p => (
              <div key={p.id} className="px-3 py-1.5 bg-[var(--soft)] bg-opacity-20 border border-[var(--soft)] rounded-full text-xs flex items-center gap-2 group hover:border-[var(--primary)]">
                <Coffee className="w-3 h-3 opacity-40 group-hover:text-[var(--primary)]" />
                {p.content}
                <button onClick={() => onUpdate({ preferences: person.preferences.filter(pr => pr.id !== p.id) })} className="opacity-30 hover:opacity-100 hover:text-red-500"><Trash2 className="w-3.5 h-3.5"/></button>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-serif font-bold">Occasion Management</h3>
            <button 
              onClick={fetchSuggestions} 
              disabled={loadingSuggestions}
              className="text-[10px] uppercase font-bold tracking-widest text-[var(--primary)] hover:underline flex items-center gap-1"
            >
              {loadingSuggestions ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
              Auto Fill
            </button>
          </div>
          
          {suggestedDates.length > 0 && (
            <div className="mb-6 space-y-2 animate-in fade-in slide-in-from-top-2">
              <p className="text-[10px] uppercase font-bold opacity-30 tracking-widest mb-2">Suggested Rituals</p>
              {suggestedDates.map((s, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-[var(--primary)] bg-opacity-5 border border-[var(--primary)] border-opacity-20 rounded-xl">
                  <div className="flex-1">
                    <p className="text-xs font-bold">{s.label} <span className="opacity-40 font-normal ml-2">{s.date}</span></p>
                    <p className="text-[10px] opacity-60 italic leading-tight mt-0.5">{s.reason}</p>
                  </div>
                  <button 
                    onClick={() => handleAddSuggested(s.label, s.date)}
                    className="p-2 bg-[var(--primary)] text-white rounded-lg hover:opacity-90 transition-all active:scale-90"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-2 mb-6">
            {TYPICAL_OCCASIONS.map(occ => (
              <button key={occ} type="button" onClick={() => handleQuickOccasion(occ)} className={`px-3 py-2 rounded-full text-[10px] uppercase tracking-wider font-bold transition-all border shadow-sm ${newDateLabel === occ ? 'bg-[var(--primary)] text-white' : 'bg-[var(--soft)] bg-opacity-20 opacity-60'}`}>
                {occ}
              </button>
            ))}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); if (!newDateLabel || !newDateValue) return; onUpdate({ dates: [...person.dates, { id: crypto.randomUUID(), label: newDateLabel, date: newDateValue, recurring: newDateRecurring, status: 'PLANNED', leadDays: 7 }] }); setNewDateLabel(''); setNewDateValue(''); }} className="kokoro-card p-6 rounded-2xl border-[var(--soft)] bg-opacity-30 space-y-4">
            <input required placeholder="Ritual Name" value={newDateLabel} onChange={e => setNewDateLabel(e.target.value)} className="w-full px-4 py-3 bg-[var(--card)] border border-[var(--soft)] rounded-xl outline-none focus:ring-1 focus:ring-[var(--primary)]" />
            <input ref={dateInputRef} required type="date" value={newDateValue} onChange={e => setNewDateValue(e.target.value)} className="w-full px-4 py-3 bg-[var(--card)] border border-[var(--soft)] rounded-xl outline-none focus:ring-1 focus:ring-[var(--primary)]" />
            <div className="flex items-center gap-2 px-1">
              <button type="button" onClick={() => setNewDateRecurring(!newDateRecurring)} className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-all ${newDateRecurring ? 'text-[var(--primary)]' : 'opacity-30'}`}>
                <RefreshCw className="w-3 h-3" />
                Repeat Annually
              </button>
            </div>
            <button type="submit" className="w-full py-4 bg-[var(--ink)] text-[var(--bg)] rounded-xl font-bold uppercase text-[10px] tracking-[0.2em] shadow-lg active:scale-95 transition-all">Schedule Ritual</button>
          </form>
          <div className="space-y-3 mt-8">
            {person.dates.map(d => (
              <div key={d.id} className="kokoro-card p-5 rounded-2xl flex justify-between items-center border-[var(--soft)] shadow-sm">
                <div>
                  <p className="font-bold text-sm mb-0.5">{d.label}</p>
                  <p className="text-[10px] uppercase opacity-40">{new Date(d.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <select value={d.status} onChange={(e) => onUpdate({ dates: person.dates.map(date => date.id === d.id ? { ...date, status: e.target.value as CardStatus } : date) })} className={`status-chip status-${d.status} bg-opacity-20 border-none outline-none cursor-pointer`}>
                    <option value="PLANNED">Planned</option><option value="ORDERED">Ordered</option><option value="SENT">Sent</option>
                  </select>
                  <div className="flex items-center gap-3">
                    <button onClick={() => onUpdate({ dates: person.dates.map(date => date.id === d.id ? { ...date, recurring: !date.recurring } : date) })} className={`p-1 transition-all ${d.recurring ? 'text-[var(--primary)] opacity-100' : 'opacity-20 hover:opacity-50'}`}>
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => onUpdate({ dates: person.dates.filter(da => da.id !== d.id) })} className="p-1 opacity-20 hover:opacity-100 hover:text-red-500"><Trash2 className="w-3.5 h-3.5"/></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-[var(--primary)] bg-opacity-10 rounded-2xl p-6 border border-[var(--primary)] border-opacity-20 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-serif font-bold">Curated Discoveries</h3>
            <button onClick={fetchProducts} disabled={loadingProducts || person.preferences.length === 0} className="text-[10px] uppercase font-bold tracking-widest text-[var(--primary)] hover:underline flex items-center gap-1">
              {loadingProducts ? <Loader2 className="w-3 h-3 animate-spin" /> : <ShoppingBag className="w-3 h-3" />}
              Refresh
            </button>
          </div>
          {products.length > 0 ? (
            <div className="grid gap-3 grid-cols-1 md:grid-cols-2 mt-4">
              {products.map((prod, i) => (
                <div key={i} className="kokoro-card p-4 rounded-2xl border-[var(--soft)] flex flex-col justify-between group animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-sm leading-tight text-[var(--ink)]">{prod.name}</h4>
                      {prod.price && <span className="text-[10px] font-bold opacity-40 whitespace-nowrap">{prod.price}</span>}
                    </div>
                    <p className="text-[11px] opacity-60 leading-relaxed italic mb-4">"{prod.reason}"</p>
                  </div>
                  {prod.url && <a href={prod.url} target="_blank" rel="noopener noreferrer" className="mt-auto flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--primary)] group-hover:opacity-80 transition-opacity">View Product <ExternalLink className="w-3 h-3" /></a>}
                </div>
              ))}
            </div>
          ) : (
            <div onClick={fetchProducts} className={`kokoro-card p-8 rounded-2xl border-dashed border-2 border-[var(--soft)] text-center cursor-pointer hover:border-[var(--primary)] transition-all mt-4 ${loadingProducts ? 'animate-pulse' : ''}`}>
              <ShoppingBag className="w-6 h-6 mx-auto mb-2 opacity-20" />
              <p className="text-sm opacity-40 font-light italic">{loadingProducts ? "Searching for the perfect gesture..." : "Tap to discover curated gift ideas."}</p>
            </div>
          )}
        </section>

        <section className="bg-[var(--primary)] bg-opacity-10 rounded-2xl p-6 border border-[var(--primary)] border-opacity-20 shadow-sm">
          <div className="flex items-center gap-2 mb-4"><Sparkles className="w-5 h-5 text-[var(--primary)]" /><h3 className="text-lg font-serif font-bold">Thoughtful Spark</h3></div>
          {insights ? <div className="bg-[var(--card)] p-5 rounded-xl mb-6 text-sm italic border animate-in fade-in zoom-in-95">{insights}</div> : <p className="text-sm opacity-50 mb-6 italic">Reflect on nuances to discover ways to show up.</p>}
          <button disabled={loadingInsights || person.preferences.length === 0} onClick={fetchInsights} className="w-full py-4 bg-[var(--card)] border border-[var(--primary)] text-[var(--primary)] rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-[var(--primary)] hover:text-white transition-all active:scale-95">
            {loadingInsights ? 'Meditating...' : 'Get Gestures'}
          </button>
        </section>

        <button onClick={() => onDelete(person.id)} className="w-full py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-red-400 opacity-40 hover:opacity-100 hover:bg-red-50 rounded-2xl transition-all flex items-center justify-center gap-3 mt-12">
          <Trash2 className="w-4 h-4" />
          Purge Profile
        </button>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [people, setPeople] = useState<Person[]>(() => {
    const saved = localStorage.getItem('kokoro_people');
    return saved ? JSON.parse(saved) : [];
  });
  const [view, setView] = useState<'home' | 'rolodex' | 'settings' | 'manifesto'>('home');
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'bot', content: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('kokoro_theme') || 'bay');

  useEffect(() => {
    localStorage.setItem('kokoro_people', JSON.stringify(people));
  }, [people]);

  useEffect(() => {
    localStorage.setItem('kokoro_theme', theme);
    document.body.className = `theme-${theme}`;
  }, [theme]);

  const recognitionRef = useRef<any>(null);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert("Speech recognition is not supported in this browser.");
        return;
      }
      
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setChatInput(transcript);
        handleAIChat(undefined, transcript);
      };

      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);
      
      recognitionRef.current = recognition;
      recognition.start();
      setIsListening(true);
    }
  };

  const updatePerson = (id: string, updates: Partial<Person>) => {
    setPeople(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const executeCommand = (command: any) => {
    const { action, data } = command;
    if (action === 'ADD_PERSON' && data?.name) {
      const newPerson: Person = {
        id: crypto.randomUUID(),
        name: data.name,
        relationship: data.relationship || 'Friend',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.name}`,
        pinned: false,
        preferences: [],
        dates: [],
        notes: data.notes || '',
        phone: data.phone || '',
        email: data.email || '',
        address: data.address || ''
      };
      setPeople(prev => [newPerson, ...prev]);
    } else if ((action === 'ADD_DATE' || action === 'ADD_PREFERENCE') && data?.name) {
      const person = people.find(p => p.name.toLowerCase().includes(data.name.toLowerCase()));
      if (person) {
        if (action === 'ADD_DATE') {
          const newDate: ImportantDate = {
            id: crypto.randomUUID(),
            label: data.label || 'Special Occasion',
            date: data.date || new Date().toISOString().split('T')[0],
            recurring: true,
            status: 'PLANNED',
            leadDays: 7
          };
          updatePerson(person.id, { dates: [...person.dates, newDate] });
        } else if (action === 'ADD_PREFERENCE') {
          const newPref: Preference = {
            id: crypto.randomUUID(),
            category: 'fact',
            content: data.content || '',
            timestamp: Date.now()
          };
          updatePerson(person.id, { preferences: [...person.preferences, newPref] });
        }
      }
    }
  };

  const handleAIChat = async (e?: React.FormEvent, directInput?: string) => {
    if (e) e.preventDefault();
    const input = directInput || chatInput;
    if (!input.trim() || isProcessing) return;

    const newUserChat = { role: 'user' as const, content: input };
    setChatHistory(prev => [...prev, newUserChat]);
    setChatInput('');
    setIsProcessing(true);

    try {
      const response = await processCommand(input, people.map(p => p.name));
      setChatHistory(prev => [...prev, { role: 'bot', content: response.message }]);
      
      if (response.command && response.command.action !== 'NONE') {
        executeCommand(response.command);
      }
    } catch (err) {
      setChatHistory(prev => [...prev, { role: 'bot', content: "I'm sorry, I encountered an error processing that." }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const deletePerson = (id: string) => {
    if (window.confirm('Erase this profile?')) {
      setPeople(prev => prev.filter(p => p.id !== id));
      setSelectedPersonId(null);
    }
  };

  const onAddRitual = (personId: string, label: string, date: string) => {
    const person = people.find(p => p.id === personId);
    if (!person) return;
    const newDate: ImportantDate = {
      id: crypto.randomUUID(),
      label,
      date,
      recurring: true,
      status: 'PLANNED',
      leadDays: 7
    };
    updatePerson(personId, { dates: [...person.dates, newDate] });
  };

  const exportData = () => {
    const data = JSON.stringify(people, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `kokoro_export_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedPeople = JSON.parse(event.target?.result as string);
        if (Array.isArray(importedPeople)) {
          if (window.confirm(`Import ${importedPeople.length} people? This will overwrite your current data.`)) {
            setPeople(importedPeople);
          }
        } else {
          alert("Invalid data format. Please ensure the file is a valid Kokoro export.");
        }
      } catch (err) {
        alert("Error parsing file. Please ensure it is a valid JSON file.");
      }
    };
    reader.readAsText(file);
    // Reset input so the same file can be selected again if needed
    e.target.value = '';
  };

  const selectedPerson = useMemo(() => 
    people.find(p => p.id === selectedPersonId), 
  [people, selectedPersonId]);

  const upcomingEvents = useMemo(() => {
    const all = people.flatMap(p => 
      p.dates.map(d => ({ ...d, personId: p.id, personName: p.name }))
    );
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return all
      .filter(e => new Date(e.date) >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5);
  }, [people]);

  if (selectedPerson) {
    return (
      <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)]">
        <main className="max-w-2xl mx-auto px-4">
          <PersonProfile 
            person={selectedPerson} 
            onBack={() => setSelectedPersonId(null)} 
            onUpdate={(updates) => updatePerson(selectedPerson.id, updates)}
            onDelete={deletePerson}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)]">
      <main className="max-w-2xl mx-auto px-4 py-8">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Heart className="w-8 h-8 text-[var(--primary)] fill-[var(--primary)]" />
            <h1 className="text-3xl font-serif font-black tracking-tighter">KOKORO</h1>
          </div>
          <div className="flex gap-2">
            {view !== 'home' && (
              <button onClick={() => setView('home')} className="p-3 bg-[var(--soft)] bg-opacity-20 rounded-full hover:bg-opacity-40 transition-all">
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <button onClick={() => setView('rolodex')} className="p-3 bg-[var(--soft)] bg-opacity-20 rounded-full hover:bg-opacity-40 transition-all">
              <Users className="w-5 h-5" />
            </button>
            <button onClick={() => setView('settings')} className="p-3 bg-[var(--soft)] bg-opacity-20 rounded-full hover:bg-opacity-40 transition-all">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </header>

        {view === 'home' && (
          <HomeView 
            people={people}
            chatHistory={chatHistory}
            chatInput={chatInput}
            setChatInput={setChatInput}
            isProcessing={isProcessing}
            isListening={isListening}
            toggleListening={toggleListening}
            handleAIChat={handleAIChat}
            setView={setView}
            setSelectedPersonId={setSelectedPersonId}
            upcomingEvents={upcomingEvents}
            onAddRitual={onAddRitual}
          />
        )}

        {view === 'rolodex' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-serif font-bold">The Rolodex</h2>
              <span className="text-xs opacity-40 font-bold uppercase tracking-widest">{people.length} Souls</span>
            </div>
            <div className="grid gap-3 pb-20">
              {people.map(p => (
                <div 
                  key={p.id} 
                  onClick={() => { setSelectedPersonId(p.id); setView('home'); }}
                  className="kokoro-card p-4 rounded-2xl flex items-center gap-4 cursor-pointer hover:border-[var(--primary)] transition-all border-[var(--soft)] shadow-sm bg-[var(--card)]"
                >
                  <img src={p.avatar} className="w-12 h-12 rounded-full object-cover border-2 border-[var(--soft)]" />
                  <div className="flex-1">
                    <h4 className="font-bold text-[var(--ink)]">{p.name}</h4>
                    <p className="text-xs opacity-50">{p.relationship}</p>
                  </div>
                  {p.pinned && <Star className="w-4 h-4 text-[var(--primary)] fill-[var(--primary)]" />}
                  <ChevronRight className="w-4 h-4 opacity-20" />
                </div>
              ))}
              {people.length === 0 && (
                <div className="py-20 text-center opacity-30 italic bg-[var(--soft)] bg-opacity-5 rounded-3xl border-2 border-dashed border-[var(--soft)]">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-10" />
                  <p>Your circle is empty. Add someone via the assistant.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {view === 'settings' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <section>
              <h3 className="text-xs uppercase font-bold tracking-[0.2em] opacity-40 mb-6 px-2">Visual Resonance</h3>
              <div className="grid grid-cols-2 gap-3">
                {THEMES.map(t => (
                  <button 
                    key={t} 
                    onClick={() => setTheme(t)}
                    className={`p-6 rounded-2xl border-2 transition-all capitalize font-serif text-lg ${theme === t ? 'border-[var(--primary)] bg-[var(--primary)] bg-opacity-5 text-[var(--primary)]' : 'border-[var(--soft)] hover:border-opacity-100 border-opacity-30 bg-[var(--card)]'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </section>

            <section className="kokoro-card p-6 rounded-2xl border-[var(--soft)] space-y-4 bg-[var(--card)] shadow-sm">
              <h3 className="text-xs uppercase font-bold tracking-[0.2em] opacity-40 mb-2">Data Portability</h3>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={exportData}
                  className="flex items-center justify-center gap-2 p-4 bg-[var(--soft)] bg-opacity-10 rounded-xl border border-[var(--soft)] hover:bg-opacity-20 transition-all text-sm font-medium"
                >
                  <Download className="w-4 h-4" /> Export
                </button>
                <label className="flex items-center justify-center gap-2 p-4 bg-[var(--soft)] bg-opacity-10 rounded-xl border border-[var(--soft)] hover:bg-opacity-20 transition-all text-sm font-medium cursor-pointer">
                  <Upload className="w-4 h-4" /> Import
                  <input type="file" accept=".json" onChange={importData} className="hidden" />
                </label>
              </div>
              <p className="text-[10px] opacity-40 italic">Your data is stored locally. Use these to backup or move your circle.</p>
            </section>
            
            <section className="kokoro-card p-6 rounded-2xl border-[var(--soft)] space-y-4 bg-[var(--card)] shadow-sm">
              <h3 className="font-bold flex items-center gap-2 text-sm"><Info className="w-4 h-4 text-[var(--primary)]" /> About Kokoro</h3>
              <p className="text-sm opacity-60 leading-relaxed italic">
                "Kokoro" (心) represents the heart, mind, and spirit. This space is designed for the cultivation of deep, intentional relationships through observation and ritual.
              </p>
            </section>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
