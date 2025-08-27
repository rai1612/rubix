import React, { useEffect, useState } from 'react';
import { Calendar, Clock, BarChart3, Plus, Eye, Play, Trash2 } from 'lucide-react';
import { useSessionContext } from '../context/SessionContext';
import { SessionService, SessionDto } from '../services/sessionService';
import { formatTime, SolveService, SolveDto, PenaltyType } from '../services/solveService';
import { PuzzleType } from '../services/scrambleService';
import { useNavigate } from 'react-router-dom';

const SessionsPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    currentSession, 
    isLoading: sessionLoading, 
    createNewSession,
    endCurrentSession,
    activateSession,
    deleteSession
  } = useSessionContext();

  // State for session history and stats
  const [allSessions, setAllSessions] = useState<SessionDto[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    totalSessions: 0,
    totalPracticeTime: 0,
    avgSessionLength: 0,
    totalSolves: 0
  });

  // State for session details modal
  const [selectedSession, setSelectedSession] = useState<SessionDto | null>(null);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [sessionSolves, setSessionSolves] = useState<SolveDto[]>([]);
  const [loadingSessionSolves, setLoadingSessionSolves] = useState(false);

  // Load session history on mount (session is auto-loaded by context)
  useEffect(() => {
    loadSessionHistory();
  }, []);

  // Load session history and calculate stats
  const loadSessionHistory = async () => {
    setLoadingHistory(true);
    try {
      const sessions = await SessionService.getUserSessions(20); // Get last 20 sessions
      setAllSessions(sessions);
      
      // Calculate aggregate statistics
      const stats = sessions.reduce((acc, session) => ({
        totalSessions: acc.totalSessions + 1,
        totalPracticeTime: acc.totalPracticeTime + getSessionDurationMs(session),
        totalSolves: acc.totalSolves + (session.solveCount || 0),
        avgSessionLength: 0 // Will calculate below
      }), { totalSessions: 0, totalPracticeTime: 0, totalSolves: 0, avgSessionLength: 0 });
      
      stats.avgSessionLength = stats.totalSessions > 0 ? stats.totalPracticeTime / stats.totalSessions : 0;
      setSessionStats(stats);
    } catch (error) {
      console.error('Failed to load session history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Format duration in milliseconds to readable string
  const formatDuration = (durationMs: number): string => {
    const minutes = Math.floor(durationMs / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  // Calculate session duration from startedAt to now (for active sessions)
  const getSessionDuration = (startedAt: string): string => {
    const start = new Date(startedAt);
    const now = new Date();
    const diffMs = now.getTime() - start.getTime();
    return formatDuration(diffMs);
  };

  // Get session duration from start to end (or now if active)
  const getSessionDurationMs = (session: SessionDto): number => {
    const start = new Date(session.startedAt);
    const end = session.endedAt ? new Date(session.endedAt) : new Date();
    return end.getTime() - start.getTime();
  };

  // Generate a smart session name
  const generateSessionName = (): string => {
    const now = new Date();
    const timeOfDay = now.getHours();
    const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });
    const timeStr = now.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });

    let sessionType = '';
    if (timeOfDay >= 5 && timeOfDay < 12) {
      sessionType = 'Morning Practice';
    } else if (timeOfDay >= 12 && timeOfDay < 17) {
      sessionType = 'Afternoon Session';
    } else if (timeOfDay >= 17 && timeOfDay < 21) {
      sessionType = 'Evening Practice';
    } else {
      sessionType = 'Late Night Session';
    }

    return `${sessionType} - ${dayName} ${timeStr}`;
  };

  const handleNewSession = async () => {
    try {
      console.log('Creating new session...');
      const sessionName = generateSessionName();
      console.log('Generated session name:', sessionName);
      
      await createNewSession({
        name: sessionName,
        puzzleType: PuzzleType.CUBE_3X3
      });
      console.log('Session created successfully');
      // Refresh history after creating new session
      await loadSessionHistory();
    } catch (error) {
      console.error('Failed to create new session:', error);
      alert(`Failed to create session: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleEndSession = async () => {
    try {
      await endCurrentSession();
      // Refresh history after ending session
      loadSessionHistory();
    } catch (error) {
      console.error('Failed to end session:', error);
    }
  };

  const handleContinueSession = () => {
    // Navigate to timer page to continue the session
    navigate('/timer');
  };

  const handleViewSession = async (sessionId: string) => {
    console.log('View session:', sessionId);
    const session = allSessions.find(s => s.id === sessionId);
    if (session) {
      setSelectedSession(session);
      setIsSessionModalOpen(true);
      
      // Load session solves for detailed metrics
      setLoadingSessionSolves(true);
      try {
        const solves = await SolveService.getSessionSolves(sessionId);
        setSessionSolves(solves);
      } catch (error) {
        console.error('Failed to load session solves:', error);
        setSessionSolves([]);
      } finally {
        setLoadingSessionSolves(false);
      }
    } else {
      console.error('Session not found:', sessionId);
    }
  };

  const closeSessionModal = () => {
    setIsSessionModalOpen(false);
    setSelectedSession(null);
    setSessionSolves([]);
    setLoadingSessionSolves(false);
  };

  const handleActivateSession = async (sessionId: string) => {
    try {
      console.log('🎯 ACTIVATING SESSION:', sessionId);
      console.log('🎯 Session ID type:', typeof sessionId);
      console.log('🎯 Session ID length:', sessionId.length);
      
      await activateSession(sessionId);
      console.log('✅ Session activated successfully');
      
      // Refresh session history to update active states
      await loadSessionHistory();
      
      // Close modal and navigate to timer
      closeSessionModal();
      navigate('/timer');
    } catch (error) {
      console.error('❌ Failed to activate session:', error);
      
      // Enhanced error logging
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as any;
        console.error('❌ HTTP Status:', axiosError.response?.status);
        console.error('❌ Response data:', axiosError.response?.data);
        console.error('❌ Request URL:', axiosError.config?.url);
        console.error('❌ Full URL:', axiosError.config?.baseURL + axiosError.config?.url);
      }
      
      alert(`Failed to activate session: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleDeleteSession = async (sessionId: string, sessionName: string) => {
    // Confirm deletion
    const confirmed = window.confirm(
      `Are you sure you want to delete "${sessionName}"?\n\nThis will permanently delete the session and all its solves. This action cannot be undone.`
    );
    
    if (!confirmed) return;

    try {
      console.log('🗑️ DELETING SESSION:', sessionId);
      await deleteSession(sessionId);
      console.log('✅ Session deleted successfully');
      
      // Refresh session history to remove deleted session
      await loadSessionHistory();
      
      // Close modal if it was open for this session
      if (selectedSession?.id === sessionId) {
        closeSessionModal();
      }
      
      // Show success message
      alert(`Session "${sessionName}" has been deleted successfully.`);
    } catch (error) {
      console.error('❌ Failed to delete session:', error);
      alert(`Failed to delete session: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Calculate actual standard deviation from solve data
  const calculateStandardDeviation = (): string => {
    if (sessionSolves.length < 2) {
      return loadingSessionSolves ? 'Loading...' : '--';
    }
    
    const validSolves = sessionSolves.filter(solve => solve.penalty !== PenaltyType.DNF);
    if (validSolves.length < 2) return '--';
    
    const times = validSolves.map(solve => solve.adjustedTimeMs);
    const mean = times.reduce((sum, time) => sum + time, 0) / times.length;
    const variance = times.reduce((sum, time) => sum + Math.pow(time - mean, 2), 0) / times.length;
    const stdDev = Math.sqrt(variance);
    
    return formatTime(stdDev);
  };

  // Calculate actual Sub-X count from solve data
  const calculateSubXCount = (thresholdMs: number): number => {
    if (sessionSolves.length === 0) return 0;
    
    const validSolves = sessionSolves.filter(solve => solve.penalty !== PenaltyType.DNF);
    return validSolves.filter(solve => solve.adjustedTimeMs < thresholdMs).length;
  };

  // Calculate success rate (non-DNF percentage)
  const calculateSuccessRate = (): string => {
    if (sessionSolves.length === 0) {
      return loadingSessionSolves ? 'Loading...' : '--';
    }
    
    const validSolves = sessionSolves.filter(solve => solve.penalty !== PenaltyType.DNF);
    const rate = (validSolves.length / sessionSolves.length) * 100;
    return `${rate.toFixed(1)}%`;
  };

  // Calculate session improvement (first vs last few solves)
  const calculateSessionImprovement = (): { text: string; improved: boolean | null } => {
    if (sessionSolves.length < 6) {
      return { text: loadingSessionSolves ? 'Loading...' : '--', improved: null };
    }
    
    const validSolves = sessionSolves.filter(solve => solve.penalty !== PenaltyType.DNF);
    if (validSolves.length < 6) return { text: '--', improved: null };
    
    // Sort by solve time (oldest first)
    const sortedSolves = validSolves.sort((a, b) => new Date(a.solvedAt).getTime() - new Date(b.solvedAt).getTime());
    
    // First 25% vs last 25% average
    const firstQuarter = sortedSolves.slice(0, Math.ceil(sortedSolves.length * 0.25));
    const lastQuarter = sortedSolves.slice(-Math.ceil(sortedSolves.length * 0.25));
    
    const firstAvg = firstQuarter.reduce((sum, solve) => sum + solve.adjustedTimeMs, 0) / firstQuarter.length;
    const lastAvg = lastQuarter.reduce((sum, solve) => sum + solve.adjustedTimeMs, 0) / lastQuarter.length;
    
    const improvement = firstAvg - lastAvg;
    const sign = improvement > 0 ? '↓' : improvement < 0 ? '↑' : '';
    const text = `${sign} ${formatTime(Math.abs(improvement))}`;
    
    return { 
      text, 
      improved: improvement > 0 ? true : improvement < 0 ? false : null 
    };
  };



  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Practice Sessions</h1>
        <p className="text-gray-600">
          Organize your practice and track your improvement over time
        </p>
      </div>

      {/* Session Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Total Sessions</h3>
          </div>
          {loadingHistory ? (
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-20"></div>
            </div>
          ) : (
            <>
              <p className="text-3xl font-bold text-gray-900 mb-2">{sessionStats.totalSessions}</p>
              <p className="text-sm text-gray-600">
                {allSessions.filter(s => {
                  const weekAgo = new Date();
                  weekAgo.setDate(weekAgo.getDate() - 7);
                  return new Date(s.startedAt) > weekAgo;
                }).length} this week
              </p>
            </>
          )}
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Total Practice Time</h3>
          </div>
          {loadingHistory ? (
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-20 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </div>
          ) : (
            <>
              <p className="text-3xl font-bold text-gray-900 mb-2">{formatDuration(sessionStats.totalPracticeTime)}</p>
              <p className="text-sm text-green-600">
                {formatDuration(allSessions.filter(s => {
                  const weekAgo = new Date();
                  weekAgo.setDate(weekAgo.getDate() - 7);
                  return new Date(s.startedAt) > weekAgo;
                }).reduce((acc, s) => acc + getSessionDurationMs(s), 0))} this week
              </p>
            </>
          )}
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Avg Session Length</h3>
          </div>
          {loadingHistory ? (
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-20"></div>
            </div>
          ) : (
            <>
              <p className="text-3xl font-bold text-gray-900 mb-2">{formatDuration(sessionStats.avgSessionLength)}</p>
              <p className="text-sm text-gray-600">
                {sessionStats.totalSessions > 0 ? Math.round(sessionStats.totalSolves / sessionStats.totalSessions) : 0} solves avg
              </p>
            </>
          )}
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-orange-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Total Solves</h3>
          </div>
          {loadingHistory ? (
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-20"></div>
            </div>
          ) : (
            <>
              <p className="text-3xl font-bold text-gray-900 mb-2">{sessionStats.totalSolves}</p>
              <p className="text-sm text-gray-600">Across all sessions</p>
            </>
          )}
        </div>
      </div>

      {/* Current Session */}
      {sessionLoading ? (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="text-center">
                  <div className="h-8 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-12 mx-auto"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : currentSession ? (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Current Session</h2>
            <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
              {currentSession.isActive ? 'Active' : 'Ended'}
            </span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{currentSession.solveCount || 0}</p>
              <p className="text-sm text-gray-600">Solves</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {currentSession.averageTimeMs ? formatTime(currentSession.averageTimeMs) : '--'}
              </p>
              <p className="text-sm text-gray-600">Average</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {currentSession.bestTimeMs ? formatTime(currentSession.bestTimeMs) : '--'}
              </p>
              <p className="text-sm text-gray-600">Best</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {getSessionDuration(currentSession.startedAt)}
              </p>
              <p className="text-sm text-gray-600">Duration</p>
            </div>
          </div>

          <div className="flex space-x-4">
            <button 
              onClick={handleContinueSession}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors inline-flex items-center space-x-2"
            >
              <Play className="w-4 h-4" />
              <span>Continue Session</span>
            </button>
            <button 
              onClick={() => handleViewSession(currentSession.id)}
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors inline-flex items-center space-x-2"
            >
              <Eye className="w-4 h-4" />
              <span>View Details</span>
            </button>
            <button 
              onClick={handleEndSession}
              className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors inline-flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>New Session</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No active session</p>
            <button 
              onClick={handleNewSession}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Start New Session
            </button>
          </div>
        </div>
      )}

      {/* Recent Sessions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Sessions</h2>
        
        {loadingHistory ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-4 mb-2">
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="h-4 bg-gray-200 rounded w-12"></div>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                  <div className="h-3 bg-gray-200 rounded w-18"></div>
                  <div className="h-3 bg-gray-200 rounded w-14"></div>
                </div>
              </div>
            ))}
          </div>
        ) : allSessions.filter(session => !session.isActive).length > 0 ? (
          <div className="space-y-4">
            {allSessions.filter(session => !session.isActive).map((session, index) => (
              <div key={session.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-2">
                    <h3 className="font-medium text-gray-900">{session.name || `Session ${index + 1}`}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      session.puzzleType === 'CUBE_3X3' ? 'bg-blue-100 text-blue-800' :
                      session.puzzleType === 'CUBE_4X4' ? 'bg-green-100 text-green-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {session.puzzleType === 'CUBE_3X3' ? '3x3' : session.puzzleType === 'CUBE_4X4' ? '4x4' : session.puzzleType}
                    </span>

                  </div>
                  <div className="flex items-center space-x-6 text-sm text-gray-600">
                    <span>{session.solveCount || 0} solves</span>
                    <span>Avg: {session.averageTimeMs ? formatTime(session.averageTimeMs) : '--'}</span>
                    <span>Best: {session.bestTimeMs ? formatTime(session.bestTimeMs) : '--'}</span>
                    <span>{formatDuration(getSessionDurationMs(session))}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">
                    {new Date(session.startedAt).toLocaleDateString() === new Date().toLocaleDateString() 
                      ? `Today, ${new Date(session.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                      : new Date(session.startedAt).toLocaleDateString() === new Date(Date.now() - 24*60*60*1000).toLocaleDateString()
                      ? `Yesterday, ${new Date(session.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                      : new Date(session.startedAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                    }
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <button 
                      onClick={() => handleViewSession(session.id)}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium inline-flex items-center space-x-1"
                    >
                      <Eye className="w-3 h-3" />
                      <span>View</span>
                    </button>
                    <button 
                      onClick={() => handleActivateSession(session.id)}
                      className="text-green-600 hover:text-green-700 text-sm font-medium inline-flex items-center space-x-1"
                    >
                      <Play className="w-3 h-3" />
                      <span>Continue</span>
                    </button>
                    {allSessions.length > 1 && (
                      <button 
                        onClick={() => handleDeleteSession(session.id, session.name)}
                        className="text-red-600 hover:text-red-700 text-sm font-medium inline-flex items-center space-x-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No previous sessions</p>
          </div>
        )}

        {allSessions.length > 0 && (
          <div className="mt-6 text-center">
            <button 
              onClick={() => loadSessionHistory()}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Refresh Sessions
            </button>
          </div>
        )}
      </div>

      {/* Session Details Modal */}
      {isSessionModalOpen && selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedSession.name}</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedSession.puzzleType === 'CUBE_3X3' ? '3x3x3 Cube' : selectedSession.puzzleType}
                  {selectedSession.isActive && (
                    <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                      Active
                    </span>
                  )}
                </p>
              </div>
              <button
                onClick={closeSessionModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Session Overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{selectedSession.solveCount || 0}</p>
                  <p className="text-sm text-blue-600 font-medium">Total Solves</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">
                    {selectedSession.averageTimeMs ? formatTime(selectedSession.averageTimeMs) : '--'}
                  </p>
                  <p className="text-sm text-green-600 font-medium">Average Time</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">
                    {selectedSession.bestTimeMs ? formatTime(selectedSession.bestTimeMs) : '--'}
                  </p>
                  <p className="text-sm text-purple-600 font-medium">Best Time</p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <p className="text-2xl font-bold text-orange-600">
                    {formatDuration(getSessionDurationMs(selectedSession))}
                  </p>
                  <p className="text-sm text-orange-600 font-medium">Duration</p>
                </div>
              </div>

              {/* Session Metadata */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-gray-900">Session Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Started:</span>
                      <span className="font-medium">
                        {new Date(selectedSession.startedAt).toLocaleString()}
                      </span>
                    </div>
                    {selectedSession.endedAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ended:</span>
                        <span className="font-medium">
                          {new Date(selectedSession.endedAt).toLocaleString()}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`font-medium ${selectedSession.isActive ? 'text-green-600' : 'text-gray-600'}`}>
                        {selectedSession.isActive ? 'Active' : 'Completed'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-gray-900">Performance Analysis</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Standard Deviation:</span>
                      <span className="font-medium">{calculateStandardDeviation()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Success Rate:</span>
                      <span className="font-medium">{calculateSuccessRate()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sub-20 Count:</span>
                      <span className="font-medium">
                        {loadingSessionSolves ? 'Loading...' : (
                          <>
                            {calculateSubXCount(20000)} / {sessionSolves.length}
                            {sessionSolves.length > 0 && (
                              <span className="text-gray-500 ml-1">
                                ({Math.round((calculateSubXCount(20000) / sessionSolves.length) * 100)}%)
                              </span>
                            )}
                          </>
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Session Progress:</span>
                      <span className={`font-medium ${
                        calculateSessionImprovement().improved === true ? 'text-green-600' :
                        calculateSessionImprovement().improved === false ? 'text-red-600' :
                        'text-gray-600'
                      }`}>
                        {calculateSessionImprovement().text}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes Section */}
              {selectedSession.notes && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Notes</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700">{selectedSession.notes}</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-4">
                {selectedSession.isActive ? (
                  <>
                    <button
                      onClick={() => {
                        closeSessionModal();
                        navigate('/timer');
                      }}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors inline-flex items-center space-x-2"
                    >
                      <Play className="w-4 h-4" />
                      <span>Continue Session</span>
                    </button>
                    <button
                      onClick={async () => {
                        await handleEndSession();
                        closeSessionModal();
                      }}
                      className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors inline-flex items-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>New Session</span>
                    </button>
                  </>
                ) : (
                                  <button
                  onClick={() => handleActivateSession(selectedSession.id)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors inline-flex items-center space-x-2"
                >
                  <Play className="w-4 h-4" />
                  <span>Reactivate Session</span>
                </button>
              )}
              {!selectedSession.isActive && allSessions.length > 1 && (
                <button
                  onClick={() => handleDeleteSession(selectedSession.id, selectedSession.name)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors inline-flex items-center space-x-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Session</span>
                </button>
              )}
              <button
                onClick={closeSessionModal}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionsPage;
