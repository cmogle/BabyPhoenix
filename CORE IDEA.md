Scope Document - MVP

Product Concept: Event Proposal Readiness

1. Working Title

Event Proposal Readiness Engine
An AI-assisted workflow that converts vague or inconsistent event ideas into standardized, approval-ready proposals.

⸻

2. Core Problem

In large enterprises, event proposals are often created in PowerPoint, Word, email, or spreadsheets with inconsistent language, incomplete information, and weak linkage to strategic priorities. This creates four expensive problems:
	•	decision-makers cannot compare proposals consistently
	•	marketers waste time in rework and back-and-forth
	•	approvals are delayed because critical information is missing
	•	leadership lacks visibility across the event portfolio

The MVP does not attempt to solve all marketing operations. It solves one narrow problem:

make event proposals decision-ready before approval.

⸻

3. Core Hypothesis

If enterprise event proposals are normalized into a common structure, checked for completeness and policy readiness, and returned with clear guidance on what is missing, then:
	•	marketers will produce better submissions faster
	•	reviewers will spend less time chasing missing information
	•	approval conversations will become more consistent
	•	leadership will gain a usable basis for comparing proposals

The MVP should prove that the value lies in readiness and standardization, not in generic AI chat.

⸻

4. MVP Goal

Build a modular prototype that an enterprise could understand and plausibly use tomorrow for event proposal intake and readiness assessment.

The output should be immediately useful in a real review or approval process.

Success is not “the AI is clever.”
Success is:

someone can paste in a rough event idea and receive a structured proposal, a readiness status, and a precise list of what must be fixed before approval.

⸻

5. Narrow Use Case

In Scope

Enterprise B2B event proposals, such as:
	•	client roundtables
	•	executive dinners
	•	sponsorship opportunities
	•	conferences
	•	regional field events
	•	partner events
	•	webinars, where treated as a governed event type

Out of Scope for MVP
	•	full campaign planning
	•	budget management system
	•	project/task execution
	•	post-event ROI analytics
	•	agency workflow management
	•	creative production workflow
	•	enterprise-wide portfolio optimization
	•	deep system integrations
	•	universal marketing briefing across all work types

⸻

6. Primary User Roles

Primary User

Regional or field marketer
	•	has an idea for an event
	•	knows the local context
	•	does not naturally express plans in governance-compliant structure
	•	needs to submit something that can be approved

Secondary User

Marketing leader / approver / marketing operations reviewer
	•	reviews incoming proposals
	•	wants consistency, completeness, and comparability
	•	needs to know whether a proposal is ready, weak, or missing essentials

Tertiary User

Administrator / central ops owner
	•	configures event taxonomy, required fields, readiness rules
	•	maintains standard language and governance expectations

⸻

7. Value Proposition

For the submitter
	•	reduces ambiguity
	•	reduces rework
	•	helps transform rough ideas into approval-ready proposals

For the reviewer
	•	makes proposals easier to assess
	•	reveals missing information immediately
	•	creates consistency across submissions

For leadership
	•	produces comparable structured data
	•	creates a basic portfolio view across event types, regions, products, and segments

⸻

8. Product Principle

The MVP is not a chatbot product.
It is a proposal normalization and readiness engine with AI-assisted input.

Conversation may be one input method, but the core value is:
	•	convert messy inputs into structured proposals
	•	diagnose gaps
	•	enforce required fields and taxonomy
	•	produce a decision-ready summary

⸻

9. Inputs

The MVP should support at least two input modes:

A. Freeform text / paste

User pastes rough event idea, email, notes, or partial brief.

Example:
“Want to run a Q3 executive breakfast in Singapore for payments prospects, around Sibos timing, maybe with a partner, focused on treasury and transaction banking buyers.”

B. Guided form / assisted completion

User fills or confirms structured fields after AI extraction.

Optional if time permits:

C. Conversational guidance

System asks targeted follow-up questions where information is missing or vague.

⸻

10. Standardized Output Structure

Each event proposal should be normalized into a common schema.

Required core fields
	•	event title
	•	event type
	•	objective
	•	target segment
	•	target buyer roles
	•	product / solution focus
	•	geography / market
	•	proposed timing
	•	audience size / scale
	•	format
	•	strategic rationale
	•	success metrics
	•	estimated budget range
	•	owner
	•	dependencies / required approvals

Optional useful fields
	•	partner involved
	•	target accounts
	•	related campaign / program
	•	regulatory or compliance considerations
	•	executive participation
	•	venue type
	•	follow-up / conversion expectation

⸻

11. Readiness Engine

This is the heart of the MVP.

The system should assess whether the proposal is ready for review, based on explicit rules.

Readiness should evaluate:
	•	completeness of required fields
	•	clarity and specificity of objective
	•	clarity of target audience
	•	strategic rationale present
	•	measurable success criteria present
	•	consistency between fields
	•	taxonomy compliance
	•	missing governance data
	•	obvious vagueness or placeholders

Output should not rely primarily on a single magic score

