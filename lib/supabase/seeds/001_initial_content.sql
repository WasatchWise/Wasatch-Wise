-- ============================================================================
-- Initial Seed Data for WasatchWise SDPC Platform
-- ============================================================================

-- ============================================================================
-- VIDEO TEMPLATES
-- ============================================================================

INSERT INTO video_templates (
  template_name,
  template_type,
  script_template,
  required_variables,
  optional_variables,
  estimated_duration,
  category,
  tags
) VALUES
(
  'welcome_onboarding',
  'onboarding',
  'Hi {{contact_name}}, I''m John from WasatchWise. I wanted to personally welcome {{district_name}} to our platform. I saw from your AI Readiness Quiz that you scored {{quiz_score}}/100, which puts you in our {{tier}} category. Over the next 90 days, we''ll work together to build a comprehensive AI governance framework. Here''s what to expect: Weeks 1-4 we''ll focus on policy development, Weeks 5-8 on teacher training, and Weeks 9-12 on your full audit. I''m here if you need anything—feel free to reach out via WiseBot or book a call directly. Let''s get started!',
  ARRAY['contact_name', 'district_name', 'quiz_score', 'tier'],
  ARRAY['state', 'district_size'],
  60,
  'Onboarding',
  ARRAY['welcome', 'first_contact', 'quiz_results']
),
(
  'week_4_milestone',
  'milestone',
  'Congratulations, {{contact_name}}! Your board just approved {{district_name}}''s AI use policy—that''s a huge milestone! You''re now ahead of 87% of districts in your state. Next up is teacher onboarding. I''ve prepared training materials customized for your team, and they''ll be in your email within the hour. Week 5 starts tomorrow, so let''s keep the momentum going. Great work!',
  ARRAY['contact_name', 'district_name'],
  ARRAY['state', 'policy_name'],
  45,
  'Milestone',
  ARRAY['policy_approved', 'celebration', 'week_4']
),
(
  'ferpa_explanation',
  'explanation',
  'Hi {{contact_name}}, you asked about FERPA compliance for {{tool_name}}. Here''s what you need to know: FERPA requires that any vendor accessing student PII must have a signed Data Privacy Agreement. For AI tools, this gets more complex because of how data is processed and potentially used for model training. Let me walk you through the three key requirements: First, the vendor must be designated as a "school official" under FERPA. Second, you need documented legitimate educational interest. Third, there must be contractual restrictions on re-disclosure. I''ve attached a checklist specific to {{tool_name}} to help you evaluate their compliance. If you need help reviewing their DPA, just let me know.',
  ARRAY['contact_name', 'tool_name'],
  ARRAY['vendor_name', 'specific_concerns'],
  90,
  'Explanation',
  ARRAY['FERPA', 'compliance', 'tool_evaluation']
),
(
  'audit_results_delivery',
  'celebration',
  '{{contact_name}}, your Cognitive Audit results are ready! {{district_name}} scored {{audit_score}}/100. Here''s what stood out: Your strengths are in {{strengths}}, which is excellent. The areas for improvement are {{weaknesses}}, and I''ve created a custom 90-day action plan to address them. The good news? These are all manageable, and I''ll be with you every step of the way. Let''s schedule 30 minutes this week to walk through your personalized roadmap. I''m proud of the progress you''ve already made—let''s keep building on it.',
  ARRAY['contact_name', 'district_name', 'audit_score', 'strengths', 'weaknesses'],
  ARRAY['top_priority', 'next_step'],
  120,
  'Results',
  ARRAY['audit', 'results', 'celebration']
),
(
  'dpa_expiring_alert',
  'alert',
  'Hi {{contact_name}}, quick heads up: Your Data Privacy Agreement with {{vendor_name}} expires on {{expiration_date}}. That''s {{days_remaining}} days from now. To avoid any interruptions to {{tool_name}}, we should start the renewal process this week. I''ve pulled up your current agreement and can help you review any updates they''re proposing. Would you like me to send you a renewal checklist, or would you prefer to jump on a quick call to discuss? Let me know how I can help.',
  ARRAY['contact_name', 'vendor_name', 'expiration_date', 'days_remaining', 'tool_name'],
  ARRAY['district_name'],
  60,
  'Alert',
  ARRAY['DPA', 'renewal', 'expiration', 'urgent']
),
(
  'tool_risk_warning',
  'alert',
  '{{contact_name}}, I flagged something in {{district_name}}''s tool assessment that needs your immediate attention. {{tool_name}} has been classified as {{risk_tier}} risk because {{risk_reason}}. Here''s what I recommend: {{recommendation}}. This doesn''t mean you need to stop using it right away, but we should address these concerns within the next {{timeline}}. I''ve drafted an action plan—let me know if you want to review it together or if you''d like me to send it via email.',
  ARRAY['contact_name', 'district_name', 'tool_name', 'risk_tier', 'risk_reason', 'recommendation', 'timeline'],
  ARRAY['vendor_contact'],
  75,
  'Alert',
  ARRAY['risk', 'tool_assessment', 'urgent']
);

