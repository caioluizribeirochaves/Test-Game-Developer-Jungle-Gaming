import React from 'react';
import { PiratePanel } from '../components/PiratePanel';
import { PirateButton } from '../components/PirateButton';
import { MatchConfig } from '@/engine/config/gameConfig';
import { useRankingQuery, useMatchHistoryQuery } from '@/api/queries';

export interface CaptainsLogModalProps {
  initialTab?: 'ranking' | 'history';
  config: MatchConfig;
  onClose: () => void;
}

export const CaptainsLogModal: React.FC<CaptainsLogModalProps> = ({
  initialTab = 'ranking',
  config,
  onClose,
}) => {
  const [activeTab, setActiveTab] = React.useState<'ranking' | 'history'>(initialTab);
  const [rankingPage, setRankingPage] = React.useState(1);
  const [historyPage, setHistoryPage] = React.useState(1);

  const {
    data: rankingData,
    isLoading: isRankingLoading,
    isError: isRankingError,
    refetch: refetchRanking,
  } = useRankingQuery(config.sessionDuration, config.enemySpawnInterval, rankingPage);

  const {
    data: historyData,
    isLoading: isHistoryLoading,
    isError: isHistoryError,
    refetch: refetchHistory,
  } = useMatchHistoryQuery(historyPage);

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
      const day = String(date.getDate()).padStart(2, '0');
      const month = months[date.getMonth()];
      const hours = String(date.getHours()).padStart(2, '0');
      const mins = String(date.getMinutes()).padStart(2, '0');
      return `${day} ${month} • ${hours}:${mins}`;
    } catch {
      return isoString;
    }
  };

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div
      className="relative w-full h-full flex flex-col items-center justify-center bg-cover bg-center overflow-hidden"
      style={{ backgroundImage: 'url(/assets/ui_scene_background.png)' }}
    >
      <PiratePanel size="wide">
        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#fce79f] tracking-wider mb-3 drop-shadow-md">
          CAPTAIN'S LOG
        </h2>

        {/* Tab Toggle Navigation */}
        <div className="flex items-center gap-3 mb-3">
          <PirateButton
            variant={activeTab === 'ranking' ? 'tabActive' : 'tabInactive'}
            onClick={() => setActiveTab('ranking')}
          >
            RANKING
          </PirateButton>

          <PirateButton
            variant={activeTab === 'history' ? 'tabActive' : 'tabInactive'}
            onClick={() => setActiveTab('history')}
          >
            MATCH HISTORY
          </PirateButton>
        </div>

        {/* Dynamic Subtitle */}
        <div className="text-[11px] sm:text-xs font-bold text-[#c5ad83] uppercase tracking-wider mb-4 text-center">
          {activeTab === 'ranking'
            ? `${config.sessionDuration} SECOND BATTLES • ${config.enemySpawnInterval} SECOND SPAWN INTERVAL`
            : `CAPTAIN JACK • YOUR RECENT BATTLES`}
        </div>

        {/* Data Container Area */}
        <div className="w-full min-h-[260px] max-h-[340px] flex flex-col justify-between overflow-x-auto">
          {activeTab === 'ranking' ? (
            /* RANKING TAB CONTENT */
            <div>
              {isRankingLoading && (
                <div className="w-full h-48 flex items-center justify-center text-amber-300 font-bold animate-pulse text-sm">
                  Loading Fleet Rankings...
                </div>
              )}

              {isRankingError && (
                <div className="w-full h-48 flex flex-col items-center justify-center text-red-400 text-sm gap-2">
                  <span>Failed to load ranking records.</span>
                  <button
                    onClick={() => refetchRanking()}
                    className="text-xs text-sky-400 underline cursor-pointer"
                  >
                    Retry Query
                  </button>
                </div>
              )}

              {!isRankingLoading && !isRankingError && rankingData?.items.length === 0 && (
                <div className="w-full h-48 flex items-center justify-center text-stone-400 text-sm">
                  No voyages recorded for this configuration yet.
                </div>
              )}

              {!isRankingLoading && !isRankingError && (rankingData?.items.length ?? 0) > 0 && (
                <table className="w-full text-left text-xs sm:text-sm border-collapse">
                  <thead>
                    <tr className="text-[10px] sm:text-xs text-stone-400 uppercase border-b border-[#243f5e] pb-1">
                      <th className="py-1.5 px-3">RANK</th>
                      <th className="py-1.5 px-3">CAPTAIN</th>
                      <th className="py-1.5 px-3">POINTS</th>
                      <th className="py-1.5 px-3">PLAYED</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rankingData?.items.map((entry) => (
                      <tr
                        key={entry.matchId}
                        className={`border-b border-[#1c324b] transition-colors ${
                          entry.isCurrentPlayer
                            ? 'bg-[#4a3a1d]/60 font-bold text-[#fce79f]'
                            : 'text-[#d7e3ef] hover:bg-[#1a2d42]/40'
                        }`}
                      >
                        <td className="py-2.5 px-3 font-mono">
                          {String(entry.rank).padStart(2, '0')}
                        </td>
                        <td className="py-2.5 px-3 flex items-center gap-1.5">
                          {entry.rank === 1 && <span className="text-yellow-400">★</span>}
                          <span>{entry.playerName}</span>
                          {entry.isCurrentPlayer && (
                            <span className="text-[9px] bg-amber-500/30 text-amber-200 border border-amber-500/50 px-1 py-0.5 rounded font-mono">
                              YOU
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-amber-300">
                          {entry.score}
                        </td>
                        <td className="py-2.5 px-3 text-stone-400 text-[11px] sm:text-xs font-mono">
                          {formatDate(entry.date)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ) : (
            /* MATCH HISTORY TAB CONTENT */
            <div>
              {isHistoryLoading && (
                <div className="w-full h-48 flex items-center justify-center text-amber-300 font-bold animate-pulse text-sm">
                  Fetching Captain's Logbook...
                </div>
              )}

              {isHistoryError && (
                <div className="w-full h-48 flex flex-col items-center justify-center text-red-400 text-sm gap-2">
                  <span>Failed to load match history.</span>
                  <button
                    onClick={() => refetchHistory()}
                    className="text-xs text-sky-400 underline cursor-pointer"
                  >
                    Retry Query
                  </button>
                </div>
              )}

              {!isHistoryLoading && !isHistoryError && historyData?.items.length === 0 && (
                <div className="w-full h-48 flex items-center justify-center text-stone-400 text-sm">
                  You haven't fought any battles yet. Set sail to record your feats!
                </div>
              )}

              {!isHistoryLoading && !isHistoryError && (historyData?.items.length ?? 0) > 0 && (
                <table className="w-full text-left text-xs sm:text-sm border-collapse">
                  <thead>
                    <tr className="text-[10px] sm:text-xs text-stone-400 uppercase border-b border-[#243f5e] pb-1">
                      <th className="py-1.5 px-3">DATE</th>
                      <th className="py-1.5 px-3">POINTS</th>
                      <th className="py-1.5 px-3">DURATION</th>
                      <th className="py-1.5 px-3">RESULT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyData?.items.map((item) => (
                      <tr
                        key={item.id}
                        className="border-b border-[#1c324b] text-[#d7e3ef] hover:bg-[#1a2d42]/40"
                      >
                        <td className="py-2.5 px-3 font-mono text-[11px] sm:text-xs text-stone-300">
                          {formatDate(item.date)}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-amber-300">
                          {item.score}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-stone-300">
                          {formatDuration(item.duration)}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-xs">
                          <span
                            className={item.reason === 'TIME_UP' ? 'text-stone-300' : 'text-red-400'}
                          >
                            {item.reason === 'TIME_UP' ? 'TIME UP' : 'DEFEATED'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Pagination Controls */}
          {activeTab === 'ranking' && rankingData && rankingData.totalPages > 1 && (
            <div className="w-full flex items-center justify-center gap-3 pt-3">
              <PirateButton
                variant="round"
                size="sm"
                onClick={() => setRankingPage((p) => Math.max(1, p - 1))}
                disabled={rankingPage <= 1}
                aria-label="Previous Page"
              >
                ↶
              </PirateButton>

              <span className="text-xs text-[#c5ad83] font-bold font-mono tracking-wider">
                PAGE {rankingData.page} OF {rankingData.totalPages}
              </span>

              <PirateButton
                variant="round"
                size="sm"
                onClick={() => setRankingPage((p) => Math.min(rankingData.totalPages, p + 1))}
                disabled={rankingPage >= rankingData.totalPages}
                aria-label="Next Page"
              >
                ↷
              </PirateButton>
            </div>
          )}

          {activeTab === 'history' && historyData && historyData.totalPages > 1 && (
            <div className="w-full flex items-center justify-center gap-3 pt-3">
              <PirateButton
                variant="round"
                size="sm"
                onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                disabled={historyPage <= 1}
                aria-label="Previous Page"
              >
                ↶
              </PirateButton>

              <span className="text-xs text-[#c5ad83] font-bold font-mono tracking-wider">
                PAGE {historyData.page} OF {historyData.totalPages}
              </span>

              <PirateButton
                variant="round"
                size="sm"
                onClick={() => setHistoryPage((p) => Math.min(historyData.totalPages, p + 1))}
                disabled={historyPage >= historyData.totalPages}
                aria-label="Next Page"
              >
                ↷
              </PirateButton>
            </div>
          )}
        </div>

        {/* Back Button */}
        <div className="mt-4">
          <PirateButton variant="primary" size="md" onClick={onClose}>
            MAIN MENU
          </PirateButton>
        </div>
      </PiratePanel>
    </div>
  );
};
