// JavaScript interfaces and utility functions for Workout Sets and Vault Posts

// Helper type guards
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

// Utility functions
export const calculateWorkoutDuration = (exercises) => {
  return exercises.reduce((total, exercise) => {
    const sets = exercise.sets || 3;
    return total + (sets * 5); // 5 minutes per set
  }, 0);
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