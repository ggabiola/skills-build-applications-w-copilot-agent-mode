import { ApiList } from './ApiList.js';
import { getJson } from '../api/client.js';

type LeaderboardEntry = { _id?: string; teamName: string; totalPoints: number; rank: number };

function loadLeaderboard() {
  return getJson<{ leaderboard: LeaderboardEntry[] }>('/api/leaderboard').then(({ leaderboard }) => leaderboard);
}

export default function Leaderboard() {
  return <ApiList<LeaderboardEntry>
    title="Leaderboard"
    description="Compare team point totals."
    load={loadLeaderboard}
    emptyMessage="No leaderboard rankings yet."
    renderItem={(entry) => `#${entry.rank} ${entry.teamName}: ${entry.totalPoints} points`}
  />;
}