Preferred output:
	•	Readiness Status: Not Ready / Partially Ready / Ready for Review
	•	Missing Items
	•	Weak or vague fields
	•	Validation flags
	•	Suggested improvements

Optional:
	•	sub-dimensions such as Completeness, Strategic Clarity, Measurability, Governance Readiness

Avoid centering the MVP on a single composite 0-100 score.

⸻

12. Example Output UX

Given a rough proposal, the user should receive:

A. Structured Event Proposal

A clean, standardized one-page proposal summary.

B. Readiness Status

Example:
Partially Ready

C. Missing / Weak Areas

Example:
	•	target buyer roles too vague
	•	success metrics not measurable
	•	budget range missing
	•	partner role unclear
	•	strategic objective not explicitly linked to product growth priority

D. Next Actions

Example:
	•	define primary buyer roles
	•	add target account list or segment criteria
	•	specify measurable event outcome
	•	confirm estimated spend band
	•	confirm whether partner is sponsor, co-host, or attendee source

⸻

13. Taxonomy and Configuration Model

The MVP should be built modularly, even if only one tenant pack is hardcoded at first.

Configuration layers

A. Taxonomy Pack
Controlled vocabularies for:
	•	event types
	•	products
	•	geographies
	•	customer segments
	•	buyer roles
	•	strategic priorities
	•	success metric types

B. Workflow Pack
	•	required fields by event type
	•	readiness rules
	•	warning rules
	•	optional approvals metadata

C. Guidance Pack
	•	field help text
	•	examples of good inputs
	•	company-specific wording

This should be represented cleanly, ideally in JSON or a similar editable structure.

⸻

14. What the MVP Must Prove

The prototype should prove these four things:

1. Normalization

It can reliably convert messy event ideas into a structured proposal.

2. Readiness Logic

It can identify what is missing or weak in a way that feels fair and useful.

3. Modularity

The logic is driven by configurable taxonomy and rules, not hardcoded prompts alone.

4. Immediate Utility

The output is usable in a real approval discussion tomorrow.

⸻

15. What the MVP Does Not Need to Prove Yet

Do not overbuild.

The prototype does not need:
	•	enterprise authentication
	•	SSO
	•	portfolio dashboards beyond basic list/filter views
	•	CRM or MAP integration
	•	downstream workflow orchestration
	•	full analytics
	•	multilingual support
	•	complex role-based access controls
	•	budget system integration
	•	benchmarking against historical performance
	•	production-grade scoring science

⸻

16. Key Risks to Test

Risk 1 - Wrong object

Is the event proposal truly painful enough to warrant tooling?

Risk 2 - AI extraction quality

Can messy input be normalized with enough reliability to be trusted?

Risk 3 - Readiness credibility

Do users find the readiness assessment fair and actionable?

Risk 4 - Overhead risk

Does the system feel faster and clearer than existing templates, or just more bureaucratic?

Risk 5 - Configuration burden

Can tenant-specific rules be represented simply, or does every deployment become bespoke consulting?

⸻

17. MVP Success Criteria

The MVP is successful if a reviewer can look at it and say:
	•	“I can see how this would reduce back-and-forth.”
	•	“This would help standardize submissions.”
	•	“This is better than receiving another deck or email.”
	•	“I could use this in an approval process.”
	•	“I understand how this could become configurable for my organization.”

The MVP is not successful if feedback is limited to:
	•	“interesting”
	•	“nice AI”
	•	“good demo”
	•	“could maybe be useful one day”

⸻

18. Suggested Functional Components

1. Proposal Intake
	•	paste text
	•	optionally upload document later
	•	optionally guided prompts

2. Extraction Layer
	•	map freeform input to structured fields
	•	identify uncertainty

3. Validation Layer
	•	apply required-field logic
	•	detect vagueness and inconsistencies
	•	check taxonomy alignment

4. Readiness Layer
	•	assign readiness state
	•	generate missing items and improvement guidance

5. Output Layer
	•	render standardized proposal
	•	render readiness summary
	•	render actionable next steps

Optional:

6. Reviewer View
	•	side-by-side comparison of a few proposals
	•	simple filters by event type / region / product / readiness

⸻

19. Recommended Build Posture

Build the prototype as a decision-support workflow, not as a generic writing assistant.

Prioritize:
	•	clarity
	•	deterministic structure
	•	explainable logic
	•	obvious utility
	•	modular configuration

De-prioritize:
	•	stylistic polish over substance
	•	broad marketing scope
	•	abstract strategic dashboards
	•	overconfident scoring
	•	“chat for the sake of chat”

⸻

20. Final One-Sentence Positioning

Event Proposal Readiness is an AI-assisted workflow that turns inconsistent enterprise event ideas into standardized, review-ready proposals with clear readiness checks, missing information diagnosis, and governance-friendly structure.

⸻

21. Final Build Instruction

If forced to choose, optimize for this single end-to-end flow:

Paste rough event idea -> extract structure -> validate against rules -> return a one-page standardized proposal + readiness status + missing items + recommended next actions.

That is the core MVP. Everything else is secondary.
