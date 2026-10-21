import { ApiList } from './ApiList.js';

type Activity = { _id?: string; type: string; minutes: number; points: number };

export default function Activities() {
  return <ApiList<Activity>
    title="Activities"
    description="Track student activity minutes and points."
    endpoint="/api/activities"
    collection="activities"
    emptyMessage="No activities yet."
    renderItem={(activity) => `${activity.type}: ${activity.minutes} minutes, ${activity.points} points`}
  />;
}
