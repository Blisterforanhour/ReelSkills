import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../lib/auth';
import { Button } from './ui/Button';
import { getSupabaseClient } from '../lib/auth';
import { AddSkillModal } from './AddSkillModal';
import { SkillDetailModal } from './SkillDetailModal';
import { LearningPathModal } from './LearningPathModal';
import { SkillRecommendationModal } from './SkillRecommendationModal';
import { Target, Plus, Brain, TrendingUp, BookOpen, Zap, ArrowRight, Lightbulb, CheckCircle, Clock, Star, Award, Code, Users, Globe, AlignCenterVertical as Certificate, Eye, Sparkles, AlertCircle } from 'lucide-react';

interface Skill {
  id: string;
  name: string;
  category: 'technical' | 'soft' | 'language' | 'certification';
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'master';
  status: 'planned' | 'in-progress' | 'completed' | 'verified';
  years_experience: number;
  verified: boolean;
  endorsements: number;
  video_demo_url?: string;
  description?: string;
  ai_rating?: number;
  ai_feedback?: string;
  video_verified: boolean;
  video_uploaded_at?: string;
  created_at?: string;
  updated_at?: string;
}

interface AIInsight {
  type: 'recommendation' | 'learning-path' | 'market-trend' | 'skill-gap';
  title: string;
  description: string;
  actionable: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  data?: any; // Additional data for the insight
}

