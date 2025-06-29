import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { Button } from './ui/Button';
import { Plus, X, Code, Users, Globe, AlignCenterVertical as Certificate } from 'lucide-react';

interface AddSkillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (skill: {
    name: string;
    category: 'technical' | 'soft' | 'language' | 'certification';
    proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'master';
  }) => void;
}

const categories = [
  { value: 'technical', label: 'Technical', icon: Code, description: 'Programming, tools, frameworks' },
  { value: 'soft', label: 'Soft Skills', icon: Users, description: 'Leadership, communication, teamwork' },
  { value: 'language', label: 'Languages', icon: Globe, description: 'Spoken and written languages' },
  { value: 'certification', label: 'Certifications', icon: Certificate, description: 'Professional certifications' }
] as const;

const proficiencies = [
  { value: 'beginner', label: 'Beginner', description: 'Just starting out' },
  { value: 'intermediate', label: 'Intermediate', description: 'Some experience' },
  { value: 'advanced', label: 'Advanced', description: 'Solid expertise' },
  { value: 'expert', label: 'Expert', description: 'Deep knowledge' },
  { value: 'master', label: 'Master', description: 'Industry leader' }
] as const;

export const AddSkillModal: React.FC<AddSkillModalProps> = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'technical' | 'soft' | 'language' | 'certification'>('technical');
  const [proficiency, setProficiency] = useState<typeof proficiencies[number]['value']>('beginner');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    
    setIsSaving(true);
    try {
      await onSave({ name: name.trim(), category, proficiency });
      setName('');
      setCategory('technical');
      setProficiency('beginner');
      onClose();
    } catch (error) {
      console.error('Error saving skill:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setName('');
    setCategory('technical');
    setProficiency('beginner');
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={handleClose}>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" aria-hidden="true" />
      
      {/* Dialog Panel */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-lg bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-sm border border-slate-700/50 rounded-xl shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
            <Dialog.Title className="text-xl font-bold text-white">Add New Skill</Dialog.Title>
            <button
              onClick={handleClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Skill Name */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Skill Name</label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., React, Python, Leadership, Spanish"
                autoFocus
              />
            </div>

            {/* Category Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">Category</label>
              <div className="grid grid-cols-2 gap-3">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setCategory(cat.value)}
                      className={`p-4 rounded-xl border transition-all text-left ${
                        category === cat.value
                          ? 'border-blue-500/50 bg-blue-500/20 text-blue-300'
                          : 'border-slate-600/50 bg-slate-700/30 text-slate-300 hover:border-slate-500/50 hover:bg-slate-700/50'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <Icon size={20} />
                        <span className="font-medium">{cat.label}</span>
                      </div>
                      <p className="text-xs opacity-75">{cat.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Proficiency Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">Proficiency Level</label>
              <div className="space-y-2">
                {proficiencies.map((prof) => (
                  <button
                    key={prof.value}
                    type="button"
                    onClick={() => setProficiency(prof.value)}
                    className={`w-full p-3 rounded-lg border transition-all text-left ${
                      proficiency === prof.value
                        ? 'border-blue-500/50 bg-blue-500/20 text-blue-300'
                        : 'border-slate-600/50 bg-slate-700/30 text-slate-300 hover:border-slate-500/50 hover:bg-slate-700/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{prof.label}</span>
                      <span className="text-xs opacity-75">{prof.description}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-6 border-t border-slate-700/50">
            <Button 
              variant="outline" 
              onClick={handleClose} 
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
              <Plus size={16} className="mr-2" />
              {isSaving ? 'Adding...' : 'Add Skill'}
            </Button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};