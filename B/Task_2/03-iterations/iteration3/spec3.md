# Iteration 3 – Specification

## 1. Iteration Goal

The goal of Iteration 3 is to enhance the SkillMatch platform with AI-powered recommendations, notifications, and improved user engagement features. This iteration focuses on automation, personalization, and scalability improvements.

---

## 2. Included Requirements

- Extended REQ-04 (enhanced with AI-based ranking)
- Notification system requirement (new conceptual extension)
- User engagement improvements (implicit system requirement)

---

## 3. Functional Description

The system introduces advanced features:

### AI-Based Recommendations
- The system improves matching using AI-driven ranking (simulated or conceptual model)
- Personalized job recommendations are generated for each user
- Ranking adapts based on user behaviour and preferences

### Notification System
- Users receive notifications for:
  - New job matches
  - Application status updates
- Employers receive notifications for new applicants

### Personalization
- System learns from user interactions (clicks, applications)
- Recommendations improve over time

---

## 4. Data Model Additions

- **Notification**
  - notification_id
  - user_id
  - type
  - message
  - timestamp
  - read_status

- **UserInteraction**
  - interaction_id
  - user_id
  - job_id
  - action_type (view, apply, save)

---

## 5. Requirement Attributes

| Requirement | Priority | Complexity | Risk | Dependencies |
|------------|----------|------------|------|--------------|
| AI Recommendation System | High | High | High | REQ-04, Iteration 2 |
| Notifications | Medium | Medium | Low | REQ-01 |
| Personalization | Medium | High | High | User interaction data |

---
