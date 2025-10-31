export type EquipmentSpec = {
  id: string
  name: string
  model?: string
  position: [number, number, number]
  rotation?: [number, number, number]
  size: [number, number, number]
  info: {
    purpose: string
    muscles: string[]
    steps: string[]
    safety: string[]
    videoUrl?: string
    thumbnail?: string
  }
}

export const EQUIPMENT: EquipmentSpec[] = [
  { id: 'treadmill', name: 'Treadmill', model: '/models/treadmill.glb', position: [-10, 1.2, -6], size: [2, 1.2, 1], info: {
    purpose: 'Cardio endurance', muscles: ['Quads','Hamstrings','Calves','Glutes'], steps: ['Start slow','Increase pace gradually','Maintain posture'], safety: ['Use safety clip','Never jump off at speed'] } },
  { id: 'squat-rack', name: 'Squat Rack', model: '/models/squat_rack.glb', position: [-3, 1.2, -6], size: [2, 2.4, 2], info: {
    purpose: 'Lower-body strength', muscles: ['Quads','Glutes','Core'], steps: ['Unrack with control','Sit back and down','Drive up through heels'], safety: ['Use safeties','Don’t round lower back'] } },
  { id: 'bench-press', name: 'Bench Press', model: '/models/bench_press.glb', position: [4, 0.8, -6], size: [2, 1.6, 2], info: {
    purpose: 'Upper-body strength', muscles: ['Chest','Triceps','Shoulders'], steps: ['Grip shoulder width','Feet planted','Lower to sternum','Press up'], safety: ['Use a spotter','Don’t flare elbows excessively'] } },
  { id: 'dumbbell-rack', name: 'Dumbbell Rack', model: '/models/dumbbell_rack.glb', position: [10, 0.8, -6], size: [3, 1.6, 1], info: {
    purpose: 'Free weight selection', muscles: ['Full body'], steps: ['Select moderate weight','Control reps'], safety: ['Re-rack dumbbells','Avoid dropping weights'] } },
  { id: 'bike', name: 'Stationary Bike', model: '/models/stationary_bike.glb', position: [-10, 0.9, 2], size: [1.5, 1.8, 1], info: {
    purpose: 'Low-impact cardio', muscles: ['Quads','Calves','Glutes'], steps: ['Adjust seat height','Maintain cadence'], safety: ['Avoid excessive resistance initially'] } },
  { id: 'smith', name: 'Smith Machine', model: '/models/smith_machine.glb', position: [-3, 1.2, 2], size: [2, 2.4, 2], info: {
    purpose: 'Guided strength training', muscles: ['Chest','Back','Legs','Shoulders'], steps: ['Set safety pins','Load appropriate weight','Maintain form','Use full range of motion'], safety: ['Always use safety pins','Don\'t lock knees','Keep core engaged'] } },
  { id: 'leg-press', name: 'Leg Press Machine', model: '/models/leg_press_machine.glb', position: [4, 1.0, 2], size: [2.5, 1.8, 2], info: {
    purpose: 'Lower body strength', muscles: ['Quads','Glutes','Hamstrings','Calves'], steps: ['Adjust seat position','Place feet shoulder-width','Lower weight slowly','Press through heels'], safety: ['Don\'t lock knees','Keep back flat','Use appropriate weight'] } },
  { id: 'yoga', name: 'Yoga Mat Zone', model: '/models/yoga_mats.glb', position: [10, 0.1, 2], size: [3, 0.2, 3], info: {
    purpose: 'Mobility / Core', muscles: ['Core','Hips','Back'], steps: ['Use mat','Slow, controlled movements'], safety: ['Avoid painful ranges'] } }
]


