# Import Event Registration Task Specification

*Use one copy for each L0, L1, or L2 task, including human-review tasks. Use the Level 3 template for L3 tasks.*

*Save each completed copy in `my_first_agent/agent/task-specs/` in `BUS4498_InClass_Build`. Name the file after the task using lowercase words separated by hyphens: Check Completeness becomes `check-completeness.md`. Replace `&` with `and` and remove other punctuation. Keep the exact workflow task ID and name inside the file.*

*Replace every bracketed prompt, copy input/output/tool blocks as needed, and remove unused blocks and instructions. Specify the design; do not create tool scripts. Record the reason for the automation level only in the team worksheet.*

## Basic Information

- **Task ID:** T1
- **Task name:** Import event registration 
- **Task type:** Retrieve
- **Task owner:** CPVC organizers 

*Task type describes the work. Automation level describes how it is performed. Tool type describes its proposed implementation.*

## 1. Task Description

This task imports the current event registration list provided by CPVC organizers into the correct EmpirePulse event record. It follows a predefined import rule: accept an approved structured registration file for one identified event, preserve its source and version information, and create an import receipt showing the imported record count. The workflow needs this task so that current registration information is available for validation in T2. It does not determine whether individual records are valid or contact participants. If the file is unreadable, lacks an event identifier, or cannot be imported, the task records the failure and hands the case to CPVC organizers rather than continuing as if the import succeeded.

## 2. Inputs

### Input 1

- **Input name:** event_registration_list
- **Contents and format:** A current, approved structured registration-list file for one event, such as a CSV or spreadsheet export. It must include the event identifier, source file/version information, and participant registration records with their registration identifiers and attendance-status information.
- **Source:** CPVC organizers upload the list when creating or updating the event.

- **Input name:** event_context
- **Contents and format:** A structured EmpirePulse event record containing the unique event identifier and current event status needed to associate the registration list with the correct event.
- **Source:** EmpirePulse event-creation record and CPVC organizers
If a required input is missing or invalid: Record a registration_import_exception with the event identifier, available source-file information, and failure reason. Hand the case to CPVC organizers. Do not continue to T2 as though the registration list was imported successfully.
*Copy the Input block for each additional input.*


## 3. Outputs

### Output 1

- **Output name:** Imported_registration_data
- **Contents and format:** A structured import result containing the event identifier, a reference to the staged registration records, record count, source-file version information, import timestamp, and status of imported or already_imported.
- **Next task or recipient:** T2 — Validate registration data.
- **Complete when:** The staged registration records can be accessed for the matching event and the system has saved an import receipt. If the same source file is processed again, already_imported confirms that duplicate records were not created.

### Output 2 
- **Output name**: registration_import_exception
- **Contents and format:** A structured exception record containing the event identifier, available source-file information, failure category, failure reason, timestamp, and status of blocked.
-** Next task or recipient:** CPVC organizers.
- **Complete when:** The exception record is saved, and the case is routed to CPVC organizers without sending incomplete data to T2.

*Copy the Output block for each additional output.*

## 4. Planned Tools

*Use a verb-object name, usually matching the task: Check Completeness can use `check_completeness`. List every tool separately and use the same name and type wherever the tool appears in the project.*

### Tool 1

- **Tool name:** import_registration_list
- **Input:** event_registration_list and event_context
- **Output:** imported_registration_data; or registration_import_exception if the import cannot be completed.
- **Implementation Route:** Web API call to EmpirePulse.
- **Integration approach:** Direct integration.
- **Role in this task:** Imports the approved registration-list file into the identified event, stages the records for T2 validation, preserves source-file version information, and prevents duplicate imports during scheduled reruns or repeated uploads.
- **Task timeout:** 60 seconds.
- **Maximum retries:** : 1 additional attempt.
- **Retry only when:** A temporary timeout or service-unavailable error occurs. Wait 15 seconds before retrying and use the same event identifier and source-file version/checksum as the idempotency key. Before retrying, check whether an import receipt already exists. Do not retry invalid files, missing event identifiers, access-denied responses, or an uncertain import outcome.
- **On timeout, exhausted retries, or an error that cannot be retried:** Save registration_import_exception with the failure category and available evidence, then hand the case to CPVC organizers. Do not send the case to T2 as though the import succeeded.
  
*Copy the Tool block as needed. For a fully manual task, you may still need to retrieve the information and hand it to human and allow updates from human, depending on your manual task context.*



