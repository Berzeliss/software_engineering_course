# Iteration 1 – Specification

## 1. Iteration Goal

The goal of Iteration 1 is to establish the core foundation of the SkillMatch platform. This includes user profile management, job listing creation, and basic data structures required for both job seekers and employers. This iteration focuses on enabling basic platform functionality without advanced matching or AI features.

---

## 2. Included Requirements

This iteration implements the following requirements:

- REQ-01: User profile creation, editing, and deletion
- REQ-02: Management of skills, education, and experience
- REQ-03: Job listing creation, editing, and deletion
- REQ-05: Ability for users to apply for jobs

---

## 3. Functional Description

The system allows two main user types: job seekers and employers.

Job seekers can:
- Create and manage their personal profiles
- Add and update skills, education, and work experience
- View job listings
- Apply for available job postings

Employers can:
- Create company profiles
- Post job listings with descriptions and requirements
- Edit or remove job listings
- View incoming applications

At this stage, no automatic matching or ranking system is implemented. All interactions are manual and user-driven.

---

## 4. Data Model (Simplified)

- **User**
  - user_id
  - name
  - email
  - role (job seeker / employer)

- **Profile**
  - profile_id
  - user_id
  - skills
  - education
  - experience

- **Job**
  - job_id
  - company_id
  - title
  - description
  - required_skills

- **Application**
  - application_id
  - user_id
  - job_id
  - status

---

## 5. Requirement Attributes

| Requirement | Priority | Complexity | Risk | Dependencies |
|------------|----------|------------|------|--------------|
| REQ-01 | High | Medium | Low | User system |
| REQ-02 | High | Medium | Medium | REQ-01 |
| REQ-03 | High | Medium | Low | Company system |
| REQ-05 | High | Medium | Medium | REQ-01, REQ-03 |

---
