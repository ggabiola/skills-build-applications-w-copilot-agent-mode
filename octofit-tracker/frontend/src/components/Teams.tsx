import { ApiList } from './ApiList.js';

type Team = { _id?: string; name: string; mascot?: string; members: unknown[] };

export default function Teams() {
  return <ApiList<Team>
    title="Teams"
    description="Manage teams and members."
    endpoint="/api/teams"
    collection="teams"
    emptyMessage="No teams yet."
    renderItem={(team) => `${team.name}${team.mascot ? ` (${team.mascot})` : ''} - ${team.members.length} members`}
  />;
}
