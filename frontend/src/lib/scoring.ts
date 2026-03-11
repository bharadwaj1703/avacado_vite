import type {
  Question,
  TextEntryQuestion,
  OneOfManyQuestion,
  ManyOfManyQuestion,
  QuestionResult,
  AssessmentResult,
} from '@/types/content'

// ============================================================================
// Levenshtein Distance for Fuzzy Matching
// ============================================================================

function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = []

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i]
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j] + 1 // deletion
        )
      }
    }
  }

  return matrix[b.length][a.length]
}

function similarityScore(a: string, b: string): number {
  const maxLength = Math.max(a.length, b.length)
  if (maxLength === 0) return 1
  const distance = levenshteinDistance(a, b)
  return 1 - distance / maxLength
}

// ============================================================================
// Text Entry Scoring
// ============================================================================

export interface TextEntryResult {
  correct: boolean
  pointsEarned: number
  normalizedUserAnswer: string | number
}

export function scoreTextEntry(
  question: TextEntryQuestion,
  userAnswer: string
): TextEntryResult {
  const { match_strategy, correct_answer, case_sensitive = false } = question

  // Normalize user answer
  const normalizedUser = case_sensitive ? userAnswer.trim() : userAnswer.trim().toLowerCase()

  switch (match_strategy) {
    case 'exact': {
      const correctStrings = Array.isArray(correct_answer)
        ? correct_answer
        : [String(correct_answer)]
      const normalizedCorrect = correctStrings.map((a) =>
        case_sensitive ? a.trim() : a.trim().toLowerCase()
      )
      const correct = normalizedCorrect.includes(normalizedUser)
      return {
        correct,
        pointsEarned: correct ? question.points : 0,
        normalizedUserAnswer: normalizedUser,
      }
    }

    case 'fuzzy': {
      const correctStrings = Array.isArray(correct_answer)
        ? correct_answer.map(String)
        : [String(correct_answer)]
      const threshold = question.fuzzy_threshold ?? 0.8
      const normalizedCorrect = correctStrings.map((a) =>
        case_sensitive ? a.trim() : a.trim().toLowerCase()
      )

      const bestSimilarity = Math.max(
        ...normalizedCorrect.map((correct) => similarityScore(normalizedUser, correct))
      )
      const correct = bestSimilarity >= threshold
      return {
        correct,
        pointsEarned: correct ? question.points : 0,
        normalizedUserAnswer: normalizedUser,
      }
    }

    case 'regex': {
      const pattern = new RegExp(String(correct_answer), case_sensitive ? '' : 'i')
      const correct = pattern.test(userAnswer)
      return {
        correct,
        pointsEarned: correct ? question.points : 0,
        normalizedUserAnswer: normalizedUser,
      }
    }

    case 'number': {
      const userNum = parseFloat(userAnswer)
      if (isNaN(userNum)) {
        return {
          correct: false,
          pointsEarned: 0,
          normalizedUserAnswer: userAnswer,
        }
      }
      const correctNum = typeof correct_answer === 'number' ? correct_answer : parseFloat(String(correct_answer))
      const tolerance = question.tolerance ?? 0
      const correct = Math.abs(userNum - correctNum) <= tolerance
      return {
        correct,
        pointsEarned: correct ? question.points : 0,
        normalizedUserAnswer: userNum,
      }
    }

    case 'number-range': {
      const userNum = parseFloat(userAnswer)
      if (isNaN(userNum)) {
        return {
          correct: false,
          pointsEarned: 0,
          normalizedUserAnswer: userAnswer,
        }
      }
      const min = question.range_min ?? -Infinity
      const max = question.range_max ?? Infinity
      const correct = userNum >= min && userNum <= max
      return {
        correct,
        pointsEarned: correct ? question.points : 0,
        normalizedUserAnswer: userNum,
      }
    }

    default:
      return {
        correct: false,
        pointsEarned: 0,
        normalizedUserAnswer: normalizedUser,
      }
  }
}

// ============================================================================
// One of Many Scoring
// ============================================================================

export interface OneOfManyResult {
  correct: boolean
  partial: boolean
  pointsEarned: number
}

export function scoreOneOfMany(
  question: OneOfManyQuestion,
  selectedOption: string
): OneOfManyResult {
  const correct = selectedOption === question.correct_option
  
  // Partial credit: if enabled, wrong answer gets 0.5
  // This is unusual but can be configured per question
  const partial = false // One of many is binary unless custom logic added
  
  return {
    correct,
    partial,
    pointsEarned: correct ? question.points : 0,
  }
}

// ============================================================================
// Many of Many Scoring
// ============================================================================

export interface ManyOfManyResult {
  correct: boolean
  partial: boolean
  pointsEarned: number
  details: {
    correctSelected: string[]
    incorrectSelected: string[]
    missedCorrect: string[]
  }
}

