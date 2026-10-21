import { ApiList } from './ApiList.js';
import { getJson } from '../api/client.js';

type WorkoutSuggestion = { _id?: string; title: string; reason: string };

function loadSuggestions() {
  const email = encodeURIComponent('mona@example.com');
  return getJson<{ suggestions: WorkoutSuggestion[] }>(`/api/workouts/suggestions/${email}`).then(({ suggestions }) => suggestions);
}

export default function Workouts() {
  return <ApiList<WorkoutSuggestion>
    title="Workout suggestions"
    description="Recommend workouts from activity patterns."
    load={loadSuggestions}
    emptyMessage="No workout suggestions available."
    renderItem={(workout) => <><strong>{workout.title}</strong>: {workout.reason}</>}
  />;
}
