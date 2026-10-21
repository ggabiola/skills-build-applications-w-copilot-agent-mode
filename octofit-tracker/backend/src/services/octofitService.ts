import { Activity, Team, User, Workout } from '../models/index.js';

function httpError(message: string, status = 400) {
  return Object.assign(new Error(message), { status });
}

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw httpError('Activity payload must be an object');
  }

  const { userId, teamId, type, minutes } = input as Record<string, unknown>;
  const validId = (value: unknown) => typeof value === 'string' && /^[\da-f]{24}$/i.test(value);
  if (!validId(userId) || !validId(teamId) || typeof type !== 'string' || !type.trim() || typeof minutes !== 'number' || !Number.isFinite(minutes) || minutes <= 0) {
    throw httpError('Activity requires valid userId, teamId, type, and positive minutes');
  }

  const [userExists, teamExists] = await Promise.all([
    User.exists({ _id: userId }),
    Team.exists({ _id: teamId }),
  ]);
  if (!userExists || !teamExists) {
    throw httpError('Activity user or team was not found', 404);
  }

  return Activity.create({ user: userId, team: teamId, type, minutes, points: minutes, occurredAt: new Date() });
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw httpError('Team payload must be an object');
  }

  const { name, mascot, members = [] } = input as Record<string, unknown>;
  if (typeof name !== 'string' || !name.trim() || typeof mascot !== 'string' || !mascot.trim() || !Array.isArray(members) || !members.every((member) => typeof member === 'string' && /^[\da-f]{24}$/i.test(member))) {
    throw httpError('Team requires a name, mascot, and valid member IDs');
  }

  const memberExists = await Promise.all(members.map((member) => User.exists({ _id: member })));
  if (memberExists.some((member) => !member)) {
    throw httpError('One or more team members were not found', 404);
  }

  return Team.create({ name, mascot, members });
}

export async function getLeaderboard() {
  const teams = await Team.aggregate([
    {
      $lookup: {
        from: Activity.collection.name,
        localField: '_id',
        foreignField: 'team',
        as: 'activities',
      },
    },
    { $project: { teamName: '$name', totalPoints: { $sum: '$activities.points' } } },
    { $sort: { totalPoints: -1, teamName: 1 } },
  ]);
  return teams.map((team, index) => ({ ...team, rank: index + 1 }));
}

export async function suggestWorkouts(userEmail: string) {
  const user = await User.findOne({ email: userEmail }).select('_id fitnessGoal').lean();
  if (!user) {
    throw httpError('User was not found', 404);
  }

  const [recentActivities, workouts] = await Promise.all([
    Activity.find({ user: user._id }).sort({ occurredAt: -1 }).limit(5).select('type').lean(),
    Workout.find().sort({ title: 1 }).lean(),
  ]);
  const recentType = recentActivities[0]?.type?.toLowerCase();
  const activityFocus = recentType === 'run' || recentType === 'cycle' || recentType === 'walk'
    ? 'endurance'
    : recentType;
  const goalFocus = user.fitnessGoal?.toLowerCase();
  const goalHasWorkout = workouts.some((workout) => workout.focus.toLowerCase() === goalFocus);
  const preferredFocus = goalHasWorkout ? goalFocus : activityFocus ?? goalFocus;
  const reason = goalHasWorkout
    ? `Matches your ${user.fitnessGoal} fitness goal.`
    : recentType
      ? `Recommended based on your recent ${recentType} activity.`
      : `Matches your ${user.fitnessGoal} fitness goal.`;

  return workouts
    .sort((left, right) => Number(right.focus.toLowerCase() === preferredFocus) - Number(left.focus.toLowerCase() === preferredFocus))
    .map((workout) => ({ ...workout, reason }));
}

export { User };
