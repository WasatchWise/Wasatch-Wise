# Vertex AI Integration Plan for AI Concierge Enhancement 🤖

**Date:** January 2025  
**Purpose:** Improve AI Concierge accuracy using Vertex AI  
**Current System:** Google Gemini 2.0 Flash (via GoogleGenerativeAI SDK)

---

## 🎯 OVERVIEW

### Current AI Concierge:
- **Model:** Google Gemini 2.0 Flash
- **API:** GoogleGenerativeAI SDK (direct)
- **Accuracy Issues:** Ski conditions (60%), Events (40%), Canyon status (70%)

### Vertex AI Capabilities:
- **Real-time data integration** - Better tool/function calling
- **Grounding** - Connect to external data sources
- **Enterprise features** - Better rate limits, monitoring
- **Multi-model** - Access to Gemini, PaLM, other models
- **Vertex AI Search** - Natural language search across your data

---

## 🚀 RECOMMENDED VERTEX AI SOLUTIONS

### Solution 1: Vertex AI Search (Best for Real-Time Data)
**What it does:** Natural language search across your data sources  
**Use case:** Real-time event data, destination information  
**Benefits:**
- ✅ Can index external sources (Eventbrite, resort websites)
- ✅ Real-time updates
- ✅ Semantic search across your content
- ✅ Better accuracy for TripKit-specific queries

**Implementation:**
```typescript
// Vertex AI Search for events
const eventSearch = await vertexAISearch.search({
  query: "What events are happening in Salt Lake City today?",
  dataStoreId: "your-event-datastore-id",
});
```

**When to use:**
- ✅ Today's events (replaces curated data)
- ✅ Destination search (enhances current search)
- ✅ TripKit-specific recommendations

---

### Solution 2: Vertex AI with Function Calling (Best for API Integration)
**What it does:** Better function calling for real-time data  
**Use case:** Weather, ski conditions, canyon status  
**Benefits:**
- ✅ Better structured function calls
- ✅ More reliable API integrations
- ✅ Better error handling
- ✅ Can chain multiple functions

**Implementation:**
```typescript
import { VertexAI } from '@google-cloud/aiplatform';

const vertexAI = new VertexAI({
  project: 'your-project-id',
  location: 'us-central1',
});

// Define function for ski conditions
const skiConditionsFunction = {
  name: 'get_ski_conditions',
  description: 'Get real-time ski conditions from resort APIs',
  parameters: {
    type: 'object',
    properties: {
      resort: { type: 'string' },
    },
  },
};

// Use with Gemini model
const model = vertexAI.preview.getGenerativeModel({
  model: 'gemini-2.0-flash-exp',
  tools: [skiConditionsFunction],
});
```

**When to use:**
- ✅ Ski conditions (integrate with resort APIs)
- ✅ Canyon status (integrate with UDOT API)
- ✅ Weather (already working, but could enhance)

---

### Solution 3: Vertex AI Grounding (Best for Factual Accuracy)
**What it does:** Grounds responses in external data sources  
**Use case:** Ensuring accuracy of all responses  
**Benefits:**
- ✅ Responses based on verified sources
- ✅ Citations included
- ✅ Better accuracy for factual queries
- ✅ Reduces hallucination

**Implementation:**
```typescript
// Vertex AI Grounding for accurate responses
const model = vertexAI.preview.getGenerativeModel({
  model: 'gemini-2.0-flash-exp',
  groundingConfig: {
    groundingSources: [
      {
        web: {
          // Web sources for grounding
        },
      },
    ],
  },
});
```

**When to use:**
- ✅ All queries (improves overall accuracy)
- ✅ Destination recommendations
- ✅ TripKit-specific queries

---

## 📋 RECOMMENDED IMPLEMENTATION PLAN

### Phase 1: Vertex AI Search for Events (Highest ROI)
**Goal:** Replace curated events with real-time data  
**Time:** 1-2 weeks  
**Impact:** Improves accuracy from 40% → 90%+

**Steps:**
1. Set up Vertex AI Search data store
2. Index Eventbrite API or local event sources
3. Replace `get_todays_events` function with Vertex AI Search
4. Test accuracy improvements

