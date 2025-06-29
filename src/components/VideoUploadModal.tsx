import React, { useState, useRef } from 'react';
import { Dialog } from '@headlessui/react';
import { Button } from './ui/Button';
import { X, Upload, Video, AlertCircle, CheckCircle, FileVideo, Cloud } from 'lucide-react';

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
        setError('Please select a valid video file');
        return;
      }
      
      // Validate file size (max 100MB)
      if (file.size > 100 * 1024 * 1024) {
        setError('Video file must be less than 100MB');
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
          reject(new Error('Upload failed'));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'));
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
        setError('Please select a video file');
        return;
      }

      setIsUploading(true);
      setError(null);

      try {
        finalVideoUrl = await uploadToS3(videoFile);
      } catch (error) {
        console.error('Upload error:', error);
        setError('Failed to upload video. Please try again.');
        setIsUploading(false);
        return;
      }
    } else {
      if (!videoUrl.trim()) {
        setError('Please enter a video URL');
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
        throw new Error(result.error || 'Analysis failed');
      }

      onVideoAnalyzed(result);
      resetForm();
      onClose();
    } catch (error) {
      console.error('Video analysis error:', error);
      setError(error instanceof Error ? error.message : 'Analysis failed');
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
              onClick={handleClose}
              disabled={isProcessing}
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

            {/* Upload Method Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">
                Upload Method
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setUploadMethod('file')}
                  disabled={isProcessing}
                  className={`p-4 rounded-xl border transition-all text-left disabled:opacity-50 ${
                    uploadMethod === 'file'
                      ? 'border-blue-500/50 bg-blue-500/20 text-blue-300'
                      : 'border-slate-600/50 bg-slate-700/30 text-slate-300 hover:border-slate-500/50 hover:bg-slate-700/50'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Cloud size={20} />
                    <span className="font-medium">Upload File</span>
                  </div>
                  <p className="text-xs opacity-75">Upload directly to our secure cloud storage</p>
                </button>

                <button
                  type="button"
                  onClick={() => setUploadMethod('url')}
                  disabled={isProcessing}
                  className={`p-4 rounded-xl border transition-all text-left disabled:opacity-50 ${
                    uploadMethod === 'url'
                      ? 'border-blue-500/50 bg-blue-500/20 text-blue-300'
                      : 'border-slate-600/50 bg-slate-700/30 text-slate-300 hover:border-slate-500/50 hover:bg-slate-700/50'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Video size={20} />
                    <span className="font-medium">Video URL</span>
                  </div>
                  <p className="text-xs opacity-75">Link to YouTube, Vimeo, or other platforms</p>
                </button>
              </div>
            </div>

            {/* File Upload */}
            {uploadMethod === 'file' && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Select Video File
                </label>
                <div
                  className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
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
                      <CheckCircle size={32} className="text-green-400 mx-auto" />
                      <p className="text-green-300 font-medium">{videoFile.name}</p>
                      <p className="text-slate-400 text-sm">
                        {(videoFile.size / (1024 * 1024)).toFixed(1)} MB
                      </p>
                      <Button
                        size="small"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isProcessing}
                        className="border-slate-600/50 text-slate-300"
                      >
                        Change File
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <FileVideo size={32} className="text-slate-400 mx-auto" />
                      <div>
                        <p className="text-white font-medium">Choose a video file</p>
                        <p className="text-slate-400 text-sm">MP4, MOV, AVI up to 100MB</p>
                      </div>
                      <Button
                        size="small"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isProcessing}
                        className="bg-blue-600/80 hover:bg-blue-700/80"
                      >
                        <Upload size={14} className="mr-1" />
                        Select File
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
                  Video URL
                </label>
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  disabled={isProcessing}
                />
                <p className="text-slate-400 text-xs mt-2">
                  Supported platforms: YouTube, Vimeo, or direct video links
                </p>
              </div>
            )}

            {/* Upload Progress */}
            {isUploading && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Cloud size={20} className="text-blue-400" />
                  <h4 className="font-semibold text-white">Uploading to Cloud Storage...</h4>
                </div>
                <div className="w-full bg-slate-700/30 rounded-full h-3 mb-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-cyan-400 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-slate-300 text-sm">{uploadProgress}% complete</p>
              </div>
            )}

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

            {/* AI Analysis Info */}
            {!isProcessing && (
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Video size={20} className="text-purple-400" />
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
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-6 border-t border-slate-700/50">
            <Button 
              variant="outline" 
              onClick={handleClose} 
              disabled={isProcessing}
              className="border-slate-600/50 text-slate-300"
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
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-slate-600 disabled:to-slate-700"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Uploading... {uploadProgress}%
                </>
              ) : isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Analyzing...
                </>
              ) : (
                <>
                  <Upload size={16} className="mr-2" />
                  {uploadMethod === 'file' ? 'Upload & Analyze' : 'Analyze Video'}
                </>
              )}
            </Button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};