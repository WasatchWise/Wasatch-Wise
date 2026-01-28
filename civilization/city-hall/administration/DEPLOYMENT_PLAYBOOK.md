# Business REALMS: Deployment Playbook

## 10-Day Realm Deployment

**Target:** From completed intake questionnaire to live realm in 10 business days.

---

## Pre-Deployment Checklist

Before starting the deployment clock:

- [ ] Intake questionnaire completed
- [ ] Genre recommendation confirmed with client
- [ ] Tier/pricing agreed and deposit received
- [ ] Integration credentials provided (or test mode enabled)
- [ ] Brand assets received (or defaults confirmed)
- [ ] Kickoff call scheduled

---

## Day 1-2: Discovery & Configuration

### Day 1 Morning: Kickoff Call (60 min)
- [ ] Review questionnaire together
- [ ] Confirm building list and priorities
- [ ] Walk through genre options, finalize selection
- [ ] Identify any gaps in questionnaire
- [ ] Set expectations for 10-day timeline

### Day 1 Afternoon: Configuration Files

**Create realm directory:**
```bash
mkdir -p /realms/[client-slug]/{docs,assets,src,config}
```

**Generate configuration files:**

1. `realm.config.js`
```javascript
// Generated from questionnaire
export default {
  id: '[client-slug]',
  name: '[Realm Name]',
  genre: '[selected-genre]',
  owner: '[Owner Name]',
  company: '[Company Name]',
  
  // Colors from questionnaire or defaults
  colors: {
    primary: '#[hex]',
    secondary: '#[hex]',
    accent: '#[hex]',
    background: '#[hex]',
  },
  
  // Features enabled
  features: {
    residents: [true/false],
    infrastructure: [true/false],
    // ... based on tier
  },
  
  // Integration flags
  integrations: {
    // ... from questionnaire
  },
}
```

2. `buildings.config.js` - Map each building from questionnaire
3. `agents.config.js` - Configure agents based on selections

**Document decisions:**
- [ ] Create `REALM_SPEC.md` from questionnaire
- [ ] Create `BUILDING_REGISTRY.md` from building list
- [ ] Create `AGENT_ROSTER.md` from agent selections

### Day 2: Genre Template Clone

**Clone appropriate genre template:**
```bash
cp -r /templates/genres/[genre]/* /realms/[client-slug]/src/
```

**Apply configuration:**
- [ ] Update component imports to use client config
- [ ] Replace placeholder names with client names
- [ ] Apply color palette
- [ ] Verify genre-specific components load

**First visual test:**
- [ ] Realm loads with placeholder data
- [ ] All buildings render in correct positions
- [ ] Genre aesthetic matches selection
- [ ] Basic navigation works

**Client checkpoint (optional):**
- [ ] Screenshot or video of initial layout
- [ ] Quick Slack/email update: "Your realm is taking shape!"

---

## Day 3-4: Data Integration

### Day 3: Primary Integrations

**For each Must Have integration from questionnaire:**

1. **Connect data source:**
```javascript
// Example: Stripe connection
import { connectStripe } from '@/integrations/stripe';

const stripeData = await connectStripe({
  apiKey: process.env.CLIENT_STRIPE_KEY,
  accountId: config.integrations.stripe.accountId,
});
```

2. **Map to building metrics:**
```javascript
// Map Stripe revenue to Building 1
buildings[0].metrics.revenue = stripeData.mrr;
```

3. **Test data flow:**
- [ ] Data fetches successfully
- [ ] Transforms apply correctly
- [ ] Building metrics update
- [ ] Error handling works

**Integration log:**
- [ ] Document each connection in `INTEGRATION_LOG.md`
- [ ] Note API versions, rate limits, gotchas

### Day 4: Secondary Integrations & Fallbacks

**Complete remaining integrations:**
- [ ] Nice-to-have integrations
- [ ] Manual entry fallbacks for missing data
- [ ] Error states and loading states

**Data refresh setup:**
- [ ] Configure refresh intervals per questionnaire
- [ ] Set up webhooks where available
- [ ] Test real-time updates

**Full data test:**
- [ ] All buildings show real data (or realistic test data)
- [ ] Metrics update on schedule
- [ ] No console errors

---

## Day 5-6: Agent Configuration

### Day 5: Agent Setup

**For each agent in roster:**

1. **Create agent configuration:**
```javascript
// agents/[agent-id].config.js
export default {
  id: '[agent-id]',
  name: '[Agent Name]',
  role: '[Role]',
  buildingId: '[building-id]',
  
  personality: {
    traits: ['[from questionnaire]'],
    voice: '[from preferences]',
  },
  
  systemPrompt: `
    You are [name], the [role] for [company].
    [Customized based on client context]
  `,
  
  dataAccess: ['[sources]'],
}
```

2. **Configure CrewAI/LangChain agent:**
```python
from crewai import Agent

agent = Agent(
    role=config.role,
    goal=config.goal,
    backstory=config.systemPrompt,
    tools=[...configured tools...],
)
```

3. **Test agent responses:**
- [ ] Agent stays in character
- [ ] Agent has correct data access
- [ ] Agent responses match tone preferences
- [ ] Agent can answer building-specific questions

### Day 6: Agent Integration

**Wire agents to UI:**
- [ ] Building click triggers agent greeting
- [ ] Chat interface functional
- [ ] Agent can access building data
- [ ] Briefings generate correctly

**Test scenarios:**
- [ ] Morning briefing generation
- [ ] Building-specific questions
- [ ] Cross-building questions (Mayor)
- [ ] Alert triggering

**Agent refinement:**
- [ ] Adjust prompts based on test responses
- [ ] Fine-tune personality if needed
- [ ] Document final prompts in `AGENT_ROSTER.md`

---

## Day 7-8: Polish & Testing

