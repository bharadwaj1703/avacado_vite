# Content Authoring Reference

This document describes all supported content types, fields, and conventions for the Avacado curriculum system.

---

## Curriculum Structure

```
content/
├── curriculum.yaml                          # Root curriculum definition
└── milestones/
    └── 01-ai-foundations/
        ├── milestone.yaml                   # Milestone metadata
        └── levels/
            └── 01-intro-to-ai/
                ├── level.yaml               # Level metadata
                └── lessons/
                    └── 01-what-is-ai/
                        ├── lesson.yaml      # Lesson metadata + quiz config
                        ├── screens/
                        │   ├── 01-not-new.yaml
                        │   ├── 02-narrow-vs-general.yaml
                        │   └── 03-ready-for-ai.yaml
                        └── questions/
                            ├── q01-year.yaml
                            └── q02-narrow-vs-general.yaml
```

All content is defined in YAML files. The Vite content plugin validates every file against Zod schemas at build time and generates a `virtual:content-manifest` module.

---

## File Naming Conventions

- Directories use `{order}-{slug}` format: `01-ai-foundations`, `02-prompt-engineering`
- Screen files: `{order}-{slug}.yaml` inside `screens/`
- Question files: `{id}.yaml` inside `questions/`
- Metadata files: `curriculum.yaml`, `milestone.yaml`, `level.yaml`, `lesson.yaml`

---

## Curriculum

Root file at `content/curriculum.yaml`.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `version` | string | yes | Semantic version of the curriculum |
| `title` | string | yes | Display title |
| `description` | string | yes | Short description |
| `last_updated` | ISO datetime | no | When last updated |
| `milestone_refs` | string[] | yes | Relative paths to milestone directories |

```yaml
version: "1.0.0"
title: "Avacado AI Curriculum"
description: "Learn AI from the ground up"
last_updated: "2025-01-15T00:00:00Z"
milestone_refs:
  - "milestones/01-ai-foundations/milestone.yaml"
```

---

## Milestone

File at `milestones/{id}/milestone.yaml`.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | yes | Unique identifier |
| `title` | string | yes | Display title |
| `description` | string | yes | Short description |
| `order` | integer | yes | Sort order (1-indexed) |
| `level_refs` | string[] | yes | Relative paths to level directories |
| `thumbnail` | string | no | Path to thumbnail image |
| `color_theme` | string | no | Theme color for this milestone |

```yaml
id: "01-ai-foundations"
title: "AI Foundations"
description: "Core concepts of artificial intelligence"
order: 1
level_refs:
  - "levels/01-intro-to-ai/level.yaml"
  - "levels/02-machine-learning/level.yaml"
```

---

## Level

File at `levels/{id}/level.yaml`.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | yes | Unique identifier |
| `title` | string | yes | Display title |
| `description` | string | yes | Short description |
| `order` | integer | yes | Sort order |
| `lesson_refs` | string[] | yes | Relative paths to lesson directories |
| `thumbnail` | string | no | Path to thumbnail image |

```yaml
id: "01-intro-to-ai"
title: "Introduction to AI"
description: "What is AI and why it matters"
order: 1
lesson_refs:
  - "lessons/01-what-is-ai/lesson.yaml"
  - "lessons/02-ai-history/lesson.yaml"
```

---

## Lesson

File at `lessons/{id}/lesson.yaml`.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | yes | Unique identifier |
| `title` | string | yes | Display title |
| `description` | string | yes | Short description |
| `order` | integer | yes | Sort order |
| `screen_refs` | string[] | yes | Relative paths to screen YAML files |
| `quiz` | QuizConfig | no | End-of-lesson quiz configuration |
| `estimated_duration_minutes` | integer | no | Estimated lesson duration |
| `tags` | string[] | no | Tags for categorization |

```yaml
id: "01-what-is-ai"
title: "What is AI?"
description: "Discover what artificial intelligence really means"
order: 1
screen_refs:
  - "screens/01-not-new.yaml"
  - "screens/02-narrow-vs-general.yaml"
  - "screens/03-ready-for-ai.yaml"
quiz:
  question_refs:
    - "questions/q01-year.yaml"
    - "questions/q02-narrow-vs-general.yaml"
  minimum_passing_score: 0.7
  allow_retry: true
  show_answers_after: true
estimated_duration_minutes: 10
tags: ["beginner", "ai-basics"]
```

### Quiz Config

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `question_refs` | string[] | required | Relative paths to question files |
| `minimum_passing_score` | number (0–1) | `0.7` | Score needed to pass |
| `allow_retry` | boolean | `true` | Can the user retry? |
| `show_answers_after` | boolean | `true` | Show correct answers after submission |
| `max_attempts` | integer | none | Maximum retry attempts |
| `time_limit_minutes` | integer | none | Time limit for the quiz |