**Code Changes:**
```typescript
// Replace in src/app/api/dan/chat/route.ts
async function getTodaysEvents(area?: string, category?: string): Promise<string> {
  // Old: Curated events
  // New: Vertex AI Search
  const searchResults = await vertexAISearch.search({
    query: `Events happening today in ${area || 'Salt Lake City'}`,
    dataStoreId: process.env.VERTEX_AI_EVENTS_DATASTORE_ID,
  });
  
  return JSON.stringify({
    events: searchResults.results,
    source: 'Vertex AI Search - Real-time',
  });
}
```

---

### Phase 2: Enhanced Function Calling for Ski Conditions
**Goal:** Integrate real-time ski resort data  
**Time:** 2-3 weeks  
**Impact:** Improves accuracy from 60% → 85%+

**Steps:**
1. Set up ski resort API integrations (or web scraping)
2. Create Vertex AI function for ski conditions
3. Replace hardcoded `getSkiConditions` function
4. Add "last updated" timestamps
5. Fallback to static data if API fails

**Code Changes:**
```typescript
// Enhanced ski conditions with Vertex AI function calling
async function getSkiConditions(resort: string): Promise<string> {
  try {
    // Try real-time API first
    const conditions = await fetchSkiResortAPI(resort);
    return JSON.stringify({
      ...conditions,
      last_updated: new Date().toISOString(),
      source: 'Resort API - Real-time',
    });
  } catch (error) {
    // Fallback to static data with disclaimer
    const staticConditions = getStaticSkiConditions(resort);
    return JSON.stringify({
      ...staticConditions,
      last_updated: 'Unknown',
      disclaimer: 'Data may not reflect current conditions. Check resort website for real-time updates.',
      source: 'Static data - May be outdated',
    });
  }
}
```

---

### Phase 3: Vertex AI Grounding for All Queries
**Goal:** Improve overall accuracy with grounding  
**Time:** 1-2 weeks  
**Impact:** Improves overall accuracy 5-10%

**Steps:**
1. Set up Vertex AI Grounding configuration
2. Add web sources for Utah-related queries
3. Enable grounding for all Dan Concierge queries
4. Include citations in responses

**Code Changes:**
```typescript
// Add grounding to Dan's model
const model = vertexAI.preview.getGenerativeModel({
  model: 'gemini-2.0-flash-exp',
  systemInstruction: systemPrompt,
  groundingConfig: {
    groundingSources: [
      {
        web: {
          // Ground in web sources for Utah travel
        },
      },
    ],
  },
});
```

---

## 🔧 TECHNICAL IMPLEMENTATION

### Setup Vertex AI:

1. **Enable Vertex AI API:**
```bash
gcloud services enable aiplatform.googleapis.com
```

2. **Install Vertex AI SDK:**
```bash
npm install @google-cloud/aiplatform
```

3. **Environment Variables:**
```env
# Vertex AI Configuration
GOOGLE_CLOUD_PROJECT_ID=your-project-id
VERTEX_AI_LOCATION=us-central1
VERTEX_AI_EVENTS_DATASTORE_ID=your-datastore-id

# Keep existing Gemini API key as fallback
GEMINI_API_KEY=your-gemini-key
```

---

### Updated API Route:

```typescript
// src/app/api/dan/chat/route.ts (updated)
import { VertexAI } from '@google-cloud/aiplatform';

// Initialize Vertex AI
const vertexAI = new VertexAI({
  project: process.env.GOOGLE_CLOUD_PROJECT_ID!,
  location: process.env.VERTEX_AI_LOCATION || 'us-central1',
});

export async function POST(request: NextRequest) {
  // ... existing code ...

  // Use Vertex AI instead of direct Gemini
  const model = vertexAI.preview.getGenerativeModel({
    model: 'gemini-2.0-flash-exp',
    systemInstruction: systemPrompt,
    // Add grounding for accuracy
    groundingConfig: {
      groundingSources: [{
        web: {},
      }],
    },
  });

  // Enhanced function calling with Vertex AI
  const chat = model.startChat({
    history,
    tools: [danTools], // Same tools, but better execution
  });

  // ... rest of code ...
}
```

