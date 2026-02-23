export type ActivityActionKind =
  | 'lesson_watched'
  | 'quiz_answered_correctly'
  | 'quiz_answered_incorrectly'

export type ActivityEntity = 'lesson' | 'quiz'

export type SyncUserInput = {
  leadId?: string
  displayName?: string
}

export type SyncUserResponse = {
  userId: string
}

export type OnboardingInput = {
  profession?: 'student' | 'freelancer' | 'founder' | 'business_owner' | 'working_professional' | 'others'
  selfReportedAiKnowledge?: 0 | 1 | 2 | 3 | 4
  companyWebsite?: string
  extractedCompanyDetails?: string
  jobTitle?: string
  timeCommitmentSpan?: 5 | 10 | 15 | 20 | 30
  timeCommitmentFrequency?: 'daily' | 'weekly' | 'weekend' | 'monthly'
  preferredTiming?: 'morning' | 'lunch' | 'evening' | 'night'
  timezone?: string
  completed: boolean
}

export type OnboardingResponse = {
  userId: string
  onboardingCompletedAt?: string
}

export type RecordActivityInput = {
  actionKind: ActivityActionKind
  slug: string
  entity: ActivityEntity
}

export type RecordActivityResponse = {
  activityId: string | null
}

export type ChatStatus =
  | 'awaiting_user'
  | 'awaiting_llm'
  | 'streaming'
  | 'errored'
  | 'ready'

export type ChatRow = {
  id: string
  user_id: string
  title: string | null
  status: ChatStatus
  created_at: string
  updated_at: string
}

export type MessageRow = {
  id: string
  chat_id: string
  role: string
  content: string
  usage: string | null
  stop_reason: string | null
  created_at: string
}

export type ChatModelsResponse = {
  data: Array<{ id: string; name: string; pricing?: Record<string, string>; context_length?: number | null }>
}

export type ChatCreateResponse = ChatRow

export type ChatGetResponse = {
  chat: ChatRow
  messages: MessageRow[]
}