---

## Screen

Files in `screens/` directory.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | yes | Unique identifier |
| `title` | string | yes | Display title |
| `hero` | HeroConfig | yes | Visual hero element (see Hero Types below) |
| `transcript` | string | yes | Narration text (supports `\n\n` for paragraph breaks) |
| `checkpoint_quiz` | CheckpointQuiz | no | Inline quiz that gates progression |
| `estimated_duration_seconds` | integer | no | Used to calibrate transcript animation speed |

```yaml
id: "01-not-new"
title: "AI is Not New!"
hero:
  type: "image"
  src: "/content/images/ai-welcome.svg"
  alt: "Abstract representation of AI"
  sync_points:
    - word_index: 5
      action: "highlight"
transcript: |
  When you type a message and your phone suggests the next word,
  that's AI at work.

  It's been around since the 1950s — longer than most people think!
estimated_duration_seconds: 45
```

### Checkpoint Quiz

Embeds a single question inline within a screen. The user must answer before proceeding.

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `question_ref` | string | required | Relative path to question file |
| `required_to_pass` | boolean | `true` | Must pass to proceed |
| `allow_skip` | boolean | `false` | Can skip the checkpoint |

```yaml
checkpoint_quiz:
  question_ref: "questions/q02-narrow-vs-general.yaml"
  required_to_pass: true
  allow_skip: false
```

---

## Hero Types

The `hero` field on a screen defines the visual element displayed above the transcript.

### `image`

Static image (SVG, PNG, JPG).

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | `"image"` | yes | |
| `src` | string | yes | Path to image file |
| `alt` | string | yes | Alt text |
| `sync_points` | SyncPoint[] | no | Word-index-triggered actions |

```yaml
hero:
  type: "image"
  src: "/content/images/ai-welcome.svg"
  alt: "AI illustration"
```

### `video`

Video element with playback controls.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | `"video"` | yes | |
| `src` | string | yes | Path to video file |
| `poster` | string | no | Poster image before playback |
| `autoplay` | boolean | no | Auto-play on mount |
| `loop` | boolean | no | Loop video |
| `muted` | boolean | no | Mute audio |
| `sync_points` | SyncPoint[] | no | Word-index-triggered actions |

```yaml
hero:
  type: "video"
  src: "/content/videos/ai-demo.mp4"
  poster: "/content/images/ai-demo-poster.jpg"
  autoplay: true
  muted: true
```

### `gif`

Animated GIF.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | `"gif"` | yes | |
| `src` | string | yes | Path to GIF file |
| `alt` | string | yes | Alt text |
| `sync_points` | SyncPoint[] | no | Word-index-triggered actions |

### `animated-svg`

SVG with anime.js-driven animation (paths animate in with stroke-dashoffset).

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | `"animated-svg"` | yes | |
| `src` | string | yes | Path to SVG file |
| `animation_config` | object | no | Configuration passed to animator (e.g. `{ autoplay: true, loop: false }`) |
| `sync_points` | SyncPoint[] | no | Word-index-triggered actions |

```yaml
hero:
  type: "animated-svg"
  src: "/content/images/narrow-vs-general.svg"
  animation_config:
    autoplay: true
    loop: false
  sync_points:
    - word_index: 3
      action: "trigger"
      target: "narrow-ai"
```

### `interactive`

Custom React component (resolved at runtime).

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | `"interactive"` | yes | |
| `component` | string | yes | Component identifier |
| `props` | object | no | Props passed to the component |
| `sync_points` | SyncPoint[] | no | Word-index-triggered actions |

### `mascot`

Displays the Avacado mascot blob with a call-to-action button. Used for lesson outros and special screens.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | `"mascot"` | yes | |
| `eye_variant` | string | no | Eye variant: `"regular"` (default) or `"shy"` |
| `mouth_variant` | string | no | Mouth variant: `"smile"` (default) or `"grin"` |
| `cta_text` | string | no | Button text (default: `"Continue"`) |
| `cta_action` | string | no | `"next"` (default), `"quiz"`, or `"home"` |

```yaml
hero:
  type: "mascot"
  eye_variant: "regular"
  mouth_variant: "smile"
  cta_text: "Let's Go!"
  cta_action: "quiz"
```

---

## SyncPoint Configuration

Sync points trigger actions at specific word indices during transcript playback.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `word_index` | integer (≥0) | yes | Word position (0-indexed) that triggers the action |
| `action` | string | yes | `"highlight"`, `"animate"`, or `"trigger"` |
| `target` | string | no | Target element ID for the action |

