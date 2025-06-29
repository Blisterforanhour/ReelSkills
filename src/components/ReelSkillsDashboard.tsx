import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../lib/auth';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { getSupabaseClient } from '../lib/auth';
import { AddSkillModal } from './AddSkillModal';
import { 
  Target, 
  Video, 
  Code, 
  FileText, 
  Presentation, 
  Award, 
  Plus, 
  CheckCircle, 
  Clock,
  Star,
  Upload,
  TrendingUp,
  Brain,
  Eye,
  Filter,
  Search,
  BarChart3,
  Zap,
  BookOpen,
  PlayCircle,
  Calendar,
  Users,
  Trophy,
  Sparkles,
  ArrowRight,
  ChevronRight
} from 'lucide-react';

interface Skill {
  id: string;
  name: string;
  category: 'technical' | 'soft' | 'language' | 'certification';
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'master';
  demonstrationMethod: 'code' | 'video' | 'documentation' | 'presentation' | 'live-demo';
  status: 'planned' | 'in-progress' | 'completed' | 'verified';
  rating?: number;
  verifiedAt?: string;
  progress?: number;
  nextMilestone?: string;
  aiInsights?: string[];
  marketDemand?: 'low' | 'medium' | 'high' | 'critical';
  learningPath?: string[];
}

