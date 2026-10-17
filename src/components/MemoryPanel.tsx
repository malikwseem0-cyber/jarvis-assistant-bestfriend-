import React, { useState, useEffect } from 'react';
import { Brain, Plus, Trash2, Search, Download, ShieldCheck, Tag } from 'lucide-react';
import { MemoryItem } from '../types';

export const MemoryPanel: React.FC = () => {
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newCategory, setNewCategory] = useState<'preference' | 'project' | 'task' | 'working'>('preference');
  const [statusMsg, setStatusMsg] = useState('');

  const loadMemories = () => {
    fetch('/api/memory')
      .then((res) => res.json())
      .then((data) => {
        if (data.records) setMemories(data.records);
      })
      .catch((err) => console.error('Failed to load memory:', err));
  };

  useEffect(() => {
    loadMemories();
  }, []);

  const handleAddMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey || !newValue) return;

    try {
      const res = await fetch('/api/memory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: newCategory,
          key: newKey,
          value: newValue,
          tags: [newCategory, 'user-defined'],
        }),
      });
      const data = await res.json();
      if (data.success) {
        setNewKey('');
        setNewValue('');
        setShowAddModal(false);
        loadMemories();
        setStatusMsg('Memory fact committed to persistent SQLite store.');
        setTimeout(() => setStatusMsg(''), 3000);
      }
    } catch (err) {
      console.error('Error adding memory:', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/memory/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setMemories(data.records);
        setStatusMsg('Memory record purged safely.');
        setTimeout(() => setStatusMsg(''), 3000);
      }
    } catch (err) {
      console.error('Error deleting memory:', err);
    }
  };

  const handleExportBackup = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(memories, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `jarvis_memory_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setStatusMsg('Memory snapshot exported as JSON backup.');
    setTimeout(() => setStatusMsg(''), 3000);
  };

  const filtered = memories.filter((m) => {
    const matchCategory = activeCategory === 'all' || m.category === activeCategory;
    const matchSearch =
      !search ||
      m.key.toLowerCase().includes(search.toLowerCase()) ||
      m.value.toLowerCase().includes(search.toLowerCase()) ||
      m.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    return matchCategory && matchSearch;
  });

  return (
    <div className="bg-slate-950/85 border border-cyan-500/25 rounded-2xl p-4 backdrop-blur-md font-mono text-xs text-slate-200 flex flex-col h-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-cyan-500/20 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-cyan-400" />
          <span className="font-bold tracking-wider text-cyan-300 uppercase text-[11px]">
            PERSISTENT NEURAL MEMORY (SQLITE BACKED)
          </span>
          <span className="bg-slate-800 text-cyan-400 text-[10px] px-2 py-0.5 rounded-full border border-cyan-500/20">
            {memories.length} RECORDS
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportBackup}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-cyan-500/30 text-cyan-300 text-[10px] cursor-pointer"
            title="Download JSON Memory Snapshot"
          >
            <Download className="w-3 h-3" />
            <span>EXPORT BACKUP</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-[10px] cursor-pointer"
          >
            <Plus className="w-3 h-3" />
            <span>REMEMBER FACT</span>
          </button>
        </div>
      </div>

      {/* Status Notice */}
      {statusMsg && (
        <div className="mb-2 bg-emerald-950/40 border border-emerald-500/30 rounded p-1.5 text-[10px] text-emerald-300 flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Filter and Category Pills */}
      <div className="flex flex-wrap items-center gap-1.5 mb-3">
        {['all', 'preference', 'project', 'task', 'working'].map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-2.5 py-1 rounded-lg text-[10px] uppercase font-mono transition-colors cursor-pointer ${
              activeCategory === cat
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}

        <div className="flex-1 min-w-[160px] relative ml-auto">
          <Search className="w-3 h-3 text-cyan-400 absolute left-2.5 top-2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search memory..."
            className="w-full bg-slate-900/80 border border-cyan-500/20 rounded-lg pl-7 pr-2 py-1 text-[11px] text-cyan-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>
      </div>

      {/* Add Memory Modal Overlay */}
      {showAddModal && (
        <form onSubmit={handleAddMemory} className="mb-3 bg-slate-900 border border-cyan-500/40 rounded-xl p-3">
          <div className="font-bold text-cyan-300 text-xs mb-2">STORE NEW PERSISTENT RECORD</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
            <select
              value={newCategory}
              onChange={(e: any) => setNewCategory(e.target.value)}
              className="bg-slate-950 border border-cyan-500/30 rounded p-1 text-[11px] text-slate-200"
            >
              <option value="preference">Preference</option>
              <option value="project">Project Context</option>
              <option value="task">Task History</option>
              <option value="working">Working Context</option>
            </select>
            <input
              type="text"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              placeholder="Record Key / Title"
              className="sm:col-span-2 bg-slate-950 border border-cyan-500/30 rounded p-1 text-[11px] text-slate-200"
              required
            />
          </div>
          <textarea
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            placeholder="Fact / Detail to persist..."
            rows={2}
            className="w-full bg-slate-950 border border-cyan-500/30 rounded p-1.5 text-[11px] text-slate-200 mb-2"
            required
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-2.5 py-1 text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded"
            >
              Save Record
            </button>
          </div>
        </form>
      )}

      {/* Memory List */}
      <div className="space-y-2 flex-1 overflow-y-auto max-h-56 pr-1">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="bg-slate-900/60 border border-cyan-500/15 hover:border-cyan-500/30 rounded-xl p-2.5 transition-all"
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5 font-bold text-cyan-300 text-[11px]">
                <Tag className="w-3 h-3 text-cyan-400" />
                <span>{item.key}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-cyan-950/60 text-cyan-400 border border-cyan-500/20">
                  {item.category}
                </span>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
                  title="Forget this memory record"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <p className="text-[11px] text-slate-300 pl-4">{item.value}</p>
            <div className="mt-1.5 pl-4 flex items-center justify-between text-[9px] text-slate-400">
              <div className="flex gap-1">
                {item.tags.map((t) => (
                  <span key={t} className="bg-slate-800 text-slate-400 px-1 rounded">
                    #{t}
                  </span>
                ))}
              </div>
              <span>Updated: {item.updatedAt.slice(0, 10)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
