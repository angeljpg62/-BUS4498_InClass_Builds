# [Exact task name] Task Specification

*Use one copy for each L0, L1, or L2 task, including human-review tasks. Use the Level 3 template for L3 tasks.*

*Save each completed copy in `my_first_agent/agent/task-specs/` in `BUS4498_InClass_Build`. Name the file after the task using lowercase words separated by hyphens: Check Completeness becomes `check-completeness.md`. Replace `&` with `and` and remove other punctuation. Keep the exact workflow task ID and name inside the file.*

*Replace every bracketed prompt, copy input/output/tool blocks as needed, and remove unused blocks and instructions. Specify the design; do not create tool scripts. Record the reason for the automation level only in the team worksheet.*

## Basic Information

- **Task ID:** [Exact ID from the workflow.]
- **Task name:** [Exact verb-object task name from the workflow.]
- **Task type:** [Choose the primary type: Retrieve, Sense, Reason, Decide, Act, Verify, Remember, or Learn.]
- **Task owner:** [Person or role accountable for this task.]

*Task type describes the work. Automation level describes how it is performed. Tool type describes its proposed implementation.*

## 1. Task Description

[Explain what the task does and why the workflow needs it. Identify the rule, criteria, model-supported operation, or human judgment used to turn its inputs into the required output.]

## 2. Inputs

### Input 1

- **Input name:** [Short, specific name.]
- **Contents and format:** [Required fields or information and their form, such as a table, structured record, document, image, or human response. Describe the structure; do not invent case data.]
- **Source:** [Task ID and name, person or role, or named data source that provides the input.]

*Copy the Input block for each additional input.*

- **If a required input is missing or invalid:** [State what happens and identify the exception task or responsible person.]

## 3. Outputs

### Output 1

- **Output name:** [Short, specific name.]
- **Contents and format:** [Required fields or information and their form, including the result, status, or evidence needed by the recipient.]
- **Next task or recipient:** [Task ID and name, person or role, or storage location that receives the output.]
- **Complete when:** [Observable condition showing that this output is ready to use.]

*Copy the Output block for each additional output.*

## 4. Planned Tools

*Use a verb-object name, usually matching the task: Check Completeness can use `check_completeness`. List every tool separately and use the same name and type wherever the tool appears in the project.*

### Tool 1

- **Tool name:** [Proposed verb-object name.]
- **Input:** [replace with a input name listed above]
- **Output:** [replace with a output name listed above]
- **Implementation Route:** [file operations, functions/scripts, database queries, and web API calls]
- **Integration approach:** [direct integration, or MCP integration]
- **Role in this task:** [What the tool does with which inputs and what result it returns or state it changes.]
- **Task timeout:** [Maximum total elapsed time for one task run, with units. For L0, state a human response deadline instead, such as one business day after assignment.]
- **Maximum retries:** [Nonnegative whole number of additional attempts. Use 0 if retries are not permitted. For L0, write "Not applicable — manual task."]
- **Retry only when:** [Conditions that permit another attempt and any waiting interval. For work that changes records or sends messages, explain how retries avoid duplicates; hand off if the action's outcome is uncertain. Write "Not applicable" for manual tasks or when retries are 0.]
- **On timeout, exhausted retries, or an error that cannot be retried:** [State the status or evidence recorded and the exception task or person receiving the case. Do not continue as if the task succeeded.]

*Copy the Tool block as needed. For a fully manual task, you may still need to retrieve the information and hand it to human and allow updates from human, depending on your manual task context.*



