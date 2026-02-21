import { useState, useRef } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery } from 'convex/react'
import { SignedIn, UserButton, useAuth, useClerk, useUser } from '@clerk/clerk-react'
import { User } from 'lucide-react'
import { api } from '../../../convex/_generated/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useConvexUser } from '@/hooks/useConvexUser'
import { clearConvexSkipped, isConvexSkipped } from '@/lib/convex-skip'

const PROFESSION_LABELS: Record<string, string> = {
  student: 'Student',
  freelancer: 'Freelancer',
  founder: 'Founder',
  business_owner: 'Business owner',
  working_professional: 'Working professional',
  others: 'Others',
}

const AI_KNOWLEDGE_LABELS: Record<string, string> = {
  '0': 'I am not sure',
  '1': 'Beginner',
  '2': 'Basic',
  '3': 'Intermediate',
  '4': 'Advanced',
}

const FREQUENCY_LABELS: Record<string, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  weekend: 'Weekend',
  monthly: 'Monthly',
}

const TIMING_LABELS: Record<string, string> = {
  morning: 'Morning',
  lunch: 'Afternoon',
  evening: 'Evening',
  night: 'Night',
}

type ConvexUser = {
  displayName?: string
  profession?: string
  companyWebsite?: string
  jobTitle?: string
  selfReportedAiKnowledge?: number
  timeCommitmentSpan?: number
  timeCommitmentFrequency?: string
  preferredTiming?: string
  timezone?: string
  onboardingCompletedAt?: number
}

