import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../lib/auth';
import { Button } from './ui/Button';
import { getSupabaseClient } from '../lib/auth';
import { AddSkillModal } from './AddSkillModal';
import { VideoUploadModal } from './VideoUploadModal';
import { SkillDetailModal } from './SkillDetailModal';
import { Target, Plus, Brain, Star, Award, Video, CheckCircle, Upload, Play, Edit, AlertCircle, Sparkles, Trash2, MoreVertical } from 'lucide-react';

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

const ReelSkillsDashboard: React.FC = () => {
  const { user, profile, createProfile } = useAuthStore();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [currentSkill, setCurrentSkill] = useState<Skill | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showVideoUpload, setShowVideoUpload] = useState(false);
  const [showSkillDetail, setShowSkillDetail] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creatingProfile, setCreatingProfile] = useState(false);

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
      }
    } catch (error) {
      console.error('Error updating skill:', error);
      throw error;
    }
  };

  const handleDeleteSkill = async (skillId: string) => {
    try {
      const { error } = await supabase
        .from('skills')
        .delete()
        .eq('id', skillId);

      if (error) throw error;

      // Remove from local state
      setSkills(prev => prev.filter(skill => skill.id !== skillId));
      
      // If this was the current skill, select another one or clear
      if (currentSkill?.id === skillId) {
        const remainingSkills = skills.filter(skill => skill.id !== skillId);
        setCurrentSkill(remainingSkills.length > 0 ? remainingSkills[0] : null);
      }
    } catch (error) {
      console.error('Error deleting skill:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchSkills();
  }, [profile?.id]);

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

  const handleVideoAnalyzed = async (result: { 
    rating: number | null; 
    feedback: string | null; 
    verified: boolean; 
    message?: string;
    strengths?: string[];
    improvements?: string[];
    confidence?: number;
  }) => {
    if (!currentSkill) return;
    
    try {
      const updateData: any = {
        video_uploaded_at: new Date().toISOString(),
      };

      // Only update AI fields if they have actual values (not null)
      if (result.rating !== null) {
        updateData.ai_rating = result.rating;
      }
      if (result.feedback !== null) {
        updateData.ai_feedback = result.feedback;
      }
      if (result.verified !== null) {
        updateData.video_verified = result.verified;
      }

      const { data, error } = await supabase
        .from('skills')
        .update(updateData)
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
      }
    } catch (error) {
      console.error('Error updating skill:', error);
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
            Showcase your expertise with video demonstrations
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
                Add your first skill and create ReelSkills to showcase your expertise with AI-powered video analysis.
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
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {skills.map((skill) => (
                  <div
                    key={skill.id}
                    className={`relative group p-4 rounded-xl border transition-all ${
                      currentSkill?.id === skill.id
                        ? 'border-blue-500/50 bg-blue-500/20 text-blue-300'
                        : 'border-slate-600/30 bg-slate-800/30 text-slate-300 hover:border-slate-500/50 hover:bg-slate-700/40'
                    }`}
                  >
                    <button
                      onClick={() => setCurrentSkill(skill)}
                      className="w-full text-left"
                    >
                      <div className="font-medium mb-1">{skill.name}</div>
                      <div className="text-xs opacity-75 capitalize">{skill.proficiency}</div>
                      {skill.video_verified && (
                        <div className="flex items-center gap-1 mt-2">
                          <CheckCircle size={12} className="text-green-400" />
                          <span className="text-xs text-green-400">AI Verified</span>
                        </div>
                      )}
                      {skill.video_demo_url && !skill.video_verified && (
                        <div className="flex items-center gap-1 mt-2">
                          <Video size={12} className="text-blue-400" />
                          <span className="text-xs text-blue-400">ReelSkill Uploaded</span>
                        </div>
                      )}
                    </button>
                    
                    {/* Quick Actions Menu */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentSkill(skill);
                            setShowSkillDetail(true);
                          }}
                          className="p-1.5 bg-slate-700/80 hover:bg-blue-600/80 rounded-lg transition-colors"
                          title="Edit skill"
                        >
                          <Edit size={12} className="text-white" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Are you sure you want to delete "${skill.name}"?`)) {
                              handleDeleteSkill(skill.id);
                            }
                          }}
                          className="p-1.5 bg-slate-700/80 hover:bg-red-600/80 rounded-lg transition-colors"
                          title="Delete skill"
                        >
                          <Trash2 size={12} className="text-white" />
                        </button>
                      </div>
                    </div>
                  </div>
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
                  
                  {/* AI Rating - only show if exists */}
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
                      <Brain size={24} className="mr-3" />
                      Upload & Analyze with AI
                    </Button>
                  ) : currentSkill.video_verified ? (
                    <div className="bg-green-500/20 border border-green-500/30 rounded-2xl p-6">
                      <div className="flex items-center justify-center gap-3 mb-3">
                        <CheckCircle size={24} className="text-green-400" />
                        <span className="text-xl font-bold text-green-300">AI Verified!</span>
                      </div>
                      <p className="text-slate-300">
                        Your {currentSkill.name} ReelSkill has been analyzed and verified by AI. Excellent work!
                      </p>
                      <Button
                        onClick={() => window.open(currentSkill.video_demo_url, '_blank')}
                        variant="outline"
                        className="mt-4 border-green-500/30 text-green-300"
                      >
                        <Play size={16} className="mr-2" />
                        View ReelSkill
                      </Button>
                    </div>
                  ) : (
                    <div className="bg-blue-500/20 border border-blue-500/30 rounded-2xl p-6">
                      <div className="flex items-center justify-center gap-3 mb-3">
                        <Video size={24} className="text-blue-400" />
                        <span className="text-xl font-bold text-blue-300">ReelSkill Ready for Analysis</span>
                      </div>
                      <p className="text-slate-300 mb-4">
                        Your {currentSkill.name} ReelSkill is uploaded and ready for AI analysis.
                      </p>
                      <div className="flex justify-center gap-3">
                        <Button
                          onClick={() => window.open(currentSkill.video_demo_url, '_blank')}
                          variant="outline"
                          className="border-blue-500/30 text-blue-300"
                        >
                          <Play size={16} className="mr-2" />
                          View ReelSkill
                        </Button>
                        <Button
                          onClick={() => setShowVideoUpload(true)}
                          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                        >
                          <Brain size={16} className="mr-2" />
                          Analyze with AI
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* AI Feedback - only show if exists */}
                {currentSkill.ai_feedback && (
                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-6 mb-8">
                    <div className="flex items-center gap-3 mb-3">
                      <Brain size={20} className="text-purple-400" />
                      <h3 className="font-semibold text-white">AI Feedback</h3>
                    </div>
                    <p className="text-slate-300">{currentSkill.ai_feedback}</p>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="flex justify-center gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowSkillDetail(true)}
                    className="border-slate-600/50 text-slate-300"
                  >
                    <Edit size={16} className="mr-2" />
                    Edit Details
                  </Button>
                  {currentSkill.video_demo_url && (
                    <Button
                      variant="outline"
                      onClick={() => setShowVideoUpload(true)}
                      className="border-purple-500/30 text-purple-300"
                    >
                      <Brain size={16} className="mr-2" />
                      Re-analyze with AI
                    </Button>
                  )}
                </div>
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
            onDelete={handleDeleteSkill}
          />
        )}
      </div>
    </div>
  );
};

export default ReelSkillsDashboard;