export function scoreManyOfMany(
  question: ManyOfManyQuestion,
  selectedOptions: string[]
): ManyOfManyResult {
  const { correct_options, passing_rule, min_required, partial_credit, points } = question
  
  const correctSelected = selectedOptions.filter((id) => correct_options.includes(id))
  const incorrectSelected = selectedOptions.filter((id) => !correct_options.includes(id))
  const missedCorrect = correct_options.filter((id) => !selectedOptions.includes(id))

  const details = {
    correctSelected,
    incorrectSelected,
    missedCorrect,
  }

  let correct = false
  let partial = false
  let pointsEarned = 0

  switch (passing_rule) {
    case 'match-all': {
      correct = correctSelected.length === correct_options.length && incorrectSelected.length === 0
      if (correct) {
        pointsEarned = points
      } else if (partial_credit && correctSelected.length > 0) {
        partial = true
        pointsEarned = (correctSelected.length / correct_options.length) * points
      }
      break
    }

    case 'at-least-k': {
      const required = min_required ?? Math.ceil(correct_options.length / 2)
      correct = correctSelected.length >= required && incorrectSelected.length === 0
      if (correct) {
        pointsEarned = points
      } else if (partial_credit && correctSelected.length > 0) {
        partial = true
        pointsEarned = (correctSelected.length / required) * points
      }
      break
    }

    case 'strict': {
      // Must select ALL correct and NO incorrect
      correct = correctSelected.length === correct_options.length && incorrectSelected.length === 0
      if (correct) {
        pointsEarned = points
      }
      // No partial credit in strict mode
      break
    }
  }

  return {
    correct,
    partial,
    pointsEarned,
    details,
  }
}

// ============================================================================
// Question Dispatcher
// ============================================================================

export function scoreQuestion(
  question: Question,
  userAnswer: unknown
): { correct: boolean; partial: boolean; pointsEarned: number; normalizedAnswer?: unknown } {
  switch (question.type) {
    case 'text-entry': {
      const result = scoreTextEntry(question, String(userAnswer))
      return {
        correct: result.correct,
        partial: false,
        pointsEarned: result.pointsEarned,
        normalizedAnswer: result.normalizedUserAnswer,
      }
    }

    case 'one-of-many': {
      const result = scoreOneOfMany(question, String(userAnswer))
      return {
        correct: result.correct,
        partial: result.partial,
        pointsEarned: result.pointsEarned,
        normalizedAnswer: userAnswer,
      }
    }

    case 'many-of-many': {
      const result = scoreManyOfMany(question, userAnswer as string[])
      return {
        correct: result.correct,
        partial: result.partial,
        pointsEarned: result.pointsEarned,
        normalizedAnswer: userAnswer,
      }
    }

    default:
      return {
        correct: false,
        partial: false,
        pointsEarned: 0,
        normalizedAnswer: userAnswer,
      }
  }
}

// ============================================================================
// Quiz Assessment
// ============================================================================

export function assessQuiz(
  questions: Question[],
  answers: Record<string, unknown>,
  minimumPassingScore: number = 0.7
): AssessmentResult {
  let totalPoints = 0
  let pointsEarned = 0
  let correctCount = 0
  let partialCount = 0
  let incorrectCount = 0

  const questionResults: QuestionResult[] = questions.map((question) => {
    const userAnswer = answers[question.id]
    const scoring = scoreQuestion(question, userAnswer)

    totalPoints += question.points
    pointsEarned += scoring.pointsEarned

    if (scoring.correct) {
      correctCount++
    } else if (scoring.partial) {
      partialCount++
    } else {
      incorrectCount++
    }

    // Determine correct answer for feedback
    let correctAnswer: unknown
    if (question.type === 'text-entry') {
      correctAnswer = (question as TextEntryQuestion).correct_answer
    } else if (question.type === 'one-of-many') {
      correctAnswer = (question as OneOfManyQuestion).correct_option
    } else if (question.type === 'many-of-many') {
      correctAnswer = (question as ManyOfManyQuestion).correct_options
    }

    return {
      questionId: question.id,
      correct: scoring.correct,
      partial: scoring.partial,
      pointsEarned: scoring.pointsEarned,
      pointsPossible: question.points,
      userAnswer: scoring.normalizedAnswer ?? userAnswer,
      correctAnswer,
      feedback: question.explanation,
    }
  })

  const score = totalPoints > 0 ? pointsEarned / totalPoints : 0
  const passed = score >= minimumPassingScore

  return {
    score,
    passed,
    totalPoints,
    pointsEarned,
    breakdown: {
      correct: correctCount,
      partial: partialCount,
      incorrect: incorrectCount,
    },
    questionResults,
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

export function formatScore(score: number): string {
  return `${Math.round(score * 100)}%`
}

export function getScoreColor(score: number): 'green' | 'yellow' | 'red' {
  if (score >= 0.8) return 'green'
  if (score >= 0.6) return 'yellow'
  return 'red'
}

export function getPassFailMessage(passed: boolean, score: number): string {
  if (passed) {
    if (score >= 0.9) return 'Excellent! You mastered this lesson!'
    if (score >= 0.8) return 'Great job! You passed!'
    return 'Good work! You passed!'
  } else {
    if (score >= 0.5) return 'Almost there! Try again to pass.'
    return 'Keep practicing! You can do better.'
  }
}
