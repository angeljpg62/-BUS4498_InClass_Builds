# Validate-registration-data.md Task Specification

*Use one copy for each L0, L1, or L2 task, including human-review tasks. Use the Level 3 template for L3 tasks.*

*Save each completed copy in `my_first_agent/agent/task-specs/` in `BUS4498_InClass_Build`. Name the file after the task using lowercase words separated by hyphens: Check Completeness becomes `check-completeness.md`. Replace `&` with `and` and remove other punctuation. Keep the exact workflow task ID and name inside the file.*

*Replace every bracketed prompt, copy input/output/tool blocks as needed, and remove unused blocks and instructions. Specify the design; do not create tool scripts. Record the reason for the automation level only in the team worksheet.*

## Basic Information

- **Task ID:** T2
- **Task name:** Validate registration data
- **Task type:** Verify
- **Task owner:** CPVC organizers

*Task type describes the work. Automation level describes how it is performed. Tool type describes its proposed implementation.*

## 1. Task Description

This task applies predefined data-quality rules to the registration data imported in T1. It checks whether required registration information is present, identifies duplicate registration records, and detects inconsistent values or attendance statuses. The workflow needs this task to separate usable registration data from records that require organizer review before the attendance estimate is created. It does not change registration records or resolve unclear information; affected records are routed to T3, and only validated data continues to T6.

## 2. Inputs

### Input 1

- **Input name:** imported_registration_data
- **Contents and format:** The structured import result from T1, including the event identifier, reference to staged registration records, record count, source-file version information, and import status.
- **Source:**  T1 — Import event registration list.

### Input 2

- **Input name:** registration_validation_rules
- **Contents and format:** A structured set of approved validation criteria for required information, duplicate-record detection, and inconsistent registration or attendance-status values
- **Source:**  T1 — Import event registration list.
- **If a required input is missing or invalid:** Save a registration_validation_exception with the available event and source information and the failure reason. Hand the case to CPVC organizers. Do not route the data to T3 or T6 as though validation succeeded.
*Copy the Input block for each additional input.*

- **If a required input is missing or invalid:** [State what happens and identify the exception task or responsible person.]

## 3. Outputs

### Output 1

- **Output name:** validated_registration_data
- **Contents and format:** A structured reference to registration records that passed the approved validation rules, including the event identifier, source-file version, validation-rule version, validation timestamp, and status of valid.
- **Next task or recipient:** T6 — Combine registration data with the historical attendance rate of about 40%.
- **Complete when:** All applicable validaition rules have passed and the validated registration-data reference is available for the matching event

### Output 2 
Output name: affected_registration_records
Contents and format: A structured list of records requiring review, including the event identifier, affected registration identifiers, issue category, failed validation rule, source-file version, and status of review_required.
Next task or recipient: T3 — Flag affected registration records for organizer review.
Complete when: Every identified missing, duplicate, or inconsistent record from the current source-file version is included in the review list.

### Output 3

Output name: registration_validation_exception
Contents and format: A structured exception record containing the event identifier, source-file version when available, failure category, failure reason, timestamp, and status of blocked.
Next task or recipient: CPVC organizers.
Complete when: The exception record is saved and no unvalidated data is sent to T3 or T6.
*Copy the Output block for each additional output.*

## 4. Planned Tools

*Use a verb-object name, usually matching the task: Check Completeness can use `check_completeness`. List every tool separately and use the same name and type wherever the tool appears in the project.*

### Tool 1

- **Tool name:** validate_registration_data
- **Input:** imported_registration_data and registration_validation_rules
- **Output:* validated_registration_data, affected_registration_records, or registration_validation_exception when validation cannot be completed.
- **Implementation Route:** Functions/scripts and database query within EmpirePulse.
- **Integration approach:** Direct integration.
- **Role in this task:** Applies the approved validation rules to the current imported registration data and produces either validated data or a review list without changing participant records.
- **Task timeout:** 60 seconds.
- **Maximum retries:** 1 additional attempt.
- **Retry only when:** A temporary timeout or service-unavailable error occurs. Wait 15 seconds before retrying and use the same event identifier and source-file version as the idempotency key. Before retrying, check whether a validation result for that source-file version already exists. Do not retry invalid inputs, malformed validation rules, access-denied responses, or an uncertain validation outcome.
- **On timeout, exhausted retries, or an error that cannot be retried:** Save registration_validation_exception with the failure category and available evidence, then hand the case to CPVC organizers. Do not continue to T3 or T6 as though validation succeeded.
*Copy the Tool block as needed. For a fully manual task, you may still need to retrieve the information and hand it to human and allow updates from human, depending on your manual task context.*



