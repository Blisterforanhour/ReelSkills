import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../lib/auth';
import { Button } from './ui/Button';
import { getSupabaseClient } from '../lib/auth';
import { AddSkillModal } from './AddSkillModal';
import { VideoUploadModal } from './VideoUploadModal';
import { SkillDetailModal } from './SkillDetailModal';
import { Target, Plus, Brain, Star, Award, Video, ArrowRight, Lightbulb, AlertCircle, RefreshCw, Play, Upload, CheckCircle, Clock, TrendingUp, Edit, BookOpen, Certificate } from 'lucide-react';

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

interface AIImprovement {
  type: 'video' | 'practice' | 'certification' | 'experience' | 'proficiency';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  actionable: boolean;
  estimatedTime?: string;
  actionData?: any;
}

const ReelSkillsDashboard: React.FC = () => {
  const { user, profile, createProfile } = useAuthStore();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [currentSkill, setCurrentSkill] = useState<Skill | null>(null);
  const [improvements, setImprovements] = useState<AIImprovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showVideoUpload, setShowVideoUpload] = useState(false);
  const [showSkillDetail, setShowSkillDetail] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creatingProfile, setCreatingProfile] = useState(false);
  const [loadingImprovements, setLoadingImprovements] = useState(false);

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
        
        // Set the first skill as current if none selected
        if (formattedSkills.length > 0 && !currentSkill) {
          setCurrentSkill(formattedSkills[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching skills:', error);
      setError('Failed to load skills');
      setSkills([]);
    } finally {
      setLoading(false);
    }
  };

  const generateImprovements = (skill: Skill): AIImprovement[] => {
    const improvements: AIImprovement[] = [];

    // Video demonstration
    if (!skill.video_demo_url) {
      improvements.push({
        type: 'video',
        title: 'Add Video Demonstration',
        description: 'Upload a video showing your skills in action. This increases profile credibility by 300%.',
        priority: 'critical',
        actionable: true,
        estimatedTime: '30 minutes',
        actionData: { action: 'upload_video' }
      });
    } else if (!skill.video_verified) {
      improvements.push({
        type: 'video',
        title: 'Get AI Verification',
        description: 'Your video needs AI analysis for verification. This will provide detailed feedback.',
        priority: 'high',
        actionable: true,
        estimatedTime: '5 minutes',
        actionData: { action: 'analyze_video' }
      });
    }

    // Experience tracking
    if (skill.years_experience === 0) {
      improvements.push({
        type: 'experience',
        title: 'Add Experience Details',
        description: 'Document your years of experience to show skill maturity.',
        priority: 'medium',
        actionable: true,
        estimatedTime: '2 minutes',
        actionData: { action: 'edit_experience' }
      });
    }

    // Description enhancement
    if (!skill.description || skill.description.length < 50) {
      improvements.push({
        type: 'experience',
        title: 'Enhance Skill Description',
        description: 'Add a detailed description of your experience and projects with this skill.',
        priority: 'medium',
        actionable: true,
        estimatedTime: '5 minutes',
        actionData: { action: 'edit_description' }
      });
    }

    // Proficiency advancement
    if (skill.proficiency !== 'master' && skill.years_experience > 0) {
      const nextLevel = getNextProficiencyLevel(skill.proficiency);
      improvements.push({
        type: 'proficiency',
        title: `Advance to ${nextLevel} Level`,
        description: `With ${skill.years_experience} years of experience, consider advancing from ${skill.proficiency} to ${nextLevel}.`,
        priority: 'medium',
        actionable: true,
        estimatedTime: '1-2 weeks of focused learning',
        actionData: { 
          action: 'advance_proficiency',
          currentLevel: skill.proficiency,
          nextLevel: nextLevel
        }
      });
    }

    // Practice suggestions based on proficiency
    if (skill.proficiency === 'beginner') {
      improvements.push({
        type: 'practice',
        title: 'Complete Foundational Practice',
        description: 'Focus on basic exercises and tutorials to strengthen your foundation.',
        priority: 'high',
        actionable: true,
        estimatedTime: '2-3 weeks',
        actionData: { 
          action: 'practice_resources',
          level: 'beginner',
          resources: [
            'Complete online tutorials',
            'Build 2-3 simple projects',
            'Join beginner communities'
          ]
        }
      });
    }

    // Certification for advanced skills
    if ((skill.proficiency === 'advanced' || skill.proficiency === 'expert') && skill.category === 'technical') {
      improvements.push({
        type: 'certification',
        title: 'Earn Professional Certification',
        description: 'Get industry-recognized certification to validate your expertise.',
        priority: 'medium',
        actionable: true,
        estimatedTime: '4-6 weeks',
        actionData: { 
          action: 'certification_guide',
          skillName: skill.name,
          certifications: getCertificationSuggestions(skill.name)
        }
      });
    }

    return improvements.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  };

  const getNextProficiencyLevel = (current: string) => {
    switch (current) {
      case 'beginner': return 'intermediate';
      case 'intermediate': return 'advanced';
      case 'advanced': return 'expert';
      case 'expert': return 'master';
      default: return 'master';
    }
  };

  const getCertificationSuggestions = (skillName: string): string[] => {
    const certMap: Record<string, string[]> = {
      'JavaScript': ['JavaScript Institute Certification', 'Meta Front-End Developer'],
      'React': ['Meta React Developer', 'React Certification by HackerRank'],
      'Python': ['Python Institute PCAP', 'Microsoft Python Certification'],
      'AWS': ['AWS Certified Solutions Architect', 'AWS Certified Developer'],
      'Azure': ['Azure Fundamentals', 'Azure Developer Associate'],
      'Docker': ['Docker Certified Associate', 'Kubernetes Certification'],
      'Node.js': ['Node.js Certification', 'OpenJS Node.js Services Developer']
    };
    
    return certMap[skillName] || ['Industry-specific certification', 'Professional development course'];
  };

  const handleTakeAction = async (improvement: AIImprovement) => {
    if (!currentSkill || !improvement.actionData) return;

    const { action } = improvement.actionData;

    switch (action) {
      case 'upload_video':
      case 'analyze_video':
        setShowVideoUpload(true);
        break;

      case 'edit_experience':
      case 'edit_description':
        setShowSkillDetail(true);
        break;

      case 'advance_proficiency':
        await handleAdvanceProficiency(improvement.actionData);
        break;

      case 'practice_resources':
        showPracticeResources(improvement.actionData);
        break;

      case 'certification_guide':
        showCertificationGuide(improvement.actionData);
        break;

      default:
        console.log('Unknown action:', action);
    }
  };

  const handleAdvanceProficiency = async (actionData: any) => {
    if (!currentSkill) return;

    const confirmed = window.confirm(
      `Are you ready to advance your ${currentSkill.name} skills from ${actionData.currentLevel} to ${actionData.nextLevel}? This should reflect your actual skill level.`
    );

    if (confirmed) {
      try {
        const { error } = await supabase
          .from('skills')
          .update({ proficiency: actionData.nextLevel })
          .eq('id', currentSkill.id);

        if (error) throw error;

        // Update local state
        const updatedSkill = { ...currentSkill, proficiency: actionData.nextLevel };
        setCurrentSkill(updatedSkill);
        setSkills(prev => prev.map(skill => 
          skill.id === currentSkill.id ? updatedSkill : skill
        ));

        // Refresh improvements
        const newImprovements = generateImprovements(updatedSkill);
        setImprovements(newImprovements);

        alert(`Congratulations! Your ${currentSkill.name} proficiency has been advanced to ${actionData.nextLevel} level.`);
      } catch (error) {
        console.error('Error updating proficiency:', error);
        alert('Failed to update proficiency. Please try again.');
      }
    }
  };

  const showPracticeResources = (actionData: any) => {
    const { resources, level } = actionData;
    const resourceList = resources.join('\n• ');
    
    alert(`Practice Resources for ${level} level:\n\n• ${resourceList}\n\nThese activities will help strengthen your foundation and prepare you for the next level.`);
  };

  const showCertificationGuide = (actionData: any) => {
    const { skillName, certifications } = actionData;
    const certList = certifications.join('\n• ');
    
    alert(`Recommended Certifications for ${skillName}:\n\n• ${certList}\n\nThese certifications will validate your expertise and boost your professional credibility.`);
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
        const updatedSkill = { ...currentSkill, ...updates, updated_at: data.updated_at };
        setCurrentSkill(updatedSkill);
        setSkills(prev => prev.map(skill => 
          skill.id === skillId ? updatedSkill : skill
        ));

        // Refresh improvements after update
        if (currentSkill) {
          const newImprovements = generateImprovements(updatedSkill);
          setImprovements(newImprovements);
        }
      }
    } catch (error) {
      console.error('Error updating skill:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchSkills();
  }, [profile?.id]);

  useEffect(() => {
    if (currentSkill) {
      setLoadingImprovements(true);
      // Simulate AI processing time
      setTimeout(() => {
        const skillImprovements = generateImprovements(currentSkill);
        setImprovements(skillImprovements);
        setLoadingImprovements(false);
      }, 1000);
    }
  }, [currentSkill]);

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
        setCurrentSkill(newSkill);
      }
    } catch (error) {
      console.error('Error saving skill:', error);
      setError('Failed to save skill');
      throw error;
    }
  };

  const handleVideoAnalyzed = async (result: { rating: number; feedback: string; verified: boolean }) => {
    if (!currentSkill) return;
    
    try {
      const { data, error } = await supabase
        .from('skills')
        .update({
          ai_rating: result.rating,
          ai_feedback: result.feedback,
          video_verified: result.verified,
          video_uploaded_at: new Date().toISOString(),
        })
        .eq('id', currentSkill.id)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const updatedSkill = { ...currentSkill, ...data };
        setCurrentSkill(updatedSkill);
        setSkills(prev => prev.map(skill => 
          skill.id === currentSkill.id ? updatedSkill : skill
        ));

        // Refresh improvements after video analysis
        const newImprovements = generateImprovements(updatedSkill);
        setImprovements(newImprovements);
      }
    } catch (error) {
      console.error('Error updating skill:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'border-red-500/30 bg-red-500/5 text-red-300';
      case 'high': return 'border-orange-500/30 bg-orange-500/5 text-orange-300';
      case 'medium': return 'border-yellow-500/30 bg-yellow-500/5 text-yellow-300';
      case 'low': return 'border-blue-500/30 bg-blue-500/5 text-blue-300';
      default: return 'border-slate-500/30 bg-slate-500/5 text-slate-300';
    }
  };

  const getImprovementIcon = (type: string) => {
    switch (type) {
      case 'video': return Video;
      case 'practice': return BookOpen;
      case 'certification': return Certificate;
      case 'experience': return Edit;
      case 'proficiency': return TrendingUp;
      default: return Lightbulb;
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

  return (
    <div className="min-h-screen" style={{ 
      background: 'radial-gradient(ellipse at center, #1E293B 0%, #0F172A 100%)',
      backgroundAttachment: 'fixed'
    }}>
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-cyan-400 bg-clip-text text-transparent mb-2">
            ReelSkills
          </h1>
          <p className="text-slate-400 text-lg">
            Master one skill at a time with AI-powered guidance
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 mb-6">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-white text-lg">Loading your skills...</p>
          </div>
        ) : skills.length === 0 ? (
          /* No Skills State */
          <div className="text-center py-16">
            <div className="bg-slate-800/20 backdrop-blur-sm border border-slate-700/20 rounded-xl p-12 max-w-md mx-auto">
              <Target size={64} className="text-slate-400 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold text-white mb-4">Start Your Journey</h3>
              <p className="text-slate-400 mb-8">
                Add your first skill and let AI guide you to mastery with personalized improvement suggestions.
              </p>
              <Button 
                onClick={() => setIsModalOpen(true)}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-lg px-8 py-4"
              >
                <Plus size={20} className="mr-2" />
                Add Your First Skill
              </Button>
            </div>
          </div>
        ) : (
          /* Main Content */
          <div className="space-y-8">
            {/* Skill Selector */}
            <div className="bg-slate-800/20 backdrop-blur-sm border border-slate-700/20 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Your Skills</h2>
                <Button 
                  size="small"
                  onClick={() => setIsModalOpen(true)}
                  className="bg-blue-600/80 hover:bg-blue-700/80"
                >
                  <Plus size={16} className="mr-1" />
                  Add Skill
                </Button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {skills.map((skill) => (
                  <button
                    key={skill.id}
                    onClick={() => setCurrentSkill(skill)}
                    className={`p-4 rounded-xl border transition-all text-left ${
                      currentSkill?.id === skill.id
                        ? 'border-blue-500/50 bg-blue-500/20 text-blue-300'
                        : 'border-slate-600/30 bg-slate-700/20 text-slate-300 hover:border-slate-500/50 hover:bg-slate-700/30'
                    }`}
                  >
                    <div className="font-medium mb-1">{skill.name}</div>
                    <div className="text-xs opacity-75 capitalize">{skill.proficiency}</div>
                    {skill.video_verified && (
                      <div className="flex items-center gap-1 mt-2">
                        <CheckCircle size={12} className="text-green-400" />
                        <span className="text-xs text-green-400">Verified</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Current Skill Focus */}
            {currentSkill && (
              <div className="bg-slate-800/20 backdrop-blur-sm border border-slate-700/20 rounded-xl p-8">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-white mb-2">{currentSkill.name}</h2>
                  <div className="flex items-center justify-center gap-4 text-slate-400">
                    <span className="capitalize">{currentSkill.category}</span>
                    <span>•</span>
                    <span className="capitalize">{currentSkill.proficiency}</span>
                    <span>•</span>
                    <span>{currentSkill.years_experience} years</span>
                  </div>
                  
                  {/* AI Rating */}
                  {currentSkill.ai_rating && (
                    <div className="flex items-center justify-center gap-2 mt-4">
                      <span className="text-slate-400">AI Rating:</span>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={16}
                            className={i < currentSkill.ai_rating! ? 'text-yellow-400' : 'text-slate-600'}
                            fill={i < currentSkill.ai_rating! ? 'currentColor' : 'none'}
                          />
                        ))}
                        <span className="text-yellow-400 ml-1">{currentSkill.ai_rating}/5</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Main Action Button */}
                <div className="text-center mb-8">
                  {!currentSkill.video_demo_url ? (
                    <Button
                      onClick={() => setShowVideoUpload(true)}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-xl px-12 py-6 rounded-2xl"
                    >
                      <Upload size={24} className="mr-3" />
                      Upload Video Demo
                    </Button>
                  ) : !currentSkill.video_verified ? (
                    <Button
                      onClick={() => setShowVideoUpload(true)}
                      className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-xl px-12 py-6 rounded-2xl"
                    >
                      <Brain size={24} className="mr-3" />
                      Get AI Analysis
                    </Button>
                  ) : (
                    <div className="bg-green-500/20 border border-green-500/30 rounded-2xl p-6">
                      <div className="flex items-center justify-center gap-3 mb-3">
                        <CheckCircle size={24} className="text-green-400" />
                        <span className="text-xl font-bold text-green-300">Skill Verified!</span>
                      </div>
                      <p className="text-slate-300">
                        Your {currentSkill.name} skills have been AI-verified. Great work!
                      </p>
                      {currentSkill.video_demo_url && (
                        <Button
                          onClick={() => window.open(currentSkill.video_demo_url, '_blank')}
                          variant="outline"
                          className="mt-4 border-green-500/30 text-green-300"
                        >
                          <Play size={16} className="mr-2" />
                          View Demo
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                {/* AI Feedback */}
                {currentSkill.ai_feedback && (
                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-6 mb-8">
                    <div className="flex items-center gap-3 mb-3">
                      <Brain size={20} className="text-purple-400" />
                      <h3 className="font-semibold text-white">AI Feedback</h3>
                    </div>
                    <p className="text-slate-300">{currentSkill.ai_feedback}</p>
                  </div>
                )}
              </div>
            )}

            {/* AI Improvements */}
            {currentSkill && (
              <div className="bg-slate-800/20 backdrop-blur-sm border border-slate-700/20 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Lightbulb size={24} className="text-yellow-400" />
                    <h3 className="text-xl font-bold text-white">AI Improvement Suggestions</h3>
                  </div>
                  <Button
                    size="small"
                    variant="outline"
                    onClick={() => {
                      setLoadingImprovements(true);
                      setTimeout(() => {
                        const skillImprovements = generateImprovements(currentSkill);
                        setImprovements(skillImprovements);
                        setLoadingImprovements(false);
                      }, 1000);
                    }}
                    disabled={loadingImprovements}
                    className="border-slate-600/50 text-slate-300"
                  >
                    <RefreshCw size={14} className={`mr-1 ${loadingImprovements ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>

                {loadingImprovements ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mr-3"></div>
                    <span className="text-slate-300">Analyzing your skill...</span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {improvements.map((improvement, index) => {
                      const Icon = getImprovementIcon(improvement.type);
                      return (
                        <div
                          key={index}
                          className={`border rounded-xl p-6 ${getPriorityColor(improvement.priority)}`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <Icon size={20} />
                              <h4 className="font-semibold">{improvement.title}</h4>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs px-2 py-1 rounded-full bg-current/20 capitalize">
                                {improvement.priority}
                              </span>
                              {improvement.estimatedTime && (
                                <span className="text-xs text-slate-400">
                                  {improvement.estimatedTime}
                                </span>
                              )}
                            </div>
                          </div>
                          <p className="text-slate-300 text-sm mb-4">{improvement.description}</p>
                          {improvement.actionable && (
                            <Button
                              size="small"
                              onClick={() => handleTakeAction(improvement)}
                              className="bg-blue-600/80 hover:bg-blue-700/80"
                            >
                              <ArrowRight size={14} className="mr-1" />
                              Take Action
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Add Skill Modal */}
        <AddSkillModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
        />

        {/* Video Upload Modal */}
        {currentSkill && (
          <VideoUploadModal
            isOpen={showVideoUpload}
            onClose={() => setShowVideoUpload(false)}
            skillId={currentSkill.id}
            skillName={currentSkill.name}
            onVideoAnalyzed={handleVideoAnalyzed}
          />
        )}

        {/* Skill Detail Modal */}
        {currentSkill && (
          <SkillDetailModal
            skill={currentSkill}
            isOpen={showSkillDetail}
            onClose={() => setShowSkillDetail(false)}
            onUpdate={handleUpdateSkill}
          />
        )}
      </div>
    </div>
  );
};

export default ReelSkillsDashboard;