-- ============================================================================
-- KNOWLEDGE BASE
-- ============================================================================

INSERT INTO knowledge_base (
  category,
  question,
  answer,
  tags,
  confidence_level,
  priority
) VALUES

-- FERPA Questions
(
  'FERPA',
  'What is FERPA and how does it apply to AI tools?',
  'FERPA (Family Educational Rights and Privacy Act) is a federal law that protects the privacy of student education records. When using AI tools, FERPA applies if the tool accesses, stores, or processes student personally identifiable information (PII). Districts must ensure vendors sign Data Privacy Agreements (DPAs) and are designated as "school officials" with legitimate educational interest. Key requirements include: (1) Vendor must be under direct control of the district, (2) Must use data only for authorized educational purposes, (3) Cannot re-disclose data without consent, (4) Must follow district data retention policies.',
  ARRAY['FERPA', 'compliance', 'AI tools', 'privacy', 'DPA'],
  'high',
  10
),
(
  'FERPA',
  'Does AI training on student data violate FERPA?',
  'Yes, using student data to train AI models typically violates FERPA unless explicitly authorized. FERPA requires that vendors only use student data for the specific educational purpose for which it was disclosed. Training AI models on student work, behavior data, or assessment results without explicit consent constitutes unauthorized use. Your DPA should explicitly prohibit: (1) Using student data for model training, (2) Using data to improve products for other clients, (3) Retaining data longer than necessary for the educational service, (4) Sharing data with third parties including parent AI companies.',
  ARRAY['FERPA', 'AI training', 'machine learning', 'data use', 'violations'],
  'high',
  9
),
(
  'FERPA',
  'What student data is considered PII under FERPA?',
  'FERPA defines PII (Personally Identifiable Information) as information that, alone or in combination, can identify a student. This includes: Direct identifiers (name, SSN, student ID, photos, biometric data), Indirect identifiers (date/place of birth, parent names, address), Educational data (grades, test scores, disciplinary records, special education status, attendance), and increasingly, Behavioral and biometric data (facial recognition, keystroke patterns, emotional state data from AI tools). For AI tools, be especially cautious with: Learning analytics, Behavioral predictions, Emotional state detection, Voice and writing samples, and Screen activity tracking.',
  ARRAY['FERPA', 'PII', 'student data', 'identifiers', 'privacy'],
  'high',
  8
),

-- Policy Questions
(
  'Policy',
  'What should be included in an AI use policy?',
  'An effective AI use policy should include: (1) Acceptable use guidelines for staff and students with specific AI tool examples, (2) Data privacy requirements including DPA mandates for all AI vendors, (3) Clear approval process for adopting new AI tools, (4) Mandatory training requirements before using AI, (5) Monitoring and accountability measures, (6) Incident response procedures for data breaches or misuse, (7) Regular review schedule (annually minimum), (8) Roles and responsibilities (who approves, who monitors), (9) Age-appropriate restrictions for student use, (10) Transparency requirements for AI-generated content.',
  ARRAY['policy', 'governance', 'AI use', 'best practices'],
  'high',
  10
),
(
  'Policy',
  'How often should AI policies be reviewed?',
  'AI policies should be reviewed at least annually, but given the rapid pace of AI development, quarterly reviews are recommended. Immediate reviews should be triggered by: (1) New AI tools being adopted, (2) Changes in state/federal regulations, (3) Security incidents or breaches, (4) Significant AI technology changes, (5) Stakeholder concerns or complaints, (6) Board policy changes. Between formal reviews, maintain a running list of policy questions or gaps that arise during implementation.',
  ARRAY['policy', 'review', 'updates', 'governance'],
  'high',
  7
),

-- Tool Evaluation
(
  'Tool Evaluation',
  'How do I evaluate if an AI tool is safe for students?',
  'Use this 10-point evaluation checklist: (1) Does it collect student PII? If yes, what specific data? (2) Where is data stored? (US, EU, other?) (3) Is student data used to train AI models? (4) Does it share data with third parties? (5) What are data retention policies? (6) Is there a signed DPA that meets FERPA requirements? (7) Has it been reviewed by your legal/compliance team? (8) What is the vendor''s security track record? Any breaches? (9) Are there age-appropriate content safeguards? (10) Can the district delete data on request? Additionally, check SDPC registry, Common Sense Privacy ratings, and state-approved vendor lists.',
  ARRAY['tool evaluation', 'safety', 'assessment', 'AI tools', 'checklist'],
  'high',
  10
),
(
  'Tool Evaluation',
  'What questions should I ask vendors about their AI?',
  'Essential vendor questions: (1) Is your AI model trained on student data? If so, whose and how? (2) Where is student data stored geographically? (3) Who has access to our student data within your organization? (4) Do you share data with parent companies or third parties? (5) How do you handle data deletion requests? (6) What happens to our data if we cancel service? (7) Do you use student data for product improvement? (8) How is your AI model validated for bias? (9) Can teachers/admins override or explain AI decisions? (10) What security certifications do you have? (SOC 2, ISO 27001, etc.) (11) What is your data breach notification policy? (12) Will you sign our DPA template?',
  ARRAY['vendor assessment', 'AI vendors', 'questions', 'due diligence'],
  'high',
  9
),

