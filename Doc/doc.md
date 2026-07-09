# eliza
### Privacy-First AI Health Advocate for People Living with Fibromyalgia

> **Hackathon Project**

---

# Problem Statement

People living with fibromyalgia often spend years seeking a diagnosis. Symptoms such as chronic pain, fatigue, poor sleep and brain fog are difficult to describe during a short GP appointment, leading many patients to feel unheard or dismissed.

Existing solutions force users to choose between:

- **Trustworthy but generic** health information (NHS, NICE, Versus Arthritis)
- **Personalised AI** that requires sharing sensitive health information with third-party providers

There is currently no solution that provides **personalised, trustworthy guidance while preserving user privacy.**

---

# Our Solution

eliza is a **privacy-first AI health advocate** that helps users organise their symptoms before speaking with a healthcare professional.

Rather than asking users to write long paragraphs, eliza conducts an **adaptive clinician-style interview**, asks relevant follow-up questions, analyses uploaded medical documents, and generates a structured health summary.

Users remain in control of their data and choose whether to:

- Download a GP-ready report
- Save a private health record
- Share anonymously with the community

---

# Key Features

## Adaptive AI Interview

Instead of filling in forms, users have a guided conversation.

The AI asks questions similar to how a GP would:

- What symptoms are you experiencing?
- Where is the pain?
- How long has it been happening?
- What makes it worse?
- How does it affect your daily life?

Questions adapt depending on previous answers.

---

## Medical Document Upload

Users can upload:

- Blood tests
- MRI reports
- X-rays
- GP letters
- Hospital discharge summaries
- Other medical documents

The system extracts only relevant clinical information to enrich the health summary.

---

## Privacy Guard

Before any information leaves the user's device, it passes through a local privacy layer.

Privacy Guard automatically removes personally identifiable information (PII), including:

- Name
- Address
- Phone number
- Email
- Date of birth
- NHS number
- Postcode
- Other personal identifiers

Only anonymised clinical information is sent to the cloud LLM.

Example:

Original:

> My name is Sarah Smith. My NHS number is 1234567890. I've had widespread pain for 8 months.

Sent to OpenAI:

> Patient has experienced widespread pain for approximately 8 months.

---

## GP Summary Generator

After the interview, the AI creates a structured report including:

- Symptom summary
- Timeline
- Impact on daily life
- Triggers
- Treatments tried
- Uploaded medical documents
- Discussion points for GP
- Questions to ask GP
- Trusted self-care recommendations

The report can be exported as a PDF.

---

## Community Support

Users may optionally publish an anonymised version of their health summary to the community.

This allows other patients with similar experiences to offer support without requiring users to rewrite their story.

---

# User Journey

```text
Home

↓

Start Health Conversation

↓

Adaptive AI Interview

↓

Upload Medical Documents (Optional)

↓

Privacy Guard
(Removes personal information)

↓

OpenAI

↓

Health Summary Generated

↓

User chooses:

• GP Summary (PDF)

• Save Privately

• Share with Community

• Continue chatting with AI
```

---

# High-Level Architecture

```text
                    User

                      │
                      ▼

          Adaptive AI Interview

                      │

          Medical Document Upload

                      │
                      ▼

        ┌──────────────────────────┐
        │      Privacy Guard        │
        │  (Runs locally / client)  │
        ├──────────────────────────┤
        │ Remove Name              │
        │ Remove DOB               │
        │ Remove Address           │
        │ Remove NHS Number        │
        │ Remove Email             │
        │ Remove Phone             │
        └──────────────────────────┘

                      │

        Sanitised Clinical Context

                      │
                      ▼

               OpenAI API

                      │

          Structured JSON Response

                      │
        ┌─────────────┼──────────────┐
        ▼             ▼              ▼

 GP Report      Community Post     AI Guidance
```

---

# AI Workflow

## Step 1

Collect symptom information through adaptive questioning.

↓

## Step 2

Extract relevant findings from uploaded documents.

↓

## Step 3

Privacy Guard removes personal information.

↓

## Step 4

Only anonymised medical context is sent to OpenAI.

↓

## Step 5

OpenAI generates structured JSON.

Example:

```json
{
  "summary": "...",
  "symptoms": [],
  "timeline": [],
  "gpDiscussionPoints": [],
  "questionsForDoctor": [],
  "selfCare": [],
  "communityPost": ""
}
```

↓

## Step 6

Frontend displays multiple outputs from the same response.

---

# Privacy First Design

Our architecture follows the principle of **minimum necessary disclosure**.

Instead of sending raw user input, only information required to generate useful medical guidance is transmitted.

Personal information remains on the user's device whenever possible.

This approach supports:

- User privacy
- Reduced data exposure
- Greater trust
- Regulatory readiness (GDPR principles)

---

# Trusted Information

AI recommendations are grounded in trusted medical sources, such as:

- NHS
- NICE Guidelines
- Versus Arthritis
- Other evidence-based resources

The AI does **not diagnose** conditions.

Instead, it:

- Helps users organise symptoms
- Suggests discussion points
- Provides trusted self-care guidance
- Encourages appropriate medical review

---

# MVP Scope

✅ Adaptive symptom interview

✅ Upload medical documents

✅ Privacy Guard

✅ AI-generated GP report

✅ PDF export

✅ Anonymous community sharing

---

# Future Improvements

- Fine-tuned Privacy Guard model
- OCR for handwritten documents
- Symptom timeline visualisation
- Medication interaction awareness
- Pain tracking dashboard
- Wearable integration
- HealthKit / Google Fit integration
- Multi-condition support
- Voice interviews
- GP portal integration

---

# Proposed Technology Stack

## Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS

---

## Backend

- Node.js
- Next.js API Routes

---

## AI

- OpenAI Responses API
- Structured JSON Outputs

---

## Privacy Layer

MVP:

- Regex detection
- Named Entity Recognition (NER)
- Local PII redaction

Future:

- Fine-tuned Privacy Guard SLM

---

## Database

TBC

---

## Authentication

TBC

---

## Storage

TBC

---

## OCR (Optional)

- Tesseract OCR

or

- Azure Document Intelligence

---

# Team Vision

Our goal is not to replace healthcare professionals.

Our goal is to empower patients to become better prepared for clinical conversations while maintaining ownership of their personal health information.

By combining adaptive interviewing, privacy-preserving AI, and evidence-based guidance, eliza helps bridge the gap between symptom onset and professional care.