const ReelSkillsDashboard: React.FC = () => {
  const { user, profile, createProfile } = useAuthStore();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [creatingProfile, setCreatingProfile] = useState(false);
  
  // New modal states
  const [learningPathModal, setLearningPathModal] = useState<{ isOpen: boolean; skill?: Skill }>({ isOpen: false });
  const [skillRecommendationModal, setSkillRecommendationModal] = useState<{ isOpen: boolean; recommendations?: string[] }>({ isOpen: false });

  const supabase = getSupabaseClient();

  const handleCreateProfile = async () => {
    if (!user?.email) return;
    
    setCreatingProfile(true);
    setError(null);
    
    try {
      const newProfile = await createProfile(
        user.id,
        user.email,
        user.user_metadata?.first_name,
        user.user_metadata?.last_name
      );
      
      if (!newProfile) {
        setError('Failed to create profile. Please try refreshing the page.');
      }
    } catch (error) {
      console.error('Error creating profile:', error);
      setError('Failed to create profile. Please try refreshing the page.');
    } finally {
      setCreatingProfile(false);
    }
  };

  const fetchSkills = async () => {
    if (!profile?.id) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .eq('profile_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching skills:', error);
        setError('Failed to load skills');
        setSkills([]);
      } else {
        const formattedSkills = (data || []).map((row: any) => ({
          id: row.id,
          name: row.name,
          category: row.category,
          proficiency: row.proficiency,
          status: row.verified ? 'verified' : 'planned',
          years_experience: row.years_experience || 0,
          verified: row.verified || false,
          endorsements: row.endorsements || 0,
          video_demo_url: row.video_demo_url,
          description: row.description,
          ai_rating: row.ai_rating,
          ai_feedback: row.ai_feedback,
          video_verified: row.video_verified || false,
          video_uploaded_at: row.video_uploaded_at,
          created_at: row.created_at,
          updated_at: row.updated_at,
        }));
        setSkills(formattedSkills);
      }
    } catch (error) {
      console.error('Error fetching skills:', error);
      setError('Failed to load skills');
      setSkills([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, [profile?.id]);

  // Generate AI insights based on current skills
  useEffect(() => {
    if (skills.length > 0) {
      const insights: AIInsight[] = [];
      
      // Find skills that can be advanced
      const skillsToAdvance = skills.filter(skill => 
        skill.proficiency !== 'master' && skill.years_experience > 0
      );
      
      if (skillsToAdvance.length > 0) {
        insights.push({
          type: 'learning-path',
          title: 'Complete Your Learning Path',
          description: `Focus on advancing your ${skillsToAdvance[0].name} skills to the next proficiency level.`,
          actionable: true,
          priority: 'high',
          data: { skill: skillsToAdvance[0] }
        });
      }

      // Market trend insight
      insights.push({
        type: 'market-trend',
        title: 'High-Demand Skills Alert',
        description: 'AI and Machine Learning skills are seeing 40% growth in job postings this quarter.',
        actionable: true,
        priority: 'critical',
        data: { 
          trendingSkills: ['Artificial Intelligence', 'Machine Learning', 'Python', 'Data Science'],
          growthRate: 40
        }
      });

      // Skill gap analysis
      const hasCloudSkills = skills.some(skill => 
        skill.name.toLowerCase().includes('cloud') || 
        skill.name.toLowerCase().includes('aws') || 
        skill.name.toLowerCase().includes('azure')
      );
      
      if (!hasCloudSkills && skills.some(skill => skill.category === 'technical')) {
        insights.push({
          type: 'skill-gap',
          title: 'Skill Gap Analysis',
          description: 'Consider adding cloud computing skills to complement your technical stack.',
          actionable: true,
          priority: 'medium',
          data: { 
            recommendedSkills: ['AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes'],
            reason: 'Cloud skills complement your existing technical expertise'
          }
        });
      }

      setAiInsights(insights);
    } else {
      setAiInsights([]);
    }
  }, [skills]);

  const handleSave = async ({ name, category, proficiency }: Omit<Skill, 'id' | 'status' | 'years_experience' | 'verified' | 'endorsements' | 'video_verified'>) => {
    if (!profile?.id) {
      setError('Profile not found. Please refresh the page.');
      return;
    }

    try {
      setError(null);
      const { data, error } = await supabase
        .from('skills')
        .insert({
          profile_id: profile.id,
          name: name.trim(),
          category,
          proficiency,
          years_experience: 0,
          description: null,
          verified: false,
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving skill:', error);
        setError('Failed to save skill');
        throw error;
      }

      if (data) {
        const newSkill: Skill = {
          id: data.id,
          name: data.name,
          category: data.category,
          proficiency: data.proficiency,
          status: 'planned',
          years_experience: data.years_experience || 0,
          verified: data.verified || false,
          endorsements: data.endorsements || 0,
          video_demo_url: data.video_demo_url,
          description: data.description,
          ai_rating: data.ai_rating,
          ai_feedback: data.ai_feedback,
          video_verified: data.video_verified || false,
          video_uploaded_at: data.video_uploaded_at,
          created_at: data.created_at,
          updated_at: data.updated_at,
        };
        setSkills(prev => [newSkill, ...prev]);
      }
    } catch (error) {
      console.error('Error saving skill:', error);
      setError('Failed to save skill');
      throw error;
    }
  };

  const handleUpdateSkill = async (skillId: string, updates: Partial<Skill>) => {
    try {
      const { data, error } = await supabase
        .from('skills')
        .update({
          years_experience: updates.years_experience,
          description: updates.description,
          video_demo_url: updates.video_demo_url,
        })
        .eq('id', skillId)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setSkills(prev => prev.map(skill => 
          skill.id === skillId 
            ? { ...skill, ...updates, updated_at: data.updated_at }
            : skill
        ));
        setSelectedSkill(prev => prev ? { ...prev, ...updates } : null);
      }
    } catch (error) {
      console.error('Error updating skill:', error);
      throw error;
    }
  };

  const handleSkillClick = (skill: Skill) => {
    setSelectedSkill(skill);
  };

  const handleInsightAction = (insight: AIInsight) => {
    switch (insight.type) {
      case 'learning-path':
        // Open learning path modal for the specific skill
        if (insight.data?.skill) {
          setLearningPathModal({ isOpen: true, skill: insight.data.skill });
        }
        break;
        
      case 'skill-gap':
        // Open skill recommendation modal
        if (insight.data?.recommendedSkills) {
          setSkillRecommendationModal({ 
            isOpen: true, 
            recommendations: insight.data.recommendedSkills 
          });
        }
        break;
        
      case 'market-trend':
        // Open skill recommendation modal with trending skills
        if (insight.data?.trendingSkills) {
          setSkillRecommendationModal({ 
            isOpen: true, 
            recommendations: insight.data.trendingSkills 
          });
        }
        break;
        
      case 'recommendation':
        // Generic recommendation - could open a general guidance modal
        alert(`Recommendation: ${insight.description}`);
        break;
        
      default:
        console.log('Acting on insight:', insight);
    }
  };

  // If user exists but no profile, show profile creation
  if (user && !profile && !creatingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ 
        background: 'radial-gradient(ellipse at center, #1E293B 0%, #0F172A 100%)',
        backgroundAttachment: 'fixed'
      }}>
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-slate-800/20 backdrop-blur-sm border border-slate-700/20 rounded-xl p-8">
            <AlertCircle size={48} className="text-yellow-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Profile Setup Required</h2>
            <p className="text-slate-400 mb-6">
              We need to set up your profile to get started with ReelSkills.
            </p>
            {error && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 mb-4">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}
            <Button 
              onClick={handleCreateProfile}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
              disabled={creatingProfile}
            >
              {creatingProfile ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating Profile...
                </>
              ) : (
                'Create Profile'
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show loading while creating profile
  if (creatingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ 
        background: 'radial-gradient(ellipse at center, #1E293B 0%, #0F172A 100%)',
        backgroundAttachment: 'fixed'
      }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Setting up your profile...</p>
        </div>
      </div>
    );
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'technical': return Code;
      case 'soft': return Users;
      case 'language': return Globe;
      case 'certification': return Certificate;
      default: return Target;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return Award;
      case 'completed': return CheckCircle;
      case 'in-progress': return Clock;
      case 'planned': return Target;
      default: return Target;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'text-emerald-400';
      case 'completed': return 'text-blue-400';
      case 'in-progress': return 'text-amber-400';
      case 'planned': return 'text-slate-400';
      default: return 'text-slate-400';
    }
  };

  const getProficiencyColor = (proficiency: string) => {
    switch (proficiency) {
      case 'master': return 'text-purple-400';
      case 'expert': return 'text-red-400';
      case 'advanced': return 'text-orange-400';
      case 'intermediate': return 'text-yellow-400';
      case 'beginner': return 'text-green-400';
      default: return 'text-slate-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'border-red-500/30 bg-red-500/5';
      case 'high': return 'border-orange-500/30 bg-orange-500/5';
      case 'medium': return 'border-yellow-500/30 bg-yellow-500/5';
      case 'low': return 'border-blue-500/30 bg-blue-500/5';
      default: return 'border-slate-500/30 bg-slate-500/5';
    }
  };

  return (
    <div className="min-h-screen" style={{ 
      background: 'radial-gradient(ellipse at center, #1E293B 0%, #0F172A 100%)',
      backgroundAttachment: 'fixed'
    }}>
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-cyan-400 bg-clip-text text-transparent mb-2">
                ReelSkills
              </h1>
              <p className="text-slate-400 text-lg">
                Showcase your skills • Learn with AI guidance • Accelerate your career
              </p>
            </div>
            <Button 
              onClick={() => setIsModalOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg"
            >
              <Plus size={16} className="mr-2" />
              Add Skill
            </Button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 mb-6">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-slate-800/20 backdrop-blur-sm border border-slate-700/20 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <Target size={20} className="text-blue-400" />
                <TrendingUp size={16} className="text-green-400" />
              </div>
              <div className="text-2xl font-bold text-white">{skills.length}</div>
              <div className="text-sm text-slate-400">Total Skills</div>
            </div>

            <div className="bg-slate-800/20 backdrop-blur-sm border border-slate-700/20 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <Award size={20} className="text-emerald-400" />
                <CheckCircle size={16} className="text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-emerald-300">
                {skills.filter(s => s.verified).length}
              </div>
              <div className="text-sm text-slate-400">Verified</div>
            </div>

            <div className="bg-slate-800/20 backdrop-blur-sm border border-slate-700/20 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <Clock size={20} className="text-amber-400" />
                <Zap size={16} className="text-amber-400" />
              </div>
              <div className="text-2xl font-bold text-amber-300">
                {skills.filter(s => s.years_experience > 0).length}
              </div>
              <div className="text-sm text-slate-400">With Experience</div>
            </div>

            <div className="bg-slate-800/20 backdrop-blur-sm border border-slate-700/20 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <Brain size={20} className="text-purple-400" />
                <Sparkles size={16} className="text-purple-400" />
              </div>
              <div className="text-2xl font-bold text-purple-300">{aiInsights.length}</div>
              <div className="text-sm text-slate-400">AI Insights</div>
            </div>
          </div>
        </div>

        {/* AI Insights Section */}
        {aiInsights.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Brain size={24} className="text-purple-400" />
              <h2 className="text-xl font-bold text-white">AI Career Guidance</h2>
            </div>
            <div className="grid gap-4">
              {aiInsights.map((insight, index) => (
                <div 
                  key={index}
                  className={`bg-slate-800/20 backdrop-blur-sm border rounded-xl p-6 ${getPriorityColor(insight.priority)}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Lightbulb size={20} className="text-yellow-400" />
                      <h3 className="font-semibold text-white">{insight.title}</h3>
                    </div>
                    {insight.actionable && (
                      <Button 
                        size="small" 
                        className="bg-blue-600/80 hover:bg-blue-700/80"
                        onClick={() => handleInsightAction(insight)}
                      >
                        <ArrowRight size={14} className="mr-1" />
                        Act
                      </Button>
                    )}
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed">{insight.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Target size={24} className="text-blue-400" />
            <h2 className="text-xl font-bold text-white">Your Skills Portfolio</h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-slate-800/20 backdrop-blur-sm border border-slate-700/20 rounded-xl p-6 animate-pulse">
                  <div className="h-4 bg-slate-700/30 rounded mb-4"></div>
                  <div className="h-3 bg-slate-700/30 rounded mb-2"></div>
                  <div className="h-3 bg-slate-700/30 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : skills.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-slate-800/20 backdrop-blur-sm border border-slate-700/20 rounded-xl p-8 max-w-md mx-auto">
                <BookOpen size={48} className="text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Start Your Skills Journey</h3>
                <p className="text-slate-400 mb-6">
                  Add your first skill to begin showcasing your expertise and receiving AI-powered career guidance.
                </p>
                <Button 
                  onClick={() => setIsModalOpen(true)}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                >
                  <Plus size={16} className="mr-2" />
                  Add Your First Skill
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {skills.map((skill) => {
                const CategoryIcon = getCategoryIcon(skill.category);
                const StatusIcon = getStatusIcon(skill.status);
                
                return (
                  <div
                    key={skill.id}
                    className="group bg-slate-800/20 backdrop-blur-sm border border-slate-700/20 rounded-xl p-6 hover:border-blue-500/30 transition-all duration-300 cursor-pointer"
                    onClick={() => handleSkillClick(skill)}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-700/30 rounded-lg">
                          <CategoryIcon size={20} className="text-blue-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white group-hover:text-blue-300 transition-colors">
                            {skill.name}
                          </h3>
                          <p className="text-sm text-slate-400 capitalize">{skill.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <StatusIcon size={16} className={getStatusColor(skill.status)} />
                        {skill.ai_rating && (
                          <div className="flex items-center gap-1 ml-2">
                            <Star size={12} className="text-yellow-400" />
                            <span className="text-xs text-yellow-400">{skill.ai_rating}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Proficiency */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-400">Proficiency</span>
                        <span className={`text-sm font-medium capitalize ${getProficiencyColor(skill.proficiency)}`}>
                          {skill.proficiency}
                        </span>
                      </div>
                      <div className="w-full bg-slate-700/30 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-cyan-400 h-2 rounded-full transition-all duration-500"
                          style={{ 
                            width: `${
                              skill.proficiency === 'beginner' ? 20 :
                              skill.proficiency === 'intermediate' ? 40 :
                              skill.proficiency === 'advanced' ? 60 :
                              skill.proficiency === 'expert' ? 80 : 100
                            }%` 
                          }}
                        />
                      </div>
                    </div>

                    {/* Experience & Status */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-slate-400">
                          {skill.years_experience} {skill.years_experience === 1 ? 'year' : 'years'}
                        </span>
                        {skill.endorsements > 0 && (
                          <span className="text-green-400">
                            {skill.endorsements} endorsements
                          </span>
                        )}
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          size="small" 
                          variant="outline" 
                          className="bg-slate-800/30 border-slate-600/30 text-slate-300"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSkillClick(skill);
                          }}
                        >
                          <Eye size={12} className="mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Add Skill Modal */}
        <AddSkillModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
        />

        {/* Skill Detail Modal */}
        <SkillDetailModal
          skill={selectedSkill}
          isOpen={!!selectedSkill}
          onClose={() => setSelectedSkill(null)}
          onUpdate={handleUpdateSkill}
        />

        {/* Learning Path Modal */}
        <LearningPathModal
          skill={learningPathModal.skill}
          isOpen={learningPathModal.isOpen}
          onClose={() => setLearningPathModal({ isOpen: false })}
        />

        {/* Skill Recommendation Modal */}
        <SkillRecommendationModal
          recommendations={skillRecommendationModal.recommendations || []}
          isOpen={skillRecommendationModal.isOpen}
          onClose={() => setSkillRecommendationModal({ isOpen: false })}
          onAddSkill={(skillName) => {
            // Auto-fill the add skill modal with the recommended skill
            setSkillRecommendationModal({ isOpen: false });
            setIsModalOpen(true);
          }}
        />
      </div>
    </div>
  );
};

export default ReelSkillsDashboard;