### Day 7: Visual Polish

**Brand application:**
- [ ] Custom logo placed (or default confirmed)
- [ ] Color palette applied consistently
- [ ] Building sprites match genre
- [ ] Typography correct

**UI refinement:**
- [ ] Tooltips informative
- [ ] Click states clear
- [ ] Loading states graceful
- [ ] Mobile responsive (if in scope)

**Animation & feel:**
- [ ] Appropriate animations for genre
- [ ] Alert indicators visible
- [ ] State changes smooth

### Day 8: Comprehensive Testing

**Functional testing:**
| Test | Pass |
|------|------|
| All buildings render | ☐ |
| All metrics display | ☐ |
| Data refreshes correctly | ☐ |
| Agents respond appropriately | ☐ |
| Alerts trigger at thresholds | ☐ |
| Navigation works | ☐ |
| No console errors | ☐ |

**Edge case testing:**
| Test | Pass |
|------|------|
| Missing data handled | ☐ |
| API timeout handled | ☐ |
| Large numbers display | ☐ |
| Long text truncates | ☐ |
| Multiple rapid clicks | ☐ |

**Performance testing:**
| Metric | Target | Actual |
|--------|--------|--------|
| Initial load | < 3s | |
| Data refresh | < 1s | |
| Agent response | < 5s | |

---

## Day 9: Client Review

### Review Call (60-90 min)

**Walkthrough:**
- [ ] Tour all buildings
- [ ] Demonstrate metrics
- [ ] Show agent interactions
- [ ] Test with real scenarios

**Gather feedback:**
- [ ] Note all requested changes
- [ ] Categorize: Must fix vs Nice to have vs Future
- [ ] Agree on what's in scope for launch

**Feedback document:**
```markdown
## Client Review Feedback - [Date]

### Must Fix (Before Launch)
- [ ] Item 1
- [ ] Item 2

### Nice to Have (Day 10 if time)
- [ ] Item 3

### Future Enhancement
- [ ] Item 4

### Approved for Launch
☐ Client approval received
```

### Revision Window
- [ ] Address all Must Fix items
- [ ] Attempt Nice to Have items
- [ ] Document Future items in backlog

---

## Day 10: Launch

### Pre-Launch Checklist

**Technical:**
- [ ] All feedback addressed
- [ ] Final testing complete
- [ ] Production environment ready
- [ ] SSL certificate configured
- [ ] Domain/subdomain pointed

**Data:**
- [ ] Live API keys configured
- [ ] Webhooks active
- [ ] Initial data populated
- [ ] Refresh schedules active

**Access:**
- [ ] Client account created
- [ ] Password shared securely
- [ ] 2FA enabled (if applicable)

### Deployment

**Deploy to production:**
```bash
npm run realm:deploy -- --realm=[client-slug] --env=production
```

**Verify deployment:**
- [ ] Site loads at client URL
- [ ] All features functional
- [ ] No errors in logs

### Launch Call (30 min)

**Handoff:**
- [ ] Walk through live realm
- [ ] Show how to access
- [ ] Demonstrate key interactions
- [ ] Answer questions

**Training:**
- [ ] Provide documentation
- [ ] Schedule training session (if purchased)
- [ ] Share support contact

**Launch celebration:**
- [ ] Screenshot the live realm
- [ ] Client testimonial request
- [ ] Internal announcement

---

## Post-Launch

### Day 11-14: Stabilization

**Monitor:**
- [ ] Check error logs daily
- [ ] Verify data flows
- [ ] Agent response quality

**Quick fixes:**
- [ ] Address any immediate issues
- [ ] Adjust agent prompts if needed
- [ ] Fine-tune thresholds

### Day 30: Check-in

**30-day review:**
- [ ] Schedule call with client
- [ ] Review usage patterns
- [ ] Gather feedback
- [ ] Discuss enhancements

**Success metrics:**
- [ ] Daily active usage?
- [ ] Client satisfaction?
- [ ] Referral potential?

---

## Templates & Checklists

### Daily Stand-up Template
```
Day [X] of 10: [Client Name] Realm

Yesterday:
- [Completed items]

Today:
- [Planned items]

Blockers:
- [Any issues]

On track: ☐ Yes ☐ At risk ☐ No
```

### Handoff Document Template
```markdown
# [Realm Name] - Launch Handoff

## Access
- URL: [realm-url]
- Login: [credentials]

## Buildings
[List all buildings with descriptions]

## Agents
[List all agents with roles]

## Data Sources
[List integrations with refresh schedules]

## Known Issues
[Any known limitations]

## Support
- Contact: [support email]
- Hours: [availability]
- Response time: [SLA]

## Next Steps
[Upcoming enhancements, training, etc.]
```

---

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Data not refreshing | Check API credentials, rate limits |
| Agent off-character | Review and adjust system prompt |
| Building not rendering | Check sprite path, position config |
| Slow performance | Optimize data queries, add caching |
| Client unhappy with genre | Discuss alternatives, consider pivot |

### Escalation Path
1. Builder attempts resolution
2. Escalate to lead if unresolved in 2 hours
3. Client communication if timeline at risk
4. Executive notification if delivery date at risk

---

## Metrics & Improvement

### Track Per Deployment
| Metric | Target | Actual |
|--------|--------|--------|
| Total hours | 40 | |
| Days to deploy | 10 | |
| Client satisfaction | 4.5/5 | |
| Post-launch issues | < 3 | |

### Retrospective Questions
- What went well?
- What was harder than expected?
- What can we template better?
- What documentation was missing?
- How can we do this faster next time?

### Knowledge Capture
After each deployment:
- [ ] Update templates with new patterns
- [ ] Document new integration connectors
- [ ] Add to gotchas list
- [ ] Improve questionnaire if gaps found
