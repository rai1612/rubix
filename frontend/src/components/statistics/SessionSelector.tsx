import React, { useState, useEffect } from 'react';
import { ChevronDown, Calendar, Users, BarChart3 } from 'lucide-react';
import { SessionService, SessionDto } from '../../services/sessionService';
import { PuzzleType } from '../../services/scrambleService';
import { cn, getAdaptiveClasses } from '../../utils/appearanceUtils';

interface SessionSelectorProps {
  selectedSessionId: string | null; // null means "All Sessions"
  onSessionChange: (sessionId: string | null) => void;
  puzzleType: PuzzleType;
  className?: string;
}

export const SessionSelector: React.FC<SessionSelectorProps> = ({
  selectedSessionId,
  onSessionChange,
  puzzleType,
  className = ''
}) => {
  const [sessions, setSessions] = useState<SessionDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchSessions = async () => {
      setIsLoading(true);
      try {
        const allSessions = await SessionService.getUserSessions(50); // Get more sessions
        // Filter by puzzle type
        const filteredSessions = allSessions.filter(session => session.puzzleType === puzzleType);
        setSessions(filteredSessions);
      } catch (error) {
        console.error('Failed to fetch sessions:', error);
        setSessions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessions();
  }, [puzzleType]);

  const selectedSession = selectedSessionId 
    ? sessions.find(s => s.id === selectedSessionId)
    : null;

  const handleSessionSelect = (sessionId: string | null) => {
    setIsOpen(false);
    onSessionChange(sessionId);
  };

  const formatSessionDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatSessionTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <BarChart3 className="w-4 h-4 text-adaptive-tertiary" />
        <div className="animate-pulse bg-gray-200 rounded h-6 w-32"></div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center gap-2 mb-2">
        <BarChart3 className="w-4 h-4 text-adaptive-secondary" />
        <span className="text-sm font-medium text-adaptive-primary">Session View:</span>
      </div>
      
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
        >
          <div className="flex items-center gap-3">
            {selectedSession ? (
              <>
                <Calendar className="w-4 h-4 text-adaptive-tertiary" />
                <div className="text-left">
                  <div className="font-medium text-adaptive-primary">
                    {selectedSession.name || 'Unnamed Session'}
                  </div>
                  <div className="text-xs text-adaptive-tertiary">
                    {formatSessionDate(selectedSession.startedAt)} • {selectedSession.solveCount} solves
                  </div>
                </div>
              </>
            ) : (
              <>
                <Users className="w-4 h-4 text-adaptive-tertiary" />
                <div className="text-left">
                  <div className="font-medium text-adaptive-primary">All Sessions Combined</div>
                  <div className="text-xs text-adaptive-tertiary">
                    {sessions.length} session{sessions.length !== 1 ? 's' : ''} • Overall statistics
                  </div>
                </div>
              </>
            )}
          </div>
          <ChevronDown className={`w-4 h-4 text-adaptive-tertiary transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
            {/* All Sessions Option */}
            <button
              onClick={() => handleSessionSelect(null)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-adaptive-tertiary transition-colors ${
                selectedSessionId === null ? 'bg-adaptive-tertiary border-r-2 border-primary-500' : ''
              }`}
            >
              <Users className="w-4 h-4 text-adaptive-tertiary" />
              <div>
                <div className="font-medium text-adaptive-primary">All Sessions Combined</div>
                <div className="text-xs text-adaptive-tertiary">
                  Overall statistics across all {sessions.length} sessions
                </div>
              </div>
            </button>

            {/* Individual Sessions */}
            <div className="border-t border-gray-100">
              {sessions.length === 0 ? (
                <div className="px-4 py-6 text-center text-adaptive-tertiary">
                  <Calendar className={cn('w-8 h-8 mx-auto mb-2', getAdaptiveClasses.text.tertiary)} />
                  <div className="text-sm">No sessions found</div>
                  <div className="text-xs">Start timing to create sessions</div>
                </div>
              ) : (
                sessions.map((session) => (
                  <button
                    key={session.id}
                    onClick={() => handleSessionSelect(session.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-adaptive-tertiary transition-colors ${
                      selectedSessionId === session.id ? 'bg-adaptive-tertiary border-r-2 border-primary-500' : ''
                    }`}
                  >
                    <Calendar className="w-4 h-4 text-adaptive-tertiary" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-adaptive-primary truncate">
                          {session.name || 'Unnamed Session'}
                        </div>
                        {session.isActive && (
                          <span className="text-xs bg-success text-success px-2 py-0.5 rounded-full">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-adaptive-tertiary flex items-center justify-between">
                        <span>
                          {formatSessionDate(session.startedAt)} at {formatSessionTime(session.startedAt)}
                        </span>
                        <span>
                          {session.solveCount} solve{session.solveCount !== 1 ? 's' : ''}
                        </span>
                      </div>
                      {session.averageTimeMs && (
                        <div className="text-xs text-adaptive-tertiary">
                          Avg: {(session.averageTimeMs / 1000).toFixed(2)}s
                        </div>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Summary Info */}
      <div className="mt-2 text-xs text-adaptive-tertiary">
        {selectedSession ? (
          <div className="flex items-center justify-between">
            <span>
              {selectedSession.isActive ? 'Active session' : 'Ended session'}
            </span>
            <span>
              {formatSessionDate(selectedSession.startedAt)}
            </span>
          </div>
        ) : (
          <div>
            Viewing combined data from all {sessions.length} sessions
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionSelector;
