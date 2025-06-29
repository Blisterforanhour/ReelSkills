import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { Button } from './ui/Button';
import { X, Upload, Video, AlertCircle, CheckCircle } from 'lucide-react';

interface VideoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  skillId: string;
  skillName: string;
  onVideoAnalyzed: (result: { rating: number; feedback: string; verified: boolean }) => void;
}

export const VideoUploadModal: React.FC<VideoUploadModalProps> = ({
  isOpen,
  onClose,
  skillId,
  skillName,
  onVideoAnalyzed
}) => {
  const [videoUrl, setVideoUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!videoUrl.trim()) {
      setError('Please enter a video URL');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-skill-video`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          skillId,
          videoUrl: videoUrl.trim(),
          skillName,
          proficiencyLevel: 'intermediate' // You might want to pass this as a prop
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Analysis failed');
      }

      onVideoAnalyzed(result);
      setVideoUrl('');
      onClose();
    } catch (error) {
      console.error('Video analysis error:', error);
      setError(error instanceof Error ? error.message : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" aria-hidden="true" />
      
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-lg bg-slate-800/95 backdrop-blur-sm border border-slate-700/50 rounded-xl shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
            <div>
              <Dialog.Title className="text-xl font-bold text-white">
                Upload Video Demo
              </Dialog.Title>
              <p className="text-slate-400">Demonstrate your {skillName} skills</p>
            </div>
            <button
              onClick={onClose}
              disabled={isAnalyzing}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors disabled:opacity-50"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Error Display */}
            {error && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 flex items-center gap-3">
                <AlertCircle size={20} className="text-red-400" />
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            {/* Video URL Input */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Video URL
              </label>
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                disabled={isAnalyzing}
              />
              <p className="text-slate-400 text-xs mt-2">
                Supported platforms: YouTube, Vimeo, or direct video links
              </p>
            </div>

            {/* AI Analysis Info */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <Video size={20} className="text-blue-400" />
                <h4 className="font-semibold text-white">AI-Powered Analysis</h4>
              </div>
              <p className="text-slate-300 text-sm">
                Our AI will analyze your video demonstration and provide:
              </p>
              <ul className="text-slate-300 text-sm mt-2 space-y-1">
                <li>• Skill proficiency assessment (1-5 stars)</li>
                <li>• Detailed feedback and suggestions</li>
                <li>• Verification status for your portfolio</li>
                <li>• Recommendations for improvement</li>
              </ul>
            </div>

            {/* Analysis Status */}
            {isAnalyzing && (
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-400"></div>
                  <div>
                    <h4 className="font-semibold text-white">Analyzing Video...</h4>
                    <p className="text-slate-300 text-sm">
                      Our AI is reviewing your {skillName} demonstration. This may take a few moments.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-6 border-t border-slate-700/50">
            <Button 
              variant="outline" 
              onClick={onClose} 
              disabled={isAnalyzing}
              className="border-slate-600/50 text-slate-300"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAnalyze} 
              disabled={isAnalyzing || !videoUrl.trim()}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-slate-600 disabled:to-slate-700"
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Analyzing...
                </>
              ) : (
                <>
                  <Upload size={16} className="mr-2" />
                  Analyze Video
                </>
              )}
            </Button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};