
export const isCreatedWorkoutSet = (set) => {
  return set.origin === 'created';
};

export const isImportedWorkoutSet = (set) => {
  return set.origin === 'imported';
};

export const canPublish = (set, currentUid) => {
  return set.ownerUid === currentUid && 
         set.origin === 'created' && 
         !set.isPublished;
};

export const calculateWorkoutDuration = (exercises) => {
  return exercises.reduce((total, exercise) => {
    const sets = exercise.sets || 3;
    return total + (sets * 5); 
  }, 0);
};

export const formatDuration = (totalMinutes) => {
  if (!totalMinutes || isNaN(totalMinutes)) return '0m';
  
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.round(totalMinutes % 60);
  
  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
  return `${minutes}m`;
};

export const extractMuscleGroups = (exercises) => {
  const muscles = new Set();
  exercises.forEach(exercise => {
    if (exercise.target) {
      muscles.add(exercise.target);
    }
    if (exercise.bodyPart) {
      muscles.add(exercise.bodyPart);
    }
  });
  return Array.from(muscles);
};