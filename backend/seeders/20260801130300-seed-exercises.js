'use strict';

const exercises = [
  // ===== CHEST =====
  { exercise: 'Barbell Bench Press', category: 'Chest' },
  { exercise: 'Incline Barbell Bench Press', category: 'Chest' },
  { exercise: 'Dumbbell Bench Press', category: 'Chest' },
  { exercise: 'Incline Dumbbell Press', category: 'Chest' },
  { exercise: 'Chest Fly (Cable)', category: 'Chest' },
  { exercise: 'Push-Up', category: 'Chest' },
  { exercise: 'Dips (Chest)', category: 'Chest' },

  // ===== BACK =====
  { exercise: 'Deadlift', category: 'Back' },
  { exercise: 'Pull-Up', category: 'Back' },
  { exercise: 'Lat Pulldown', category: 'Back' },
  { exercise: 'Barbell Row', category: 'Back' },
  { exercise: 'Seated Cable Row', category: 'Back' },
  { exercise: 'Dumbbell Row (Single Arm)', category: 'Back' },
  { exercise: 'T-Bar Row', category: 'Back' },

  // ===== LEGS =====
  { exercise: 'Barbell Back Squat', category: 'Legs' },
  { exercise: 'Front Squat', category: 'Legs' },
  { exercise: 'Leg Press', category: 'Legs' },
  { exercise: 'Romanian Deadlift', category: 'Legs' },
  { exercise: 'Leg Extension', category: 'Legs' },
  { exercise: 'Leg Curl', category: 'Legs' },
  { exercise: 'Walking Lunge', category: 'Legs' },
  { exercise: 'Bulgarian Split Squat', category: 'Legs' },
  { exercise: 'Standing Calf Raise', category: 'Legs' },
  { exercise: 'Hip Thrust', category: 'Legs' },

  // ===== SHOULDERS =====
  { exercise: 'Overhead Press (Barbell)', category: 'Shoulders' },
  { exercise: 'Seated Dumbbell Shoulder Press', category: 'Shoulders' },
  { exercise: 'Lateral Raise', category: 'Shoulders' },
  { exercise: 'Front Raise', category: 'Shoulders' },
  { exercise: 'Rear Delt Fly', category: 'Shoulders' },
  { exercise: 'Face Pull', category: 'Shoulders' },
  { exercise: 'Shrugs', category: 'Shoulders' },

  // ===== ARMS =====
  { exercise: 'Barbell Curl', category: 'Arms' },
  { exercise: 'Dumbbell Curl', category: 'Arms' },
  { exercise: 'Hammer Curl', category: 'Arms' },
  { exercise: 'Preacher Curl', category: 'Arms' },
  { exercise: 'Triceps Pushdown', category: 'Arms' },
  { exercise: 'Skull Crushers', category: 'Arms' },
  { exercise: 'Close-Grip Bench Press', category: 'Arms' },
  { exercise: 'Dips (Triceps)', category: 'Arms' },

  // ===== CORE =====
  { exercise: 'Plank', category: 'Core' },
  { exercise: 'Hanging Leg Raise', category: 'Core' },
  { exercise: 'Cable Crunch', category: 'Core' },
  { exercise: 'Sit-Up', category: 'Core' },
  { exercise: 'Russian Twist', category: 'Core' },
  { exercise: 'Ab Wheel Rollout', category: 'Core' },

  // ===== CARDIO =====
  { exercise: 'Treadmill Run', category: 'Cardio' },
  { exercise: 'Stationary Bike', category: 'Cardio' },
  { exercise: 'Rowing Machine', category: 'Cardio' },
  { exercise: 'Elliptical', category: 'Cardio' },
  { exercise: 'Jump Rope', category: 'Cardio' },
  { exercise: 'Stair Climber', category: 'Cardio' },
];

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert('exercises', exercises, { ignoreDuplicates: true });
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('exercises', {
      exercise: exercises.map((e) => e.exercise),
    });
  },
};
