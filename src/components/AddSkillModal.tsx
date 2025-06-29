import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { Button } from './ui/Button';
import { Upload, X } from 'lucide-react';

interface AddSkillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (skill: {
    name: string;
    category: 'technical' | 'soft' | 'language' | 'certification';
    proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'master';
    demonstrationMethod: 'code' | 'video' | 'documentation' | 'presentation' | 'live-demo';
  }) => void;
}

const categories = ['technical', 'soft', 'language', 'certification'] as const;
const proficiencies = ['beginner', 'intermediate', 'advanced', 'expert', 'master'] as const;
const methods = ['code', 'video', 'documentation', 'presentation', 'live-demo'] as const;

export const AddSkillModal: React.FC<AddSkillModalProps> = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'technical' | 'soft' | 'language' | 'certification'>('technical');
  const [proficiency, setProficiency] = useState<typeof proficiencies[number]>('beginner');
  const [method, setMethod] = useState<typeof methods[number]>('code');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    
    setIsSaving(true);
    try {
      await onSave({ name, category, proficiency, demonstrationMethod: method });
      setName('');
      setCategory('technical');
      setProficiency('beginner');
      setMethod('code');
      onClose();
    } catch (error) {
      console.error('Error saving skill:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose}>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" aria-hidden="true" />
      
      {/* Dialog Panel */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-lg bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-sm border border-slate-700/50 rounded-xl shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
            <Dialog.Title className="text-xl font-bold text-white">Add New Skill</Dialog.Title>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Skill Name</label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., React, Python, Leadership"
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
                <select
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                >
                  {categories.map((c) => (
                    <option key={c} value={c} className="bg-slate-800 text-white capitalize">
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Proficiency</label>
                <select
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  value={proficiency}
                  onChange={(e) => setProficiency(e.target.value as any)}
                >
                  {proficiencies.map((p) => (
                    <option key={p} value={p} className="bg-slate-800 text-white capitalize">
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Demonstration Method</label>
              <select
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                value={method}
                onChange={(e) => setMethod(e.target.value as any)}
              >
                {methods.map((m) => (
                  <option key={m} value={m} className="bg-slate-800 text-white capitalize">
                    {m.replace('-', ' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-6 border-t border-slate-700/50">
            <Button 
              variant="outline" 
              onClick={onClose} 
              disabled={isSaving}
              className="border-slate-600/50 text-slate-300 hover:bg-slate-700/50"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isSaving || !name.trim()}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-slate-600 disabled:to-slate-700"
            >
              <Upload size={16} className="mr-2" />
              {isSaving ? 'Saving...' : 'Add Skill'}
            </Button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};