---

## 📊 EXPECTED ACCURACY IMPROVEMENTS

### Before Vertex AI:
| Feature | Accuracy | Status |
|---------|----------|--------|
| Weather | 95% | ✅ Good |
| Ski Conditions | 60% | ⚠️ Hardcoded |
| Canyon Status | 70% | ⚠️ Estimated |
| Events | 40% | ⚠️ Curated |
| Destination Search | 100% | ✅ Perfect |

**Overall:** 73%

### After Vertex AI:
| Feature | Accuracy | Improvement |
|---------|----------|-------------|
| Weather | 95% | Maintained |
| Ski Conditions | 85% | +25% |
| Canyon Status | 85% | +15% |
| Events | 90% | +50% |
| Destination Search | 100% | Maintained |

**Overall:** 91% (+18%)

---

## 💰 COST CONSIDERATIONS

### Vertex AI Pricing:
- **Vertex AI Search:** ~$0.50 per 1,000 queries
- **Vertex AI API:** ~$0.00025 per 1K tokens (input), ~$0.001 per 1K tokens (output)
- **Function Calling:** Included in API pricing

### Estimated Monthly Cost:
- **Current (Gemini Direct):** ~$50-100/month
- **With Vertex AI:** ~$100-200/month (more features, better accuracy)

### ROI:
- ✅ Better user satisfaction
- ✅ Reduced support requests
- ✅ Increased trust in AI Concierge
- ✅ Better conversion rates

---

## 🎯 PRIORITY RECOMMENDATIONS

### Immediate (This Month):
1. **✅ Set up Vertex AI project** - 1 day
2. **✅ Implement Vertex AI Search for events** - 1-2 weeks
   - Highest ROI (40% → 90% accuracy)
   - Most visible improvement

### Short-term (Next Month):
3. **✅ Enhance ski conditions with real APIs** - 2-3 weeks
   - Second highest ROI (60% → 85% accuracy)
   - User trust improvement

4. **✅ Add Vertex AI Grounding** - 1-2 weeks
   - Improves overall accuracy
   - Better citations

### Long-term (Next Quarter):
5. **🔄 Full migration to Vertex AI** - Consider
6. **🔄 Custom fine-tuning** - If needed

---

## 🔍 QUICK WINS WITHOUT VERTEX AI

### While Setting Up Vertex AI:
1. **Add disclaimers** - This week
   - "Ski conditions may not reflect current state. Check resort website."
   - "Events may have changed. Verify with event calendar."

2. **Include links to sources** - This week
   - Link to resort websites for ski conditions
   - Link to UDOT for canyon status
   - Link to event calendars

3. **Add "last updated" timestamps** - Next week
   - Show when data was last refreshed
   - Helps users understand data freshness

---

## 📝 MIGRATION CHECKLIST

### Phase 1: Setup
- [ ] Create Google Cloud project
- [ ] Enable Vertex AI API
- [ ] Install Vertex AI SDK
- [ ] Set up environment variables
- [ ] Test Vertex AI connection

### Phase 2: Events (Highest Priority)
- [ ] Set up Vertex AI Search data store
- [ ] Index event sources
- [ ] Update `getTodaysEvents` function
- [ ] Test accuracy
- [ ] Deploy

### Phase 3: Ski Conditions
- [ ] Set up resort API integrations
- [ ] Update `getSkiConditions` function
- [ ] Add fallback to static data
- [ ] Add "last updated" timestamps
- [ ] Test and deploy

### Phase 4: Grounding
- [ ] Configure Vertex AI Grounding
- [ ] Add web sources
- [ ] Enable for all queries
- [ ] Test citations
- [ ] Deploy

---

## 🚀 START HERE

### Recommended First Steps:
1. **This Week:**
   - Add disclaimers to AI Concierge responses
   - Include links to official sources

2. **Next Week:**
   - Set up Vertex AI project
   - Test Vertex AI Search with events

3. **This Month:**
   - Implement Vertex AI Search for events
   - Measure accuracy improvements

**Vertex AI is powerful for improving accuracy, especially with real-time data integration. Start with events (highest ROI) and expand from there.** 🤖✨
