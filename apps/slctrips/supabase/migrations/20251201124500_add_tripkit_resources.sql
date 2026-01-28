-- Add resources column to tripkits for "Deep Content"
ALTER TABLE public.tripkits
ADD COLUMN IF NOT EXISTS resources JSONB;
-- Populate "Ski Utah Complete" with comprehensive beginner content
UPDATE public.tripkits
SET resources = $$ [
  {
    "id": "resort-selection",
    "title": "🚨 CRITICAL: Which Resort for Beginners?",
    "type": "guide",
    "icon": "🎿",
    "content": "### Brighton Resort ⭐ HIGHLY RECOMMENDED\n**21% Beginner Terrain** | Utah's oldest resort (1936). Known for approachable atmosphere, excellent Snow Sports School, and **night skiing**. Beginner trails accessible from all lifts. Local favorite.\n\n### Park City Mountain Resort ⭐ RECOMMENDED\n**7-15% Beginner** | **Largest lift-served resort in the US**. Varied terrain for all levels. Great beginner programs.\n\n### Snowbasin ⭐ RECOMMENDED\n**Needles Zone** has the largest variety of beginner/intermediate runs. 45 minutes from SLC airport.\n\n---\n\n### ⚠️ AVOID AS A BEGINNER\n**Alta Ski Area**: Only 15% beginner. **55% advanced/expert**. Steep, deep powder. **Ski-only** (no snowboards). Iconic but intimidating.\n\n**Snowbird**: 27% easiest BUT reputation for \"intermediates only.\" Challenging terrain.\n\n**Deer Valley**: 27% beginner BUT **luxury resort** with high prices. **Ski-only**. Not ideal for first-timers on a budget.\n\n*Source: Resort trail maps, Brighton history*"
  },
  {
    "id": "transportation",
    "title": "Getting There: SLC Airport → Resorts",
    "type": "guide",
    "icon": "🚌",
    "content": "### Public Transit (UTA Ski Routes)\nA **car-free ski vacation is possible!** Utah Transit Authority operates seasonal Ski Routes:\n- **Route 972**: Brighton/Solitude\n- **Route 994**: Alta/Snowbird\n\n### Distances from SLC Airport\n- **Snowbasin**: 45 minutes\n- **Snowbird**: 29 miles (47 km)\n- **10 of 15 Utah resorts**: ~1 hour\n\n### Free Shuttle\n**Alta Shuttle**: Free loop between Alta and Snowbird base areas and accommodations.\n\n### Parking\nRefer to the **Ski Utah Parking Guide** for costs and tips. Parking fills fast on weekends—arrive before 8:30 AM.\n\n*Source: UTA, resort websites*"
  },
  {
    "id": "lessons",
    "title": "Why You MUST Take a Lesson",
    "type": "guide",
    "icon": "👨‍🏫",
    "content": "### Why It's Critical\n**Ski school is where beginners find the secrets to skiing.** A single half-day lesson will save you days of frustration and prevent injury. **Friends don't let friends teach friends** (it ruins both).\n\n### Where to Book\nEvery major resort has a ski school:\n- **Brighton**: Famous for its Snow Sports School\n- **Deer Valley**: 500+ instructors\n- **Snowbasin**: Youth, Adult, Private lessons\n- **Alta**: Beginner-focused programs\n\n### Cost Examples\n- **Deer Valley Women's Empowerment Clinic**: $750/day\n- **Ted Ligety Performance Camp** (3 days, elite): $4,750\n\n*Beginner group lessons are typically $100-200 for a half-day. Book in advance.*\n\n*Source: Resort websites, Deer Valley programs*"
  },
  {
    "id": "when-to-go",
    "title": "When to Go: Timing Your Trip",
    "type": "guide",
    "icon": "📅",
    "content": "### Best Months for Powder\n**January - February**: Peak season. Cottonwood Canyons receive **1 foot of snow every 5 days**. Alta averages **500+ inches annually**.\n\n### Avoid Crowds (Midweek is Key)\nPlan a **midweek escape** for lower prices and fewer people. Weekends and holidays are packed.\n\n### Deer Valley High Season (Most Expensive)\n- Dec 19 – Jan 3\n- Jan 16 – 19\n- Feb 6 – 21\n- Mar 1 – Apr 4\n\n### \"Goldilocks Storms\"\nUtah's ideal storms dump **10-20 inches** (not too much, not too little), minimizing avalanche risk while maximizing powder.\n\n*Source: Alta snowfall data, Deer Valley calendar*"
  },
  {
    "id": "passes",
    "title": "Season Passes vs. Day Tickets",
    "type": "guide",
    "icon": "🎫",
    "content": "### For Beginners: Start with Day Tickets\nDon't commit to a season pass until you know you love it.\n\n### If You Buy a Multi-Pass:\n**Epic Pass**: Park City Mountain Resort\n\n**Ikon Pass**: Alta, Snowbird, Deer Valley, Brighton, Solitude\n*(Note: Deer Valley limits Ikon Pass days)*\n\n**Solbright Pass**: Brighton + Solitude for a small surcharge\n\n### Impact of Mega-Passes\nIkon and Epic have driven **unprecedented visitation**, leading to crowded slopes and canyon gridlock. This is the reality of modern skiing.\n\n*Source: Pass websites, industry analysis*"
  },
  {
    "id": "rentals",
    "title": "What to Buy vs. Rent",
    "type": "gear",
    "icon": "🛒",
    "content": "### RENT (For Your First Season)\n- Skis & Bindings\n- Poles\n\n### BUY (Single-Best Investment)\n**Properly fitted ski boots** are the #1 way to improve your skiing. Go to a boot fitter, not a generic sports store.\n\n### Where to Rent\n- **At the resort**: Convenient but pricier\n- **In SLC**: Cheaper, but you have to transport gear\n\nMost resorts (Alta, Snowbasin, Deer Valley, Brighton) have rental shops.\n\n*Source: Expert advice, resort rental shops*"
  },
  {
    "id": "pack-survival",
    "title": "On-Mountain Survival: What to Bring",
    "type": "guide",
    "icon": "🎒",
    "content": "### In Your Pack\n- **Water** (altitude dehydrates you fast)\n- **Snacks** (granola bars, trail mix)\n- **Extra layer** (fleece or down jacket)\n- **Sunscreen** (SPF 50+, UV is intense at altitude)\n- **Chapstick**\n\n### Alta-Specific Rule\nAnything carried onto a lift (except ski poles) **must be in a small/medium backpack or waist pack**. No loose items.\n\n### Where to Eat\n- **Little Cottonwood Canyon** (Alta/Snowbird): Slopeside cafes, family grills, elegant lodge dining\n- **Snowbasin**: Top-ranked for exquisite cuisine\n- **Deer Valley**: Gourmet dining options\n\n*Source: Alta policies, resort dining guides*"
  },
  {
    "id": "interlodge-prep",
    "title": "Interlodge Preparedness (Critical Safety)",
    "type": "guide",
    "icon": "🚨",
    "content": "### If You're Staying in Little Cottonwood Canyon\nYou **must** be prepared for Interlodge. This isn't optional.\n\n### What to Have\n- **Food & Water** (enough for 12-24 hours)\n- **Extra clothes** (clean, dry)\n- **Snow scraper & shovel** (in your car)\n- **Travel insurance** (to cover flight changes)\n- **Flexible schedule** (don't plan tight connections)\n\n### Read the Weather Forecast\nCheck avalanche forecasts at **utahavalanchecenter.org** before heading to the canyon.\n\n### The Silver Lining: \"Country Club\" Days\nIf you're lodged in the canyon during Interlodge, **you'll be first in the lift line** when it lifts. Locals call this a \"Country Club\" day—fresh, untracked powder with no crowds.\n\n*Source: Alta/Snowbird safety protocols*"
  },
  {
    "id": "origins",
    "title": "From Silver to Snow: Utah's Skiing Origins",
    "type": "guide",
    "icon": "⛏️",
    "content": "### Alta: Where It All Began (1939)\nOnce a booming silver mining town, Alta nearly became a ghost town when the mines dried up. In 1939, visionaries in the Salt Lake City Winter Sports Association raised $10,000 to build one of America's first chairlifts—the Collins Lift. Alta Ski Area was born, transforming a dying mining camp into a powder paradise.\n\n### The Pioneers\n**S. Joe Quinney** (1892-): A Logan native and Harvard-trained lawyer, Quinney was president of the Utah Ski Club (1935-38) and led the Salt Lake City Winter Sports Association for 25 years. His legal expertise made Alta's creation possible.\n\n**Alf Engen**: Known as \"Skiing's and Alta's Greatest Ambassador,\" Engen's influence was so profound that the Alf Engen Ski Museum at Utah Olympic Park was named in his honor after the 2002 Games.\n\n### Park City: Mining Town Reborn\nPark City was one of the continent's largest silver strikes but nearly died during the Great Depression. In a last-ditch effort, Park City Consolidated Mines established a ski area on Treasure Mountain in 1963, trading silver for snow and saving the town.\n\n*Source: Engen, 'First Tracks: A Century of Skiing in Utah'; Kelner, 'Skiing in Utah: A History'*"
  },
  {
    "id": "snowboard-ban",
    "title": "The Snowboarding Ban: A Cultural War",
    "type": "guide",
    "icon": "🏂",
    "content": "### Why Resorts Banned Snowboarding (1980s)\nEarly snowboards were hard to control. Riders lacked reliable braking, leading to uncontrolled descents and collisions. The ski community also viewed snowboarders as \"too unruly\" and \"dangerous to skiing culture.\"\n\n### The Turning Point\nIn the 1980s, the discovery of the **carving technique** gave riders a definitive way to control speed. By 1985, ~40 resorts allowed snowboarding; by 1990, that number hit 476.\n\n### The Last Holdouts\n**Alta Ski Area**: \"Alta is for skiers. Snowboarding is not allowed.\" Reasons cited:\n- Different \"blind spots\" lead to collisions\n- Snowboarders \"cut off\" moguls, degrading terrain\n- Extensive traverses are difficult on a board\n\n**Deer Valley**: Opened ski-only in 1981 as part of its luxury, tradition-focused brand.\n\n### Legal Precedent\nIn *Wasatch Equal. v. Alta Ski Lifts Co.* (2014), a federal court affirmed that private resorts have the right to ban snowboards.\n\n*Source: Court case, Pennington NYT 2007, Solomon NYT 2013*"
  },
  {
    "id": "olympics-legacy",
    "title": "2002 Olympics: The Legacy That Keeps Giving",
    "type": "guide",
    "icon": "🏅",
    "content": "### The Venues (All Still in Use)\n- **Park City**: Giant Slalom, Snowboard events\n- **Deer Valley**: Slalom, Moguls, Aerials\n- **Snowbasin**: Downhill, Super-G\n- **Utah Olympic Park**: Bobsled, Luge, Ski Jumping\n- **Soldier Hollow**: Cross-Country, Biathlon\n\n### The Athletes\n**Apolo Ohno**: Short track speed skating star\n**Lindsey Vonn**: Made her Olympic debut at 17 in Salt Lake City (lives in Park City today)\n**Sage Kotsenburg**: Park City local who won the first-ever Olympic gold in men's snowboard slopestyle (2014)\n\n### Infrastructure Built\n**TRAX Light Rail**: Expanded specifically for the Games, still serves hundreds of thousands today.\n\n### Economic Impact\n**100% of venues** are still in use, managed by the Utah Olympic Legacy Foundation. They see **1.4 million uses annually**.\n\n**Post-Olympic Boom (14 years after vs. 14 years before)**:\n- **+43%** increase in average annual skier days\n- **+25%** increase in visits to Utah national parks\n\n*Source: SLOC Official Report (ISBN 978-0-9717961-0-2), Pace 2006 study, Kem Gardner 2018 analysis*"
  },
  {
    "id": "athletes",
    "title": "Famous Athletes: Utah's Ski Stars",
    "type": "guide",
    "icon": "🌟",
    "content": "### Olympic Legends\n**Lindsey Vonn**: One of the most decorated ski racers in history. Made her Olympic debut in Salt Lake City (2002) at age 17. Won Olympic downhill gold in 2010. Now lives in Park City.\n\n**Sage Kotsenburg**: Park City local who won the first-ever Olympic gold medal in men's snowboard slopestyle (Sochi 2014).\n\n### University of Utah: A Ski Dynasty\nThe U of U ski program has won **NCAA National Championships in 2019, 2021, and 2022**. Several athletes from the program are now on the '24/'25 U.S. Alpine Ski Team, including:\n- Jared Goldberg (Holladay)\n- Elisabeth & Mary Bocock (Salt Lake City)\n- Lauren Macuga (rising star with a World Cup super-G victory)\n\n*Source: Vonn, 'Rise: My Story'; U.S. Ski Team rosters*"
  },
  {
    "id": "skiing-types",
    "title": "Types of Skiing in Utah",
    "type": "terminology",
    "icon": "⛷️",
    "content": "Utah offers terrain for every discipline.",
    "items": [
      {"label": "Alpine (Downhill)", "value": "The classic resort experience. Alta: 45% beginner/intermediate. Snowbird: 35% expert (steep chutes, deep powder). Snowbasin: Olympic double-blacks off John Paul lift."},
      {"label": "Cross-Country (Nordic)", "value": "Endurance skiing on flat/rolling terrain. Premier venue: Soldier Hollow Nordic Center (31km of trails, built for 2002 Olympics)."},
      {"label": "Backcountry", "value": "Ungroomed, unpatrolled terrain outside resorts. Requires avalanche safety training. Expert-level. Ski Utah offers the Interconnect Tour—a guided adventure linking 6 resorts."},
      {"label": "Freestyle", "value": "Tricks, jumps, rails. Snowbasin has 3 terrain parks. Utah Olympic Park is a world-class freestyle training facility."},
      {"label": "Uphill (Ski Touring)", "value": "Ascending under your own power with skins, then skiing down. Growing trend. Alta has official policies for uphill travel."}
    ] },
  { "id": "greatest-snow",
  "title": "The Greatest Snow on Earth®: Science & History",
  "type": "guide",
  "icon": "❄️",
  "content": "### The Slogan (1966)\nUtah officially began using \"The Greatest Snow on Earth®\" in **1966** and trademarked it in **1975**. It appears on state license plates.\n\n### The Lawsuit (1997-1999)\nRingling Bros. and Barnum & Bailey Circus sued Utah over the slogan (they owned \"The Greatest Show on Earth\"). **Utah won.** The circus's trademark did not extend to snow.\n\n### The Science\n**Lake-Effect Snow**: Storms pick up moisture from the Great Salt Lake, then dump it as massive snowfall when they hit the Wasatch Mountains (Alta, Snowbird).\n\n**\"Right-Side-Up\" Storms**: Warmer, wetter snow falls first (solid base), followed by colder, lighter snow on top. This creates incredible flotation—you feel like you're floating.\n\n**Salt Nuclei**: Salt particles from the dry lakebeds may act as condensation nuclei, forming unique \"ice pellet snow that doesn't pack.\"\n\n### The Competition\nHokkaido, Japan has a higher probability of deep powder days in late January. But for **consistency across an entire season**, Utah is the global benchmark.\n\n*Source: AMS Journal, \"Secrets of the Greatest Snow on Earth\"; Ringling Bros. v. Utah case (1997)*" },
  { "id": "interlodge",
  "title": "Interlodge: A Utah Phenomenon",
  "type": "guide",
  "icon": "🚨",
  "content": "### What Is Interlodge?\n**Interlodge** is a legal directive that requires everyone in Little Cottonwood Canyon (residents, guests, employees) to remain indoors during periods of extreme avalanche danger or while mitigation work is underway.\n\n### Why It Exists\nHighway 210 (the only road to Alta and Snowbird) has **65 different avalanche paths** threatening it. Little Cottonwood Canyon has **one of the highest avalanche indexes globally**.\n\n### What It Means for You\nIf Interlodge is called, you cannot leave your hotel or lodge until it's lifted. It's rare, but it's a necessary reality of skiing in one of the most avalanche-prone canyons in the world.\n\n*Source: Alta/Snowbird safety protocols*" },
  { "id": "challenges",
  "title": "Modern Challenges: Traffic, Climate, Crowds",
  "type": "guide",
  "icon": "⚠️",
  "content": "### Canyon Gridlock\nLittle Cottonwood Canyon's single road (Highway 210) is a notorious bottleneck. Proposals for a gondola (costing $1B+) remain controversial.\n\n### Environmental Concerns\nThe Wasatch Mountains are Salt Lake City's primary drinking water source. Environmental groups warn that resort expansion threatens the **Wasatch watershed**.\n\n### Overcrowding\nMega-passes (Ikon, Epic) have driven unprecedented visitation. Ironically, the fears from the ONE Wasatch debates—overwhelmed roads, crowded slopes—have come true **without a single new interconnect lift being built**.\n\n### Climate Change\nUtah is experiencing **warmer winters** with more rain at lower elevations. Mid-season melting events threaten the long-term viability of \"The Greatest Snow on Earth®.\" **Reducing greenhouse gas emissions is critical.**\n\n*Source: Save Our Canyons, climate studies*" },
  { "id": "difficulty",
  "title": "Ski Difficulty Decoded",
  "type": "terminology",
  "icon": "📊",
  "content": "Understanding trail ratings is crucial for safety. Start small and work your way up.",
  "items": [
      {"label": "🟢 Green Circle", "value": "Easiest. Groomed, wide, gentle slopes. Perfect for beginners."},
      {"label": "🟦 Blue Square", "value": "Intermediate. Steeper, may be groomed or ungroomed. For skiers comfortable with turning and stopping."},
      {"label": "♦️ Black Diamond", "value": "Advanced. Steep, often ungroomed, may have moguls. For experienced skiers only."},
      {"label": "♦️♦️ Double Black Diamond", "value": "Expert Only. Extremely steep, narrow, or hazardous. Do not attempt unless you are an expert."}
    ] },
  { "id": "gear",
  "title": "Essential Gear Checklist",
  "type": "gear",
  "icon": "🎿",
  "content": "Don't hit the slopes without these. Renting is great for first-timers.",
  "items": [
      {"label": "Skis & Bindings", "value": "Rent these. Should come up to roughly your chin or nose."},
      {"label": "Ski Boots", "value": "Most important. Should feel like a firm handshake, not torture."},
      {"label": "Helmet", "value": "Non-negotiable. Protect your brain."},
      {"label": "Goggles", "value": "Protect eyes from sun, wind, snow. Sunglasses only work on sunny spring days."},
      {"label": "Waterproof Jacket & Pants", "value": "Stay dry = stay warm. No jeans! Cotton kills (freezes)."},
      {"label": "Base Layers", "value": "Synthetic or wool (no cotton!) to wick sweat."},
      {"label": "Gloves or Mittens", "value": "Mittens warmer; gloves more dexterous. Waterproof is key."}
    ] },
  { "id": "sizing",
  "title": "Ski Sizing Guide",
  "type": "sizing",
  "icon": "📏",
  "content": "General guide for beginner ski length based on height. Shorter = easier to turn.",
  "items": [
      {"label": "5'0\" (152cm)", "value": "135-145cm"},
      {"label": "5'4\" (163cm)", "value": "145-155cm"},
      {"label": "5'8\" (173cm)", "value": "155-165cm"},
      {"label": "6'0\" (183cm)", "value": "165-175cm"},
      {"label": "6'4\" (193cm)", "value": "175-185cm"}
    ] },
  { "id": "first-day",
  "title": "First Day Survival Guide",
  "type": "guide",
  "icon": "🆕",
  "content": "### 1. Arrive Early (8:30 AM)\nParking fills fast on weekends. Get there early to secure a spot and sort rentals without stress.\n\n### 2. Take a Lesson\nEven just a half-day lesson saves days of frustration and potential injury. **Friends don't let friends teach friends** (it ruins friendships).\n\n### 3. Hydrate & Snack\nAltitude dehydrates you faster. Drink water. Keep a granola bar in your pocket.\n\n### 4. Know the Code\nPeople ahead of you have the right of way. **It is YOUR responsibility to avoid them.** Stop on the side of the trail, not in the middle." },
  { "id": "beyond-utah",
  "title": "Beyond Utah: 12-Hour Ski Destinations",
  "type": "guide",
  "icon": "🗺️",
  "content": "### SLC Airport is Your Hub\nSalt Lake International is perfectly positioned for a **12-hour driving radius** that includes world-class skiing across 6 states.\n\n### Colorado (~7-9 hours)\n- **Vail, Breckenridge, Aspen**: Epic Pass resorts\n- **Telluride**: Legendary terrain, iconic town\n- **Steamboat**: 'Champagne powder'\n\n### Wyoming (~5-6 hours)\n- **Jackson Hole**: Expert terrain, steep chutes (Ikon Pass)\n- **Grand Targhee**: Deep powder, quieter than Jackson\n\n### Idaho (~4-6 hours)\n- **Sun Valley**: America's first destination ski resort (1936)\n- **Schweitzer, Brundage**: Hidden gems with excellent snow\n\n### Montana (~8-10 hours)\n- **Big Sky**: Massive terrain, uncrowded\n- **Whitefish**: Charming town, great beginner/intermediate\n\n### Nevada (~6-7 hours)\n- **Mt. Rose**: Close to Reno/Tahoe\n\n### Arizona (~10-12 hours)\n- **Sunrise Park, Arizona Snowbowl**: Ski in the desert!\n\n*SLCTrips covers all of these. Use this TripKit as your foundation, then explore the Intermountain West.*\n\n*Source: Driving distances from SLC*" } ] $$::jsonb
WHERE slug = 'ski-utah-complete';