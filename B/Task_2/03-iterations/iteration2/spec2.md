# Iteration 2 – Specification

## 1. Iteration Goal

The goal of Iteration 2 is to introduce intelligent job matching and ranking functionality into the SkillMatch platform. This iteration builds on the foundation of Iteration 1 by enabling automated matching between job seekers and job listings based on skills and experience.

---

## 2. Included Requirements

- REQ-04: Matching job listings to profiles based on skills and experience
- REQ-02 (extended usage): structured skill data becomes critical for matching
- REQ-01 (dependency): profiles are required for matching

---

## 3. Functional Description

The system introduces an automated matching engine that compares user profiles with job listings.

Key features:
- The system calculates a match score between a user and a job listing
- Jobs are ranked based on relevance to the user’s skills and experience
- Users can view recommended jobs sorted by match score
- Employers can see ranked candidate lists for their job postings

Matching logic is based on:
- Skill overlap
- Experience relevance
- Optional weighting of required skills

No AI/ML model is used yet; logic is rule-based.

---

## 4. Data Model Additions

- **MatchScore**
  - match_id
  - user_id
  - job_id
  - score (0–100)
  - explanation (basic rule-based reasoning)

- Extended Job Model:
  - required_experience_level
  - skill_weights (optional)

---

## 5. Requirement Attributes

| Requirement | Priority | Complexity | Risk | Dependencies |
|------------|----------|------------|------|--------------|
| REQ-04 | High | High | Medium | REQ-01, REQ-02, REQ-03 |

---