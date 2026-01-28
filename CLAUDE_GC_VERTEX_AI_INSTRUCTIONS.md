# Instructions for Claude Chrome Extension
## Google Cloud & Vertex AI Infrastructure Alignment

---

## 🎯 Your Mission

You are tasked with helping align and organize WasatchWise's corporate infrastructure across:
1. **Google Cloud Platform (GCP)** - Projects, IAM, billing, services
2. **Vertex AI** - Models, endpoints, datasets, pipelines
3. **All related plans and configurations** accessible from the browser

Your goal is to:
- **Audit** current infrastructure state
- **Organize** projects and resources logically
- **Document** configurations and relationships
- **Identify revenue generation opportunities** (primary focus)
- **Map revenue-generating capabilities** from existing infrastructure
- **Identify underutilized resources** that could generate revenue
- **Create** a comprehensive infrastructure map
- **Update** the infrastructure snapshot document

---

## 📋 Current Infrastructure Baseline

**Reference Documents:**
- `INFRASTRUCTURE_SNAPSHOT.md` - Current GCP/Vertex AI infrastructure state
- `TECH_STACK_AUDIT.md` - Complete tech stack audit (30+ services)
- `REVENUE_OPPORTUNITIES.md` - Revenue generation opportunities and strategy

**Key Facts (as of December 2025):**
- **Organization:** wasatchwise.com (ID: 810144673916)
- **Total Monthly Cost:** $15.42 (Minimal overhead - excellent for revenue generation)
- **Active Projects:** 6
- **Folder Structure:** Environment-based (10-sandbox, 20-dev, 30-stage, 40-prod, SLCTrips, system-gsuite)
- **Primary Revenue Project:** SLCTrips ($15.39/month cost, generating revenue)
- **Vertex AI:** Minimal usage ($0.02/month) but fully configured - HIGH revenue potential
- **Enabled APIs:** 49 in Wasatch Wise HQ project - ready for service offerings

**When performing audits:**
- Compare current state to baseline
- Note any changes or new resources
- **PRIMARY FOCUS: Revenue opportunities** - Identify how infrastructure can generate revenue
- **Identify underutilized revenue potential** - What services could be monetized?
- **Reference TECH_STACK_AUDIT.md** for complete tech stack context (30+ services)
- **Reference REVENUE_OPPORTUNITIES.md** for revenue strategy context
- **Key Revenue Drivers Identified:**
  - Content Creation (HeyGen + ElevenLabs) - HIGHEST potential
  - Vertex AI Services - HIGH potential
  - NotebookLM Knowledge Management - HIGH potential
  - NDPA Compliance Services - HIGH potential
  - Multi-Property Portfolio - HIGH potential
- Update the snapshot document with new findings
- Highlight revenue-generating patterns and opportunities
- Update revenue opportunities document with new discoveries

---

## 📚 Key Resources to Access

### Google Cloud Console
- **Main Console:** https://console.cloud.google.com
- **IAM & Admin:** https://console.cloud.google.com/iam-admin
- **Billing:** https://console.cloud.google.com/billing
- **APIs & Services:** https://console.cloud.google.com/apis/dashboard
- **Service Accounts:** https://console.cloud.google.com/iam-admin/serviceaccounts

### Vertex AI Console
- **Vertex AI Dashboard:** https://console.cloud.google.com/vertex-ai
- **Models:** https://console.cloud.google.com/vertex-ai/models
- **Endpoints:** https://console.cloud.google.com/vertex-ai/endpoints
- **Datasets:** https://console.cloud.google.com/vertex-ai/datasets
- **Pipelines:** https://console.cloud.google.com/vertex-ai/pipelines
- **Workbench:** https://console.cloud.google.com/vertex-ai/workbench

### Additional Resources
- **Cloud Resource Manager:** https://console.cloud.google.com/cloud-resource-manager
- **Cloud Monitoring:** https://console.cloud.google.com/monitoring
- **Cloud Logging:** https://console.cloud.google.com/logs
- **Cloud Storage:** https://console.cloud.google.com/storage

---

## 🔍 Phase 1: Infrastructure Discovery & Audit

### Step 1: Project Inventory

**Action Items:**
1. Navigate to **Cloud Resource Manager:** https://console.cloud.google.com/cloud-resource-manager
2. List all GCP projects associated with WasatchWise
3. For each project, document:
   - **Project ID** and **Project Name**
   - **Project Number**
   - **Organization/Resource Hierarchy** (if applicable)
   - **Billing Account** linked
   - **Creation Date**
   - **Labels/Tags** (if any)
   - **Status** (Active, Pending Delete, etc.)

