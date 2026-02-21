export type Profession =
  | 'student'
  | 'freelancer'
  | 'founder'
  | 'business_owner'
  | 'working_professional'
  | 'others'

export type TimeCommitmentSpan = 5 | 10 | 15 | 20 | 30
export type TimeCommitmentFrequency = 'daily' | 'weekly' | 'weekend' | 'monthly'
export type PreferredTiming = 'morning' | 'lunch' | 'evening' | 'night'

export type UserRow = {
  id: string
  clerk_user_id: string
  lead_id: string | null
  display_name: string | null
  profession: Profession | null
  self_reported_ai_knowledge: 0 | 1 | 2 | 3 | 4 | null
  company_website: string | null
  extracted_company_details: string | null
  job_title: string | null
  time_commitment_span: TimeCommitmentSpan | null
  time_commitment_frequency: TimeCommitmentFrequency | null
  preferred_timing: PreferredTiming | null
  timezone: string | null
  onboarding_completed_at: string | null
  created_at: string
  updated_at: string
}

export type OnboardingInput = {
  profession?: Profession
  selfReportedAiKnowledge?: 0 | 1 | 2 | 3 | 4
  companyWebsite?: string
  extractedCompanyDetails?: string
  jobTitle?: string
  timeCommitmentSpan?: TimeCommitmentSpan
  timeCommitmentFrequency?: TimeCommitmentFrequency
  preferredTiming?: PreferredTiming
  timezone?: string
  completed: boolean
}

export type ActivityActionKind =
  | 'lesson_watched'
  | 'quiz_answered_correctly'
  | 'quiz_answered_incorrectly'

export type ActivityEntity = 'lesson' | 'quiz'

export type RecordActivityInput = {
  actionKind: ActivityActionKind
  slug: string
  entity: ActivityEntity
}
