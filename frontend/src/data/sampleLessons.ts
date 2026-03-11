import type { Unit } from '@/types/quiz'

export const sampleUnits: Unit[] = [
  {
    id: 'unit-1',
    title: 'Unit 1',
    description: 'Style Foundations',
    lessons: [
      { id: 'l1', title: 'Style Basics', icon: 'shirt', status: 'completed', quizId: 'basics-1' },
      { id: 'l2', title: 'Color Theory', icon: 'palette', status: 'completed', quizId: 'color-theory' },
      { id: 'l3', title: 'Fit Guide', icon: 'ruler', status: 'current', quizId: 'basics-1' },
      { id: 'l4', title: 'Fabric 101', icon: 'scissors', status: 'locked' },
    ],
  },
  {
    id: 'unit-2',
    title: 'Unit 2',
    description: 'Building Outfits',
    lessons: [
      { id: 'l5', title: 'Capsule Wardrobe', icon: 'gem', status: 'locked' },
      { id: 'l6', title: 'Layering', icon: 'layers', status: 'locked' },
      { id: 'l7', title: 'Accessories', icon: 'watch', status: 'locked' },
    ],
  },
  {
    id: 'unit-3',
    title: 'Unit 3',
    description: 'Advanced Style',
    lessons: [
      { id: 'l8', title: 'Pattern Mixing', icon: 'grid', status: 'locked' },
      { id: 'l9', title: 'Seasonal Style', icon: 'leaf', status: 'locked' },
      { id: 'l10', title: 'Style Identity', icon: 'sparkles', status: 'locked' },
    ],
  },
]

export const streakCount = 7