**Documentation Format:**
```
Project: [Project Name]
├── Project ID: [id]
├── Project Number: [number]
├── Billing: [Billing Account Name]
├── Created: [Date]
├── Purpose: [Description]
└── Status: [Active/Inactive]
```

### Step 2: Billing & Cost Analysis

**Action Items:**
1. Navigate to **Billing:** https://console.cloud.google.com/billing
2. List all billing accounts
3. For each billing account:
   - Document **Billing Account ID** and **Name**
   - Check **Linked Projects**
   - Review **Current Month Costs**
   - Identify **Top Cost Services**
   - Note **Budget Alerts** (if any)
   - Check **Payment Method**

**Documentation Format:**
```
Billing Account: [Name]
├── Account ID: [id]
├── Linked Projects: [List]
├── Current Month Cost: $[amount]
├── Top Services:
│   ├── [Service 1]: $[amount]
│   ├── [Service 2]: $[amount]
│   └── [Service 3]: $[amount]
└── Budget Alerts: [Yes/No]
```

### Step 3: IAM & Access Control Audit

**Action Items:**
1. Navigate to **IAM & Admin:** https://console.cloud.google.com/iam-admin/iam
2. For each project, document:
   - **Service Accounts** (list all)
   - **Principals** (users, groups, domains)
   - **Roles** assigned
   - **Custom Roles** (if any)
   - **Organization Policies** (if applicable)

**Documentation Format:**
```
Project: [Project Name]
├── Service Accounts:
│   ├── [SA Name] - [Purpose] - [Roles]
│   └── [SA Name] - [Purpose] - [Roles]
├── Users/Groups:
│   ├── [Email] - [Roles]
│   └── [Email] - [Roles]
└── Custom Roles: [List]
```

### Step 4: Enabled APIs & Services

**Action Items:**
1. Navigate to **APIs & Services:** https://console.cloud.google.com/apis/dashboard
2. For each project, list:
   - **All Enabled APIs**
   - **API Quotas** and **Usage**
   - **API Keys** (note which are restricted)
   - **OAuth 2.0 Clients** (if any)

**Documentation Format:**
```
Project: [Project Name]
├── Enabled APIs:
│   ├── [API Name] - [Status] - [Quota: X/Y]
│   └── [API Name] - [Status] - [Quota: X/Y]
├── API Keys: [Count]
└── OAuth Clients: [Count]
```

---

## 🤖 Phase 2: Vertex AI Infrastructure Audit

### Step 1: Vertex AI Models Inventory

**Action Items:**
1. Navigate to **Vertex AI Models:** https://console.cloud.google.com/vertex-ai/models
2. For each project, document all models:
   - **Model Name** and **ID**
   - **Model Type** (AutoML, Custom, Pre-trained)
   - **Framework** (TensorFlow, PyTorch, etc.)
   - **Region** where deployed
   - **Creation Date**
   - **Status** (Active, Archived)
   - **Training Job** (if applicable)
   - **Version** information

**Documentation Format:**
```
Model: [Model Name]
├── Model ID: [id]
├── Type: [AutoML/Custom/Pre-trained]
├── Framework: [Framework]
├── Region: [Region]
├── Created: [Date]
├── Status: [Active/Archived]
└── Versions: [List]
```

### Step 2: Vertex AI Endpoints

**Action Items:**
1. Navigate to **Vertex AI Endpoints:** https://console.cloud.google.com/vertex-ai/endpoints
2. Document all endpoints:
   - **Endpoint Name** and **ID**
   - **Region**
   - **Deployed Models** (which models are deployed)
   - **Traffic Split** (if multiple models)
   - **Creation Date**
   - **Status**
   - **Endpoint URL** (if available)

**Documentation Format:**
```
Endpoint: [Endpoint Name]
├── Endpoint ID: [id]
├── Region: [Region]
├── Deployed Models:
│   ├── [Model 1] - [Traffic: X%]
│   └── [Model 2] - [Traffic: Y%]
├── Status: [Active/Inactive]
└── URL: [Endpoint URL]
```

### Step 3: Vertex AI Datasets

