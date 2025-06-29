import React, { useState, useRef } from 'react';
import { Dialog } from '@headlessui/react';
import { Button } from './ui/Button';
import { X, Upload, Video, AlertCircle, CheckCircle, FileVideo, Cloud, Play } from 'lucide-react';

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
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [uploadMethod, setUploadMethod] = useState<'file' | 'url'>('file');
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('video/')) {
        setError('Please select a valid video file for your ReelSkill');
        return;
      }
      
      // Validate file size (max 100MB)
      if (file.size > 100 * 1024 * 1024) {
        setError('ReelSkill video must be less than 100MB');
        return;
      }
      
      setVideoFile(file);
      setError(null);
    }
  };

  const uploadToS3 = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('skillId', skillId);
    formData.append('skillName', skillName);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          resolve(response.videoUrl);
        } else {
          reject(new Error('ReelSkill upload failed'));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('ReelSkill upload failed'));
      });

      // Use your S3 upload endpoint
      xhr.open('POST', `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/upload-video`);
      xhr.setRequestHeader('Authorization', `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`);
      xhr.send(formData);
    });
  };

  const handleAnalyze = async () => {
    let finalVideoUrl = '';

    if (uploadMethod === 'file') {
      if (!videoFile) {
        setError('Please select a ReelSkill video file');
        return;
      }

      setIsUploading(true);
      setError(null);

      try {
        finalVideoUrl = await uploadToS3(videoFile);
      } catch (error) {
        console.error('Upload error:', error);
        setError('Failed to upload ReelSkill. Please try again.');
        setIsUploading(false);
        return;
      }
    } else {
      if (!videoUrl.trim()) {
        setError('Please enter a ReelSkill video URL');
        return;
      }
      finalVideoUrl = videoUrl.trim();
    }

    setIsUploading(false);
    setIsAnalyzing(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-skill-video`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          skillId,
          videoUrl: finalVideoUrl,
          skillName,
          proficiencyLevel: 'intermediate'
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'ReelSkill analysis failed');
      }

      onVideoAnalyzed(result);
      resetForm();
      onClose();
    } catch (error) {
      console.error('ReelSkill analysis error:', error);
      setError(error instanceof Error ? error.message : 'ReelSkill analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetForm = () => {
    setVideoFile(null);
    setVideoUrl('');
    setUploadProgress(0);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    if (!isUploading && !isAnalyzing) {
      resetForm();
      onClose();
    }
  };

  const isProcessing = isUploading || isAnalyzing;

  return (
    <Dialog open={isOpen} onClose={handleClose}>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" aria-hidden="true" />
      
      {/* Dialog Container - Full screen on mobile, centered on desktop */}
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="min-h-full flex items-end sm:items-center justify-center p-0 sm:p-4">
          <Dialog.Panel className="w-full max-w-lg bg-slate-800/95 backdrop-blur-sm border-0 sm:border border-slate-700/50 rounded-t-xl sm:rounded-xl shadow-2xl transform transition-all flex flex-col max-h-screen sm:max-h-[90vh]">
            {/* Fixed Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-700/50 flex-shrink-0">
              <div>
                <Dialog.Title className="text-lg sm:text-xl font-bold text-white">
                  Upload Your ReelSkill
                </Dialog.Title>
                <p className="text-slate-400 text-sm">Showcase your {skillName} expertise</p>
              </div>
              <button
                onClick={handleClose}
                disabled={isProcessing}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Error Display */}
              {error && (
                <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 flex items-center gap-3">
                  <AlertCircle size={20} className="text-red-400 flex-shrink-0" />
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              )}

              {/* Upload Method Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  How would you like to share your ReelSkill?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setUploadMethod('file')}
                    disabled={isProcessing}
                    className={`p-3 sm:p-4 rounded-xl border transition-all text-left disabled:opacity-50 ${
                      uploadMethod === 'file'
                        ? 'border-blue-500/50 bg-blue-500/20 text-blue-300'
                        : 'border-slate-600/50 bg-slate-700/30 text-slate-300 hover:border-slate-500/50 hover:bg-slate-700/50'
                    }`}
                  >
                    <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                      <Cloud size={18} className="sm:w-5 sm:h-5" />
                      <span className="font-medium text-sm sm:text-base">Upload ReelSkill</span>
                    </div>
                    <p className="text-xs opacity-75">Upload your video directly to secure storage</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setUploadMethod('url')}
                    disabled={isProcessing}
                    className={`p-3 sm:p-4 rounded-xl border transition-all text-left disabled:opacity-50 ${
                      uploadMethod === 'url'
                        ? 'border-blue-500/50 bg-blue-500/20 text-blue-300'
                        : 'border-slate-600/50 bg-slate-700/30 text-slate-300 hover:border-slate-500/50 hover:bg-slate-700/50'
                    }`}
                  >
                    <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                      <Video size={18} className="sm:w-5 sm:h-5" />
                      <span className="font-medium text-sm sm:text-base">Link ReelSkill</span>
                    </div>
                    <p className="text-xs opacity-75">Share from YouTube, Vimeo, or other platforms</p>
                  </button>
                </div>
              </div>

              {/* File Upload */}
              {uploadMethod === 'file' && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Select Your ReelSkill Video
                  </label>
                  <div
                    className={`border-2 border-dashed rounded-xl p-4 sm:p-6 text-center transition-all ${
                      videoFile 
                        ? 'border-green-500/50 bg-green-500/10' 
                        : 'border-slate-600/50 bg-slate-700/20 hover:border-slate-500/50'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="video/*"
                      onChange={handleFileSelect}
                      disabled={isProcessing}
                      className="hidden"
                    />
                    
                    {videoFile ? (
                      <div className="space-y-2">
                        <CheckCircle size={24} className="sm:w-8 sm:h-8 text-green-400 mx-auto" />
                        <p className="text-green-300 font-medium text-sm sm:text-base">{videoFile.name}</p>
                        <p className="text-slate-400 text-xs sm:text-sm">
                          {(videoFile.size / (1024 * 1024)).toFixed(1)} MB ReelSkill ready!
                        </p>
                        <Button
                          size="small"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isProcessing}
                          className="border-slate-600/50 text-slate-300 text-xs sm:text-sm"
                        >
                          Change ReelSkill
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <FileVideo size={24} className="sm:w-8 sm:h-8 text-slate-400 mx-auto" />
                        <div>
                          <p className="text-white font-medium text-sm sm:text-base">Choose your ReelSkill video</p>
                          <p className="text-slate-400 text-xs sm:text-sm">MP4, MOV, AVI up to 100MB</p>
                        </div>
                        <Button
                          size="small"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isProcessing}
                          className="bg-blue-600/80 hover:bg-blue-700/80 text-xs sm:text-sm"
                        >
                          <Upload size={12} className="sm:w-3.5 sm:h-3.5 mr-1" />
                          Select ReelSkill
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* URL Input */}
              {uploadMethod === 'url' && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    ReelSkill Video URL
                  </label>
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm sm:text-base"
                    disabled={isProcessing}
                  />
                  <p className="text-slate-400 text-xs mt-2">
                    Link to your ReelSkill on YouTube, Vimeo, or direct video links
                  </p>
                </div>
              )}

              {/* Upload Progress */}
              {isUploading && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Cloud size={20} className="text-blue-400" />
                    <h4 className="font-semibold text-white text-sm sm:text-base">Uploading Your ReelSkill...</h4>
                  </div>
                  <div className="w-full bg-slate-700/30 rounded-full h-2 sm:h-3 mb-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-cyan-400 h-2 sm:h-3 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-slate-300 text-xs sm:text-sm">{uploadProgress}% complete</p>
                </div>
              )}

              {/* Analysis Status */}
              {isAnalyzing && (
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-purple-400"></div>
                    <div>
                      <h4 className="font-semibold text-white text-sm sm:text-base">Analyzing Your ReelSkill...</h4>
                      <p className="text-slate-300 text-xs sm:text-sm">
                        Our AI is reviewing your {skillName} ReelSkill demonstration. This may take a few moments.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* AI Analysis Info */}
              {!isProcessing && (
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Play size={18} className="sm:w-5 sm:h-5 text-purple-400" />
                    <h4 className="font-semibold text-white text-sm sm:text-base">AI-Powered ReelSkill Analysis</h4>
                  </div>
                  <p className="text-slate-300 text-xs sm:text-sm">
                    Our AI will analyze your ReelSkill demonstration and provide:
                  </p>
                  <ul className="text-slate-300 text-xs sm:text-sm mt-2 space-y-1">
                    <li>• Skill proficiency assessment (1-5 stars)</li>
                    <li>• Detailed feedback and improvement suggestions</li>
                    <li>• ReelSkill verification status for your portfolio</li>
                    <li>• Personalized learning recommendations</li>
                  </ul>
                </div>
              )}

              {/* ReelSkill Tips */}
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                <h4 className="font-semibold text-white mb-3 text-sm sm:text-base">💡 ReelSkill Tips</h4>
                <ul className="space-y-1 text-xs sm:text-sm text-slate-300">
                  <li>• Keep your ReelSkill under 3 minutes for best engagement</li>
                  <li>• Show real problem-solving, not just theory</li>
                  <li>• Explain your thought process as you work</li>
                  <li>• Include before/after results when possible</li>
                  <li>• Ensure good audio and video quality</li>
                </ul>
              </div>
            </div>

            {/* Fixed Footer */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 p-4 sm:p-6 border-t border-slate-700/50 bg-slate-800/95 flex-shrink-0">
              <Button 
                variant="outline" 
                onClick={handleClose} 
                disabled={isProcessing}
                className="border-slate-600/50 text-slate-300 w-full sm:w-auto order-2 sm:order-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAnalyze} 
                disabled={
                  isProcessing || 
                  (uploadMethod === 'file' && !videoFile) || 
                  (uploadMethod === 'url' && !videoUrl.trim())
                }
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-slate-600 disabled:to-slate-700 w-full sm:w-auto order-1 sm:order-2"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Uploading ReelSkill... {uploadProgress}%
                  </>
                ) : isAnalyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Analyzing ReelSkill...
                  </>
                ) : (
                  <>
                    <Upload size={16} className="mr-2" />
                    {uploadMethod === 'file' ? 'Upload ReelSkill' : 'Analyze ReelSkill'}
                  </>
                )}
              </Button>
            </div>
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  );
};