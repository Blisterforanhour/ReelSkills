import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../lib/auth';
import { Button } from './ui/Button';
import { getSupabaseClient } from '../lib/auth';
import { AddSkillModal } from './AddSkillModal';
import { 
  Target, 
  Plus, 
  Brain,
  TrendingUp,
  BookOpen,
  Zap,
  ArrowRight,
  Lightbulb,
  CheckCircle,
  Clock,
  Star,
  Award,
  Code,
  Users,
  Globe,
  Certificate,
  PlayCircle,
  Eye,
  Sparkles
} from 'lucide-react';

interface Skill {
  id: string;
  name: string;
  category: 'technical' | 'soft' | 'language' | 'certification';
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'master';
  status: 'planned' | 'in-progress' | 'completed' | 'verified';
  created_at?: string;
  updated_at?: string;
}

interface AIInsight {
  type: 'recommendation' | 'learning-path' | 'market-trend' | 'skill-gap';
  title: string;
  description: string;
  actionable: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

const ReelSkillsDashboard: React.FC = () => {
  const { user, profile } = useAuthStore();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);

  const supabase = getSupabaseClient();

  useEffect(() => {
    const fetchSkills = async () => {
      if (!profile?.id) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('skills')
          .select('*')
          .eq('profile_id', profile.id)
          .order('created_at', { ascending: false });

        if (!error && data) {
          setSkills(data.map((row: any) => ({
            id: row.id,
            name: row.name,
            category: row.category,
            proficiency: row.proficiency,
            status: row.verified ? 'verified' : 'planned',
            created_at: row.created_at,
            updated_at: row.updated_at,
          })));
        }
      } catch (error) {
        console.error('Error fetching skills:', error);
      }
      setLoading(false);
    };

    fetchSkills();
  }, [supabase, profile?.id]);

  // Generate AI insights based on current skills
  useEffect(() => {
    if (skills.length > 0) {
      const insights: AIInsight[] = [
        {
          type: 'recommendation',
          title: 'Complete Your Learning Path',
          description: `Focus on advancing your ${skills[0]?.name || 'primary'} skills to the next proficiency level.`,
          actionable: true,
          priority: 'high'
        },
        {
          type: 'market-trend',
          title: 'High-Demand Skills Alert',
          description: 'AI and Machine Learning skills are seeing 40% growth in job postings this quarter.',
          actionable: true,
          priority: 'critical'
        },
        {
          type: 'skill-gap',
          title: 'Skill Gap Analysis',
          description: 'Consider adding cloud computing skills to complement your technical stack.',
          actionable: true,
          priority: 'medium'
        }
      ];
      setAiInsights(insights);
    }
  }, [skills]);

  const handleSave = async ({ name, category, proficiency }: Omit<Skill, 'id' | 'status'>) => {
    if (!profile?.id) return;
    try {
      const { data, error } = await supabase
        .from('skills')
        .insert({
          profile_id: profile.id,
          name,
          category,
          proficiency,
          years_experience: 0,
          description: null,
        })
        .select()
        .single();

      if (!error && data) {
        const newSkill: Skill = {
          id: data.id,
          name: data.name,
          category: data.category,
          proficiency: data.proficiency,
          status: 'planned',
          created_at: data.created_at,
          updated_at: data.updated_at,
        };
        setSkills(prev => [newSkill, ...prev]);
      }
    } catch (error) {
      console.error('Error saving skill:', error);
    }
  };

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
      case 'critical': return 'border-red-500/50 bg-red-500/10';
      case 'high': return 'border-orange-500/50 bg-orange-500/10';
      case 'medium': return 'border-yellow-500/50 bg-yellow-500/10';
      case 'low': return 'border-blue-500/50 bg-blue-500/10';
      default: return 'border-slate-500/50 bg-slate-500/10';
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

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-br from-slate-800/30 to-slate-900/30 backdrop-blur-sm border border-slate-700/30 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <Target size={20} className="text-blue-400" />
                <TrendingUp size={16} className="text-green-400" />
              </div>
              <div className="text-2xl font-bold text-white">{skills.length}</div>
              <div className="text-sm text-slate-400">Total Skills</div>
            </div>

            <div className="bg-gradient-to-br from-slate-800/30 to-slate-900/30 backdrop-blur-sm border border-slate-700/30 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <Award size={20} className="text-emerald-400" />
                <CheckCircle size={16} className="text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-emerald-300">
                {skills.filter(s => s.status === 'verified').length}
              </div>
              <div className="text-sm text-slate-400">Verified</div>
            </div>

            <div className="bg-gradient-to-br from-slate-800/30 to-slate-900/30 backdrop-blur-sm border border-slate-700/30 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <Clock size={20} className="text-amber-400" />
                <Zap size={16} className="text-amber-400" />
              </div>
              <div className="text-2xl font-bold text-amber-300">
                {skills.filter(s => s.status === 'in-progress').length}
              </div>
              <div className="text-sm text-slate-400">In Progress</div>
            </div>

            <div className="bg-gradient-to-br from-slate-800/30 to-slate-900/30 backdrop-blur-sm border border-slate-700/30 rounded-xl p-4">
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
                  className={`bg-gradient-to-br from-slate-800/30 to-slate-900/30 backdrop-blur-sm border rounded-xl p-6 ${getPriorityColor(insight.priority)}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Lightbulb size={20} className="text-yellow-400" />
                      <h3 className="font-semibold text-white">{insight.title}</h3>
                    </div>
                    {insight.actionable && (
                      <Button size="small" className="bg-blue-600/80 hover:bg-blue-700/80">
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
                <div key={i} className="bg-gradient-to-br from-slate-800/30 to-slate-900/30 backdrop-blur-sm border border-slate-700/30 rounded-xl p-6 animate-pulse">
                  <div className="h-4 bg-slate-700/50 rounded mb-4"></div>
                  <div className="h-3 bg-slate-700/50 rounded mb-2"></div>
                  <div className="h-3 bg-slate-700/50 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : skills.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gradient-to-br from-slate-800/30 to-slate-900/30 backdrop-blur-sm border border-slate-700/30 rounded-xl p-8 max-w-md mx-auto">
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
                    className="group bg-gradient-to-br from-slate-800/30 to-slate-900/30 backdrop-blur-sm border border-slate-700/30 rounded-xl p-6 hover:border-blue-500/50 transition-all duration-300 cursor-pointer"
                    onClick={() => setSelectedSkill(skill)}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-700/50 rounded-lg">
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
                      <div className="w-full bg-slate-700/50 rounded-full h-2">
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

                    {/* Status */}
                    <div className="flex items-center justify-between">
                      <span className={`text-sm capitalize ${getStatusColor(skill.status)}`}>
                        {skill.status.replace('-', ' ')}
                      </span>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="small" variant="outline" className="bg-slate-800/50 border-slate-600/50 text-slate-300">
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
      </div>
    </div>
  );
};

export default ReelSkillsDashboard;