**Action Items:**
1. Navigate to **Vertex AI Datasets:** https://console.cloud.google.com/vertex-ai/datasets
2. Document all datasets:
   - **Dataset Name** and **ID**
   - **Dataset Type** (Image, Text, Video, Tabular, etc.)
   - **Region**
   - **Storage Location** (GCS bucket)
   - **Size** (if available)
   - **Creation Date**
   - **Status**
   - **Labels/Annotations** (if applicable)

**Documentation Format:**
```
Dataset: [Dataset Name]
├── Dataset ID: [id]
├── Type: [Type]
├── Region: [Region]
├── Storage: [GCS Bucket]
├── Size: [Size]
├── Created: [Date]
└── Status: [Active/Archived]
```

### Step 4: Vertex AI Pipelines

**Action Items:**
1. Navigate to **Vertex AI Pipelines:** https://console.cloud.google.com/vertex-ai/pipelines
2. Document all pipelines:
   - **Pipeline Name** and **ID**
   - **Pipeline Type** (Kubeflow, TensorFlow Extended, etc.)
   - **Region**
   - **Last Run Date**
   - **Status** (Active, Failed, etc.)
   - **Schedule** (if scheduled)
   - **Components** (if visible)

**Documentation Format:**
```
Pipeline: [Pipeline Name]
├── Pipeline ID: [id]
├── Type: [Type]
├── Region: [Region]
├── Last Run: [Date]
├── Status: [Status]
└── Schedule: [Schedule/Manual]
```

### Step 5: Vertex AI Workbench Instances

**Action Items:**
1. Navigate to **Vertex AI Workbench:** https://console.cloud.google.com/vertex-ai/workbench
2. Document all instances:
   - **Instance Name** and **ID**
   - **Region**
   - **Machine Type**
   - **Status** (Running, Stopped, etc.)
   - **Creation Date**
   - **Owner** (if visible)

**Documentation Format:**
```
Workbench Instance: [Instance Name]
├── Instance ID: [id]
├── Region: [Region]
├── Machine Type: [Type]
├── Status: [Status]
└── Created: [Date]
```

---

## 💰 Phase 3: Revenue Generation Opportunities (PRIMARY FOCUS)

### Step 1: Identify Revenue-Generating Resources

