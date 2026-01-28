export const BRAND_STYLE_GUIDE = {
    tone: "Calm, Authoritative, Professional, Empathetic to Gen X career anxiety.",
    visualStyle: {
        lighting: "Cinematic, high-contrast, professional, warm highlights.",
        environment: "Modern glass offices, clean home studies, high-end libraries, or tech-enabled home environments (for Daily Use).",
        colorPalette: "Deep navy, slate grey, with primary accents of indigo (#6366f1) and success green (#10b981).",
        subjects: "Professionals aged 35-55, looking competent, focused, and empowered by technology, never overwhelmed.",
    },
    typography: "Clean sans-serif (Inter/Roboto), hierarchy-conscious, minimal text-on-screen.",
    narrativeAngle: "The 'Ageless Advantage'—leveraging decades of experience via AI levers.",
};

export const STYLE_INSTRUCTIONS = `
  STRICT STYLE GUIDE ADHERENCE:
  - Tone: ${BRAND_STYLE_GUIDE.tone}
  - Visuals: Use ${BRAND_STYLE_GUIDE.visualStyle.lighting} lighting. 
  - Subjects should be ${BRAND_STYLE_GUIDE.visualStyle.subjects}.
  - VEO Prompts must specify: ${BRAND_STYLE_GUIDE.visualStyle.colorPalette} and ${BRAND_STYLE_GUIDE.visualStyle.environment}.
  - Narrative: Always frame through the ${BRAND_STYLE_GUIDE.narrativeAngle}.
`;
