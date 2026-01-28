export interface CurriculumFramework {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  icon: string;
  color: string;
  gradientFrom: string;
  gradientTo: string;
  teachingStyle: string;
  duration: string;
  standards: string[];
  objectives: string[];
  modules?: Module[];
  regions?: Region[];
  assessmentType: string;
  digitalTools?: string[];
}

export interface Module {
  id: string;
  name: string;
  description: string;
  duration: string;
  activities: Activity[];
  assessments: Assessment[];
}

export interface Region {
  id: string;
  name: string;
  counties: string[];
  guardians: string[];
  theme: string;
  conflict: string;
}

export interface Activity {
  id: string;
  name: string;
  description: string;
  type: 'hands-on' | 'digital' | 'discussion' | 'research' | 'creative';
  duration: string;
  materials?: string[];
}

export interface Assessment {
  id: string;
  name: string;
  type: 'formative' | 'summative' | 'peer-review' | 'self-reflection';
  description: string;
  rubric?: string;
}

export const CURRICULUM_FRAMEWORKS: CurriculumFramework[] = [
  {
    id: 'guardians-blueprint',
    name: "The Guardian's Blueprint",
    subtitle: 'Data-Driven Comparative Project-Based Learning',
    description: 'Students analyze all 29 counties using data to compare geography, resources, culture, and civics. Culminates in an Olympic Guardian Policy Brief where students advocate for their county.',
    icon: '📊',
    color: 'blue',
    gradientFrom: 'from-blue-600',
    gradientTo: 'to-cyan-500',
    teachingStyle: 'Data-driven PBL with comparative analysis',
    duration: '8-10 weeks',
    standards: [
      'Utah Core Standard 1: Students will understand the relationship between the physical geography of Utah and the lives of its inhabitants',
      'Utah Core Standard 2: Students will understand the chronology and significance of key events leading to Utah statehood',
      'Science SEEd Standard 4.1.4: Earth\'s features support life',
      'ELA.4.W.3: Write informative/explanatory texts'
    ],
    objectives: [
      'Compare and contrast geographic features across Utah\'s 29 counties',
      'Analyze resource distribution and economic patterns',
      'Synthesize data to create evidence-based policy recommendations',
      'Develop civic advocacy skills through guardian character perspectives'
    ],
    modules: [
      {
        id: 'module-1-geography',
        name: 'Module 1: Geography & Landforms',
        description: 'Students explore how each guardian\'s county terrain shapes their identity and challenges',
        duration: '2 weeks',
        activities: [
          {
            id: 'elevation-mapping',
            name: 'Elevation Mapping Challenge',
            description: 'Create visual maps showing elevation patterns across counties',
            type: 'hands-on',
            duration: '90 minutes',
            materials: ['Topographic maps', 'Color pencils', 'County data sheets']
          },
          {
            id: 'climate-zones',
            name: 'Climate Zone Detective',
            description: 'Investigate how altitude affects climate in different guardian territories',
            type: 'research',
            duration: '60 minutes'
          }
        ],
        assessments: [
          {
            id: 'geography-checklist',
            name: 'Geography Comparison Checklist',
            type: 'formative',
            description: 'Students track 5 geographic features for each county'
          }
        ]
      },
      {
        id: 'module-2-resources',
        name: 'Module 2: Natural Resources & Economy',
        description: 'Analyze how guardian conflicts emerge from resource distribution',
        duration: '2 weeks',
        activities: [
          {
            id: 'resource-inventory',
            name: 'Guardian Resource Inventory',
            description: 'Document mineral, water, agricultural, and tourism resources per county',
            type: 'research',
            duration: '120 minutes'
          },
          {
            id: 'trade-simulation',
            name: 'Olympian Trade Simulation',
            description: 'Role-play guardians trading resources to solve scarcity problems',
            type: 'hands-on',
            duration: '90 minutes'
          }
        ],
        assessments: [
          {
            id: 'resource-map',
            name: 'Interactive Resource Map',
            type: 'summative',
            description: 'Digital or poster map showing resource distribution with guardian annotations'
          }
        ]
      },
      {
        id: 'module-3-culture',
        name: 'Module 3: Cultural Heritage & Identity',
        description: 'Explore how county history shapes guardian personalities and values',
        duration: '2 weeks',
        activities: [
          {
            id: 'guardian-biography',
            name: 'Guardian Biography Research',
            description: 'Write mini-biographies connecting guardian traits to county history',
            type: 'creative',
            duration: '90 minutes'
          },
          {
            id: 'artifact-collection',
            name: 'County Artifact Collection',
            description: 'Research 3 cultural artifacts that define each county\'s identity',
            type: 'research',
            duration: '120 minutes'
          }
        ],
        assessments: [
          {
            id: 'culture-presentation',
            name: 'Guardian Culture Presentation',
            type: 'summative',
            description: 'Present how 3 chosen guardians represent their county\'s cultural identity'
          }
        ]
      },
      {
        id: 'module-4-civics',
        name: 'Module 4: Civic Systems & Policy',
        description: 'Students advocate for county needs through guardian policy briefs',
        duration: '3 weeks',
        activities: [
          {
            id: 'county-needs-assessment',
            name: 'County Needs Assessment',
            description: 'Identify top 3 challenges facing chosen county using data',
            type: 'research',
            duration: '90 minutes'
          },
          {
            id: 'policy-brief-writing',
            name: 'Olympic Guardian Policy Brief',
            description: 'Write formal brief advocating for county needs from guardian perspective',
            type: 'creative',
            duration: '180 minutes'
          },
          {
            id: 'olympian-congress',
            name: 'Olympian Congress Debate',
            description: 'Students present policy briefs and negotiate statewide solutions',
            type: 'discussion',
            duration: '120 minutes'
          }
        ],
        assessments: [
          {
            id: 'policy-brief-rubric',
            name: 'Policy Brief Rubric Assessment',
            type: 'summative',
            description: 'Evaluate use of data, writing quality, civic reasoning, and guardian voice',
            rubric: 'Data Evidence (25%), Writing Quality (25%), Civic Reasoning (25%), Guardian Characterization (25%)'
          },
          {
            id: 'peer-feedback',
            name: 'Peer Guardian Feedback',
            type: 'peer-review',
            description: 'Students provide feedback on each other\'s policy briefs from other guardian perspectives'
          }
        ]
      }
    ],
    assessmentType: 'Summative: Olympic Guardian Policy Brief + Peer Review',
    digitalTools: ['Google Earth', 'Data visualization tools', 'Digital mapping software']
  },
  {
    id: 'olympian-congress',
    name: 'The Olympian Congress',
    subtitle: 'Regional Coalitions & Digital Storytelling',
    description: 'Students form 5 regional guardian coalitions, create multimedia stories, and debate solutions to Utah\'s modern challenges. Features villain personification of problems.',
    icon: '🏛️',
    color: 'purple',
    gradientFrom: 'from-purple-600',
    gradientTo: 'to-pink-500',
    teachingStyle: 'Collaborative regional storytelling with debate',
    duration: '6-8 weeks',
    standards: [
      'Utah Core Standard 1: Physical geography and inhabitants',
      'Utah Core Standard 3: Understanding diverse cultural and economic perspectives',
      'ELA.4.SL.1: Engage in collaborative discussions',
      'Fine Arts Standard L2.2: Create original works that express ideas'
    ],
    objectives: [
      'Collaborate across regional perspectives to solve statewide challenges',
      'Create multimedia narratives combining guardian lore with county facts',
      'Develop persuasive speaking and negotiation skills',
      'Understand interdependence between Utah regions'
    ],
    regions: [
      {
        id: 'wasatch-front',
        name: 'Wasatch Front Alliance',
        counties: ['Salt Lake', 'Davis', 'Weber', 'Utah'],
        guardians: ['Kai (Salt Lake)', 'Maren (Davis)', 'Otis (Weber)', 'Hana (Utah)'],
        theme: 'Urban growth & diversity',
        conflict: 'Balancing development with air quality and housing affordability'
      },
      {
        id: 'canyon-country',
        name: 'Canyon Country Coalition',
        counties: ['Grand', 'San Juan', 'Garfield', 'Wayne', 'Emery'],
        guardians: ['Finn (Grand)', 'Kairos (San Juan)', 'Orin (Garfield)', 'Lars (Wayne)', 'Flint (Emery)'],
        theme: 'Tourism vs. preservation',
        conflict: 'Protecting sacred sites while supporting tourism economy'
      },
      {
        id: 'dixie-alliance',
        name: 'Dixie Alliance',
        counties: ['Washington', 'Iron', 'Kane', 'Beaver'],
        guardians: ['Sera (Washington)', 'Ember (Iron)', 'Terra (Kane)', 'Quinn (Beaver)'],
        theme: 'Desert resilience & water',
        conflict: 'Managing water scarcity during population boom'
      },
      {
        id: 'uinta-basin',
        name: 'Uinta Basin Collective',
        counties: ['Duchesne', 'Uintah', 'Daggett'],
        guardians: ['Tavaputs (Duchesne)', 'Ridge (Uintah)', 'Echo (Daggett)'],
        theme: 'Energy & wilderness',
        conflict: 'Balancing oil/gas economy with environmental protection'
      },
      {
        id: 'rural-heartland',
        name: 'Rural Heartland League',
        counties: ['Cache', 'Box Elder', 'Rich', 'Morgan', 'Summit', 'Wasatch', 'Sanpete', 'Sevier', 'Piute', 'Millard', 'Juab', 'Tooele', 'Carbon'],
        guardians: ['All remaining guardians'],
        theme: 'Agricultural heritage & rural identity',
        conflict: 'Preserving farming culture amid urbanization pressures'
      }
    ],
    modules: [
      {
        id: 'phase-1-exploration',
        name: 'Phase 1: Regional Exploration (2 weeks)',
        description: 'Students research their assigned regional coalition and create guardian profiles',
        duration: '2 weeks',
        activities: [
          {
            id: 'coalition-research',
            name: 'Coalition Deep Dive',
            description: 'Research all counties in assigned region and their guardian characters',
            type: 'research',
            duration: '120 minutes'
          },
          {
            id: 'guardian-origin-story',
            name: 'Guardian Origin Story Creation',
            description: 'Write creative origin stories for 2-3 guardians in the region',
            type: 'creative',
            duration: '90 minutes'
          }
        ],
        assessments: [
          {
            id: 'regional-profile',
            name: 'Regional Profile Poster',
            type: 'formative',
            description: 'Visual presentation of region\'s geography, resources, and guardian personalities'
          }
        ]
      },
      {
        id: 'phase-2-storytelling',
        name: 'Phase 2: Digital Storytelling (3 weeks)',
        description: 'Create multimedia guardian adventures addressing regional conflicts',
        duration: '3 weeks',
        activities: [
          {
            id: 'villain-personification',
            name: 'Villain Personification Workshop',
            description: 'Create villain characters representing regional challenges (e.g., "The Smog Monster" for air quality)',
            type: 'creative',
            duration: '60 minutes'
          },
          {
            id: 'multimedia-production',
            name: 'Guardian Adventure Production',
            description: 'Create digital comic, video, or interactive story of guardians vs. villain',
            type: 'digital',
            duration: '240 minutes (multiple sessions)'
          }
        ],
        assessments: [
          {
            id: 'story-critique',
            name: 'Peer Story Critique',
            type: 'peer-review',
            description: 'Students provide constructive feedback on accuracy and creativity'
          }
        ]
      },
      {
        id: 'phase-3-congress',
        name: 'Phase 3: The Olympian Congress (2 weeks)',
        description: 'Regions debate and negotiate solutions to statewide challenges',
        duration: '2 weeks',
        activities: [
          {
            id: 'position-papers',
            name: 'Regional Position Papers',
            description: 'Each coalition writes position paper on assigned statewide issue',
            type: 'research',
            duration: '90 minutes'
          },
          {
            id: 'congress-debate',
            name: 'Congress Debate Simulation',
            description: 'Structured debate where coalitions negotiate compromises',
            type: 'discussion',
            duration: '180 minutes (3 sessions)'
          },
          {
            id: 'summit-resolution',
            name: 'Summit Resolution Writing',
            description: 'Class co-writes final resolution incorporating all perspectives',
            type: 'discussion',
            duration: '60 minutes'
          }
        ],
        assessments: [
          {
            id: 'debate-rubric',
            name: 'Debate Performance Rubric',
            type: 'summative',
            description: 'Evaluate research quality, speaking skills, collaboration, and compromise',
            rubric: 'Research (20%), Speaking (20%), Listening (20%), Collaboration (20%), Compromise (20%)'
          }
        ]
      }
    ],
    assessmentType: 'Multimedia Story Project + Congress Debate Performance',
    digitalTools: ['Book Creator', 'iMovie/WeVideo', 'Canva', 'Google Slides', 'Audio recording apps']
  },
  {
    id: 'guardians-beehive',
    name: 'Guardians of the Beehive',
    subtitle: 'Regional Planning & Hands-On Heritage',
    description: 'Students become Junior Regional Planners, balancing county needs through guardian councils. Includes hands-on cultural activities like folk songs and pottery.',
    icon: '🐝',
    color: 'amber',
    gradientFrom: 'from-amber-600',
    gradientTo: 'to-yellow-500',
    teachingStyle: 'Service-learning + Cultural heritage activities',
    duration: '8-10 weeks',
    standards: [
      'Utah Core Standard 3: Diverse cultural and economic perspectives',
      'Science SEEd 4.1.3: Plants and animals have structures for survival',
      'Fine Arts Standard L1.1: Explore skills in visual arts',
      'Math Standard 4.MD.A.2: Use four operations to solve word problems'
    ],
    objectives: [
      'Develop civic planning skills through guardian council simulations',
      'Connect to Utah heritage through hands-on cultural activities',
      'Practice budget allocation and resource management',
      'Collaborate to balance competing county priorities'
    ],
    modules: [
      {
        id: 'orientation',
        name: 'Week 1-2: Guardian Council Orientation',
        description: 'Introduction to regional planning and guardian roles',
        duration: '2 weeks',
        activities: [
          {
            id: 'guardian-council-intro',
            name: 'Guardian Council Introduction',
            description: 'Learn about regional planning through guardian character lens',
            type: 'discussion',
            duration: '60 minutes'
          },
          {
            id: 'county-adoption',
            name: 'County Adoption Ceremony',
            description: 'Each student "adopts" 2-3 counties to champion throughout unit',
            type: 'discussion',
            duration: '45 minutes'
          }
        ],
        assessments: [
          {
            id: 'county-fact-file',
            name: 'County Fact File',
            type: 'formative',
            description: 'Research folder with key facts about adopted counties'
          }
        ]
      },
      {
        id: 'regional-challenges',
        name: 'Week 3-5: Regional Challenges',
        description: 'Students identify and propose solutions to county challenges',
        duration: '3 weeks',
        activities: [
          {
            id: 'needs-assessment',
            name: 'County Needs Assessment',
            description: 'Identify top 3 needs for each adopted county using guardian perspective',
            type: 'research',
            duration: '90 minutes'
          },
          {
            id: 'budget-allocation',
            name: 'Guardian Budget Challenge',
            description: 'Allocate limited statewide budget across competing county needs',
            type: 'hands-on',
            duration: '120 minutes',
            materials: ['Budget worksheets', 'Play money', 'County need cards']
          },
          {
            id: 'guardian-council-meeting',
            name: 'Guardian Council Meeting Simulation',
            description: 'Role-play council meetings where students advocate for county priorities',
            type: 'discussion',
            duration: '90 minutes (3 sessions)'
          }
        ],
        assessments: [
          {
            id: 'council-reflection',
            name: 'Council Meeting Reflection',
            type: 'self-reflection',
            description: 'Students reflect on compromise and civic decision-making'
          }
        ]
      },
      {
        id: 'heritage-activities',
        name: 'Week 6-8: Heritage & Culture Activities',
        description: 'Hands-on exploration of Utah cultural traditions tied to counties',
        duration: '3 weeks',
        activities: [
          {
            id: 'folk-songs',
            name: 'County Folk Songs & Music',
            description: 'Learn folk songs from different regions, discuss how music reflects culture',
            type: 'hands-on',
            duration: '90 minutes',
            materials: ['Song sheets', 'Simple instruments', 'Audio recordings']
          },
          {
            id: 'pottery-crafts',
            name: 'Native Pottery & Crafts',
            description: 'Create clay pottery inspired by Indigenous Utah traditions',
            type: 'hands-on',
            duration: '120 minutes',
            materials: ['Air-dry clay', 'Pottery tools', 'Paint/decorations']
          },
          {
            id: 'food-traditions',
            name: 'Regional Food Traditions',
            description: 'Research and share food traditions from different counties',
            type: 'research',
            duration: '60 minutes'
          },
          {
            id: 'oral-histories',
            name: 'Guardian Oral History Project',
            description: 'Interview family/community members about Utah heritage, frame as "guardian stories"',
            type: 'creative',
            duration: '90 minutes (homework + class sharing)'
          }
        ],
        assessments: [
          {
            id: 'heritage-portfolio',
            name: 'Heritage Portfolio',
            type: 'summative',
            description: 'Collection of artifacts, reflections, and photos from cultural activities'
          }
        ]
      },
      {
        id: 'capstone-plan',
        name: 'Week 9-10: Capstone Regional Plan',
        description: 'Students create comprehensive regional development plans',
        duration: '2 weeks',
        activities: [
          {
            id: 'regional-plan-draft',
            name: 'Regional Development Plan',
            description: 'Create plan balancing needs of 5-7 counties in assigned region',
            type: 'creative',
            duration: '180 minutes (multiple sessions)'
          },
          {
            id: 'plan-presentation',
            name: 'Guardian Summit Presentations',
            description: 'Present regional plans to class, answer questions from other "guardians"',
            type: 'discussion',
            duration: '120 minutes'
          }
        ],
        assessments: [
          {
            id: 'regional-plan-rubric',
            name: 'Regional Plan Assessment',
            type: 'summative',
            description: 'Evaluate understanding of county needs, creativity, and civic reasoning',
            rubric: 'County Knowledge (30%), Problem-Solving (25%), Creativity (20%), Presentation (25%)'
          }
        ]
      }
    ],
    assessmentType: 'Regional Development Plan + Heritage Portfolio',
    digitalTools: ['Budget calculators', 'Digital planning templates', 'Photo/video documentation']
  },
  {
    id: 'guardians-reckoning',
    name: "The Guardians' Reckoning",
    subtitle: 'Geo-Crisis Mitigation Project-Based Learning',
    description: 'Students tackle real Utah environmental/social crises through guardian stakeholder perspectives. Includes drought simulation, air quality modeling, and growth planning.',
    icon: '⚡',
    color: 'red',
    gradientFrom: 'from-red-600',
    gradientTo: 'to-orange-500',
    teachingStyle: 'Problem-based learning with real-world crisis scenarios',
    duration: '6-8 weeks',
    standards: [
      'Science SEEd Standard 4.1.1: Weathering and erosion shape Earth',
      'Science SEEd Standard 4.1.4: Earth features support life',
      'Utah Core Standard 1: Physical geography impacts inhabitants',
      'Math Standard 4.MD.A.1: Measurement and data conversion'
    ],
    objectives: [
      'Apply scientific reasoning to real Utah environmental challenges',
      'Understand stakeholder perspectives through guardian roles',
      'Develop solutions using data and evidence',
      'Practice presentation and persuasion skills'
    ],
    modules: [
      {
        id: 'crisis-1-drought',
        name: 'Crisis 1: The Great Drought (2 weeks)',
        description: 'Guardians respond to statewide water scarcity',
        duration: '2 weeks',
        activities: [
          {
            id: 'drought-simulation',
            name: 'Drought Impact Simulation',
            description: 'Use data to model how drought affects different counties differently',
            type: 'hands-on',
            duration: '90 minutes',
            materials: ['Water usage charts', 'County maps', 'Calculator']
          },
          {
            id: 'guardian-stakeholders',
            name: 'Guardian Stakeholder Perspectives',
            description: 'Students represent different guardian viewpoints (farming, urban, recreation)',
            type: 'discussion',
            duration: '60 minutes'
          },
          {
            id: 'solution-proposals',
            name: 'Water Conservation Solutions',
            description: 'Develop county-specific water saving strategies from guardian perspective',
            type: 'research',
            duration: '90 minutes'
          }
        ],
        assessments: [
          {
            id: 'drought-presentation',
            name: 'Drought Solution Presentation',
            type: 'summative',
            description: 'Present water conservation plan addressing stakeholder needs'
          }
        ]
      },
      {
        id: 'crisis-2-air-quality',
        name: 'Crisis 2: The Smog Siege (2 weeks)',
        description: 'Guardians tackle Wasatch Front air quality crisis',
        duration: '2 weeks',
        activities: [
          {
            id: 'air-quality-data',
            name: 'Air Quality Data Analysis',
            description: 'Graph real air quality data from Salt Lake, Weber, Utah, Davis counties',
            type: 'research',
            duration: '90 minutes'
          },
          {
            id: 'inversion-science',
            name: 'Inversion Science Experiment',
            description: 'Model how temperature inversions trap pollution in valleys',
            type: 'hands-on',
            duration: '60 minutes',
            materials: ['Clear containers', 'Hot/cold water', 'Food coloring']
          },
          {
            id: 'guardian-debate',
            name: 'Guardian Debate: Transportation vs. Industry',
            description: 'Debate which pollution sources to regulate, from guardian perspectives',
            type: 'discussion',
            duration: '90 minutes'
          }
        ],
        assessments: [
          {
            id: 'air-action-plan',
            name: 'Air Quality Action Plan',
            type: 'summative',
            description: 'Write action plan balancing economic and health concerns'
          }
        ]
      },
      {
        id: 'crisis-3-growth',
        name: 'Crisis 3: The Growth Sprawl (2 weeks)',
        description: 'Guardians plan for Utah\'s rapid population growth',
        duration: '2 weeks',
        activities: [
          {
            id: 'population-projections',
            name: 'Population Growth Projections',
            description: 'Analyze population growth data and project future needs',
            type: 'research',
            duration: '90 minutes'
          },
          {
            id: 'land-use-mapping',
            name: 'Land Use Mapping Challenge',
            description: 'Plan where new housing/schools/parks should go in growing counties',
            type: 'hands-on',
            duration: '120 minutes',
            materials: ['County maps', 'Colored markers', 'Population data']
          },
          {
            id: 'guardian-summit',
            name: 'Guardian Growth Summit',
            description: 'Negotiate statewide growth management strategy',
            type: 'discussion',
            duration: '90 minutes'
          }
        ],
        assessments: [
          {
            id: 'growth-plan-rubric',
            name: 'Growth Management Plan',
            type: 'summative',
            description: 'Comprehensive plan addressing housing, transportation, and preservation',
            rubric: 'Data Use (25%), Stakeholder Balance (25%), Feasibility (25%), Creativity (25%)'
          }
        ]
      }
    ],
    assessmentType: 'Crisis Solution Portfolios + Final Guardian Summit Presentation',
    digitalTools: ['Excel/Google Sheets', 'Climate data websites', 'Mapping tools', 'Data visualization']
  },
  {
    id: 'county-reckoning-2034',
    name: 'The 2034 County Reckoning',
    subtitle: 'Digital Historians & Future Advocacy',
    description: 'Students become digital historians documenting current county conditions and advocating for 2034 future needs. Guardians serve as data repositories and advocates.',
    icon: '🔮',
    color: 'indigo',
    gradientFrom: 'from-indigo-600',
    gradientTo: 'to-blue-500',
    teachingStyle: 'Digital literacy + Historical thinking + Future forecasting',
    duration: '8-10 weeks',
    standards: [
      'Utah Core Standard 2: Chronology and significance of key events',
      'ELA.4.W.2: Write informative/explanatory texts',
      'ELA.4.W.6: Use technology to produce and publish writing',
      'Math Standard 4.OA.A.3: Multi-step problem solving'
    ],
    objectives: [
      'Develop digital research and documentation skills',
      'Practice historical thinking by documenting the present',
      'Create evidence-based forecasts for future county needs',
      'Build advocacy skills through guardian character voices'
    ],
    modules: [
      {
        id: 'digital-historians',
        name: 'Phase 1: Becoming Digital Historians (2 weeks)',
        description: 'Students learn to research, document, and verify county information',
        duration: '2 weeks',
        activities: [
          {
            id: 'source-evaluation',
            name: 'Digital Source Evaluation',
            description: 'Learn to evaluate credibility of websites, videos, and data sources',
            type: 'digital',
            duration: '90 minutes'
          },
          {
            id: 'county-snapshot',
            name: '2024 County Snapshot Creation',
            description: 'Document current state of 2-3 counties using multiple digital sources',
            type: 'research',
            duration: '120 minutes'
          },
          {
            id: 'guardian-database',
            name: 'Guardian Database Building',
            description: 'Create digital database of guardian facts tied to verifiable county data',
            type: 'digital',
            duration: '90 minutes'
          }
        ],
        assessments: [
          {
            id: 'snapshot-checklist',
            name: 'County Snapshot Checklist',
            type: 'formative',
            description: 'Verify students documented all required data categories'
          }
        ]
      },
      {
        id: 'trend-analysis',
        name: 'Phase 2: Trend Analysis & Forecasting (3 weeks)',
        description: 'Analyze historical trends to forecast 2034 county conditions',
        duration: '3 weeks',
        activities: [
          {
            id: 'population-trends',
            name: 'Population Trend Graphing',
            description: 'Graph county population changes from 2000-2024, project to 2034',
            type: 'research',
            duration: '90 minutes'
          },
          {
            id: 'resource-forecasting',
            name: 'Resource Availability Forecasting',
            description: 'Predict water, land, economic resources in 2034 based on current trends',
            type: 'research',
            duration: '120 minutes'
          },
          {
            id: 'guardian-warnings',
            name: 'Guardian Warning System',
            description: 'Create "warning messages" from guardians about future challenges',
            type: 'creative',
            duration: '60 minutes'
          }
        ],
        assessments: [
          {
            id: 'forecast-report',
            name: '2034 Forecast Report',
            type: 'summative',
            description: 'Written report with graphs showing projected county conditions'
          }
        ]
      },
      {
        id: 'advocacy-campaign',
        name: 'Phase 3: Guardian Advocacy Campaign (3 weeks)',
        description: 'Students create multimedia campaigns advocating for county needs',
        duration: '3 weeks',
        activities: [
          {
            id: 'issue-identification',
            name: 'Critical Issue Identification',
            description: 'Identify top 3 issues each county will face by 2034',
            type: 'research',
            duration: '90 minutes'
          },
          {
            id: 'multimedia-campaign',
            name: 'Guardian Advocacy Multimedia',
            description: 'Create PSA videos, posters, or websites from guardian perspective',
            type: 'digital',
            duration: '240 minutes (multiple sessions)',
            materials: ['Tablets/computers', 'Video editing software', 'Design tools']
          },
          {
            id: 'community-presentation',
            name: 'Community Presentation Event',
            description: 'Present campaigns to parents, community members, local officials',
            type: 'discussion',
            duration: '120 minutes'
          }
        ],
        assessments: [
          {
            id: 'campaign-rubric',
            name: 'Advocacy Campaign Rubric',
            type: 'summative',
            description: 'Evaluate research quality, creativity, persuasiveness, and technical skills',
            rubric: 'Research (25%), Creativity (25%), Persuasiveness (25%), Technical Quality (25%)'
          },
          {
            id: 'community-feedback',
            name: 'Community Feedback Form',
            type: 'peer-review',
            description: 'Collect feedback from community presentation attendees'
          }
        ]
      }
    ],
    assessmentType: '2034 Forecast Report + Multimedia Advocacy Campaign',
    digitalTools: ['Google Workspace', 'Canva', 'WeVideo/iMovie', 'Data.gov', 'Census data tools', 'Utah.gov resources']
  },
  {
    id: 'comparative-regional',
    name: 'Comparative Regional Studies',
    subtitle: 'Cross-County Analysis & Synthesis',
    description: 'Students conduct deep comparative analysis across regions, identifying patterns in geography, economy, culture, and governance. Culminates in research symposium.',
    icon: '🔬',
    color: 'teal',
    gradientFrom: 'from-teal-600',
    gradientTo: 'to-green-500',
    teachingStyle: 'Academic research + Comparative analysis + Symposium presentation',
    duration: '10-12 weeks',
    standards: [
      'Utah Core Standard 1: Physical geography relationships',
      'Utah Core Standard 3: Diverse perspectives',
      'ELA.4.RI.9: Integrate information from two texts',
      'ELA.4.W.7: Conduct short research projects'
    ],
    objectives: [
      'Conduct systematic comparative research across multiple counties',
      'Identify and analyze patterns in geographic, economic, and cultural data',
      'Synthesize findings into coherent research presentations',
      'Develop academic research and citation skills'
    ],
    modules: [
      {
        id: 'research-foundations',
        name: 'Module 1: Research Foundations (2 weeks)',
        description: 'Learn research methodologies and select comparative focus',
        duration: '2 weeks',
        activities: [
          {
            id: 'research-questions',
            name: 'Developing Research Questions',
            description: 'Formulate comparative questions about Utah counties',
            type: 'research',
            duration: '90 minutes'
          },
          {
            id: 'guardian-lens',
            name: 'Guardian Research Lens',
            description: 'Use guardian conflicts as framework for comparative analysis',
            type: 'discussion',
            duration: '60 minutes'
          }
        ],
        assessments: [
          {
            id: 'research-proposal',
            name: 'Research Proposal',
            type: 'formative',
            description: 'Written proposal outlining research question and methodology'
          }
        ]
      },
      {
        id: 'data-collection',
        name: 'Module 2: Multi-County Data Collection (4 weeks)',
        description: 'Systematic data gathering across all 29 counties',
        duration: '4 weeks',
        activities: [
          {
            id: 'standardized-data',
            name: 'Standardized Data Collection',
            description: 'Gather same data points for all counties to enable comparison',
            type: 'research',
            duration: '240 minutes (spread across weeks)'
          },
          {
            id: 'guardian-interviews',
            name: 'Guardian "Expert Interviews"',
            description: 'Students write fictional interviews with guardians to explore perspectives',
            type: 'creative',
            duration: '120 minutes'
          }
        ],
        assessments: [
          {
            id: 'data-notebook',
            name: 'Research Data Notebook',
            type: 'formative',
            description: 'Organized collection of all gathered data with citations'
          }
        ]
      },
      {
        id: 'analysis-synthesis',
        name: 'Module 3: Analysis & Synthesis (3 weeks)',
        description: 'Identify patterns and develop conclusions',
        duration: '3 weeks',
        activities: [
          {
            id: 'pattern-mapping',
            name: 'Pattern Mapping Exercise',
            description: 'Create visual maps showing geographic/economic/cultural patterns',
            type: 'hands-on',
            duration: '120 minutes'
          },
          {
            id: 'guardian-summit-synthesis',
            name: 'Guardian Summit Synthesis',
            description: 'Role-play guardians discussing patterns and their implications',
            type: 'discussion',
            duration: '90 minutes'
          }
        ],
        assessments: [
          {
            id: 'analysis-draft',
            name: 'Analysis Draft',
            type: 'formative',
            description: 'Written draft of findings with supporting evidence'
          }
        ]
      },
      {
        id: 'symposium',
        name: 'Module 4: Research Symposium (2 weeks)',
        description: 'Students present research findings in formal symposium',
        duration: '2 weeks',
        activities: [
          {
            id: 'presentation-creation',
            name: 'Symposium Presentation Creation',
            description: 'Design professional presentation with visual aids',
            type: 'digital',
            duration: '120 minutes'
          },
          {
            id: 'symposium-event',
            name: 'Guardian Research Symposium',
            description: 'Formal presentation event with Q&A sessions',
            type: 'discussion',
            duration: '180 minutes'
          }
        ],
        assessments: [
          {
            id: 'symposium-rubric',
            name: 'Symposium Presentation Rubric',
            type: 'summative',
            description: 'Evaluate research quality, presentation skills, and depth of analysis',
            rubric: 'Research Quality (30%), Analysis Depth (30%), Presentation (20%), Q&A (20%)'
          },
          {
            id: 'written-paper',
            name: 'Research Paper',
            type: 'summative',
            description: 'Final written paper documenting full research process and findings'
          }
        ]
      }
    ],
    assessmentType: 'Research Paper + Symposium Presentation + Data Notebook',
    digitalTools: ['Research databases', 'Citation tools', 'Data analysis software', 'Presentation software']
  }
];
