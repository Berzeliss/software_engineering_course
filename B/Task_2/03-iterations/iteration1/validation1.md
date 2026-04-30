# Iteration 1 – Validation

## Test Strategy

Each requirement is validated using functional test cases to ensure correctness, usability, and completeness.

---

## Test Cases

### REQ-01 – Profile Management

- **Test Case ID:** TC-01
- **Input:** User creates a profile with name, email, and role
- **Expected Result:** Profile is successfully created and stored
- **Pass Criteria:** Profile is visible and editable in system
- **Edge Case:** Missing email → system shows error message

---

### REQ-02 – Skills / Education / Experience

- **Test Case ID:** TC-02
- **Input:** User adds skills (e.g. Java, Python), education, and experience
- **Expected Result:** Data is correctly saved and displayed in profile
- **Pass Criteria:** All updates persist after refresh
- **Edge Case:** Empty skill list → system allows save but warns user

---

### REQ-03 – Job Listings

- **Test Case ID:** TC-03
- **Input:** Employer creates job listing with title and description
- **Expected Result:** Job appears in job listing feed
- **Pass Criteria:** Job can be edited and deleted
- **Edge Case:** Missing title → validation error shown

---

### REQ-05 – Job Application

- **Test Case ID:** TC-04
- **Input:** User applies for a job
- **Expected Result:** Application is stored and linked to user and job
- **Pass Criteria:** Employer can view application
- **Edge Case:** Applying twice → system prevents duplicate application

---

## Validation Summary

All core functionalities of Iteration 1 are validated through structured test cases. The system successfully supports basic job matching infrastructure without automated recommendations. This iteration establishes the foundation for future enhancements such as intelligent matching and AI-based ranking.