const ReelSkillsDashboard: React.FC = () => {
  const { user, profile } = useAuthStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'progress'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [skills, setSkills] = useState<Skill[]>([
    {
      id: '1',
      name: 'React',
      category: 'technical',
      proficiency: 'advanced',
      demonstrationMethod: 'code',
      status: 'verified',
      rating: 5,
      verifiedAt: '2024-01-15',
      progress: 95,
      nextMilestone: 'Advanced Patterns & Performance',
      aiInsights: ['Strong component architecture', 'Excellent state management', 'Consider exploring React 19 features'],
      marketDemand: 'critical',
      learningPath: ['Hooks Mastery', 'Context API', 'Performance Optimization', 'Testing Strategies']
    },
    {
      id: '2',
      name: 'TypeScript',
      category: 'technical',
      proficiency: 'intermediate',
      demonstrationMethod: 'code',
      status: 'verified',
      rating: 4,
      verifiedAt: '2024-01-10',
      progress: 75,
      nextMilestone: 'Advanced Types & Generics',
      aiInsights: ['Good type safety practices', 'Expand utility types knowledge'],
      marketDemand: 'high',
      learningPath: ['Basic Types', 'Interfaces', 'Advanced Types', 'Generics']
    },
    {
      id: '3',
      name: 'Leadership',
      category: 'soft',
      proficiency: 'advanced',
      demonstrationMethod: 'video',
      status: 'completed',
      progress: 90,
      nextMilestone: 'Team Scaling & Mentorship',
      aiInsights: ['Natural communication style', 'Strong emotional intelligence'],
      marketDemand: 'high',
      learningPath: ['Communication', 'Delegation', 'Conflict Resolution', 'Strategic Thinking']
    },
    {
      id: '4',
      name: 'Python',
      category: 'technical',
      proficiency: 'expert',
      demonstrationMethod: 'code',
      status: 'in-progress',
      progress: 60,
      nextMilestone: 'Machine Learning Integration',
      aiInsights: ['Excellent algorithmic thinking', 'Consider data science applications'],
      marketDemand: 'critical',
      learningPath: ['Basics', 'OOP', 'Data Structures', 'ML Libraries']
    },
    {
      id: '5',
      name: 'AWS Certified',
      category: 'certification',
      proficiency: 'intermediate',
      demonstrationMethod: 'documentation',
      status: 'planned',
      progress: 25,
      nextMilestone: 'Solutions Architect Associate',
      aiInsights: ['Strong foundation needed', 'Focus on core services first'],
      marketDemand: 'critical',
      learningPath: ['Cloud Fundamentals', 'Core Services', 'Architecture', 'Security']
    }
  ]);

  const supabase = getSupabaseClient();

  useEffect(() => {
    const fetchSkills = async () => {
      if (!profile?.id) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('skills')
          .select('*')
          .eq('profile_id', profile.id);

        if (!error && data && data.length > 0) {
          setSkills(
            data.map((row: any) => ({
              id: row.id,
              name: row.name,
              category: row.category,
              proficiency: row.proficiency,
              demonstrationMethod: 'code',
              status: row.verified ? 'verified' : 'planned',
              rating: row.ai_rating ?? undefined,
              verifiedAt: row.verified ? row.updated_at : undefined,
              progress: Math.random() * 100,
              marketDemand: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)] as any,
            }))
          );
        }
      } catch (error) {
        console.error('Error fetching skills:', error);
      }
      setLoading(false);
    };

    fetchSkills();
  }, [supabase, profile?.id]);

  const categories = [
    { value: 'all', label: 'All Skills', icon: Target },
    { value: 'technical', label: 'Technical', icon: Code },
    { value: 'soft', label: 'Soft Skills', icon: Users },
    { value: 'language', label: 'Languages', icon: BookOpen },
    { value: 'certification', label: 'Certifications', icon: Award }
  ];

  const filteredSkills = skills.filter(skill => {
    const matchesCategory = selectedCategory === 'all' || skill.category === selectedCategory;
    const matchesSearch = skill.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'text-green-400';
      case 'completed': return 'text-blue-400';
      case 'in-progress': return 'text-yellow-400';
      case 'planned': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-500/20 border-green-500/30';
      case 'completed': return 'bg-blue-500/20 border-blue-500/30';
      case 'in-progress': return 'bg-yellow-500/20 border-yellow-500/30';
      case 'planned': return 'bg-gray-500/20 border-gray-500/30';
      default: return 'bg-gray-500/20 border-gray-500/30';
    }
  };

  const getMarketDemandColor = (demand: string) => {
    switch (demand) {
      case 'critical': return 'text-red-400';
      case 'high': return 'text-orange-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-gray-400';
      default: return 'text-gray-400';
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

  const getDemonstrationIcon = (method: string) => {
    switch (method) {
      case 'code': return Code;
      case 'video': return Video;
      case 'documentation': return FileText;
      case 'presentation': return Presentation;
      case 'live-demo': return PlayCircle;
      default: return Target;
    }
  };

  const stats = {
    total: skills.length,
    verified: skills.filter(s => s.status === 'verified').length,
    inProgress: skills.filter(s => s.status === 'in-progress').length,
    avgRating: skills.filter(s => s.rating).reduce((acc, s) => acc + (s.rating || 0), 0) / skills.filter(s => s.rating).length || 0,
    avgProgress: skills.reduce((acc, s) => acc + (s.progress || 0), 0) / skills.length || 0,
    criticalSkills: skills.filter(s => s.marketDemand === 'critical').length
  };

  const handleSave = async ({ name, category, proficiency, demonstrationMethod }: Omit<Skill, 'id' | 'status'>) => {
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
          demonstrationMethod: 'code',
          status: data.verified ? 'verified' : 'planned',
          progress: 0,
          marketDemand: 'medium',
          aiInsights: ['New skill added - start with fundamentals']
        };
        setSkills(prev => [...prev, newSkill]);
      }
    } catch (error) {
      console.error('Error saving skill:', error);
    }
  };

  const renderSkillCard = (skill: Skill) => {
    const StatusIcon = getStatusIcon(skill.status);
    const DemoIcon = getDemonstrationIcon(skill.demonstrationMethod);
    
    return (
      <div
        key={skill.id}
        className="group relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10"
        onClick={() => setSelectedSkill(skill)}
      >
        {/* Status Badge */}
        <div className={`absolute top-4 right-4 px-2 py-1 rounded-full text-xs font-medium border ${getStatusBg(skill.status)}`}>
          <StatusIcon size={12} className={`inline mr-1 ${getStatusColor(skill.status)}`} />
          {skill.status}
        </div>

        {/* Market Demand Indicator */}
        {skill.marketDemand && (
          <div className={`absolute top-4 left-4 w-3 h-3 rounded-full ${
            skill.marketDemand === 'critical' ? 'bg-red-500' :
            skill.marketDemand === 'high' ? 'bg-orange-500' :
            skill.marketDemand === 'medium' ? 'bg-yellow-500' : 'bg-gray-500'
          } animate-pulse`} />
        )}

        {/* Main Content */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors">
              {skill.name}
            </h3>
            <DemoIcon size={20} className="text-slate-400" />
          </div>

          <div className="flex items-center gap-2 mb-4">
            <span className="px-2 py-1 bg-slate-700/50 rounded text-xs text-slate-300 capitalize">
              {skill.category}
            </span>
            <span className="px-2 py-1 bg-blue-500/20 rounded text-xs text-blue-300 capitalize">
              {skill.proficiency}
            </span>
          </div>

          {/* Progress Bar */}
          {skill.progress !== undefined && (
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-400">Progress</span>
                <span className="text-blue-300">{Math.round(skill.progress)}%</span>
              </div>
              <div className="w-full bg-slate-700/50 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-cyan-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${skill.progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Rating */}
          {skill.rating && (
            <div className="flex items-center gap-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={i < skill.rating! ? 'text-yellow-400 fill-current' : 'text-slate-600'}
                />
              ))}
              <span className="text-sm text-slate-400 ml-1">({skill.rating}/5)</span>
            </div>
          )}

          {/* Next Milestone */}
          {skill.nextMilestone && (
            <div className="text-sm text-slate-400 mb-3">
              <Target size={12} className="inline mr-1" />
              Next: {skill.nextMilestone}
            </div>
          )}

          {/* AI Insights Preview */}
          {skill.aiInsights && skill.aiInsights.length > 0 && (
            <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg p-3 border border-purple-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Brain size={14} className="text-purple-400" />
                <span className="text-sm font-medium text-purple-300">AI Insights</span>
              </div>
              <p className="text-xs text-slate-300 line-clamp-2">
                {skill.aiInsights[0]}
              </p>
            </div>
          )}
        </div>

        {/* Hover Actions */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl flex items-end justify-center pb-4">
          <div className="flex gap-2">
            <Button size="small" variant="outline" className="bg-slate-800/80 backdrop-blur-sm">
              <Eye size={14} className="mr-1" />
              View Details
            </Button>
            {skill.status === 'planned' && (
              <Button size="small" className="bg-blue-600/80 backdrop-blur-sm">
                <PlayCircle size={14} className="mr-1" />
                Start Learning
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen" style={{ 
      background: 'radial-gradient(ellipse at center, #1E293B 0%, #0F172A 100%)',
      backgroundAttachment: 'fixed'
    }}>
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-cyan-400 bg-clip-text text-transparent mb-2">
                Skills Dashboard
              </h1>
              <p className="text-slate-400 text-lg">
                Welcome back, {profile?.first_name || user?.email?.split('@')[0]}! Track your skill journey and unlock new opportunities.
              </p>
            </div>
            <Button 
              onClick={() => setIsModalOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg hover:shadow-blue-500/25"
            >
              <Plus size={16} className="mr-2" />
              Add New Skill
            </Button>
          </div>

          {/* Enhanced Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <Target size={20} className="text-blue-400" />
                <TrendingUp size={16} className="text-green-400" />
              </div>
              <div className="text-2xl font-bold text-white">{stats.total}</div>
              <div className="text-sm text-slate-400">Total Skills</div>
            </div>

            <div className="bg-gradient-to-br from-green-800/30 to-green-900/30 backdrop-blur-sm border border-green-700/50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <Award size={20} className="text-green-400" />
                <CheckCircle size={16} className="text-green-400" />
              </div>
              <div className="text-2xl font-bold text-green-300">{stats.verified}</div>
              <div className="text-sm text-green-200/70">Verified</div>
            </div>

            <div className="bg-gradient-to-br from-yellow-800/30 to-yellow-900/30 backdrop-blur-sm border border-yellow-700/50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <Clock size={20} className="text-yellow-400" />
                <Zap size={16} className="text-yellow-400" />
              </div>
              <div className="text-2xl font-bold text-yellow-300">{stats.inProgress}</div>
              <div className="text-sm text-yellow-200/70">In Progress</div>
            </div>

            <div className="bg-gradient-to-br from-purple-800/30 to-purple-900/30 backdrop-blur-sm border border-purple-700/50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <Star size={20} className="text-purple-400" />
                <Sparkles size={16} className="text-purple-400" />
              </div>
              <div className="text-2xl font-bold text-purple-300">{stats.avgRating.toFixed(1)}</div>
              <div className="text-sm text-purple-200/70">Avg Rating</div>
            </div>

            <div className="bg-gradient-to-br from-cyan-800/30 to-cyan-900/30 backdrop-blur-sm border border-cyan-700/50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <BarChart3 size={20} className="text-cyan-400" />
                <TrendingUp size={16} className="text-cyan-400" />
              </div>
              <div className="text-2xl font-bold text-cyan-300">{Math.round(stats.avgProgress)}%</div>
              <div className="text-sm text-cyan-200/70">Avg Progress</div>
            </div>

            <div className="bg-gradient-to-br from-red-800/30 to-red-900/30 backdrop-blur-sm border border-red-700/50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <Trophy size={20} className="text-red-400" />
                <ArrowRight size={16} className="text-red-400" />
              </div>
              <div className="text-2xl font-bold text-red-300">{stats.criticalSkills}</div>
              <div className="text-sm text-red-200/70">High Demand</div>
            </div>
          </div>
        </div>

        {/* Enhanced Controls */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-400 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.value}
                  onClick={() => setSelectedCategory(category.value)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl whitespace-nowrap transition-all ${
                    selectedCategory === category.value
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                      : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 border border-slate-700/50'
                  }`}
                >
                  <Icon size={16} />
                  {category.label}
                </button>
              );
            })}
          </div>

          {/* View Mode Toggle */}
          <div className="flex bg-slate-800/50 rounded-xl p-1 border border-slate-700/50">
            {[
              { mode: 'grid', icon: BarChart3, label: 'Grid' },
              { mode: 'list', icon: Filter, label: 'List' },
              { mode: 'progress', icon: TrendingUp, label: 'Progress' }
            ].map(({ mode, icon: Icon, label }) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode as any)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                  viewMode === mode
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <Icon size={14} />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* AI Insights Panel */}
        {showAIInsights && (
          <div className="mb-8 bg-gradient-to-r from-purple-500/10 to-blue-500/10 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Brain size={24} className="text-purple-400" />
                <h2 className="text-xl font-bold text-white">AI Career Insights</h2>
              </div>
              <Button 
                variant="outline" 
                size="small"
                onClick={() => setShowAIInsights(false)}
                className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
              >
                Close
              </Button>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-purple-300 mb-2">Recommended Focus Areas</h3>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li className="flex items-center gap-2">
                    <ChevronRight size={14} className="text-purple-400" />
                    Complete Python ML integration for higher market value
                  </li>
                  <li className="flex items-center gap-2">
                    <ChevronRight size={14} className="text-purple-400" />
                    AWS certification will boost your DevOps profile
                  </li>
                  <li className="flex items-center gap-2">
                    <ChevronRight size={14} className="text-purple-400" />
                    Leadership skills complement your technical expertise perfectly
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-purple-300 mb-2">Market Opportunities</h3>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li className="flex items-center gap-2">
                    <ChevronRight size={14} className="text-purple-400" />
                    Full-stack roles with React/Python are in high demand
                  </li>
                  <li className="flex items-center gap-2">
                    <ChevronRight size={14} className="text-purple-400" />
                    Tech leadership positions value your skill combination
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Skills Grid/List */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-slate-800/50 rounded-xl p-6 animate-pulse">
                <div className="h-4 bg-slate-700 rounded mb-4"></div>
                <div className="h-3 bg-slate-700 rounded mb-2"></div>
                <div className="h-3 bg-slate-700 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSkills.map(renderSkillCard)}
              </div>
            )}

            {viewMode === 'progress' && (
              <div className="space-y-4">
                {filteredSkills.map((skill) => (
                  <div key={skill.id} className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getStatusBg(skill.status)}`}>
                          {React.createElement(getStatusIcon(skill.status), { size: 20, className: getStatusColor(skill.status) })}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white">{skill.name}</h3>
                          <p className="text-sm text-slate-400 capitalize">{skill.category} • {skill.proficiency}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-300">{Math.round(skill.progress || 0)}%</div>
                        <div className="text-sm text-slate-400">Complete</div>
                      </div>
                    </div>
                    <div className="w-full bg-slate-700/50 rounded-full h-3 mb-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-cyan-400 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${skill.progress || 0}%` }}
                      />
                    </div>
                    {skill.nextMilestone && (
                      <p className="text-sm text-slate-400">
                        <Target size={12} className="inline mr-1" />
                        Next milestone: {skill.nextMilestone}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* AI Insights Button */}
        {!showAIInsights && (
          <div className="fixed bottom-8 right-8">
            <Button
              onClick={() => setShowAIInsights(true)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-purple-500/25 rounded-full p-4"
            >
              <Brain size={20} />
            </Button>
          </div>
        )}

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