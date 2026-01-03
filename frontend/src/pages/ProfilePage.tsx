import React, { useState, useEffect } from 'react';
import { Calendar, Award, Target, TrendingUp, Save, X, Edit } from 'lucide-react';
import UserService, { ProfileData } from '../services/userService';
import { formatTime } from '../services/solveService';
import { cn, getAdaptiveClasses } from '../utils/appearanceUtils';

const ProfilePage: React.FC = () => {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: ''
  });

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await UserService.getCompleteProfileData();
      setProfileData(data);
      setEditForm({
        firstName: data.user.firstName || '',
        lastName: data.user.lastName || ''
      });
    } catch (err) {
      console.error('Error loading profile data:', err);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!profileData) return;

    try {
      const updatedUser = await UserService.updateUserProfile({
        firstName: editForm.firstName,
        lastName: editForm.lastName
      });
      
      setProfileData({
        ...profileData,
        user: updatedUser
      });
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile');
    }
  };

  const handleCancel = () => {
    if (profileData) {
      setEditForm({
        firstName: profileData.user.firstName || '',
        lastName: profileData.user.lastName || ''
      });
    }
    setIsEditing(false);
  };

  const getInitials = (firstName?: string, lastName?: string, username?: string) => {
    if (firstName && lastName) {
      return (firstName[0] + lastName[0]).toUpperCase();
    }
    if (firstName) {
      return firstName[0].toUpperCase();
    }
    if (username) {
      return username[0].toUpperCase();
    }
    return 'U';
  };

  const formatMemberSince = (dateString?: string) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  const formatPracticeTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getAchievementIcon = (iconName: string) => {
    const icons: Record<string, React.ReactNode> = {
      'Award': <Award className="w-6 h-6" />,
      'Target': <Target className="w-6 h-6" />,
      'TrendingUp': <TrendingUp className="w-6 h-6" />
    };
    return icons[iconName] || <Award className="w-6 h-6" />;
  };

  const getAchievementColors = (color: string) => {
    const colors: Record<string, { bg: string; border: string; icon: string }> = {
      'yellow': { bg: getAdaptiveClasses.backgroundSemantic.warning, border: 'border-warning', icon: getAdaptiveClasses.semantic.warning },
      'green': { bg: getAdaptiveClasses.backgroundSemantic.success, border: 'border-success', icon: getAdaptiveClasses.semantic.success },
      'blue': { bg: getAdaptiveClasses.backgroundSemantic.info, border: 'border-info', icon: getAdaptiveClasses.semantic.info },
      'purple': { bg: getAdaptiveClasses.background.tertiary, border: getAdaptiveClasses.border.primary, icon: getAdaptiveClasses.text.secondary }
    };
    return colors[color] || colors.yellow;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className={cn('mb-4', getAdaptiveClasses.semantic.error)}>{error}</p>
        <button 
          onClick={loadProfileData}
          className="px-4 py-2 bg-primary-600 text-on-primary rounded-lg hover:bg-primary-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="text-center py-12">
        <p className="text-adaptive-secondary">No profile data available</p>
      </div>
    );
  }

  const { user, statistics, achievements, personalRecords } = profileData;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-adaptive-primary mb-2">Profile</h1>
        <p className="text-adaptive-secondary">
          Manage your account and view your cubing achievements
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Info */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-center mb-6">
              <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-800">
                  {getInitials(user.firstName, user.lastName, user.username)}
                </span>
              </div>
              <h2 className="text-xl font-bold text-adaptive-primary">
                {user.firstName && user.lastName ? 
                  `${user.firstName} ${user.lastName}` : 
                  user.username}
              </h2>
              <p className="text-adaptive-secondary">{user.email}</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-adaptive-tertiary" />
                <div>
                  <p className="text-sm font-medium text-adaptive-primary">Member since</p>
                  <p className="text-sm text-adaptive-secondary">{formatMemberSince(statistics.joinDate)}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Target className="w-5 h-5 text-adaptive-tertiary" />
                <div>
                  <p className="text-sm font-medium text-adaptive-primary">Preferred Method</p>
                  <p className="text-sm text-adaptive-secondary">{statistics.favoritePuzzleType}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <TrendingUp className="w-5 h-5 text-adaptive-tertiary" />
                <div>
                  <p className="text-sm font-medium text-adaptive-primary">Current Streak</p>
                  <p className="text-sm text-adaptive-secondary">{statistics.currentStreak} days</p>
                </div>
              </div>
            </div>

            <button 
              onClick={handleEdit}
              className="w-full mt-6 px-4 py-2 bg-primary-600 text-on-primary rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Edit className="w-4 h-4" />
              <span>Edit Profile</span>
            </button>
          </div>
        </div>

        {/* Profile Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Achievements */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-adaptive-primary mb-6">Achievements</h3>
            {achievements.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.map((achievement) => {
                  const colors = getAchievementColors(achievement.color);
                  return (
                    <div 
                      key={achievement.id}
                      className={`flex items-center space-x-4 p-4 ${colors.bg} border ${colors.border} rounded-lg`}
                    >
                      <div className={`p-2 ${colors.bg} rounded-lg`}>
                        <div className={colors.icon}>
                          {getAchievementIcon(achievement.icon)}
                        </div>
                      </div>
                      <div>
                        <p className="font-medium text-adaptive-primary">{achievement.title}</p>
                        <p className="text-sm text-adaptive-secondary">{achievement.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-adaptive-tertiary text-center py-8">
                No achievements yet. Keep solving to unlock achievements!
              </p>
            )}
          </div>

          {/* Personal Records */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-adaptive-primary mb-6">Personal Records</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(personalRecords).map(([puzzleType, records]) => (
                <div key={puzzleType}>
                  <h4 className="font-medium text-adaptive-primary mb-4">{puzzleType} Cube</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-adaptive-secondary">Single</span>
                      <span className="font-medium">
                        {records.single ? formatTime(records.single) : '--'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-adaptive-secondary">Ao5</span>
                      <span className="font-medium">
                        {records.ao5 ? formatTime(records.ao5) : '--'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-adaptive-secondary">Ao12</span>
                      <span className="font-medium">
                        {records.ao12 ? formatTime(records.ao12) : '--'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-adaptive-secondary">Ao100</span>
                      <span className="font-medium">
                        {records.ao100 ? formatTime(records.ao100) : '--'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Summary */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-adaptive-primary mb-6">Activity Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-adaptive-primary">{statistics.totalSolves.toLocaleString()}</p>
                <p className="text-sm text-adaptive-secondary">Total Solves</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-adaptive-primary">{formatPracticeTime(statistics.totalPracticeTime)}</p>
                <p className="text-sm text-adaptive-secondary">Practice Time</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-adaptive-primary">{statistics.totalSessions}</p>
                <p className="text-sm text-adaptive-secondary">Sessions</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-adaptive-primary">{statistics.daysActive}</p>
                <p className="text-sm text-adaptive-secondary">Days Active</p>
              </div>
            </div>
          </div>

          {/* Account Settings */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-adaptive-primary mb-6">Account Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-adaptive-primary mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  value={editForm.firstName}
                  onChange={(e) => setEditForm(prev => ({ ...prev, firstName: e.target.value }))}
                  disabled={!isEditing}
                  className="form-input disabled:bg-adaptive-tertiary disabled:text-adaptive-tertiary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-adaptive-primary mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  value={editForm.lastName}
                  onChange={(e) => setEditForm(prev => ({ ...prev, lastName: e.target.value }))}
                  disabled={!isEditing}
                  className="form-input disabled:bg-adaptive-tertiary disabled:text-adaptive-tertiary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-adaptive-primary mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="form-input bg-adaptive-tertiary text-adaptive-tertiary"
                />
                <p className="text-xs text-adaptive-tertiary mt-1">Email cannot be changed</p>
              </div>

              {isEditing ? (
                <div className="flex space-x-4 pt-4">
                  <button 
                    onClick={handleSave}
                    className="px-6 py-2 bg-primary-600 text-on-primary rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </button>
                  <button 
                    onClick={handleCancel}
                    className="px-6 py-2 bg-gray-100 text-adaptive-primary rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