- **`highlight`**: Highlights a region in the hero
- **`animate`**: Triggers an animation sequence
- **`trigger`**: Fires a named event (e.g. to reveal an SVG element)

```yaml
sync_points:
  - word_index: 5
    action: "highlight"
  - word_index: 12
    action: "trigger"
    target: "step-2"
```

---

## Question Types

Questions are used in end-of-lesson quizzes and checkpoint quizzes.

### Common Fields

All question types share these base fields:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | yes | Unique identifier |
| `prompt` | string | yes | The question text |
| `hint` | string | no | Hint shown on request |
| `explanation` | string | yes | Explanation shown after answering |
| `points` | number | no (default: 1) | Point value |

### `text-entry`

Free-text input with configurable matching.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | `"text-entry"` | yes | |
| `match_strategy` | string | yes | `"exact"`, `"fuzzy"`, `"regex"`, `"number"`, `"number-range"` |
| `correct_answer` | string \| number \| string[] | yes | Expected answer(s) |
| `case_sensitive` | boolean | no | Case-sensitive matching |
| `fuzzy_threshold` | number (0–1) | no | Similarity threshold for fuzzy matching |
| `range_min` | number | no | Min value for `number-range` |
| `range_max` | number | no | Max value for `number-range` |
| `tolerance` | number | no | Tolerance for `number` matching |
| `placeholder` | string | no | Input placeholder text |

```yaml
id: "q01-year"
type: "text-entry"
prompt: "In what decade was AI first conceptualized?"
match_strategy: "fuzzy"
correct_answer: "1950s"
fuzzy_threshold: 0.8
hint: "Think about when the first computers were built"
explanation: "AI research began in the 1950s with pioneers like Alan Turing."
points: 1
```

### `one-of-many`

Single-choice question (radio buttons, cards, button grid, or dropdown).

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | `"one-of-many"` | yes | |
| `options` | Option[] | yes (min 2) | Available choices |
| `correct_option` | string | yes | ID of the correct option |
| `render_as` | string | no (default: `"radio"`) | `"radio"`, `"cards"`, `"button-grid"`, `"dropdown"` |
| `partial_credit` | boolean | no | Allow partial credit |

Option fields: `id` (string), `text` (string), `image` (string, optional).

```yaml
id: "q02-narrow-vs-general"
type: "one-of-many"
prompt: "Which type of AI is Siri?"
options:
  - id: "narrow"
    text: "Narrow AI"
  - id: "general"
    text: "General AI"
  - id: "super"
    text: "Super AI"
correct_option: "narrow"
render_as: "cards"
hint: "Think about what Siri can and can't do"
explanation: "Siri is Narrow AI — it excels at specific tasks but can't do everything."
```

### `many-of-many`

Multiple-choice question (checkboxes, card grid, or toggle list).

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | `"many-of-many"` | yes | |
| `options` | Option[] | yes (min 2) | Available choices |
| `correct_options` | string[] | yes (min 1) | IDs of correct options |
| `passing_rule` | string | no (default: `"match-all"`) | `"match-all"`, `"at-least-k"`, `"strict"` |
| `min_required` | integer | no | Min correct for `at-least-k` |
| `partial_credit` | boolean | no | Allow partial credit |
| `render_as` | string | no (default: `"checkboxes"`) | `"checkboxes"`, `"card-grid"`, `"toggle-list"` |

```yaml
id: "q03-ai-examples"
type: "many-of-many"
prompt: "Select all examples of AI in daily life"
options:
  - id: "autocomplete"
    text: "Phone autocomplete"
  - id: "calculator"
    text: "Basic calculator"
  - id: "recommendations"
    text: "Netflix recommendations"
  - id: "thermostat"
    text: "Smart thermostat"
correct_options: ["autocomplete", "recommendations", "thermostat"]
passing_rule: "at-least-k"
min_required: 2
render_as: "card-grid"
explanation: "Autocomplete, recommendations, and smart thermostats all use AI. A basic calculator uses fixed math, not AI."
```

---

## Reference Path Format

All `*_refs` fields use **relative paths** from the containing file's directory.

- `milestone_refs` in curriculum → `"milestones/01-ai-foundations/milestone.yaml"`
- `level_refs` in milestone → `"levels/01-intro-to-ai/level.yaml"`
- `lesson_refs` in level → `"lessons/01-what-is-ai/lesson.yaml"`
- `screen_refs` in lesson → `"screens/01-not-new.yaml"`
- `question_refs` in quiz → `"questions/q01-year.yaml"`
- `question_ref` in checkpoint → `"questions/q02-narrow-vs-general.yaml"`

The Vite plugin resolves these paths and validates that all referenced files exist at build time.
