# Pain Interview Flow
## Adaptive Clinical Intake (Fibromyalgia MVP)

> **Purpose**
>
> This interview is designed to help users describe their symptoms in a structured way before speaking with a healthcare professional.
>
> The AI **does not diagnose** conditions. Instead, it gathers clinically relevant information, adapts follow-up questions based on previous answers, and prepares a GP-friendly summary.

---

# Interview Goals

The interview aims to answer the same core questions a clinician would ask:

1. What is your main concern?
2. When did it begin?
3. Where is the pain?
4. How has it changed?
5. What other symptoms occur alongside it?
6. How does it affect your life?
7. What investigations have already been done?
8. Are there any urgent symptoms that require immediate medical attention?

---

# Section 1 — Main Concern

### Q1

**What would you like help with today?**

Select one or more.

- Widespread pain
- Muscle pain
- Joint pain
- Fatigue
- Poor sleep
- Brain fog / memory problems
- Stiffness
- Other

---

## Logic

If Pain selected

→ Continue Pain Assessment

If Brain Fog selected

→ Prioritise Cognitive Questions

If Fatigue only

→ Ask fatigue questions first

---

# Section 2 — Pain Assessment

### Q2

Where do you feel pain?

Interactive body map.

Selectable regions:

- Neck
- Shoulders
- Upper Back
- Lower Back
- Chest
- Arms
- Hands
- Hips
- Legs
- Feet

---

### Q3

Is the pain on both sides of your body?

- Yes
- No

---

### Q4

Is the pain both above and below your waist?

- Yes
- No

---

### Q5

Does the pain move around your body?

- Yes
- No
- Sometimes

---

## Logic

If

Pain is widespread

AND

Pain exists on both sides

AND

Pain exists above & below waist

↓

Increase confidence for chronic widespread pain profile.

---

# Section 3 — Duration

### Q6

How long have these symptoms been present?

- Less than one month
- 1–3 months
- More than three months
- More than one year

---

## Logic

If >3 months

↓

Continue Chronic Pain Interview

Else

↓

Ask more about recent injury or illness.

---

# Section 4 — Pain Characteristics

### Q7

How would you describe your pain?

Multiple selection.

- Aching
- Burning
- Stabbing
- Tender
- Deep muscle pain
- Throbbing
- Stiffness

---

### Q8

How severe is your pain today?

Slider

0–10

---

### Q9

How often do you experience pain?

- Occasionally
- Daily
- Constantly
- Flare-ups

---

# Section 5 — Fatigue

### Q10

Do you often feel exhausted even after sleeping?

- Never
- Sometimes
- Often
- Every day

---

### Q11

How much does fatigue affect your daily activities?

- Not at all
- A little
- Moderately
- Significantly

---

# Section 6 — Sleep

### Q12

How would you describe your sleep?

- I sleep well
- I wake frequently
- I struggle to fall asleep
- I never feel refreshed

---

### Q13

Approximately how many hours do you sleep?

Numeric

---

# Section 7 — Brain Fog

### Q14

Have you experienced any of the following?

Multiple selection.

- Difficulty concentrating
- Forgetting conversations
- Losing words
- Slow thinking
- Difficulty following conversations
- None

---

### Q15

How often do these difficulties affect you?

- Rarely
- Sometimes
- Often
- Daily

---

## Logic

If

Fatigue

+

Poor Sleep

+

Cognitive Difficulties

↓

Highlight cognitive symptoms within summary.

Do NOT diagnose "Fibro Fog."

---

# Section 8 — Daily Impact

### Q16

Which areas of your life are affected?

Select all.

- Work
- Exercise
- Walking
- Household tasks
- Driving
- Social activities
- Relationships
- Sleep

---

### Q17

Which activity has become the most difficult?

Free text.

---

# Section 9 — Triggers

### Q18

Have you noticed anything that makes symptoms worse?

Multiple selection.

- Stress
- Poor sleep
- Cold weather
- Exercise
- Sitting too long
- Standing too long
- Unknown

---

### Q19

Have you noticed anything that helps?

Multiple selection.

- Heat
- Stretching
- Rest
- Exercise
- Medication
- Massage
- Nothing

---

# Section 10 — Treatments

### Q20

What have you already tried?

Select all.

- Physiotherapy
- GP
- Rheumatologist
- Pain Clinic
- Medication
- Exercise
- Heat Therapy
- None

---

### Q21

Has anything helped?

Free text.

---

# Section 11 — Medical Documents

### Q22

Do you have any medical documents?

Select all.

- Blood Test
- MRI
- X-Ray
- Ultrasound
- GP Letter
- Hospital Letter
- None

---

If documents available

↓

Upload Files

↓

Privacy Guard

↓

Document Analysis

---

# Section 12 — Medical History

### Q23

Have you received any diagnosis related to these symptoms?

Free text.

---

### Q24

Are you currently taking any medication?

Free text.

---

# Section 13 — Red Flag Screening

These questions are asked near the end of every interview.

### Q25

Are you experiencing any of the following?

Select all.

- Sudden weakness
- Loss of bladder control
- Loss of bowel control
- Fever
- Chest pain
- Rapid unexplained weight loss
- None

---

## Logic

If any red flag selected

↓

Pause interview.

Display urgent recommendation.

Example:

> Some of the symptoms you've reported may require prompt medical assessment. Please contact your GP, NHS 111 or emergency services if appropriate.

Do not continue generating normal self-care advice.

---

# Summary Generation

Once the interview is complete, the AI generates:

- Symptom Summary
- Timeline
- Areas Affected
- Impact on Daily Life
- Possible Discussion Points
- Questions to Ask GP
- Self-Care Suggestions
- Trusted Resources
- Community Post (Optional)

---

# Adaptive Logic

```text
Pain

↓

Duration > 3 months?

↓

Yes

↓

Widespread?

↓

Yes

↓

Fatigue?

↓

Yes

↓

Poor Sleep?

↓

Yes

↓

Brain Fog?

↓

Yes

↓

Generate Chronic Widespread Pain Summary
```

---

# Brain Fog Logic

```text
Brain Fog

↓

Memory Problems

↓

Difficulty Concentrating

↓

Sleep Quality

↓

Fatigue

↓

Daily Impact

↓

Include Cognitive Summary
```

---

# Privacy Workflow

```text
User Input

↓

Medical Documents

↓

Privacy Guard

↓

Remove:

• Name
• DOB
• Address
• NHS Number
• Phone
• Email

↓

OpenAI

↓

Structured JSON

↓

GP Summary
```

---

# Safety Principles

The AI must **never**:

- Diagnose fibromyalgia
- Confirm a medical condition
- Recommend prescription medication
- Replace professional medical advice

Instead, it should:

- Organise symptoms
- Help users communicate clearly
- Suggest discussion points for healthcare professionals
- Encourage appropriate medical review
- Highlight urgent symptoms when necessary

---

# Future Improvements

- Follow-up interviews over time
- Symptom trend analysis
- Pain diary integration
- Wearable device data
- Medication timeline
- AI-generated flare-up detection
- Multi-condition adaptive interviews (e.g. rheumatoid arthritis, lupus, chronic fatigue syndrome)