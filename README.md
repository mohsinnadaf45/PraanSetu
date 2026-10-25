# PraanSetu

Bridge of life. A secure platform that helps hospitals match organ donors with eligible recipients using medical compatibility rules, while keeping patient identities hidden and keeping a tamper-proof record of every step.

The problem

Organ matching in many places still depends on phone calls, spreadsheets and paper. This is slow, and organs can be lost because time runs out. It is also hard to prove that a match was fair, and patient details can leak.

What PraanSetu does

PraanSetu has five parts:

Registry. Hospitals enter donors and waiting patients with medical details (organ, blood group, body size, test results, urgency).
Matching engine. When an organ becomes available, it removes medically unsuitable patients, then ranks the rest by a clear score. Every rank comes with a plain-language reason.
Privacy shield. Real names and contact details live in a separate, locked vault. Matching only sees anonymous codes such as R-4F7A91. Revealing an identity needs a reason and is logged.
Tamper-proof audit log. Every action is saved as a chained record. If anyone edits an old entry, the chain breaks and the system shows it.
Dashboards and reports. Doctors see cases and ranked lists. Authorities and auditors see fairness numbers and can verify the log.

PraanSetu is decision support only. A doctor and the transplant committee always make the final decision.

How one match flows
A hospital lists a donor organ.
The engine filters out incompatible patients.
The engine scores the rest and shows a ranked list with reasons.
The top patient's doctor is notified (anonymous code and medical facts only).
The doctor accepts or declines within a time limit. If declined or time runs out, the next patient is offered.
The committee approves the final match.
Every step is written to the audit log.
Who uses it
Role	Main use
Hospital coordinator	Register donors and patients, list organs
Transplant doctor	Review ranked matches, accept or decline with a reason
Transplant committee	Final approval and overrides
Regional or state authority	Statistics, fairness reports, audit trail
Auditor	Verify the log, export reports
System admin	Manage accounts, settings, backups
Matching logic (starting design)

Step 1, hard filters. Organ type, blood group (ABO), size match, crossmatch and antibodies (kidney), donor safety rules, patient status, and organ-specific age limits.

Step 2, scoring. Medical urgency, tissue match (HLA), waiting time, distance and travel time, pediatric priority, and special cases.

Design rules:

Weights live in a settings file that the medical board can change. Every change is versioned and logged.
Every ranking shows its reasons and the rule version used.
The same inputs always give the same ranking.
Overrides need a written reason and are logged.
Separate rule sets per organ. Start with kidney.
Fairness reports check whether any group is consistently ranked lower.
Privacy and security
Two separate stores: medical data under anonymous codes, and a locked identity vault.
Role-based access: each role sees only what its job needs.
Encryption in transit and at rest, with extra field-level encryption for identity data.
Multi-factor authentication and short sessions.
Consent records, retention rules and a deletion process.
Fake data only during development.
Tamper-proof record

Each log entry includes a fingerprint (hash) of the entry before it. Editing an old entry breaks every later fingerprint, so tampering is detected. Names and identity details are never stored in the log.

Option	Recommendation
Hash-chained log in a normal database	Start here (MVP)
Permissioned blockchain (e.g. Hyperledger Fabric)	Later, if several organizations need shared trust
Public blockchain	Do not use (privacy and cost problems)

Transparency features: a "Verify log" button, signed auditor exports, checkpoint fingerprints sent to an outside party, and public statistics with no personal data.

Features by priority

P0, MVP

Secure login with roles and MFA
Register donor and recipient
Anonymous codes and separate identity vault
Hard-filter compatibility check
Scoring and ranked list with reasons
Offer workflow (notify, accept or decline with reason, time limit, next candidate)
Hash-chained audit log with "Verify log"
Doctor dashboard

P1, before a real pilot

Committee approval and override
HLA and crossmatch for kidney
Email, SMS and in-app notifications
Admin tools and rule versions
Auditor and authority reports
Fairness and statistics dashboard
Data import (CSV, HL7 FHIR)

P2, later

