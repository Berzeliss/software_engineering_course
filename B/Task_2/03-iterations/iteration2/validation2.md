# Iteration 2 – Validation

## Test Strategy

Validation focuses on correctness of matching logic and ranking consistency.

---

## Test Cases

### REQ-04 – Job Matching

- **Test Case ID:** TC-05
- **Input:** User profile with skills (Python, Java) and job requiring Python
- **Expected Result:** Job receives high match score
- **Pass Criteria:** Score reflects correct skill overlap
- **Edge Case:** No matching skills → score = 0 or low value

---

### Ranking Functionality

- **Test Case ID:** TC-06
- **Input:** Multiple jobs with different skill overlap
- **Expected Result:** Jobs are sorted from highest to lowest match score
- **Pass Criteria:** Ranking order is consistent with computed scores
- **Edge Case:** Equal scores → stable ordering applied

---

### Candidate Ranking (Employer View)

- **Test Case ID:** TC-07
- **Input:** Multiple candidates applying to same job
- **Expected Result:** Candidates ranked by match score
- **Pass Criteria:** Highest scoring candidate appears first

---

## Validation Summary

Iteration 2 successfully introduces rule-based intelligent matching between users and jobs. The system now supports ranking of both job recommendations and candidates, significantly improving usability and decision-making efficiency.