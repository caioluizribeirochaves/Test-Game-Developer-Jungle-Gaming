import React from 'react';
import { PiratePanel } from '../components/PiratePanel';
import { PirateButton } from '../components/PirateButton';
import { MatchConfig } from '@/engine/config/gameConfig';
import { useRankingQuery, useMatchHistoryQuery } from '@/api/queries';
import { useDeviceLayout } from '../hooks/useDeviceLayout';

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
  const { isDesktop, isMobileLandscape } = useDeviceLayout();

  // Dynamic filter state for ranking inspection
  const [selectedDuration, setSelectedDuration] = React.useState(config.sessionDuration);
  const [selectedSpawnInterval, setSelectedSpawnInterval] = React.useState(config.enemySpawnInterval);

  const [rankingPage, setRankingPage] = React.useState(1);
  const [historyPage, setHistoryPage] = React.useState(1);

  const {
    data: rankingData,
    isLoading: isRankingLoading,
    isError: isRankingError,
    refetch: refetchRanking,
  } = useRankingQuery(selectedDuration, selectedSpawnInterval, rankingPage);

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
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden p-1.5 xs:p-2 sm:p-4 select-none">
      {/* Subtle darkened and slightly blurred background scene for high contrast focus */}
      <div
        className="absolute inset-0 bg-cover bg-center filter blur-[2.5px] scale-105 pointer-events-none"
        style={{ backgroundImage: 'url(/assets/ui_scene_background.png)' }}
      />
      <div className="absolute inset-0 bg-black/35 pointer-events-none" />

      <PiratePanel size="wide" className="z-10 max-h-[calc(100dvh-12px)] flex flex-col">
        {/* MOBILE LANDSCAPE COMPACT HEADER */}
        {isMobileLandscape ? (
          <div className="w-full flex items-center justify-between gap-2 mb-1 shrink-0">
            <h2 className="text-xs xs:text-sm font-black text-[#fce79f] tracking-wider drop-shadow-md whitespace-nowrap">
              CAPTAIN'S LOG
            </h2>

            <div className="flex items-center gap-1.5">
              <PirateButton
                variant={activeTab === 'ranking' ? 'tabActive' : 'tabInactive'}
                onClick={() => setActiveTab('ranking')}
                size="xs"
                className="px-2.5 py-0.5 text-[9px]"
              >
                RANKING
              </PirateButton>

              <PirateButton
                variant={activeTab === 'history' ? 'tabActive' : 'tabInactive'}
                onClick={() => setActiveTab('history')}
                size="xs"
                className="px-2.5 py-0.5 text-[9px]"
              >
                MATCH HISTORY
              </PirateButton>
            </div>

            {activeTab === 'ranking' && (
              <div className="flex items-center gap-1.5 text-[9px] text-[#c5ad83] font-semibold">
                <span>LEN:</span>
                <select
                  value={selectedDuration}
                  onChange={(e) => {
                    setSelectedDuration(Number(e.target.value));
                    setRankingPage(1);
                  }}
                  className="bg-[#0e1925] border border-[#3b5774] text-amber-300 font-bold px-1.5 py-0.5 rounded cursor-pointer outline-none font-mono text-[9px]"
                >
                  <option value={60}>60s</option>
                  <option value={90}>90s</option>
                  <option value={120}>120s</option>
                  <option value={150}>150s</option>
                  <option value={180}>180s</option>
                </select>

                <span>SPAWN:</span>
                <select
                  value={selectedSpawnInterval}
                  onChange={(e) => {
                    setSelectedSpawnInterval(Number(e.target.value));
                    setRankingPage(1);
                  }}
                  className="bg-[#0e1925] border border-[#3b5774] text-amber-300 font-bold px-1.5 py-0.5 rounded cursor-pointer outline-none font-mono text-[9px]"
                >
                  <option value={1}>1s</option>
                  <option value={2}>2s</option>
                  <option value={3}>3s</option>
                  <option value={4}>4s</option>
                  <option value={5}>5s</option>
                  <option value={6}>6s</option>
                </select>
              </div>
            )}
          </div>
        ) : (
          /* STANDARD / DESKTOP / PORTRAIT HEADER */
          <>
            <h2 className={`${isDesktop ? 'text-2xl sm:text-3xl mb-3' : 'text-base xs:text-lg mb-1'} font-black text-[#fce79f] tracking-wider text-center drop-shadow-md shrink-0`}>
              CAPTAIN'S LOG
            </h2>

            {/* Tab Toggle Navigation */}
            <div className={`flex items-center gap-2 ${isDesktop ? 'mb-3' : 'mb-1.5'} shrink-0`}>
              <PirateButton
                variant={activeTab === 'ranking' ? 'tabActive' : 'tabInactive'}
                onClick={() => setActiveTab('ranking')}
                size={isDesktop ? 'sm' : 'xs'}
                className={isDesktop ? 'px-6 py-2 text-sm' : 'px-3 py-1 text-xs'}
              >
                RANKING
              </PirateButton>

              <PirateButton
                variant={activeTab === 'history' ? 'tabActive' : 'tabInactive'}
                onClick={() => setActiveTab('history')}
                size={isDesktop ? 'sm' : 'xs'}
                className={isDesktop ? 'px-6 py-2 text-sm' : 'px-3 py-1 text-xs'}
              >
                MATCH HISTORY
              </PirateButton>
            </div>

            {/* Filters Row */}
            {activeTab === 'ranking' && (
              <div className={`flex items-center justify-center gap-2 sm:gap-4 ${isDesktop ? 'mb-2 text-xs font-semibold' : 'mb-1 text-[10px] xs:text-[11px]'} text-stone-300 shrink-0`}>
                <div className="flex items-center gap-1">
                  <span>Battle length:</span>
                  <select
                    value={selectedDuration}
                    onChange={(e) => {
                      setSelectedDuration(Number(e.target.value));
                      setRankingPage(1);
                    }}
                    className={`bg-[#0e1925] border border-[#3b5774] text-amber-300 font-bold ${isDesktop ? 'px-2.5 py-1 text-xs' : 'px-1.5 py-0.5 text-[10px]'} rounded cursor-pointer outline-none font-mono`}
                  >
                    <option value={60}>60 s</option>
                    <option value={90}>90 s</option>
                    <option value={120}>120 s</option>
                    <option value={150}>150 s</option>
                    <option value={180}>180 s</option>
                  </select>
                </div>

                <div className="flex items-center gap-1">
                  <span>Spawn interval:</span>
                  <select
                    value={selectedSpawnInterval}
                    onChange={(e) => {
                      setSelectedSpawnInterval(Number(e.target.value));
                      setRankingPage(1);
                    }}
                    className={`bg-[#0e1925] border border-[#3b5774] text-amber-300 font-bold ${isDesktop ? 'px-2.5 py-1 text-xs' : 'px-1.5 py-0.5 text-[10px]'} rounded cursor-pointer outline-none font-mono`}
                  >
                    <option value={1}>1 s</option>
                    <option value={2}>2 s</option>
                    <option value={3}>3 s</option>
                    <option value={4}>4 s</option>
                    <option value={5}>5 s</option>
                    <option value={6}>6 s</option>
                  </select>
                </div>
              </div>
            )}

            {/* Dynamic Subtitle */}
            <div className={`${isDesktop ? 'text-xs mb-3' : 'text-[9px] xs:text-[10px] mb-1.5'} font-bold text-[#c5ad83] uppercase tracking-wider text-center shrink-0`}>
              {activeTab === 'ranking'
                ? `${selectedDuration} SECOND BATTLES • ${selectedSpawnInterval} SECOND SPAWN INTERVAL`
                : `CAPTAIN JACK • YOUR RECENT BATTLES`}
            </div>
          </>
        )}

        {/* Data Container Area - Always has min-height and flex-1 so it NEVER collapses to 0 */}
        <div
          className={`w-full flex-1 overflow-x-auto overflow-y-auto custom-scrollbar border border-[#243f5e]/40 rounded-lg ${
            isDesktop
              ? 'h-52 sm:h-64 mb-3'
              : isMobileLandscape
              ? 'min-h-[125px] max-h-[160px]'
              : 'min-h-[160px] max-h-[220px]'
          }`}
        >
          {activeTab === 'ranking' ? (
            /* RANKING TAB CONTENT */
            <div>
              {isRankingLoading && (
                <div className="w-full h-32 flex items-center justify-center text-amber-300 font-bold animate-pulse text-xs sm:text-sm">
                  Loading Fleet Rankings...
                </div>
              )}

              {isRankingError && (
                <div className="w-full h-32 flex flex-col items-center justify-center text-red-400 text-xs sm:text-sm gap-2">
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
                <div className="w-full h-32 flex items-center justify-center text-stone-400 text-xs sm:text-sm">
                  No voyages recorded for this configuration yet.
                </div>
              )}

              {!isRankingLoading && !isRankingError && (rankingData?.items.length ?? 0) > 0 && (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className={`${isDesktop ? 'text-xs' : 'text-[9px] xs:text-[10px]'} text-stone-400 uppercase border-b border-[#243f5e] pb-1`}>
                      <th className={isDesktop ? 'py-2 px-3' : 'py-1 px-1.5 xs:px-2'}>RANK</th>
                      <th className={isDesktop ? 'py-2 px-3' : 'py-1 px-1.5 xs:px-2'}>CAPTAIN</th>
                      <th className={isDesktop ? 'py-2 px-3' : 'py-1 px-1.5 xs:px-2'}>POINTS</th>
                      <th className={isDesktop ? 'py-2 px-3' : 'py-1 px-1.5 xs:px-2'}>PLAYED</th>
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
                        <td className={`${isDesktop ? 'py-2 px-3 text-sm' : 'py-1 px-1.5 xs:px-2 text-[9.5px] xs:text-[11px]'} font-mono`}>
                          {String(entry.rank).padStart(2, '0')}
                        </td>
                        <td className={`${isDesktop ? 'py-2 px-3 text-sm' : 'py-1 px-1.5 xs:px-2 text-[9.5px] xs:text-[11px]'} flex items-center gap-1.5`}>
                          {entry.rank === 1 && <span className="text-yellow-400">★</span>}
                          <span>{entry.playerName}</span>
                          {entry.isCurrentPlayer && (
                            <span className="text-[8px] xs:text-[9px] bg-amber-500/30 text-amber-200 border border-amber-500/50 px-1 py-0.5 rounded font-mono">
                              YOU
                            </span>
                          )}
                        </td>
                        <td className={`${isDesktop ? 'py-2 px-3 text-sm' : 'py-1 px-1.5 xs:px-2 text-[9.5px] xs:text-[11px]'} font-mono font-bold text-amber-300`}>
                          {entry.score}
                        </td>
                        <td className={`${isDesktop ? 'py-2 px-3 text-xs' : 'py-1 px-1.5 xs:px-2 text-[9px] xs:text-[10px]'} text-stone-400 font-mono`}>
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
                <div className="w-full h-32 flex items-center justify-center text-amber-300 font-bold animate-pulse text-xs sm:text-sm">
                  Fetching Captain's Logbook...
                </div>
              )}

              {isHistoryError && (
                <div className="w-full h-32 flex flex-col items-center justify-center text-red-400 text-xs sm:text-sm gap-2">
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
                <div className="w-full h-32 flex items-center justify-center text-stone-400 text-xs sm:text-sm">
                  You haven't fought any battles yet. Set sail to record your feats!
                </div>
              )}

              {!isHistoryLoading && !isHistoryError && (historyData?.items.length ?? 0) > 0 && (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className={`${isDesktop ? 'text-xs' : 'text-[9px] xs:text-[10px]'} text-stone-400 uppercase border-b border-[#243f5e] pb-1`}>
                      <th className={isDesktop ? 'py-2 px-3' : 'py-1 px-1.5 xs:px-2'}>DATE</th>
                      <th className={isDesktop ? 'py-2 px-3' : 'py-1 px-1.5 xs:px-2'}>POINTS</th>
                      <th className={isDesktop ? 'py-2 px-3' : 'py-1 px-1.5 xs:px-2'}>DURATION</th>
                      <th className={isDesktop ? 'py-2 px-3' : 'py-1 px-1.5 xs:px-2'}>RESULT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyData?.items.map((item) => (
                      <tr
                        key={item.id}
                        className="border-b border-[#1c324b] text-[#d7e3ef] hover:bg-[#1a2d42]/40"
                      >
                        <td className={`${isDesktop ? 'py-2 px-3 text-xs' : 'py-1 px-1.5 xs:px-2 text-[9px] xs:text-[10px]'} font-mono text-stone-300`}>
                          {formatDate(item.date)}
                        </td>
                        <td className={`${isDesktop ? 'py-2 px-3 text-sm' : 'py-1 px-1.5 xs:px-2 text-[9.5px] xs:text-[11px]'} font-mono font-bold text-amber-300`}>
                          {item.score}
                        </td>
                        <td className={`${isDesktop ? 'py-2 px-3 text-xs' : 'py-1 px-1.5 xs:px-2 text-[9.5px] xs:text-[11px]'} font-mono text-stone-300`}>
                          {formatDuration(item.duration)}
                        </td>
                        <td className={`${isDesktop ? 'py-2 px-3 text-xs font-bold' : 'py-1 px-1.5 xs:px-2 text-[9.5px] xs:text-[11px] font-bold'}`}>
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
        </div>

        {/* MOBILE LANDSCAPE FOOTER (Pagination on left, Main Menu on right) */}
        {isMobileLandscape ? (
          <div className="w-full flex items-center justify-between pt-1 shrink-0">
            {activeTab === 'ranking' && rankingData && rankingData.totalPages > 1 ? (
              <div className="flex items-center gap-1.5">
                <PirateButton
                  variant="round"
                  size="xs"
                  icon="turn_left"
                  onClick={() => setRankingPage((p) => Math.max(1, p - 1))}
                  disabled={rankingPage <= 1}
                  aria-label="Previous Page"
                >
                  ↶
                </PirateButton>
                <span className="text-[9.5px] text-[#c5ad83] font-bold font-mono tracking-wider">
                  PAGE {rankingData.page} OF {rankingData.totalPages}
                </span>
                <PirateButton
                  variant="round"
                  size="xs"
                  icon="turn_right"
                  onClick={() => setRankingPage((p) => Math.min(rankingData.totalPages, p + 1))}
                  disabled={rankingPage >= rankingData.totalPages}
                  aria-label="Next Page"
                >
                  ↷
                </PirateButton>
              </div>
            ) : activeTab === 'history' && historyData && historyData.totalPages > 1 ? (
              <div className="flex items-center gap-1.5">
                <PirateButton
                  variant="round"
                  size="xs"
                  icon="turn_left"
                  onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                  disabled={historyPage <= 1}
                  aria-label="Previous Page"
                >
                  ↶
                </PirateButton>
                <span className="text-[9.5px] text-[#c5ad83] font-bold font-mono tracking-wider">
                  PAGE {historyData.page} OF {historyData.totalPages}
                </span>
                <PirateButton
                  variant="round"
                  size="xs"
                  icon="turn_right"
                  onClick={() => setHistoryPage((p) => Math.min(historyData.totalPages, p + 1))}
                  disabled={historyPage >= historyData.totalPages}
                  aria-label="Next Page"
                >
                  ↷
                </PirateButton>
              </div>
            ) : (
              <div />
            )}

            <PirateButton
              variant="primary"
              size="xs"
              onClick={onClose}
              className="w-[130px] h-[30px] text-[9.5px]"
            >
              MAIN MENU
            </PirateButton>
          </div>
        ) : (
          /* STANDARD / DESKTOP / PORTRAIT FOOTER */
          <>
            {/* Pagination Controls */}
            {activeTab === 'ranking' && rankingData && rankingData.totalPages > 1 && (
              <div className={`w-full flex items-center justify-center gap-2 ${isDesktop ? 'pt-2.5' : 'pt-1.5'} shrink-0`}>
                <PirateButton
                  variant="round"
                  size={isDesktop ? 'sm' : 'xs'}
                  icon="turn_left"
                  onClick={() => setRankingPage((p) => Math.max(1, p - 1))}
                  disabled={rankingPage <= 1}
                  aria-label="Previous Page"
                >
                  ↶
                </PirateButton>

                <span className={`${isDesktop ? 'text-xs' : 'text-[10px] xs:text-[11px]'} text-[#c5ad83] font-bold font-mono tracking-wider`}>
                  PAGE {rankingData.page} OF {rankingData.totalPages}
                </span>

                <PirateButton
                  variant="round"
                  size={isDesktop ? 'sm' : 'xs'}
                  icon="turn_right"
                  onClick={() => setRankingPage((p) => Math.min(rankingData.totalPages, p + 1))}
                  disabled={rankingPage >= rankingData.totalPages}
                  aria-label="Next Page"
                >
                  ↷
                </PirateButton>
              </div>
            )}

            {activeTab === 'history' && historyData && historyData.totalPages > 1 && (
              <div className={`w-full flex items-center justify-center gap-2 ${isDesktop ? 'pt-2.5' : 'pt-1.5'} shrink-0`}>
                <PirateButton
                  variant="round"
                  size={isDesktop ? 'sm' : 'xs'}
                  icon="turn_left"
                  onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                  disabled={historyPage <= 1}
                  aria-label="Previous Page"
                >
                  ↶
                </PirateButton>

                <span className={`${isDesktop ? 'text-xs' : 'text-[10px] xs:text-[11px]'} text-[#c5ad83] font-bold font-mono tracking-wider`}>
                  PAGE {historyData.page} OF {historyData.totalPages}
                </span>

                <PirateButton
                  variant="round"
                  size={isDesktop ? 'sm' : 'xs'}
                  icon="turn_right"
                  onClick={() => setHistoryPage((p) => Math.min(historyData.totalPages, p + 1))}
                  disabled={historyPage >= historyData.totalPages}
                  aria-label="Next Page"
                >
                  ↷
                </PirateButton>
              </div>
            )}

            {/* Back Button */}
            <div className={`${isDesktop ? 'mt-3.5' : 'mt-1.5'} shrink-0`}>
              <PirateButton
                variant="primary"
                size={isDesktop ? 'md' : 'xs'}
                onClick={onClose}
                className={isDesktop ? '' : 'w-[125px] xs:w-[145px] h-[30px] xs:h-[34px] text-[10px] xs:text-[11px]'}
              >
                MAIN MENU
              </PirateButton>
            </div>
          </>
        )}
      </PiratePanel>
    </div>
  );
};