Living donor pairing and swap chains
Distance and travel-time scoring with maps
Patient portal (anonymous status)
More organs (liver, heart, lung, pancreas)
Permissioned blockchain across hospitals
Hindi and Marathi interface
Suggested tech stack
Layer	Suggestion
Front end	React or Next.js
API server	Python (FastAPI) or Node.js
Matching service	Separate module with rules and scoring
Main database	PostgreSQL (anonymous medical data)
Identity vault	Separate encrypted database
Audit log	Append-only, hash-chained table
Notifications	Email and SMS gateway
Hosting	Cloud region in India, with a secrets and key manager
Frontend design principles

The interface should look calm, clinical and made by a person, not like a generic template.

Avoid: gradients, glass blur, emoji icons, floating blobs, repeated icon card grids, fake charts, hype words.
Colors: warm off-white background, deep ink text, one calm accent (muted teal or deep green). Red, amber and green only for status and urgency.
Type: a refined serif for headings, a clean sans-serif for body and tables, a monospaced font for anonymous codes. Body text 15 to 16 px or larger.
Layout: left navigation, one main area, detail panel on the right. Tables first. Thin lines and whitespace instead of heavy shadows.
Motion: almost none.
Ease of use: one main action per screen, a "Why this rank" line beside every score, clear status and countdowns, visible "Identity hidden" labels, confirmations on risky actions, designed empty, loading and error states, keyboard and screen reader support, and the same words everywhere.

First screens to design: Sign in, Home, Donor and Recipient pages, Match results, Offer detail, Committee review, Audit log, Reports, Admin.

Success targets for the pilot
Metric	Target
Time from organ listing to ranked list	Under 60 seconds
Accuracy on doctor-checked test cases (hard rules)	100%
Real names visible to users who do not need them	Zero
Audit entries failing verification	Zero
Doctor rating of ranking clarity	4 out of 5 or higher
Availability during pilot	99.5% or higher
New user completes main task unaided	Under 3 minutes
Legal and ethics

Confirm all of the following with a lawyer and a transplant specialist before using real data (assuming India):

Transplantation of Human Organs and Tissues Act (THOTA) and its rules
NOTTO, ROTTO and SOTTO allocation guidelines
Digital Personal Data Protection Act, 2023
ABDM standards for health data exchange
Ethics and authorization committee rules for living donors

Principles: no buying or selling of organs, fair and public ranking rules, human control of final decisions, and transparency for patients and regulators.

Data plan
Now: fake data you generate yourself. Public statistics only (for example NOTTO reports).
Pilot: written agreement with one or two hospitals, identity removed before data reaches matching, run in shadow mode beside the real process.
Real use: only after legal approval, security review and doctor sign-off.
Roadmap
Phase	Rough time	Outcome
0. Discovery	2 to 4 weeks	Talk to coordinators and doctors, collect real rules, finalize PRD
1. MVP (kidney)	6 to 8 weeks	All P0 features
2. Pilot-ready	8 to 12 weeks	Committee flow, HLA, notifications, reports, security testing
3. Shadow pilot	3 months	Run beside the real process, measure accuracy and speed
4. Expansion	Ongoing	More organs, hospitals, living donor swaps, more languages
Testing plan
Unit tests for every matching rule, with cases checked by a doctor
Scenario tests: rejected offers, timeouts, score ties
Tamper test: edit an old log entry and confirm it is flagged
Privacy test: no screen or API leaks identity to the wrong role
Security testing and a penetration test before any pilot
Load and failure tests, including a simulated outage
Usability test with 3 to 5 real coordinators or doctors
Open questions
Which country, state and hospitals first?
Kidney first (recommended)?
Deceased donors only, or living donors too?
Who owns and runs the platform?
Is there a transplant doctor or coordinator advisor?
What data will hospitals give, and in what format?
Name

PraanSetu joins praan (life, breath) and setu (bridge). It is a working name until these checks are done: web search, Play Store and App Store, .in and .com domains, social handles, and the IP India trademark search.

Contributing

This project is at an early stage. Before contributing, read the full PRD and the legal and ethics section above. Never commit real patient data to the repository.

License

To be decided.
