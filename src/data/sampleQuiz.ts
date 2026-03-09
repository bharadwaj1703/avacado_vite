import type { Quiz } from '@/types/quiz'

export const sampleQuizzes: Record<string, Quiz> = {
  'basics-1': {
    id: 'basics-1',
    title: 'Style Basics',
    description: 'Learn the fundamentals of personal style',
    questions: [
      {
        id: 'q1',
        type: 'single',
        prompt: 'Which color family feels most "you"?',
        options: [
          { id: 'a', text: 'Earth tones (olive, tan, rust)' },
          { id: 'b', text: 'Cool neutrals (navy, grey, white)' },
          { id: 'c', text: 'Bold brights (red, cobalt, emerald)' },
          { id: 'd', text: 'Pastels (lavender, blush, mint)' },
        ],
        correctAnswers: ['a'],
      },
      {
        id: 'q2',
        type: 'multiple',
        prompt: 'Which occasions do you dress for most? (Select all that apply)',
        options: [
          { id: 'a', text: 'Casual weekends' },
          { id: 'b', text: 'Office / work' },
          { id: 'c', text: 'Date nights' },
          { id: 'd', text: 'Active / outdoors' },
        ],
        correctAnswers: ['a', 'b'],
      },
      {
        id: 'q3',
        type: 'single',
        prompt: 'What\'s your go-to footwear?',
        options: [
          { id: 'a', text: 'Sneakers' },
          { id: 'b', text: 'Boots' },
          { id: 'c', text: 'Loafers / flats' },
          { id: 'd', text: 'Sandals' },
        ],
        correctAnswers: ['a'],
      },
      {
        id: 'q4',
        type: 'single',
        prompt: 'How would you describe your ideal fit?',
        options: [
          { id: 'a', text: 'Relaxed & oversized' },
          { id: 'b', text: 'Tailored & structured' },
          { id: 'c', text: 'Slim & minimal' },
          { id: 'd', text: 'Athleisure & stretchy' },
        ],
        correctAnswers: ['b'],
      },
      {
        id: 'q5',
        type: 'multiple',
        prompt: 'Which accessories do you reach for? (Select all)',
        options: [
          { id: 'a', text: 'Watch' },
          { id: 'b', text: 'Sunglasses' },
          { id: 'c', text: 'Hat / cap' },
          { id: 'd', text: 'Jewelry / rings' },
        ],
        correctAnswers: ['a', 'b'],
      },
    ],
  },
  'color-theory': {
    id: 'color-theory',
    title: 'Color Theory',
    description: 'Master color coordination in your outfits',
    questions: [
      {
        id: 'ct1',
        type: 'single',
        prompt: 'What are complementary colors?',
        options: [
          { id: 'a', text: 'Colors next to each other on the color wheel' },
          { id: 'b', text: 'Colors opposite each other on the color wheel' },
          { id: 'c', text: 'Colors that are the same shade' },
          { id: 'd', text: 'Only primary colors' },
        ],
        correctAnswers: ['b'],
      },
      {
        id: 'ct2',
        type: 'single',
        prompt: 'Which is a neutral color?',
        options: [
          { id: 'a', text: 'Red' },
          { id: 'b', text: 'Navy' },
          { id: 'c', text: 'Beige' },
          { id: 'd', text: 'Emerald' },
        ],
        correctAnswers: ['c'],
      },
      {
        id: 'ct3',
        type: 'multiple',
        prompt: 'Which colors work for a monochromatic outfit? (Select all)',
        options: [
          { id: 'a', text: 'Light blue shirt' },
          { id: 'b', text: 'Navy blazer' },
          { id: 'c', text: 'Red scarf' },
          { id: 'd', text: 'Denim jeans' },
        ],
        correctAnswers: ['a', 'b', 'd'],
      },
    ],
  },
}