function ProfilePage() {
  const { isLoaded: clerkLoaded, isSignedIn } = useAuth()
  const { user: clerkUser } = useUser()
  const clerk = useClerk()
  const { user: convexUser, isLoading: convexLoading } = useConvexUser() as {
    user: ConvexUser | null
    isLoading: boolean
  }
  const skipConvex = isConvexSkipped()
  const streak = useQuery(
    (api as { userMetrics: { streak: () => number } }).userMetrics.streak,
    skipConvex || !isSignedIn ? 'skip' : {}
  ) as number | undefined

  const patchProfile = useMutation((api as { users: { patchProfile: (args: {
    displayName?: string
    companyWebsite?: string
    jobTitle?: string
  }) => Promise<unknown> } }).users.patchProfile)

  const [editingWebsite, setEditingWebsite] = useState(false)
  const [editingJobTitle, setEditingJobTitle] = useState(false)
  const [websiteValue, setWebsiteValue] = useState('')
  const [jobTitleValue, setJobTitleValue] = useState('')
  const [saving, setSaving] = useState(false)
  const websiteInputRef = useRef<HTMLInputElement>(null)
  const jobTitleInputRef = useRef<HTMLInputElement>(null)

  const startEditWebsite = () => {
    setWebsiteValue(convexUser?.companyWebsite ?? '')
    setEditingWebsite(true)
    setEditingJobTitle(false)
    setTimeout(() => websiteInputRef.current?.focus(), 0)
  }

  const startEditJobTitle = () => {
    setJobTitleValue(convexUser?.jobTitle ?? '')
    setEditingJobTitle(true)
    setEditingWebsite(false)
    setTimeout(() => jobTitleInputRef.current?.focus(), 0)
  }

  const saveWebsite = async () => {
    if (saving || !convexUser) return
    setSaving(true)
    try {
      await patchProfile({ companyWebsite: websiteValue.trim() || undefined })
      setEditingWebsite(false)
    } finally {
      setSaving(false)
    }
  }

  const saveJobTitle = async () => {
    if (saving || !convexUser) return
    setSaving(true)
    try {
      await patchProfile({ jobTitle: jobTitleValue.trim() || undefined })
      setEditingJobTitle(false)
    } finally {
      setSaving(false)
    }
  }

  if (!clerkLoaded) {
    return (
      <div className="mx-auto max-w-md px-4 py-8">
        <p className="text-center text-sm text-muted-foreground">Loading account...</p>
      </div>
    )
  }

  if (!isSignedIn) {
    return (
      <div className="mx-auto max-w-md px-4 py-8 text-center">
        <User className="mx-auto size-16 text-muted-foreground" />
        <h2 className="mt-4 text-xl font-medium tracking-tight">Your Profile</h2>
        <p className="mt-2 text-muted-foreground">Sign in to see your profile.</p>
      </div>
    )
  }

  const displayName =
    convexUser?.displayName ?? clerkUser?.fullName ?? clerkUser?.username ?? (clerkUser ? '—' : 'Loading…')
  const email = clerkUser?.primaryEmailAddress?.emailAddress ?? (clerkUser ? '—' : 'Loading…')

  return (
    <div className="mx-auto max-w-md space-y-6 px-4 py-6">
      <h1 className="text-xl font-semibold tracking-tight">Profile</h1>

      <div className="rounded-xl border border-border p-4">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Account</p>
        <dl className="mt-3 space-y-3 text-sm">
          <div className="flex items-start justify-between gap-2">
            <dt className="text-muted-foreground">Name</dt>
            <dd className="text-right font-medium">{displayName}</dd>
          </div>
          <div className="flex items-start justify-between gap-2">
            <dt className="text-muted-foreground">Email</dt>
            <dd className="text-right">{email}</dd>
          </div>
          {!skipConvex && (
            <>
              <div className="flex items-start justify-between gap-2">
                <dt className="text-muted-foreground">Backend</dt>
                <dd className="text-right">
                  {convexLoading ? (
                    <span className="text-muted-foreground">Syncing…</span>
                  ) : convexUser ? (
                    <span className="text-emerald-600 dark:text-emerald-400">Connected</span>
                  ) : (
                    <span className="text-amber-600 dark:text-amber-400">Syncing…</span>
                  )}
                </dd>
              </div>
              {streak !== undefined && (
                <div className="flex items-start justify-between gap-2">
                  <dt className="text-muted-foreground">Streak</dt>
                  <dd className="text-right font-medium">{streak} day{streak !== 1 ? 's' : ''}</dd>
                </div>
              )}
            </>
          )}
        </dl>
      </div>

      {skipConvex && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/40">
          <p className="text-sm font-medium text-amber-800 dark:text-amber-200">Backend not connected</p>
          <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
            Profile and leaderboard need Convex. Run <code className="rounded bg-amber-200/60 px-1 font-mono text-xs dark:bg-amber-900/60">bun convex dev</code>, then reconnect below.
          </p>
          <Button
            className="mt-3 w-full"
            variant="outline"
            size="sm"
            onClick={() => {
              clearConvexSkipped()
              window.location.reload()
            }}
          >
            Reconnect backend
          </Button>
        </div>
      )}

      {!skipConvex && convexUser && (
        <div className="rounded-xl border border-border p-4">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Onboarding</p>
          <dl className="mt-3 space-y-3 text-sm">
            {convexUser.profession !== undefined && (
              <div className="flex items-start justify-between gap-2">
                <dt className="text-muted-foreground">Role</dt>
                <dd className="text-right">{PROFESSION_LABELS[convexUser.profession] ?? convexUser.profession}</dd>
              </div>
            )}
            <div className="flex flex-col gap-1">
              <dt className="text-muted-foreground">Company website</dt>
              <dd className="text-right">
                {editingWebsite ? (
                  <div className="flex gap-2">
                    <Input
                      ref={websiteInputRef}
                      value={websiteValue}
                      onChange={(e) => setWebsiteValue(e.target.value)}
                      placeholder="https://..."
                      className="flex-1"
                      onKeyDown={(e) => e.key === 'Enter' && saveWebsite()}
                    />
                    <Button size="sm" onClick={saveWebsite} disabled={saving}>Save</Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingWebsite(false)}>Cancel</Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-end gap-2">
                    <span>{convexUser.companyWebsite || '—'}</span>
                    <Button size="sm" variant="ghost" onClick={startEditWebsite}>Edit</Button>
                  </div>
                )}
              </dd>
            </div>
            {(convexUser.profession === 'working_professional' || convexUser.jobTitle != null) && (
              <div className="flex flex-col gap-1">
                <dt className="text-muted-foreground">Job title</dt>
                <dd className="text-right">
                  {editingJobTitle ? (
                    <div className="flex gap-2">
                      <Input
                        ref={jobTitleInputRef}
                        value={jobTitleValue}
                        onChange={(e) => setJobTitleValue(e.target.value)}
                        placeholder="e.g. Product Manager"
                        className="flex-1"
                        onKeyDown={(e) => e.key === 'Enter' && saveJobTitle()}
                      />
                      <Button size="sm" onClick={saveJobTitle} disabled={saving}>Save</Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingJobTitle(false)}>Cancel</Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-end gap-2">
                      <span>{convexUser.jobTitle || '—'}</span>
                      <Button size="sm" variant="ghost" onClick={startEditJobTitle}>Edit</Button>
                    </div>
                  )}
                </dd>
              </div>
            )}
            {convexUser.selfReportedAiKnowledge !== undefined && (
              <div className="flex items-start justify-between gap-2">
                <dt className="text-muted-foreground">AI knowledge</dt>
                <dd className="text-right">{AI_KNOWLEDGE_LABELS[String(convexUser.selfReportedAiKnowledge)] ?? '—'}</dd>
              </div>
            )}
            {(convexUser.timeCommitmentSpan !== undefined || convexUser.timeCommitmentFrequency) && (
              <div className="flex items-start justify-between gap-2">
                <dt className="text-muted-foreground">Time commitment</dt>
                <dd className="text-right">
                  {[convexUser.timeCommitmentSpan != null && `${convexUser.timeCommitmentSpan} min`, convexUser.timeCommitmentFrequency && FREQUENCY_LABELS[convexUser.timeCommitmentFrequency]].filter(Boolean).join(' · ') || '—'}
                </dd>
              </div>
            )}
            {convexUser.preferredTiming && (
              <div className="flex items-start justify-between gap-2">
                <dt className="text-muted-foreground">Preferred time</dt>
                <dd className="text-right">{TIMING_LABELS[convexUser.preferredTiming] ?? convexUser.preferredTiming}</dd>
              </div>
            )}
            {convexUser.timezone && (
              <div className="flex items-start justify-between gap-2">
                <dt className="text-muted-foreground">Timezone</dt>
                <dd className="text-right font-mono text-xs">{convexUser.timezone}</dd>
              </div>
            )}
          </dl>
        </div>
      )}

      <SignedIn>
        <div className="flex items-center justify-between rounded-xl border border-border p-4">
          <p className="text-sm font-medium">Account menu</p>
          <UserButton />
        </div>
      </SignedIn>

      <Button
        className="w-full"
        variant="destructive"
        onClick={() => clerk.signOut({ redirectUrl: '/splash' })}
      >
        Sign out
      </Button>
    </div>
  )
}

export const Route = createFileRoute('/_app/profile')({
  component: ProfilePage,
})
