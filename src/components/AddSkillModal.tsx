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
  }) => Promise<void>;
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
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Skill name is required');
      return;
    }
    
    setIsSaving(true);
    setError(null);
    
    try {
      await onSave({ 
        name: name.trim(), 
        category, 
        proficiency 
      });
      
      // Reset form on successful save
      setName('');
      setCategory('technical');
      setProficiency('beginner');
      setError(null);
      onClose();
    } catch (error) {
      console.error('Error saving skill:', error);
      setError('Failed to save skill. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (!isSaving) {
      setName('');
      setCategory('technical');
      setProficiency('beginner');
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onClose={handleClose}>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" aria-hidden="true" />
      
      {/* Dialog Container - Full screen on mobile, centered on desktop */}
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="min-h-full flex items-end sm:items-center justify-center p-0 sm:p-4">
          <Dialog.Panel className="w-full max-w-lg bg-slate-800/95 backdrop-blur-sm border-0 sm:border border-slate-700/50 rounded-t-xl sm:rounded-xl shadow-2xl transform transition-all">
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-700/50">
              <Dialog.Title className="text-lg sm:text-xl font-bold text-white">Add New Skill</Dialog.Title>
              <button
                onClick={handleClose}
                disabled={isSaving}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col h-full">
              {/* Scrollable Content */}
              <div className="flex-1 p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto max-h-[calc(100vh-140px)] sm:max-h-none">
                {/* Error Display */}
                {error && (
                  <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
                    <p className="text-red-300 text-sm">{error}</p>
                  </div>
                )}

                {/* Skill Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Skill Name</label>
                  <input
                    type="text"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm sm:text-base"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., React, Python, Leadership, Spanish"
                    autoFocus
                    disabled={isSaving}
                    required
                  />
                </div>

                {/* Category Selection */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">Category</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {categories.map((cat) => {
                      const Icon = cat.icon;
                      return (
                        <button
                          key={cat.value}
                          type="button"
                          onClick={() => setCategory(cat.value)}
                          disabled={isSaving}
                          className={`p-3 sm:p-4 rounded-xl border transition-all text-left disabled:opacity-50 ${
                            category === cat.value
                              ? 'border-blue-500/50 bg-blue-500/20 text-blue-300'
                              : 'border-slate-600/50 bg-slate-700/30 text-slate-300 hover:border-slate-500/50 hover:bg-slate-700/50'
                          }`}
                        >
                          <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                            <Icon size={18} className="sm:w-5 sm:h-5" />
                            <span className="font-medium text-sm sm:text-base">{cat.label}</span>
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
                        disabled={isSaving}
                        className={`w-full p-2 sm:p-3 rounded-lg border transition-all text-left disabled:opacity-50 ${
                          proficiency === prof.value
                            ? 'border-blue-500/50 bg-blue-500/20 text-blue-300'
                            : 'border-slate-600/50 bg-slate-700/30 text-slate-300 hover:border-slate-500/50 hover:bg-slate-700/50'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                          <span className="font-medium text-sm sm:text-base">{prof.label}</span>
                          <span className="text-xs opacity-75 mt-1 sm:mt-0">{prof.description}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Fixed Footer */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 p-4 sm:p-6 border-t border-slate-700/50 bg-slate-800/95">
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={handleClose} 
                  disabled={isSaving}
                  className="border-slate-600/50 text-slate-300 hover:bg-slate-700/50 w-full sm:w-auto order-2 sm:order-1"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={isSaving || !name.trim()}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-slate-600 disabled:to-slate-700 w-full sm:w-auto order-1 sm:order-2"
                >
                  <Plus size={16} className="mr-2" />
                  {isSaving ? 'Adding...' : 'Add Skill'}
                </Button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  );
};