**Action Items:**
1. For each project, identify:
   - **Active Revenue Streams** (what's currently generating revenue)
   - **Potential Revenue Streams** (what could generate revenue)
   - **Underutilized Revenue Potential** (infrastructure ready but not monetized)

2. Focus Areas:
   - **Vertex AI Services** - What AI capabilities can be packaged as services?
   - **API Services** - Which APIs enable revenue-generating features?
   - **Active Projects** - How can current projects generate more revenue?
   - **Underutilized Projects** - What revenue models could be applied?

**Documentation Format:**
```
Revenue Opportunity: [Service/Feature Name]
├── Current State: [Active/Underutilized/Not Started]
├── Revenue Potential: [High/Medium/Low]
├── Infrastructure Ready: [Yes/No]
├── Revenue Model: [Subscription/Usage-based/One-time/Consulting]
├── Target Market: [Description]
└── Next Steps: [Action items]
```

### Step 2: Vertex AI Revenue Opportunities

**Action Items:**
1. Analyze Vertex AI resources for revenue potential:
   - **Models** - Can these be deployed as paid services?
   - **Endpoints** - Can these serve client applications?
   - **RAG/Vector Search** - Can these be packaged as enterprise solutions?
   - **Agent Builder** - Can custom agents be sold as services?
   - **Workbench** - Can ML consulting services be offered?

2. Document:
   - Which models are production-ready
   - Which capabilities could be white-labeled
   - What pricing models could apply
   - What client use cases could be served

**Documentation Format:**
```
Vertex AI Revenue Service: [Service Name]
├── Capability: [Gemini/RAG/Vector Search/Agents/etc.]
├── Current Usage: [Minimal/Active/None]
├── Revenue Model: [API calls/Subscription/Consulting]
├── Target Clients: [Description]
├── Infrastructure Status: [Ready/Needs Setup]
└── Estimated Revenue Potential: [High/Medium/Low]
```

### Step 3: API-Based Revenue Services

**Action Items:**
1. Review all 49 enabled APIs and identify:
   - Which APIs enable revenue-generating features
   - Which APIs could support client services
   - Which APIs are underutilized but have revenue potential

2. Focus on:
   - **BigQuery** - Data analytics consulting services
   - **Cloud Functions/Run** - Serverless solutions for clients
   - **Firebase** - Mobile/web app development services
   - **Vision AI** - Image analysis services
   - **Places API** - Already generating revenue via SLCTrips - can it scale?

**Documentation Format:**
```
API Revenue Opportunity: [API Name]
├── Current Usage: [Active/Underutilized/Not Used]
├── Revenue Potential: [High/Medium/Low]
├── Service Offering: [Description]
├── Target Market: [Description]
└── Implementation Effort: [Low/Medium/High]
```

### Step 4: Project Revenue Analysis

**Action Items:**
1. For each of the 6 projects, analyze:
   - **Current Revenue Status** (generating revenue or not)
   - **Revenue Model** (if applicable)
   - **Scaling Potential** (can it generate more revenue?)
   - **New Revenue Opportunities** (what could be added?)

2. Special focus on:
   - **SLCTrips** - Currently active, how can it scale?
   - **Wasatch Wise HQ** - Underutilized, what revenue services could it support?
   - **The Rock Salt, DAiTE, Adult-AI-Academy** - What revenue models apply?

**Documentation Format:**
```
Project Revenue Analysis: [Project Name]
├── Current Revenue: [Yes/No] - [Amount if known]
├── Revenue Model: [Subscription/Ads/API/Consulting/etc.]
├── Scaling Potential: [High/Medium/Low]
├── New Opportunities: [List]
└── Infrastructure Support: [What infrastructure supports revenue?]
```

### Step 5: Create Revenue Service Catalog

**Action Items:**
1. Compile all revenue opportunities into a service catalog
2. Organize by:
   - **Ready to Deploy** (infrastructure ready, can start immediately)
   - **Needs Development** (infrastructure ready, needs product development)
   - **Needs Infrastructure** (concept ready, needs setup)

3. For each service, document:
   - Service description
   - Target market
   - Revenue model
   - Infrastructure requirements
   - Estimated revenue potential
   - Implementation timeline

**Documentation Format:**
```
Revenue Service Catalog
│
├── Ready to Deploy
│   ├── [Service 1] - [Revenue Model] - [Potential]
│   └── [Service 2] - [Revenue Model] - [Potential]
│
├── Needs Development
│   ├── [Service 3] - [Revenue Model] - [Potential]
│   └── [Service 4] - [Revenue Model] - [Potential]
│
└── Needs Infrastructure
    ├── [Service 5] - [Revenue Model] - [Potential]
    └── [Service 6] - [Revenue Model] - [Potential]
```

---

## 📊 Phase 4: Resource Organization & Mapping

### Step 1: Create Infrastructure Map

**Action Items:**
1. Create a visual/textual map showing:
   - **Project Hierarchy** (if using folders/organizations)
   - **Resource Relationships** (which projects use which services)
   - **Data Flow** (datasets → models → endpoints)
   - **Dependencies** (APIs, service accounts, storage buckets)

**Documentation Format:**
```
WasatchWise Infrastructure Map
│
├── Organization: [Name] (if applicable)
│   │
│   ├── Project: [Project 1]
│   │   ├── Vertex AI Models: [Count]
│   │   ├── Vertex AI Endpoints: [Count]
│   │   ├── Datasets: [Count]
│   │   ├── Storage Buckets: [Count]
│   │   └── APIs Enabled: [List]
│   │
│   ├── Project: [Project 2]
│   │   └── [Similar structure]
│   │
│   └── Project: [Project 3]
│       └── [Similar structure]
│
└── Billing Accounts: [List]
```

### Step 2: Identify Resource Naming Patterns

**Action Items:**
1. Analyze naming conventions across:
   - Projects
   - Service Accounts
   - Models
   - Endpoints
   - Datasets
   - Storage Buckets
2. Document:
   - **Current Patterns** (if any)
   - **Inconsistencies**
   - **Recommendations** for standardization

### Step 3: Revenue Scaling Opportunities

**Action Items:**
1. Review infrastructure capacity and identify:
   - **Ready to Scale** (resources that can handle more revenue-generating traffic)
   - **Needs Scaling** (resources that need upgrade to support revenue growth)
   - **Underutilized Capacity** (infrastructure ready but not generating revenue)

2. Focus on revenue-generating resources:
   - **SLCTrips** - How can Places API usage scale to generate more revenue?
   - **Vertex AI** - How can AI services scale to serve more clients?
   - **Cloud Run/Functions** - How can serverless scale for client services?
   - **BigQuery** - How can data services scale for consulting revenue?

3. Document scaling opportunities

**Documentation Format:**
```
Revenue Scaling Opportunities
│
├── Ready to Scale (Infrastructure Ready):
│   ├── [Service]: [Current Usage] - [Revenue Potential] - [Scaling Plan]
│   └── [Service]: [Current Usage] - [Revenue Potential] - [Scaling Plan]
│
├── Needs Infrastructure Scaling:
│   ├── [Service]: [Current Capacity] - [Needed Capacity] - [Revenue Impact]
│   └── [Service]: [Current Capacity] - [Needed Capacity] - [Revenue Impact]
│
└── Underutilized Revenue Potential:
    ├── [Resource]: [Current State] - [Revenue Opportunity] - [Action Needed]
    └── [Resource]: [Current State] - [Revenue Opportunity] - [Action Needed]
```

---

## 🗂️ Phase 4: Documentation & Organization

### Step 1: Create Resource Registry

**Action Items:**
1. Create a comprehensive registry document with:
   - **All Projects** (with full details)
   - **All Vertex AI Resources** (models, endpoints, datasets, pipelines)
   - **All Service Accounts** (with purposes)
   - **All APIs** (enabled per project)
   - **All Storage Buckets** (if accessible)
   - **All Billing Accounts** (with linked projects)

### Step 2: Document Relationships

**Action Items:**
1. Map relationships:
   - Which **models** are deployed to which **endpoints**
   - Which **datasets** were used to train which **models**
   - Which **pipelines** produce which **models**
   - Which **projects** share which **resources**
   - Which **service accounts** are used by which **services**

### Step 3: Create Revenue-Focused Action Plan

**Action Items:**
1. Based on audit findings, create a revenue-focused action plan:
   - **Immediate Revenue Opportunities** (ready to deploy, can start generating revenue now)
   - **Short-term Revenue Growth** (needs development, 1-3 months)
   - **Long-term Revenue Strategy** (needs infrastructure/planning, 3-6+ months)
   - **Revenue Scaling Plans** (how to scale existing revenue streams)

2. Prioritize by:
   - Revenue potential (High/Medium/Low)
   - Implementation effort (Low/Medium/High)
   - Infrastructure readiness (Ready/Needs Setup)
   - Time to revenue (Immediate/Short-term/Long-term)

**Documentation Format:**
```
Revenue Action Plan
│
├── Immediate (Start Now):
│   ├── [Opportunity] - [Revenue Potential] - [Effort] - [Timeline]
│   └── [Opportunity] - [Revenue Potential] - [Effort] - [Timeline]
│
├── Short-term (1-3 months):
│   ├── [Opportunity] - [Revenue Potential] - [Effort] - [Timeline]
│   └── [Opportunity] - [Revenue Potential] - [Effort] - [Timeline]
│
└── Long-term (3-6+ months):
    ├── [Opportunity] - [Revenue Potential] - [Effort] - [Timeline]
    └── [Opportunity] - [Revenue Potential] - [Effort] - [Timeline]
```

---

## 🔧 Tools & Techniques

### Browser DevTools
- **Network Tab:** Monitor API calls to GCP/Vertex AI
- **Console:** Check for JavaScript errors in console
- **Application Tab:** Check stored credentials/cookies (if any)

### Screenshots
- Take screenshots of:
  - Project lists
  - Resource dashboards
  - Cost breakdowns
  - Configuration pages
  - Error messages (if any)

### Data Extraction
- Use browser's **Copy** functionality to extract:
  - Project IDs
  - Resource names
  - Configuration values
  - Cost data
- Use **Export** features in GCP console when available

---

## 📋 Comprehensive Checklist

### Google Cloud Platform
- [ ] All projects inventoried
- [ ] Billing accounts documented
- [ ] IAM roles and service accounts listed
- [ ] Enabled APIs cataloged
- [ ] Resource hierarchy mapped
- [ ] Cost analysis completed
- [ ] Optimization opportunities identified

### Vertex AI
- [ ] All models documented
- [ ] All endpoints cataloged
- [ ] All datasets listed
- [ ] All pipelines inventoried
- [ ] All workbench instances documented
- [ ] Model-to-endpoint relationships mapped
- [ ] Dataset-to-model relationships mapped

### Organization
- [ ] Infrastructure map created
- [ ] Naming patterns analyzed
- [ ] Resource registry completed
- [ ] Relationships documented
- [ ] Action plan created
- [ ] Recommendations documented

---

## 📊 Deliverables

### Primary Deliverable: Update INFRASTRUCTURE_SNAPSHOT.md

**Your main task is to update the existing snapshot document** (`INFRASTRUCTURE_SNAPSHOT.md`) with:
- Any changes since December 2025
- New resources discovered
- Updated cost data
- New projects or folder assignments
- Changes to Vertex AI usage
- New APIs enabled/disabled

### Additional Report (if significant changes found)

If you discover significant changes, create a **Change Report** with:

1. **Executive Summary**
   - Total projects: [X] (compare to baseline: 6)
   - Total Vertex AI models: [X]
   - Total endpoints: [X]
   - Total monthly cost: $[X] (compare to baseline: $15.42)
   - Key changes: [List]

2. **Changes Detected**
   - New projects
   - Deleted/archived projects
   - Cost changes (increase/decrease)
   - New Vertex AI resources
   - API changes
   - Folder structure changes

3. **Updated Infrastructure Inventory**
   - Complete project list (with folder assignments)
   - Complete Vertex AI resource list
   - Service accounts registry
   - APIs enabled per project

4. **Revenue Opportunities Analysis**
   - Revenue-generating resources identified
   - Revenue service catalog
   - Revenue scaling opportunities
   - Estimated revenue potential
   - Current spending (for context - overhead is minimal at $15.42/month)

5. **Revenue-Focused Action Plan**
   - Immediate revenue opportunities (ready to deploy)
   - Short-term revenue growth (1-3 months)
   - Long-term revenue strategy (3-6+ months)
   - Revenue scaling plans

6. **Screenshots**
   - Key dashboards
   - Resource lists
   - Cost breakdowns
   - Configuration pages
   - Any new/changed resources

---

## 🎯 Success Criteria

**Mission is Successful When:**
- ✅ All GCP projects are documented
- ✅ All Vertex AI resources are cataloged
- ✅ Infrastructure relationships are mapped
- ✅ **Revenue generation opportunities identified (PRIMARY GOAL)**
- ✅ **Revenue service catalog created**
- ✅ **Revenue scaling plans documented**
- ✅ Comprehensive documentation created
- ✅ Revenue-focused action plan provided
- ✅ All screenshots captured

---

## 🚨 Important Notes

### Security
- **DO NOT** share service account keys or credentials
- **DO NOT** modify IAM roles without authorization
- **DO NOT** delete any resources
- **ONLY** document and analyze - do not make changes

### Access
- If you encounter access denied errors, note them
- Some resources may require additional permissions
- Document what you can access vs. what you cannot

### Data Privacy
- Be mindful of sensitive data in:
  - Dataset names/descriptions
  - Model names (may reveal business logic)
  - Project names (may reveal internal structure)
- Document structure, not sensitive details

---

## 📞 If You Encounter Issues

1. **Access Denied:**
   - Note which resources you cannot access
   - Document permission requirements
   - Continue with accessible resources

2. **Too Many Resources:**
   - Focus on active resources first
   - Group similar resources
   - Use filters in console to narrow scope

3. **Missing Information:**
   - Document what's available
   - Note what's missing
   - Suggest where to find additional info

---

## 🚀 Getting Started

1. **Read the Baseline First**
   - Open `INFRASTRUCTURE_SNAPSHOT.md`
   - Familiarize yourself with current state
   - Note what to verify/update

2. **Start with Project Inventory**
   - Navigate to Cloud Resource Manager
   - Verify all 6 projects still exist
   - Check for any new projects
   - Verify folder assignments
   - Compare to baseline

3. **Verify Cost Data**
   - Navigate to Billing console
   - Check current month costs
   - Compare to baseline ($15.42/month)
   - Note any significant changes

4. **Check Vertex AI Usage**
   - Navigate to Vertex AI dashboard
   - Verify models, endpoints, datasets
   - Check usage statistics
   - Compare to baseline (minimal usage)

5. **Take Screenshots Frequently**
   - Document your progress
   - Capture important information
   - Create visual record
   - Screenshot any changes from baseline

6. **Organize as You Go**
   - Use consistent naming
   - Group related resources
   - Build the map incrementally
   - Note discrepancies from baseline

7. **Update the Snapshot**
   - Update `INFRASTRUCTURE_SNAPSHOT.md` with findings
   - Highlight changes in a "Changes Since Last Audit" section
   - Update dates and version numbers
   - Preserve historical data

---

**Good luck with the infrastructure alignment! 🎉**

Remember:
- Be thorough and systematic
- Document everything you find
- Take screenshots for reference
- Organize information logically
- Provide actionable recommendations
- Focus on alignment and optimization