-- Process & Training
(
  'Process',
  'What is the tool approval workflow?',
  'Recommended AI tool approval workflow: (1) Teacher/staff submits tool request via form, (2) IT reviews technical compatibility and security, (3) Privacy officer reviews data practices and FERPA compliance, (4) If tool collects PII, legal reviews or negotiates DPA, (5) Pilot group tests tool with limited data, (6) Feedback collected and risk assessment completed, (7) Final approval by designated authority (Tech Director, Superintendent, or Board depending on risk level), (8) Tool added to approved list with usage guidelines, (9) Training provided before broad rollout, (10) Annual re-evaluation scheduled. High-risk tools require Board approval; low-risk tools can be approved by Tech Director.',
  ARRAY['workflow', 'approval process', 'tool adoption', 'governance'],
  'high',
  8
),
(
  'Training',
  'What training do teachers need before using AI tools?',
  'Minimum training requirements: (1) District AI use policy overview, (2) FERPA basics and why it matters, (3) How to identify student PII in tool outputs, (4) Approved vs. prohibited AI uses, (5) Tool-specific training for each AI system, (6) How to verify AI-generated content accuracy, (7) Appropriate disclosure to students/parents, (8) Incident reporting procedures, (9) Accessibility considerations for AI tools. Training should be: Role-specific, Hands-on with real scenarios, Documented with completion tracking, and Refreshed annually or when new tools are added.',
  ARRAY['training', 'professional development', 'teachers', 'AI literacy'],
  'high',
  7
),

-- COPPA & Age Restrictions
(
  'COPPA',
  'What is COPPA and when does it apply?',
  'COPPA (Children''s Online Privacy Protection Act) applies to websites, apps, and online services directed at children under 13. It requires verifiable parental consent before collecting personal information from children. For schools, the school can provide consent on behalf of parents ONLY if: (1) The tool is used solely for educational purposes, (2) The information is not disclosed for commercial purposes, (3) The school has informed parents of the practice. Key COPPA requirements for EdTech vendors: Must post privacy policy, Must provide notice about data collection, Must obtain consent before collecting data, Must keep data secure, Must not condition participation on providing more data than necessary, Must delete data when no longer needed.',
  ARRAY['COPPA', 'privacy', 'children under 13', 'parental consent', 'compliance'],
  'high',
  8
),

-- State-Specific
(
  'State Law',
  'What are Utah-specific requirements for student data privacy?',
  'Utah has specific requirements under the Student Data Privacy Act (Utah Code §53E-9-301 et seq.): (1) All vendors must sign a data privacy agreement, (2) Vendors cannot use student data for targeted advertising, (3) Vendors cannot sell student data, (4) Vendors cannot use data to create student profiles except for educational purposes, (5) Districts must maintain a publicly accessible list of all vendors with access to student data, (6) Parents have right to inspect and correct student data, (7) Districts must respond to data breaches within specific timelines. Additionally, Utah requires annual reporting of all AI tools used in instruction to the State Board.',
  ARRAY['Utah', 'state law', 'Student Data Privacy Act', 'compliance'],
  'high',
  10
),

-- Incident Response
(
  'Process',
  'What do I do if there''s a data breach involving student data?',
  'Immediate data breach response steps: (1) Within 1 hour: Contain the breach - disable vendor access if needed, (2) Within 2 hours: Notify your superintendent, IT director, and legal counsel, (3) Within 24 hours: Begin internal investigation to determine scope, (4) Within 72 hours: Notify affected families (may be required sooner by state law), (5) Document everything including: What data was compromised, How many students affected, What the vendor is doing to remediate, Steps you''re taking to prevent recurrence, (6) Notify state education agency per Utah requirements, (7) Consider offering credit monitoring for affected families, (8) Review and potentially terminate vendor relationship, (9) Update policies and procedures based on lessons learned, (10) Consider public notification if breach is significant.',
  ARRAY['data breach', 'incident response', 'emergency', 'security'],
  'high',
  10
);

-- ============================================================================
-- SAMPLE VENDORS (for testing)
-- ============================================================================

INSERT INTO vendors (
  name,
  website,
  vendor_type,
  sdpc_member,
  compliance_status,
  primary_contact_email,
  risk_tier
) VALUES
(
  'Google Workspace for Education',
  'https://edu.google.com',
  'Platform',
  true,
  'active',
  'edu-support@google.com',
  'Low'
);
