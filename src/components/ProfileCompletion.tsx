import React from 'react';
import { CheckCircle, Circle, Target, Star, Award, TrendingUp, User, FileText, Video } from 'lucide-react';

interface ProfileCompletionProps {
  profile: any;
  skills: any[];
  onAction: (action: string) => void;
}

export const ProfileCompletion: React.FC<ProfileCompletionProps> = ({
  profile,
  skills,
  onAction
}) => {
  const calculateCompletion = () => {
    let completed = 0;
    let total = 6;

    // Basic profile info
    if (profile?.first_name && profile?.last_name) completed++;
    if (profile?.headline) completed++;
    if (profile?.summary) completed++;
    
    // Skills
    if (skills.length > 0) completed++;
    
    // ReelSkill videos
    const skillsWithVideos = skills.filter(skill => skill.video_demo_url);
    if (skillsWithVideos.length > 0) completed++;
    
    // Verified skills
    const verifiedSkills = skills.filter(skill => skill.video_verified);
    if (verifiedSkills.length > 0) completed++;

    return { completed, total, percentage: Math.round((completed / total) * 100) };
  };

  const completion = calculateCompletion();
  
  const completionItems = [
    {
      id: 'profile',
      title: 'Complete Profile',
      description: 'Add your name and basic info',
      completed: !!(profile?.first_name && profile?.last_name),
      icon: User,
      action: 'edit-profile'
    },
    {
      id: 'headline',
      title: 'Add Headline',
      description: 'Professional title or role',
      completed: !!profile?.headline,
      icon: FileText,
      action: 'edit-profile'
    },
    {
      id: 'summary',
      title: 'Write Summary',
      description: 'Brief professional overview',
      completed: !!profile?.summary,
      icon: FileText,
      action: 'edit-profile'
    },
    {
      id: 'skills',
      title: 'Add Skills',
      description: `${skills.length} skills added`,
      completed: skills.length > 0,
      icon: Target,
      action: 'add-skill'
    },
    {
      id: 'videos',
      title: 'Upload ReelSkills',
      description: `${skills.filter(s => s.video_demo_url).length} videos uploaded`,
      completed: skills.filter(s => s.video_demo_url).length > 0,
      icon: Video,
      action: 'upload-video'
    },
    {
      id: 'verified',
      title: 'Get Verified',
      description: `${skills.filter(s => s.video_verified).length} skills verified`,
      completed: skills.filter(s => s.video_verified).length > 0,
      icon: Award,
      action: 'verify-skills'
    }
  ];

  const getCompletionColor = (percentage: number) => {
    if (percentage >= 80) return 'from-emerald-500 to-green-500';
    if (percentage >= 60) return 'from-blue-500 to-cyan-500';
    if (percentage >= 40) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-pink-500';
  };

  const getCompletionMessage = (percentage: number) => {
    if (percentage >= 80) return 'Excellent! Your profile is nearly complete';
    if (percentage >= 60) return 'Great progress! Keep building your profile';
    if (percentage >= 40) return 'Good start! Add more to stand out';
    return 'Let\'s build your professional profile';
  };

  return (
    <div className="bg-slate-800/20 backdrop-blur-sm border border-slate-700/20 rounded-xl p-4 sm:p-6 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white">Profile Completion</h2>
          <p className="text-slate-400 text-sm">{getCompletionMessage(completion.percentage)}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            {completion.percentage}%
          </div>
          <div className="text-xs text-slate-400">{completion.completed}/{completion.total} complete</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="w-full bg-slate-700/50 rounded-full h-3 overflow-hidden">
          <div 
            className={`bg-gradient-to-r ${getCompletionColor(completion.percentage)} h-3 rounded-full transition-all duration-1000 ease-out relative`}
            style={{ width: `${completion.percentage}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Completion Items - Mobile Optimized Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {completionItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onAction(item.action)}
              className={`p-3 rounded-xl border transition-all text-left group hover:scale-105 ${
                item.completed
                  ? 'border-emerald-500/30 bg-emerald-500/10'
                  : 'border-slate-600/30 bg-slate-700/20 hover:border-blue-500/30 hover:bg-blue-500/10'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {item.completed ? (
                  <CheckCircle size={16} className="text-emerald-400 flex-shrink-0" />
                ) : (
                  <Circle size={16} className="text-slate-400 group-hover:text-blue-400 flex-shrink-0" />
                )}
                <Icon size={16} className={`${
                  item.completed ? 'text-emerald-400' : 'text-slate-400 group-hover:text-blue-400'
                } flex-shrink-0`} />
              </div>
              <div className="text-sm font-medium text-white mb-1 line-clamp-1">
                {item.title}
              </div>
              <div className="text-xs text-slate-400 line-clamp-2">
                {item.description}
              </div>
            </button>
          );
        })}
      </div>

      {/* Quick Actions */}
      {completion.percentage < 100 && (
        <div className="mt-4 pt-4 border-t border-slate-700/30">
          <div className="flex flex-col sm:flex-row gap-2">
            {!skills.length && (
              <button
                onClick={() => onAction('add-skill')}
                className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
              >
                Add Your First Skill
              </button>
            )}
            {skills.length > 0 && !skills.some(s => s.video_demo_url) && (
              <button
                onClick={() => onAction('upload-video')}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
              >
                Upload First ReelSkill
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};