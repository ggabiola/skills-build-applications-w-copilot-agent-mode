import { ApiList } from './ApiList.js';
import { getJson } from '../api/client.js';

type Activity = { _id?: string; type: string; minutes: number; points: number };

function loadActivities() {
  return getJson<{ activities: Activity[] }>('/api/activities').then(({ activities }) => activities);
}

export default function Activities() {
  return <ApiList<Activity>
    title="Activities"
    description="Track student activity minutes and points."
    load={loadActivities}
    emptyMessage="No activities yet."
    renderItem={(activity) => `${activity.type}: ${activity.minutes} minutes, ${activity.points} points`}
  />;
}
