-- WiseBot Knowledge Base Expansion
-- Adds 27 expert Q&A entries from NotebookLM extraction (2026-02)
-- Creates table if missing; expands category constraint; inserts content

-- 0. Create table if it doesn't exist (standalone for projects that haven't run 001)
CREATE TABLE IF NOT EXISTS public.knowledge_base (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  question text NOT NULL,
  answer text NOT NULL,
  answer_html text,
  related_policy text,
  related_urls jsonb DEFAULT '[]'::jsonb,
  legal_citations text[],
  tags text[] DEFAULT ARRAY[]::text[],
  keywords text[] DEFAULT ARRAY[]::text[],
  search_vector tsvector,
  view_count int DEFAULT 0,
  helpful_count int DEFAULT 0,
  not_helpful_count int DEFAULT 0,
  last_viewed_at timestamptz,
  active boolean DEFAULT true,
  priority int DEFAULT 0,
  confidence_level text CHECK (confidence_level IN ('high', 'medium', 'low')),
  requires_review boolean DEFAULT false,
  reviewed_at timestamptz,
  reviewed_by uuid,
  version int DEFAULT 1,
  previous_version_id uuid REFERENCES public.knowledge_base(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 0.1. Ensure full-text search function exists
CREATE OR REPLACE FUNCTION knowledge_base_search_vector_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.question, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.answer, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(array_to_string(NEW.tags, ' '), '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS knowledge_base_search_vector_trigger ON public.knowledge_base;
CREATE TRIGGER knowledge_base_search_vector_trigger
  BEFORE INSERT OR UPDATE ON public.knowledge_base
  FOR EACH ROW EXECUTE FUNCTION knowledge_base_search_vector_update();

-- 0.2. Indexes for search and idempotency
CREATE INDEX IF NOT EXISTS idx_knowledge_base_category ON public.knowledge_base(category);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_tags ON public.knowledge_base USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_active ON public.knowledge_base(active) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_knowledge_base_search ON public.knowledge_base USING GIN(search_vector);
CREATE UNIQUE INDEX IF NOT EXISTS knowledge_base_question_key ON public.knowledge_base(question);

-- 0.3. RLS (allow public read of active rows for WiseBot API)
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "kb_read_public" ON public.knowledge_base;
CREATE POLICY "kb_read_public" ON public.knowledge_base FOR SELECT USING (active = true);

-- 1. Expand allowed categories (drop/add works for both new and existing tables)
ALTER TABLE public.knowledge_base DROP CONSTRAINT IF EXISTS knowledge_base_category_check;
ALTER TABLE public.knowledge_base ADD CONSTRAINT knowledge_base_category_check CHECK (
  category IN (
    'FERPA', 'COPPA', 'State Law', 'State Privacy Laws', 'Policy', 'Policy Development',
    'Tool Evaluation', 'Vendor Evaluation', 'Process', 'Practical Procedures',
    'Best Practice', 'FAQ', 'Troubleshooting', 'Training',
    'AI Governance', 'AI Specific Risks', 'Compliance', 'Incident Response',
    'Accessibility', 'Special Populations', 'Parent Rights', 'Shadow AI',
    'Federal Laws', 'Edge Cases'
  )
);

-- 2. Insert new knowledge base entries (idempotent: skip if question exists)
INSERT INTO public.knowledge_base (category, question, answer, tags, confidence_level, priority, active)
SELECT v.category, v.question, v.answer, v.tags, v.confidence_level, v.priority, v.active
FROM (VALUES
  ('FERPA', 'Can we rely on the "School Official" exception to share student data with generative AI vendors without parental consent?',
   'Yes, but strictly under specific conditions. Under FERPA, schools may disclose personally identifiable information (PII) to a third-party vendor without parental consent if the vendor meets the "school official" exception. To qualify, the vendor must: 1) Perform a service the school would otherwise use its own employees for; 2) Be under the "direct control" of the school regarding the use and maintenance of education records; and 3) Not use the PII for any purpose other than the specific purpose for which it was disclosed.

Crucially for AI, this means the contract must explicitly prohibit the vendor from using student data to train their general large language models (LLMs) or for product improvement that benefits other customers. If the vendor claims ownership of the data or rights to use it for non-educational commercial purposes (such as model training), this exception does not apply, and you cannot share PII without written parental consent.',
   ARRAY['FERPA', 'school official', 'data ownership', 'model training', 'PII', 'vendor contract', 'direct control'],
   'high', 10, true),

  ('Vendor Evaluation', 'What specific questions should we ask AI vendors regarding data privacy and model training during the procurement process?',
   'When vetting AI tools, you must move beyond standard privacy questions. Ask the following specific questions to ensure compliance and safety:
1. **Model Training:** Does this tool use student data (inputs, prompts, or uploaded files) to train or refine your general AI models? (The answer should be no for compliant tools).
2. **Data Persistence:** Is the data stored? If so, where, for how long, and can we delete it on demand?
3. **Opt-In/Opt-Out:** Do you provide clear alerts when Generative AI is in use, and can parents or the district opt out of AI features while retaining other functionality?
4. **Bias Mitigation:** What steps have you taken to identify and reduce algorithmic bias in your model, particularly regarding non-native English speakers or students with disabilities?
5. **Ownership:** Does the contract explicitly state that the district/student retains ownership of all AI-generated content and input data?',
   ARRAY['vendor assessment', 'model training', 'data persistence', 'bias', 'opt-out', 'procurement', 'data ownership'],
   'high', 10, true),

  ('State Privacy Laws', 'What are the "Metadata Dictionary" requirements for Utah LEAs, and how does this apply to AI tools?',
   'Under Utah Code § 53E-9-301 and Board Rule R277-487, every Local Education Agency (LEA) must maintain and publish a Metadata Dictionary. This is a record that defines and discloses all personally identifiable student data collected and shared by the entity.

For AI tools, the Data Manager must list the specific AI vendor as a recipient. The entry must include: 1) The specific data elements shared (e.g., student essays, reading scores, name); 2) The purpose for sharing (e.g., "personalized writing feedback"); and 3) The legal justification for sharing (e.g., "School Official Exception" or "Written Consent"). This dictionary must be displayed on the LEA''s website without disclosing actual PII to ensure transparency with the public.',
   ARRAY['Utah Student Data Protection Act', 'Metadata Dictionary', 'transparency', 'LEA obligations', 'data manager', 'state compliance'],
   'high', 10, true),

  ('AI Governance', 'What is the "Traffic Light" model for AI policy, and how should we implement it in classrooms?',
   'The "Traffic Light" model is a framework for categorizing acceptable AI use to reduce confusion for students and staff. It categorizes use into three tiers:
**Red (Prohibited):** AI use is forbidden. This typically applies to foundational skill-building, assessments of original thought, or high-stakes decisions like IEP goals.
**Yellow (Conditional):** AI is allowed with permission or as a scaffold. Examples include using AI for brainstorming, outlining, or grammar checking, provided the student discloses the tool used.
**Green (Encouraged):** AI is integrated into the task. Examples include AI literacy exercises, critical evaluation of AI outputs, or specific assignments designed to be completed with AI assistance.

To implement this, updated Acceptable Use Policies (AUPs) and course syllabi should explicitly state which color applies to specific assignments or assessments.',
   ARRAY['policy development', 'traffic light model', 'classroom guidance', 'academic integrity', 'AUP', 'student use'],
   'high', 10, true),

  ('Compliance', 'How does the "School Official" exception apply if an AI vendor uses sub-processors or third-party LLMs (like OpenAI via a wrapper)?',
   'If a vendor uses a third-party LLM (e.g., an educational app that calls OpenAI''s API), the primary vendor is responsible for ensuring that the sub-processor also complies with privacy laws. The primary vendor must have a contract with the sub-processor that imposes the same strict data limits—specifically, that student data will not be used to train the third party''s foundational models.

During vetting, you must identify if the AI is internal or a third-party tool. If data is passed to a third party, the district must ensure that the "chain of trust" remains unbroken and that the sub-processor meets the definition of a "school official" under FERPA, meaning they are under the direct control of the district regarding data use.',
   ARRAY['sub-processors', 'third-party vendors', 'API', 'FERPA', 'school official', 'chain of trust', 'data security'],
   'high', 9, true),

  ('Incident Response', 'What are the immediate steps if an AI tool generates a "deepfake" or non-consensual intimate image of a student?',
   'This is a critical safety and disciplinary incident. Immediate steps include:
1. **Containment:** Isolate the content and prevent further distribution. Do not delete evidence immediately if it is needed for investigation, but ensure it is not viewable by students.
2. **Notification:** Notify the school administration and the designated Student Data Manager immediately. If the content involves NCII (Non-Consensual Intimate Imagery) or child sexual abuse material (CSAM), you may need to contact law enforcement and the NCMEC (National Center for Missing & Exploited Children).
3. **Investigation:** Determine if the content was generated using school devices or accounts. If a specific AI tool was used, report the abuse to the vendor immediately.
4. **Support:** Activate safety alerts and provide emotional support to the victim. Refer to existing policies on harassment and cyberbullying, as these apply to AI-generated harassment as well.',
   ARRAY['deepfakes', 'incident response', 'cyberbullying', 'student safety', 'law enforcement', 'harassment', 'NCII'],
   'high', 10, true),

  ('Accessibility', 'What are the new ADA Title II requirements for AI-generated digital content, and when do they take effect?',
   'As of April 2024, the U.S. DOJ issued a final rule under ADA Title II requiring that all web-based and mobile app-based digital learning resources—including those generated by AI—must meet **WCAG 2.1 Level AA** standards.

This applies to all content provided by the district, including AI-generated PDFs, course materials, and websites. Key deadlines for compliance are **June 2026** for larger districts (population 50,000+) and **June 2027** for smaller districts. Districts must audit AI tools to ensure they can produce accessible outputs (e.g., alt text, proper heading structures) or provide a human workflow to remediate the content before it is distributed to students.',
   ARRAY['ADA Title II', 'WCAG 2.1', 'accessibility', 'compliance deadlines', 'digital content', 'AI outputs'],
   'high', 10, true),

  ('Special Populations', 'Can we use AI tools to draft IEPs or 504 plans to save teacher time?',
   'The U.S. Department of Education''s Office for Civil Rights (OCR) has flagged significant risks in using AI for IDEA/Section 504 documentation. Relying on AI to draft these plans can lead to discrimination if the AI outputs are based on biased data or generic templates that do not account for the student''s unique individual needs.

If an AI tool is used to *assist* in drafting, a qualified human (the IEP team) must rigorously review, edit, and approve every part of the plan to ensure it constitutes a Free Appropriate Public Education (FAPE). Automating this process without human oversight may violate federal civil rights laws by failing to provide the individualized assessment required by law. Furthermore, inputting student medical or disability data into a non-secure AI tool is a HIPAA and FERPA violation.',
   ARRAY['IDEA', 'Section 504', 'IEP', 'OCR guidance', 'bias', 'FAPE', 'human oversight', 'special education'],
   'high', 10, true),

  ('Parent Rights', 'Do parents have the right to opt their children out of using AI tools in the classroom?',
   'Generally, yes, especially regarding data privacy and specific types of data collection. In Utah, for instance, schools must provide a "Student Data Disclosure Statement" and parents can opt out of the collection of "optional student data". If an AI tool collects data not strictly defined as "necessary" for the educational program, or if it involves biometric data or "profiling," parental consent is often required.

Even without a specific "AI opt-out" law, best practice dictates that districts provide parents with information about the AI tools used and offer an alternative assignment if a parent objects to the use of a specific tool due to privacy or ethical concerns. Policies should clarify that students will not be penalized for opting out of AI-specific tools if an equitable alternative is provided.',
   ARRAY['opt-out', 'parental consent', 'student data disclosure', 'transparency', 'optional data', 'equity'],
   'high', 9, true),

  ('Shadow AI', 'How should we handle teachers or students using personal accounts on "free" AI tools (Shadow AI)?',
   'Use of personal accounts on free AI tools (e.g., consumer ChatGPT) for school business is a significant security and privacy risk. These "click-wrap" agreements often grant the vendor broad rights to use input data for model training, violating FERPA if PII is introduced.

Districts should:
1. **Block** access to known non-compliant generative AI sites on school networks until they are vetted.
2. **Provide Vetted Alternatives:** Offer "Walled Garden" enterprise environments (e.g., district-managed accounts with data privacy agreements) so staff have a safe alternative.
3. **Policy:** Explicitly prohibit the entry of student PII, confidential records, or intellectual property into unapproved, personal AI accounts in the district''s AUP.',
   ARRAY['shadow AI', 'personal accounts', 'data security', 'click-wrap', 'walled garden', 'AUP', 'FERPA violation'],
   'high', 10, true),

  ('Vendor Evaluation', 'What is the difference between a "Walled Garden" and an "Open-Ended" AI environment, and which should we prefer?',
   'A **Walled Garden** environment operates in a closed ecosystem where the AI provider is contractually prohibited from using data to train their public models, and the district controls data retention and access. It prioritizes safety, compliance, and control.

An **Open-Ended** environment (like the free version of ChatGPT) accesses the broader internet, uses inputs for training, and may provide unvetted information. For student use, especially with PII or curricular content, districts should prioritize "Walled Garden" environments to ensure FERPA compliance and prevent data leakage.',
   ARRAY['walled garden', 'open-ended AI', 'data security', 'model training', 'vendor selection', 'student safety'],
   'high', 10, true),

  ('AI Governance', 'What role should the "Human in the Loop" play when using AI for grading or student feedback?',
   'The "Human in the Loop" (HITL) principle is non-negotiable for high-stakes tasks like grading. The U.S. Department of Education emphasizes that AI should inform, not replace, educator judgment.

AI can be used to draft feedback or suggest grades, but a qualified educator must review and validate the output before it is finalized or shared with the student. This is to prevent algorithmic bias, "hallucinations" (inaccurate feedback), and the dehumanization of the assessment process. Policies should explicitly prohibit AI from being the *sole* determiner of a student''s grade or disciplinary outcome.',
   ARRAY['human in the loop', 'grading', 'assessment', 'accountability', 'bias mitigation', 'educator oversight'],
   'high', 10, true),

  ('Federal Laws', 'How does COPPA impact the use of AI tools for students under 13?',
   'COPPA imposes strict requirements on operators of websites/apps directed at children under 13. AI tools collecting personal information (including voice, image, or extensive text inputs) from these students must obtain verifiable parental consent.

While schools can sometimes consent on behalf of parents (the "school consent" exception), this is limited to the educational context. The vendor *cannot* use the data for commercial purposes (like training a commercial model or behavioral advertising). If the AI tool uses data for non-educational purposes, the school *cannot* consent on behalf of the parent; the vendor must get consent directly from the parent. Districts must vet tool Terms of Service to ensure no commercial data use occurs before authorizing school consent.',
   ARRAY['COPPA', 'under 13', 'parental consent', 'school consent exception', 'commercial use', 'data collection'],
   'high', 10, true),

  ('Training', 'What topics must be covered in mandatory AI literacy training for staff?',
   'To ensure compliance and safety, staff training must go beyond "how to use the tool." Essential topics include:
1. **Data Privacy:** What constitutes PII and why it cannot be entered into public AI chatbots.
2. **Bias & Ethics:** Recognizing algorithmic bias and the ethical implications of AI-generated content.
3. **Human Oversight:** The requirement to review and vet all AI-generated materials for accuracy and appropriateness before student use.
4. **Prompt Engineering:** How to write effective prompts that do not inadvertently reveal sensitive information.
5. **Policy Awareness:** Understanding the specific district policies (e.g., Traffic Light model) regarding student use and academic integrity.',
   ARRAY['professional development', 'AI literacy', 'data privacy', 'bias awareness', 'human oversight', 'prompt engineering'],
   'high', 10, true),

  ('State Privacy Laws', 'Under Utah law, are third-party AI vendors allowed to use student data for targeted advertising?',
   'No. Utah Code § 53E-9-309 and Administrative Rule R277-487 strictly prohibit third-party contractors from using student data for targeted advertising. Targeted advertising is defined as selecting ads based on information obtained or inferred over time from the student''s online behavior or data. Contracts with AI vendors must include explicit provisions prohibiting this secondary use of data.',
   ARRAY['Utah Code 53E-9-309', 'targeted advertising', 'vendor prohibitions', 'secondary use', 'contract requirements'],
   'high', 10, true),

  ('Incident Response', 'Does a "hallucination" by an AI tool constitute a data breach?',
   'Not necessarily, but it can be a security incident. A data breach is defined as the unauthorized release of or access to PII. If an AI tool "hallucinates" fake facts, it is a quality/accuracy issue.

However, if an AI tool outputs *real* PII about another student (e.g., a "leak" where the model regurgitates training data containing another student''s info), that **is** a data breach and must be treated as such. This requires following standard breach response protocols, including notifying the Student Data Manager and potentially affected families within statutory timeframes (e.g., 10 days in Utah).',
   ARRAY['data breach', 'hallucination', 'PII leakage', 'incident response', 'notification', 'security incident'],
   'high', 9, true),

  ('Special Populations', 'What are the risks of using AI for English Learners (ELs) regarding bias?',
   'AI detection tools and grading algorithms have been shown to have higher error rates when evaluating essays written by non-native English speakers. These tools often flag the simpler linguistic patterns or limited vocabulary common among ELs as "AI-generated."

Using these tools as the sole basis for disciplinary action or grading can result in discrimination based on national origin, violating Title VI of the Civil Rights Act. Districts should minimize the use of AI detectors for this population and prioritize human review and "process-based" assessment (drafts, oral checks) instead.',
   ARRAY['English Learners', 'algorithmic bias', 'AI detection', 'Title VI', 'discrimination', 'equity'],
   'high', 10, true),

  ('Practical Procedures', 'What are the steps for adopting a new AI tool in compliance with privacy laws?',
   'A recommended workflow includes:
1. **Inventory & Need:** Confirm the educational purpose and that no existing tool meets the need.
2. **Vetting:** Use a rubric (like the 1EdTech AI Data Rubric) to evaluate the vendor''s privacy policy, security (SOC 2), and data handling (no model training on PII).
3. **Accessibility Check:** Request an ACR/VPAT to ensure WCAG 2.1 AA compliance.
4. **Contracting:** Sign a Data Privacy Agreement (DPA) or NDPA that prohibits secondary use of data and targeted ads.
5. **Metadata Entry:** Enter the tool and data elements into the district''s Metadata Dictionary (required in Utah).
6. **Training:** Train staff on the specific allowed/prohibited uses of this tool before rollout.',
   ARRAY['adoption workflow', 'vetting', 'DPA', 'metadata dictionary', 'accessibility', 'procurement'],
   'high', 10, true),

  ('Policy Development', 'How should our policy address "AI Detection" tools for plagiarism?',
   'Policies should advise extreme caution or prohibit the use of AI detection tools as the *sole* evidence of academic dishonesty. These tools generate false positives, particularly against non-native English speakers and neurodivergent students.

Instead, policy should focus on "AI-resilient" assessment design (e.g., in-class writing, oral defense, process drafts). If a detector is used, it should be treated as a "signal" requiring human investigation, not a definitive proof of guilt. The guidance should emphasize creating a culture of trust and transparency rather than a punitive reliance on unreliable detection technology.',
   ARRAY['AI detection', 'plagiarism', 'academic integrity', 'false positives', 'assessment design', 'policy'],
   'high', 10, true),

  ('AI Specific Risks', 'What are the risks of "Prompt Injection" or "Jailbreaking" in student-facing AI tools?',
   'Prompt injection involves users manipulating an AI''s input to bypass safety guardrails (e.g., tricking a chatbot into generating inappropriate content or revealing its instructions). This poses risks of students accessing restricted content, generating hate speech, or bypassing filters.

To mitigate this, districts should select "Walled Garden" tools with robust enterprise-grade filtering and monitoring. Additionally, Acceptable Use Policies (AUP) should explicitly prohibit "attempting to bypass security measures or guardrails of AI systems" as a violation of the code of conduct.',
   ARRAY['prompt injection', 'jailbreaking', 'guardrails', 'content filtering', 'AUP', 'student safety'],
   'high', 9, true),

  ('Edge Cases', 'A teacher wants to use a "free" AI tool that requires students to sign in with Google. Is this safe?',
   'Likely not. "Sign in with Google" (SSO) authentication does not automatically make a tool compliant. You must review the tool''s Terms of Service and Privacy Policy. Many free tools have "click-wrap" agreements that claim the right to use user data to improve their services (train models).

Unless there is a specific Data Privacy Agreement (DPA) in place between the district and the vendor that overrides these terms, using the tool with student accounts likely violates FERPA (unauthorized disclosure) and state laws regarding data ownership. The district should block the tool until a DPA is signed or a compliant alternative is found.',
   ARRAY['free tools', 'SSO', 'click-wrap', 'Terms of Service', 'FERPA', 'data ownership', 'shadow AI'],
   'high', 10, true),

  ('Accessibility', 'How can AI assist in meeting the new ADA Title II digital accessibility requirements?',
   'AI can be a powerful assistive tool for compliance. It can be used to:
1. **Generate Alt Text:** Automatically suggest descriptions for images, which human editors can then refine.
2. **Closed Captioning:** Provide real-time transcription and captioning for videos and lectures.
3. **Remediation:** Scan code or documents to identify WCAG violations (e.g., missing headings, poor contrast) and suggest fixes.
However, human oversight is required to ensure the AI-generated accommodations (like alt text) are accurate and contextually appropriate.',
   ARRAY['ADA Title II', 'assistive technology', 'alt text', 'captioning', 'WCAG compliance', 'AI remediation'],
   'high', 9, true),

  ('Policy Development', 'What should be included in the "Academic Integrity" section of a student handbook regarding AI?',
   'The policy should define "unauthorized assistance" to include the use of Generative AI to produce work submitted as one''s own without attribution. It should:
1. **Require Citation:** Mandate that students cite AI tools just as they would any other source.
2. **Define Scope:** Clarify that AI usage is only permitted when explicitly authorized by the instructor (Traffic Light model).
3. **Focus on Originality:** State that students are responsible for the accuracy and originality of any work submitted, regardless of the tools used.
4. **Consequences:** Align consequences for misuse with existing plagiarism protocols, focusing on learning opportunities rather than purely punitive measures.',
   ARRAY['academic integrity', 'plagiarism', 'citation', 'attribution', 'student handbook', 'policy definitions'],
   'high', 10, true),

  ('Vendor Evaluation', 'What is a "VPAT" or "ACR," and why do we need it for AI tools?',
   'A VPAT (Voluntary Product Accessibility Template) is a document where a vendor self-discloses how their product meets accessibility standards (Section 508/WCAG). When completed, it becomes an ACR (Accessibility Conformance Report).

Districts need this to ensure compliance with ADA Title II. Before purchasing an AI tool, you must review its ACR to verify it meets **WCAG 2.1 Level AA** standards. If the tool is not accessible (e.g., not compatible with screen readers), purchasing it creates legal liability and excludes students with disabilities.',
   ARRAY['VPAT', 'ACR', 'accessibility', 'WCAG', 'ADA Title II', 'procurement', 'vendor evaluation'],
   'high', 10, true),

  ('Special Populations', 'Can AI tools be used to translate materials for parents with limited English proficiency (LEP)?',
   'Yes, but with safeguards. AI translation tools can facilitate communication, but they are not a substitute for professional translation in high-stakes situations (e.g., IEP meetings, legal notices). OCR guidance warns that AI translations may lack nuance or accuracy.

If using AI for routine communication, include a disclaimer that the text was AI-translated. For critical documents involving parent rights or consent, districts must ensure the translation is reviewed by a qualified human or use certified translation services to meet civil rights obligations.',
   ARRAY['translation', 'LEP', 'parents', 'civil rights', 'accuracy', 'disclaimer', 'communication'],
   'high', 9, true),

  ('Practical Procedures', 'How do we handle a parent request to "inspect and review" AI-generated data about their child?',
   'Under FERPA and state laws (like Utah''s), parents have the right to inspect education records within 45 days. If an AI tool stores data linked to the student (e.g., chat logs, adaptive learning profiles), this constitutes an education record.

The Data Manager must:
1. Retrieve the data from the vendor (requiring the vendor to have data portability features).
2. Review the data to redact information about *other* students if it is comingled (e.g., in a group chat log).
3. Provide the data to the parent in a readable format. If the data is an opaque algorithmic score, the district may need to provide an explanation of how the score was derived.',
   ARRAY['parent rights', 'FERPA', 'data access', 'education record', 'data portability', 'redaction'],
   'high', 10, true),

  ('Federal Laws', 'Does CIPA require us to filter or monitor AI usage?',
   'Yes. The Children''s Internet Protection Act (CIPA) requires schools receiving E-Rate funding to filter access to content that is obscene, child pornography, or harmful to minors. Since Generative AI can produce such content, districts must ensure their content filters block access to non-educational or unsafe AI sites.

Furthermore, CIPA requires monitoring the online activities of minors. This extends to AI interactions. Districts should use "Walled Garden" AI tools that provide audit logs and monitoring capabilities to ensure students are not accessing or generating harmful content.',
   ARRAY['CIPA', 'filtering', 'monitoring', 'harmful content', 'E-Rate', 'compliance'],
   'high', 10, true),

  ('AI Governance', 'Who should be responsible for approving new AI tools in the district?',
   'Approval should not be the sole responsibility of a single IT director or teacher. Best practice involves a cross-functional **AI Governance Committee** or Task Force.

This team should include:
**Curriculum/Instruction:** To evaluate pedagogical value.
**IT/Security:** To evaluate technical security and CIPA compliance.
**Data Privacy Officer:** To ensure FERPA/COPPA compliance.
**Legal Counsel:** To review Terms of Service and liability.
**Special Education:** To ensure accessibility and non-discrimination.
This ensures a holistic review covering all risks before a tool enters the classroom.',
   ARRAY['governance committee', 'stakeholders', 'approval workflow', 'cross-functional team', 'leadership'],
   'high', 10, true),

  ('State Privacy Laws', 'Can we use biometric data (e.g., facial recognition for attendance) if it is AI-powered?',
   'In Utah, this is heavily restricted. The collection of biometric identifiers (which includes face geometry used in AI recognition) requires **separate, specific written consent** from the parent. It is classified as "Optional Student Data" and cannot be collected under a general enrollment consent.

Additionally, OCR warns that AI facial recognition often has high error rates for students of color, posing a civil rights risk. Therefore, even with consent, its use is discouraged due to potential discrimination and high privacy liability.',
   ARRAY['biometrics', 'facial recognition', 'consent', 'optional data', 'civil rights', 'discrimination', 'Utah law'],
   'high', 10, true),

  ('Edge Cases', 'Are "click-wrap" agreements (checking a box to agree to terms) legally binding for school districts?',
   'They can be binding, but they often put the district at risk. Click-wrap agreements often contain clauses that violate state and federal laws, such as indemnification clauses (which schools often cannot agree to), governing law in a different state, or rights to sell/use data.

Because individual teachers do not have the authority to bind the district to these contracts, relying on click-wrap for AI tools creates "Shadow AI" risk. Districts should negotiate a signed Data Privacy Agreement (DPA) that supersedes the click-wrap terms to ensure compliance.',
   ARRAY['click-wrap', 'terms of service', 'contracts', 'DPA', 'liability', 'shadow AI', 'indemnification'],
   'high', 10, true)
) AS v(category, question, answer, tags, confidence_level, priority, active)
WHERE NOT EXISTS (
  SELECT 1 FROM public.knowledge_base kb WHERE kb.question = v.question
);
