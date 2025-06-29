import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { Button } from './ui/Button';
import { X, Plus, TrendingUp, Star, Target, Lightbulb } from 'lucide-react';

interface SkillRecommendationModalProps {
  recommendations: string[];
  isOpen: boolean;
  onClose: () => void;
  onAddSkill: (skillName: string) => void;
}

export const SkillRecommendationModal: React.FC<SkillRecommendationModalProps> = ({
  recommendations,
  isOpen,
  onClose,
  onAddSkill
}) => {
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set());

  const handleSkillToggle = (skill: string) => {
    const newSelected = new Set(selectedSkills);
    if (newSelected.has(skill)) {
      newSelected.delete(skill);
    } else {
      newSelected.add(skill);
    }
    setSelectedSkills(newSelected);
  };

  const handleAddSelected = () => {
    selectedSkills.forEach(skill => {
      onAddSkill(skill);
    });
    setSelectedSkills(new Set());
    onClose();
  };

  const getSkillInfo = (skill: string) => {
    // Mock data for skill information
    const skillData: Record<string, { demand: string; growth: string; description: string }> = {
      'Artificial Intelligence': {
        demand: 'Very High',
        growth: '+45%',
        description: 'AI and machine learning are transforming industries worldwide.'
      },
      'Machine Learning': {
        demand: 'Very High',
        growth: '+42%',
        description: 'Essential for data-driven decision making and automation.'
      },
      'Python': {
        demand: 'High',
        growth: '+38%',
        description: 'Versatile programming language for AI, web development, and data science.'
      },
      'Data Science': {
        demand: 'High',
        growth: '+35%',
        description: 'Extract insights from data to drive business decisions.'
      },
      'AWS': {
        demand: 'High',
        growth: '+40%',
        description: 'Leading cloud platform for scalable applications and services.'
      },
      'Azure': {
        demand: 'High',
        growth: '+38%',
        description: 'Microsoft\'s cloud platform with enterprise integration.'
      },
      'Google Cloud': {
        demand: 'Medium',
        growth: '+35%',
        description: 'Google\'s cloud platform with strong AI and analytics tools.'
      },
      'Docker': {
        demand: 'Medium',
        growth: '+30%',
        description: 'Containerization technology for application deployment.'
      },
      'Kubernetes': {
        demand: 'Medium',
        growth: '+32%',
        description: 'Container orchestration for managing scalable applications.'
      }
    };

    return skillData[skill] || {
      demand: 'Medium',
      growth: '+25%',
      description: 'Valuable skill for career advancement.'
    };
  };

  const getDemandColor = (demand: string) => {
    switch (demand) {
      case 'Very High': return 'text-red-400';
      case 'High': return 'text-orange-400';
      case 'Medium': return 'text-yellow-400';
      case 'Low': return 'text-green-400';
      default: return 'text-slate-400';
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" aria-hidden="true" />
      
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-4xl bg-slate-800/95 backdrop-blur-sm border border-slate-700/50 rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
            <div>
              <Dialog.Title className="text-2xl font-bold text-white">
                Recommended Skills
              </Dialog.Title>
              <p className="text-slate-400">
                High-demand skills to boost your career prospects
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Market Insights */}
            <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-xl p-6 mb-6">
              <div className="flex items-center gap-3 mb-3">
                <TrendingUp size={24} className="text-purple-400" />
                <h3 className="text-lg font-semibold text-white">Market Insights</h3>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">
                These skills are experiencing high growth in job postings and offer excellent career advancement opportunities. 
                Adding them to your portfolio can significantly increase your marketability.
              </p>
            </div>

            {/* Skills Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {recommendations.map((skill) => {
                const skillInfo = getSkillInfo(skill);
                const isSelected = selectedSkills.has(skill);
                
                return (
                  <div
                    key={skill}
                    className={`bg-slate-700/20 border rounded-xl p-6 cursor-pointer transition-all duration-200 ${
                      isSelected 
                        ? 'border-blue-500/50 bg-blue-500/10' 
                        : 'border-slate-600/30 hover:border-slate-500/50 hover:bg-slate-700/30'
                    }`}
                    onClick={() => handleSkillToggle(skill)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-1">{skill}</h4>
                        <p className="text-slate-300 text-sm">{skillInfo.description}</p>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        isSelected 
                          ? 'bg-blue-500 border-blue-500' 
                          : 'border-slate-500'
                      }`}>
                        {isSelected && <Plus size={14} className="text-white rotate-45" />}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Target size={14} className="text-slate-400" />
                          <span className="text-slate-400">Demand:</span>
                          <span className={`font-medium ${getDemandColor(skillInfo.demand)}`}>
                            {skillInfo.demand}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendingUp size={14} className="text-green-400" />
                          <span className="text-green-400 font-medium">{skillInfo.growth}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star size={14} className="text-yellow-400" />
                        <span className="text-yellow-400 text-xs">Trending</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selection Summary */}
            {selectedSkills.size > 0 && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <Lightbulb size={20} className="text-blue-400" />
                  <h4 className="font-semibold text-white">Selected Skills</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {Array.from(selectedSkills).map(skill => (
                    <span
                      key={skill}
                      className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Learning Tips */}
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6">
              <h4 className="font-semibold text-white mb-3">💡 Getting Started Tips</h4>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>• Start with foundational courses and tutorials</li>
                <li>• Build small projects to practice new skills</li>
                <li>• Join online communities and forums</li>
                <li>• Consider earning certifications for validation</li>
                <li>• Update your portfolio with new projects</li>
              </ul>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center p-6 border-t border-slate-700/50">
            <div className="text-sm text-slate-400">
              {selectedSkills.size > 0 
                ? `${selectedSkills.size} skill${selectedSkills.size === 1 ? '' : 's'} selected`
                : 'Select skills to add to your portfolio'
              }
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={onClose}
                className="border-slate-600/50 text-slate-300"
              >
                Maybe Later
              </Button>
              {selectedSkills.size > 0 && (
                <Button 
                  onClick={handleAddSelected}
                  className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                >
                  <Plus size={16} className="mr-2" />
                  Add Selected Skills
                </Button>
              )}
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};