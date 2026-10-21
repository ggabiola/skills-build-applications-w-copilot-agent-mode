import { ApiList } from './ApiList.js';

type LeaderboardEntry = { _id?: string; teamName: string; totalPoints: number; rank: number };

export default function Leaderboard() {
  return <ApiList<LeaderboardEntry>
    title="Leaderboard"
    description="Compare team point totals."
    endpoint="/api/leaderboard"
    collection="leaderboard"
    emptyMessage="No leaderboard rankings yet."
    renderItem={(entry) => `#${entry.rank} ${entry.teamName}: ${entry.totalPoints} points`}
  />;
}
