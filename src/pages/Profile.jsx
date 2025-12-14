import React, { useState } from 'react';
import { useAuth } from '../contexts/authContext';
import { updateProfilePicture } from '../services/api';

function Profile() {
  const { user, updateUser } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image size must be less than 5MB' });
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please upload an image file' });
      return;
    }

    setUploading(true);
    setMessage({ type: '', text: '' });

    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64String = reader.result;
          const result = await updateProfilePicture(base64String);
          
          updateUser({ profilePicture: result.user.profilePicture });
          setMessage({ type: 'success', text: 'Profile picture updated successfully!' });
        } catch (error) {
          setMessage({ type: 'error', text: error.message || 'Failed to upload image' });
        } finally {
          setUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to process image' });
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="bg-zinc-800/50 backdrop-blur-sm rounded-3xl p-8 border border-zinc-700/50 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-600 mb-2">
            Profile Settings
          </h1>
          <p className="text-gray-400">Manage your account information</p>
        </div>

        {/* Message Display */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-500/10 border border-green-500/50 text-green-400' 
              : 'bg-red-500/10 border border-red-500/50 text-red-400'
          }`}>
            {message.text}
          </div>
        )}

        {/* Profile Picture Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-zinc-700 group-hover:border-red-500 transition-all duration-300">
              {user?.profilePicture ? (
                <img 
                  src={user.profilePicture} 
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-red-600 to-red-700 flex items-center justify-center text-white text-4xl font-bold">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            
            {/* Upload Button Overlay */}
            <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="hidden"
              />
              <div className="text-white text-center">
                {uploading ? (
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white mx-auto"></div>
                ) : (
                  <>
                    <svg className="w-8 h-8 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-xs">Upload</span>
                  </>
                )}
              </div>
            </label>
          </div>
          
          <p className="text-gray-400 text-sm mt-4">Click to upload new photo</p>
        </div>

        {/* User Info */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Full Name
            </label>
            <div className="px-4 py-3 rounded-lg bg-zinc-900/70 border border-zinc-700 text-white">
              {user?.name}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email Address
            </label>
            <div className="px-4 py-3 rounded-lg bg-zinc-900/70 border border-zinc-700 text-white">
              {user?.email}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Account Status
            </label>
            <div className="px-4 py-3 rounded-lg bg-green-500/10 border border-green-500/50 text-green-400 flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Active
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;