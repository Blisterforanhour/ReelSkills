import React from 'react';
import { Dialog } from '@headlessui/react';
import { Button } from './ui/Button';
import { X, Target, BookOpen, Video, Users, Award, CheckCircle, ArrowRight } from 'lucide-react';

interface Skill {
  id: string;
  name: string;
  category: 'technical' | 'soft' | 'language' | 'certification';
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'master';
  years_experience: number;
}

interface LearningPathModalProps {
  skill?: Skill;
  isOpen: boolean;
  onClose: () => void;
}

interface LearningStep {
  id: string;
  title: string;
  description: string;
  type: 'course' | 'project' | 'practice' | 'certification' | 'mentorship';
  duration: string;
  difficulty: 'easy' | 'medium' | 'hard';
  completed: boolean;
}

export const LearningPathModal: React.FC<LearningPathModalProps> = ({
  skill,
  isOpen,
  onClose
}) => {
  if (!skill) return null;

  const getNextProficiency = (current: string) => {
    switch (current) {
      case 'beginner': return 'intermediate';
      case 'intermediate': return 'advanced';
      case 'advanced': return 'expert';
      case 'expert': return 'master';
      default: return 'master';
    }
  };

  const generateLearningPath = (skill: Skill): LearningStep[] => {
    const nextLevel = getNextProficiency(skill.proficiency);
    
    // Generate learning steps based on skill and current proficiency
    const basePath: LearningStep[] = [
      {
        id: '1',
        title: `Advanced ${skill.name} Fundamentals`,
        description: `Deepen your understanding of core ${skill.name} concepts and best practices.`,
        type: 'course',
        duration: '2-3 weeks',
        difficulty: 'medium',
        completed: false
      },
      {
        id: '2',
        title: `Build a ${skill.name} Project`,
        description: `Apply your knowledge by building a real-world project using ${skill.name}.`,
        type: 'project',
        duration: '3-4 weeks',
        difficulty: 'hard',
        completed: false
      },
      {
        id: '3',
        title: `${skill.name} Best Practices`,
        description: `Learn industry standards and advanced techniques from experienced practitioners.`,
        type: 'course',
        duration: '1-2 weeks',
        difficulty: 'medium',
        completed: false
      },
      {
        id: '4',
        title: 'Peer Review & Feedback',
        description: `Get your work reviewed by peers and mentors in the ${skill.name} community.`,
        type: 'mentorship',
        duration: '1 week',
        difficulty: 'easy',
        completed: false
      }
    ];

    // Add certification step for higher levels
    if (skill.proficiency === 'advanced' || skill.proficiency === 'expert') {
      basePath.push({
        id: '5',
        title: `${skill.name} Professional Certification`,
        description: `Earn a recognized certification to validate your ${skill.name} expertise.`,
        type: 'certification',
        duration: '2-4 weeks',
        difficulty: 'hard',
        completed: false
      });
    }

    return basePath;
  };

  const learningSteps = generateLearningPath(skill);
  const nextLevel = getNextProficiency(skill.proficiency);

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'course': return BookOpen;
      case 'project': return Target;
      case 'practice': return Video;
      case 'certification': return Award;
      case 'mentorship': return Users;
      default: return BookOpen;
    }
  };

  const getStepColor = (type: string) => {
    switch (type) {
      case 'course': return 'text-blue-400';
      case 'project': return 'text-green-400';
      case 'practice': return 'text-purple-400';
      case 'certification': return 'text-yellow-400';
      case 'mentorship': return 'text-pink-400';
      default: return 'text-blue-400';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'hard': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" aria-hidden="true" />
      
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-3xl bg-slate-800/95 backdrop-blur-sm border border-slate-700/50 rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
            <div>
              <Dialog.Title className="text-2xl font-bold text-white">
                Learning Path: {skill.name}
              </Dialog.Title>
              <p className="text-slate-400">
                Advance from <span className="capitalize text-blue-400">{skill.proficiency}</span> to{' '}
                <span className="capitalize text-green-400">{nextLevel}</span>
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
            {/* Progress Overview */}
            <div className="bg-gradient-to-r from-blue-500/10 to-green-500/10 border border-blue-500/20 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Your Progress</h3>
                <div className="text-sm text-slate-400">
                  {learningSteps.filter(s => s.completed).length} of {learningSteps.length} completed
                </div>
              </div>
              <div className="w-full bg-slate-700/30 rounded-full h-3 mb-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-green-400 h-3 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${(learningSteps.filter(s => s.completed).length / learningSteps.length) * 100}%` 
                  }}
                />
              </div>
              <p className="text-slate-300 text-sm">
                Complete this learning path to advance your {skill.name} skills to the {nextLevel} level.
              </p>
            </div>

            {/* Learning Steps */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">Recommended Learning Steps</h3>
              
              {learningSteps.map((step, index) => {
                const StepIcon = getStepIcon(step.type);
                
                return (
                  <div
                    key={step.id}
                    className={`bg-slate-700/20 border border-slate-600/30 rounded-xl p-6 transition-all duration-200 ${
                      step.completed ? 'opacity-75' : 'hover:border-blue-500/30'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Step Number & Icon */}
                      <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${
                          step.completed 
                            ? 'bg-green-500/20 border-green-500/50 text-green-400' 
                            : 'bg-slate-700/30 border-slate-600/50 text-slate-400'
                        }`}>
                          {step.completed ? (
                            <CheckCircle size={20} />
                          ) : (
                            <span className="text-sm font-bold">{index + 1}</span>
                          )}
                        </div>
                        {index < learningSteps.length - 1 && (
                          <div className="w-0.5 h-8 bg-slate-600/30 mt-2" />
                        )}
                      </div>

                      {/* Step Content */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="text-lg font-semibold text-white mb-1">{step.title}</h4>
                            <p className="text-slate-300 text-sm leading-relaxed">{step.description}</p>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <StepIcon size={20} className={getStepColor(step.type)} />
                          </div>
                        </div>

                        {/* Step Metadata */}
                        <div className="flex items-center gap-6 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400">Duration:</span>
                            <span className="text-white">{step.duration}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400">Difficulty:</span>
                            <span className={`capitalize font-medium ${getDifficultyColor(step.difficulty)}`}>
                              {step.difficulty}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400">Type:</span>
                            <span className="text-white capitalize">{step.type}</span>
                          </div>
                        </div>

                        {/* Action Button */}
                        {!step.completed && (
                          <div className="mt-4">
                            <Button
                              size="small"
                              className="bg-blue-600/80 hover:bg-blue-700/80"
                              onClick={() => {
                                // Handle step action - could open external links, mark as complete, etc.
                                console.log('Starting step:', step.title);
                              }}
                            >
                              <ArrowRight size={14} className="mr-1" />
                              Start Step
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Tips Section */}
            <div className="mt-8 bg-purple-500/10 border border-purple-500/20 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-3">💡 Learning Tips</h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>• Set aside dedicated time each day for skill development</li>
                <li>• Practice regularly and build projects to reinforce learning</li>
                <li>• Join communities and forums related to {skill.name}</li>
                <li>• Document your progress and share your work for feedback</li>
                <li>• Consider finding a mentor or study group for accountability</li>
              </ul>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-6 border-t border-slate-700/50">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="border-slate-600/50 text-slate-300"
            >
              Close
            </Button>
            <Button 
              className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
              onClick={() => {
                // Handle starting the learning path
                console.log('Starting learning path for:', skill.name);
                onClose();
              }}
            >
              Start Learning Path
            </Button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};