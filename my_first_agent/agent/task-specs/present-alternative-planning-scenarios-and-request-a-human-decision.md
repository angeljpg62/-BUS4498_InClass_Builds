Present alternative planning scenarios and request a human decision Task Specification

*BUS 4498 Team Build Milestone 1. Create one copy for each L3 task. Save it in `our_team_agent/agent/task-specs/` in `BUS4498_Team_Build`. Use the task name in lowercase with hyphens between words; replace `&` with `and` and remove other punctuation.*

*Keep the exact task ID and name from the workflow. Complete all six sections, including Tool Permissions and Boundaries. The reason for assigning L3 belongs only in the team worksheet. Replace prompts and remove template instructions before submitting. Tool scripts are not required.*

```yaml
# BASIC INFORMATION
task_id: "[T12]"
task_name: "[Present alternative planning scenarios and request a human decision]"
task_owner: "[CPVC organizers]"
# Agent Inference Configuration
Provider: [OpenAI]
Model: "[gpt-4.1-mini]"
Role: "[Assess planning constraints, develop bounded alternative planning scenarios, and prepare an organizer decision request]"
Maximum inference requests per task run: "[4]"
On inference failure or exhausted limits: Record the unresolved status and hand the case to [CPVC organizers].
``` 

## 1. Task Goal

- [## Produce clear alternative food, drink, and swag planning scenarios for CPVC organizers when attendance uncertainty, budget, or venue capacity requires a human decision ]

## 2. Inbound Inputs


### Input 1

- **Input name:** [Planning Context]
- **What it contains:** [Available registration data, confirmation responses, historical attendance rate, attendance estimate, confidence range, data-quality flags, and available budget or venue-capacity information.]
- **Source:** [EmpirePulse workflow outputs and CPVC organizers.]
## 3. Tool Permissions and Boundaries

*Name each planned tool and specify its permitted use. Use verb-object names, such as `retrieve_records`, usually matching the task or permitted subtask it supports. Tool name identifies the capability; tool type identifies the proposed implementation. No scripts or working integrations are required.*

### Task-Wide Limits

- **Total task timeout:** [5 minutes.]
- **Maximum tool calls:** [8.]

### Tool 1

- **Tool name:** [retrieve_planning_context]
- **Tool type:** [API request or database query.]
- **Supports these permitted subtasks:** [assess planning constraints; identify unresolved constraints.]
- **Allowed use:** [Read the available planning context and data-quality flags from EmpirePulse.]
- **Prohibited use:** [Change registration records, request participant information, send participant messages, place orders, or change purchasing quantities.]
- **Approval required:** [None within the allowed read-only use.]
- **Timeout per call:** [30 seconds.]
- **Maximum retries per call:** [1.]
- **Retry conditions and failure response:** [Retry only for a temporary retrieval failure; hand off to CPVC organizers if the context remains unavailable or unclear.]

*Copy the Tool block as needed. Tool-specific and task-wide limits both apply; stop at whichever is reached first. Naming a tool does not authorize uses outside its stated permissions.*

## 4. How the Agent Should Reason

*Define permitted kinds of work rather than a fixed sequence. The agent selects its next subtask using intermediate findings and may skip, repeat, or combine permitted subtasks within Section 3's limits. Individual subtasks do not all have to be L3. Copy the Permitted Subtask block as needed.*

### Permitted Subtasks

- **Subtask name:** [assess_planning_constraints.]
- **Subtask description:** [Examine the available attendance estimate, confidence range, data flags, budget information, and venue-capacity information to identify the most important planning uncertainty.]
- **Subtask boundary:** [Use only retrieved EmpirePulse planning context; do not request more participant information or make decisions for organizers?]
- **Retry limits:** [1]

- Subtask name: formulate_planning_scenarios
- Subtask description: Develop alternative food, drink, and swag planning scenarios that address the most important remaining uncertainty.
- Subtask boundary: Keep scenarios within the available evidence and clearly flag missing or uncertain information; do not place orders or select a scenario.
- Retry limits: 1

- Subtask name: identify_unresolved_constraints
- Subtask description: Determine whether missing data, low confidence, budget concerns, or venue-capacity concerns prevent a supported recommendation.
- Subtask boundary: Identify uncertainty without creating new data or contacting participants.
- Retry limits: 0

- Subtask name: prepare_organizer_decision_package
- Subtask description: Present the alternative scenarios, supporting evidence, flagged uncertainties, and the decision required from CPVC organizers.
- Subtask boundary: Request a human decision and take no further autonomous action while awaiting review.
- Retry limits: 1

- **Decision guidance:** After each subtask, use its findings to select the permitted subtask most likely to resolve the most important remaining uncertainty. Do not follow a fixed sequence. If no permitted subtask can make useful progress, stop and hand the case to a person.

## 5. When to Stop or Hand Off to a Human

- **Stop successfully when:** [The task has produced alternative planning scenarios, identified supporting evidence and unresolved uncertainty, and presented a clear decision request to CPVC organizers]
- **Hand off early when:** [Required planning context is missing, conflicting, unavailable after retries, outside the task boundary, or insufficient to prepare supported scenarios.]
- **Hand off to:** [CPVC organizers.]

Stop at the first applicable budget limit or handoff condition. While awaiting review, take no further autonomous action.

## 6. Outbound Deliverable

*Revise these default items if your task needs a more specific deliverable, or retain them if they fit.*

- **Status:** Completed or escalated to human.
- **Result or recommendation:** Alternative planning scenarios and the organizer decision requested; write undetermined if escalated before a supported result is reached.
- **Evidence summary:** The attendance estimate, confidence range, data flags, and applicable budget or venue-capacity information used.
- **Subtasks performed:** Permitted subtasks completed, including repeated attempts.
- **Unresolved issues:** Remaining uncertainties or questions; use none only if no unresolved issue remains.
- **Handoff note:** . Reason for stopping, unresolved questions, and what CPVC organizers need to decide; write Not applicable for a completed task
- **Next task or recipient:** CPVC organizers.
