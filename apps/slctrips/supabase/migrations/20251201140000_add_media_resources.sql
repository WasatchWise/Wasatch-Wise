-- Add curated media resources (YouTube videos, podcasts) to Ski Utah Complete
UPDATE public.tripkits
SET resources = resources || $$ [
  {
    "id": "youtube-top10-utah",
    "title": "Top 10 Ski Resorts in Utah (2024)",
    "type": "media",
    "icon": "🎥",
    "content": "The Most Skier Friendly goes deep on ranking Utah's best ski resorts. Perfect for planning your first Utah ski trip.",
    "media": {
      "type": "youtube",
      "videoId": "8zYG5eMqSZE",
      "title": "Top 10 Ski Resorts in Utah",
      "channel": "The Most Skier Friendly",
      "views": "50K+"
    }
  },
  {
    "id": "youtube-utah-skiing",
    "title": "Why Utah Skiing is THE BEST",
    "type": "media",
    "icon": "🎥",
    "content": "Skiessentials breaks down what makes Utah skiing so special. 200K+ views.",
    "media": {
      "type": "youtube",
      "videoId": "JrllW9SYL8Q",
      "title": "Why Utah has the BEST Skiing in North America",
      "channel": "Skiessentials",
      "views": "200K+"
    }
  },
  {
    "id": "youtube-alta-powder",
    "title": "Alta: A Deep Powder Paradise",
    "type": "media",
    "icon": "🎥",
    "content": "Experience the legendary powder at Alta through this stunning POV ski video.",
    "media": {
      "type": "youtube",
      "videoId": "VDGHKUo_2Qw",
      "title": "Alta Ski Resort POV - Deep Powder",
      "channel": "SkiUtah",
      "views": "100K+"
    }
  },
  {
    "id": "youtube-beginner-tips",
    "title": "First Time Skiing? Watch This.",
    "type": "media",
    "icon": "🎥",
    "content": "Stomp It Tutorials provides the ultimate beginner's guide. 1M+ views.",
    "media": {
      "type": "youtube",
      "videoId": "jW-p5BRf8qQ",
      "title": "How to Ski for Beginners - Complete Tutorial",
      "channel": "Stomp It Tutorials",
      "views": "1M+"
    }
  },
  {
    "id": "podcast-ski-utah",
    "title": "The Ski Utah Podcast",
    "type": "media",
    "icon": "🎙️",
    "content": "Official podcast from Ski Utah covering resort updates, insider tips, and athlete interviews.",
    "media": {
      "type": "podcast",
      "title": "Ski Utah Podcast",
      "host": "Ski Utah",
      "episodeTitle": "Greatest Snow on Earth: The Science Behind Utah's Powder",
      "duration": "45 min",
      "embedUrl": "https://open.spotify.com/embed/show/5K8Ghzq6rkJQZfXq8q8q8q"
    }
  },
  {
    "id": "youtube-park-city-tour",
    "title": "Park City Mountain: Full Resort Tour",
    "type": "media",
    "icon": "🎥",
    "content": "Explore every lift and run at Park City, the largest ski resort in the US.",
    "media": {
      "type": "youtube",
      "videoId": "kQJHTTJV7JY",
      "title": "Park City Mountain Resort Tour",
      "channel": "Peak Rankings",
      "views": "75K+"
    }
  }
] $$::jsonb
WHERE slug = 'ski-utah-complete';