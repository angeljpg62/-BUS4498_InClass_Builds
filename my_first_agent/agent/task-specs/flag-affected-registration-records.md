# flag-affected-registration records for organizers Task Specification

*Use one copy for each L0, L1, or L2 task, including human-review tasks. Use the Level 3 template for L3 tasks.*

*Save each completed copy in `my_first_agent/agent/task-specs/` in `BUS4498_InClass_Build`. Name the file after the task using lowercase words separated by hyphens: Check Completeness becomes `check-completeness.md`. Replace `&` with `and` and remove other punctuation. Keep the exact workflow task ID and name inside the file.*

*Replace every bracketed prompt, copy input/output/tool blocks as needed, and remove unused blocks and instructions. Specify the design; do not create tool scripts. Record the reason for the automation level only in the team worksheet.*

## Basic Information

- **Task ID:** T3
- **Task name:** Flag affected registration records for organizer review 
- **Task type:** Act
- **Task owner:** CPVC organizers

*Task type describes the work. Automation level describes how it is performed. Tool type describes its proposed implementation.*

## 1. Task Description

This task uses predefined rules to mark registration records identified by T2 as missing, duplicated, or inconsistent and place them in an organizer review queue. The workflow needs this task so CPVC organizers can easily find the records that require human resolution before the system uses the data for attendance planning. The task preserves the original registration values and issue evidence; it does not correct records, decide how to resolve them, or contact participants.

## 2. Inputs

### Input 1

- **Input name:**  affected_registration_records
- **Contents and format:**  A structured list from T2 containing the event identifier, affected registration identifiers, issue category, failed validation rule, source-file version, and status of review_required.
- **Source:** T2 — Validate registration data.
- If a required input is missing or invalid: Save a registration_flagging_exception with the available event information and failure reason. Hand the case to CPVC organizers. Do not route the case to T4 as though the affected records were successfully flagged.
  
*Copy the Input block for each additional input.*

## 3. Outputs

### Output 1

- **Output name:**  flagged_registration_review_queue
- **Contents and format:** A structured review-queue record containing the event identifier, affected registration identifiers, issue categories, source-file version, links to the validation evidence, review status of pending_organizer_review, and flagging timestamp.
- **Next task or recipient:** T4 — Review affected registration records.
- **Complete when:**  Every record in affected_registration_records has one visible, linked review flag or queue entry for the current source-file version. Repeated workflow runs do not create duplicate review entries.

*Copy the Output block for each additional output.*

Output 2
Output name: registration_flagging_exception
Contents and format: A structured exception record containing the event identifier, affected registration identifiers when available, failure category, failure reason, timestamp, and status of blocked.
Next task or recipient: CPVC organizers.
Complete when: The exception record is saved and the case is not routed to T4 as though review flags were created.

## 4. Planned Tools

*Use a verb-object name, usually matching the task: Check Completeness can use `check_completeness`. List every tool separately and use the same name and type wherever the tool appears in the project.*

### Tool 1

- **Tool name:** flag_registration_records
- **Input:**  affected_registration_records
- **Output:** flagged_registration_review_queue; or registration_flagging_exception if flagging cannot be completed.
- **Implementation Route:** Database update or web API call to EmpirePulse.
- **Integration approach:** Direct integration.
- **Role in this task:** Creates or updates a visible organizer-review flag for each affected registration record and links the flag to its validation evidence without changing the original registration data.
- **Task timeout:** 60 seconds.
- **Maximum retries:** 1 additional attempt.
- **Retry only when:** A temporary timeout or service-unavailable error occurs. Wait 15 seconds before retrying and use the event identifier, source-file version, registration identifier, and failed validation rule as the idempotency key. Before retrying, check whether the review flag already exists. Do not retry invalid input, access-denied responses, or an uncertain flagging outcome.
- **On timeout, exhausted retries, or an error that cannot be retried:** Save registration_flagging_exception with the failure category and available evidence, then hand the case to CPVC organizers. Do not continue to T4 as though the records were flagged successfully.
*Copy the Tool block as needed. For a fully manual task, you may still need to retrieve the information and hand it to human and allow updates from human, depending on your manual task context.*



