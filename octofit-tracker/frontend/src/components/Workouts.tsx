import { ApiList } from './ApiList.js';

type WorkoutSuggestion = { _id?: string; title: string; reason: string };

export default function Workouts() {
  return <ApiList<WorkoutSuggestion>
    title="Workout suggestions"
    description="Recommend workouts from activity patterns."
    endpoint={`/api/workouts/suggestions/${encodeURIComponent('mona@example.com')}`}
    collection="suggestions"
    emptyMessage="No workout suggestions available."
    renderItem={(workout) => <><strong>{workout.title}</strong>: {workout.reason}</>}
  />;
}
