/**
 * Premium Background Scenes for AI Image Generation
 * Used to provide consistent, high-quality backgrounds for marketing posters and product enhancements.
 */

export const AI_BACKGROUND_SCENES = {
    LUXURY_MANSION: {
        name: "Luxury Modern Mansion Driveway",
        description: "A wide, paved driveway of a sleek, contemporary architectural mansion with large glass windows. Minimalist landscaping, geometric concrete structures.",
        lighting: "Golden Hour sunset glow, warm sidelighting, soft long shadows.",
        style: "Photorealistic, Architectural Photography, 8K, cinematic depth of field."
    },
    COASTAL_HIGHWAY: {
        name: "Scenic Coastal Highway",
        description: "A winding seaside road with a clear view of the deep blue ocean. Dramatic cliffs in the background and a pristine asphalt road surface.",
        lighting: "Bright mid-day sunlight, high contrast, sparkling water reflections.",
        style: "Travel Photography, Commercial Car Ad look, vibrant colors, ultra-clear."
    },
    URBAN_ROOFTOP: {
        name: "Modern Urban Rooftop",
        description: "A polished concrete rooftop parking area with a blurred city skyline backdrop. Modern skyscrapers with glass facades.",
        lighting: "Blue hour twilight, bokeh city lights, cool ambient tones with neon accents.",
        style: "Premium Lifestyle, Cyberpunk-lite, sharp focus on subject, soft background blur."
    },
    MINIMAL_STUDIO: {
        name: "Minimalist Architectural Space",
        description: "An empty, vast gallery-style space with smooth matte concrete floors and one textured feature wall. Pure negative space.",
        lighting: "Soft diffused top-lighting, 'Museum lighting', gentle gradients, no harsh shadows.",
        style: "Elegant, Minimalist, High-end Magazine Style, soft shadows."
    },
    SUNNY_PARK: {
        name: "Lush Suburban Park",
        description: "A well-manicured green lawn next to a winding stone path. Mature oak trees and dappled sunlight hitting the ground.",
        lighting: "Bright afternoon sun filtered through leaves (dappled light), natural green bounce.",
        style: "Family Lifestyle, Warm, Inviting, vibrant natural colors."
    },
    TECH_SHOWROOM: {
        name: "High-Tech Future Showroom",
        description: "A clean, glossy white showroom floor with integrated LED strip lighting in the ceiling and walls. Reflective surfaces.",
        lighting: "Pure white studio lighting (5500K), sharp reflections, futuristic vibe.",
        style: "Commercial Studio, Clean, High-tech, sharp textures."
    },
    RACING_TRACK: {
        name: "Professional Racing Circuit",
        description: "The pit lane or starting grid of a modern Formula 1 track. Curved red and white curbs, blurred grandstands.",
        lighting: "Dramatic overcast lighting, slightly moody, focus on textures of the asphalt.",
        style: "High-energy, Action Sport, Professional Racing, motion blur on wheels."
    },
    STUDIO_PREMIUM: {
        name: "Premium Product Studio",
        description: "A professional photographic studio with a seamless infinity curve background. Extremely clean and high-end feel.",
        lighting: "Softbox lighting from both sides, subtle rim light to define edges, neutral color temperature (5500K).",
        style: "Commercial Product Photography, Clean, Minimalist, 8K resolution, sharp focus."
    },
    STUDIO_WHITE: {
        name: "Pure White Studio",
        description: "A bright, high-key pure white studio background with an invisible floor-to-wall transition.",
        lighting: "Bright, even illumination, no harsh shadows, soft gray gradient under the product.",
        style: "E-commerce Catalog, Clean, Bright, minimalist."
    },
    STUDIO_GREY: {
        name: "Deep Charcoal Studio",
        description: "A sophisticated dark charcoal grey studio background with a subtle matte texture.",
        lighting: "Dramatic spotlighting on the product, deep shadows, premium luxury feel.",
        style: "Luxury Goods, Moody, Sophisticated, high contrast."
    },
    SWISS_ALPS: {
        name: "Majestic Swiss Alps",
        description: "A breathtaking view of snow-capped mountain peaks under a crystal clear blue sky. A winding alpine road carved into the mountainside.",
        lighting: "Crisp morning sunlight, high-altitude clarity, subtle lens flare.",
        style: "Epic Landscape Photography, Cinematic, 12K detail, awe-inspiring scale."
    },
    DESERT_OASIS: {
        name: "Grand Desert Dunes",
        description: "Infinite rolling sand dunes of the Sahara at sunset. The sand has a beautiful rippled texture.",
        lighting: "Deep orange sunset glow, long dramatic shadows, warm atmospheric haze.",
        style: "Cinematic Travel, National Geographic style, high contrast, vibrant textures."
    },
    FOREST_LAKE: {
        name: "Serene Mountain Lake",
        description: "A mirror-like lake reflecting a dense pine forest and jagged mountain peaks. A wooden pier or gravel shore in the foreground.",
        lighting: "Soft morning mist, diffused sunlight through trees, cool refreshing tones.",
        style: "Tranquil Nature, Sharp Reflections, 8K, peaceful atmosphere."
    },
    MOUNTAIN_PASS: {
        name: "Epic High-Mountain Pass",
        description: "A high-altitude road with dramatic hairpins and sheer drops, overlooking a vast valley below. Clouds are below the road level.",
        lighting: "Dramatic stormy sky with sunbeams breaking through (God rays), high drama.",
        style: "Automotive Commercial, Professional Drone Shot, extreme depth of field."
    }
};

export type SceneKey = keyof typeof AI_BACKGROUND_SCENES;

export function getRandomScene(): typeof AI_BACKGROUND_SCENES[SceneKey] {
    const keys = Object.keys(AI_BACKGROUND_SCENES) as SceneKey[];
    return AI_BACKGROUND_SCENES[keys[Math.floor(Math.random() * keys.length)]];
}

export function getStudioScene(): typeof AI_BACKGROUND_SCENES[SceneKey] {
    const studioKeys: SceneKey[] = ["STUDIO_PREMIUM", "STUDIO_WHITE", "STUDIO_GREY"];
    return AI_BACKGROUND_SCENES[studioKeys[Math.floor(Math.random() * studioKeys.length)]];
}

export function getHeroScene(): typeof AI_BACKGROUND_SCENES[SceneKey] {
    const heroKeys: SceneKey[] = ["SWISS_ALPS", "DESERT_OASIS", "FOREST_LAKE", "MOUNTAIN_PASS", "LUXURY_MANSION", "COASTAL_HIGHWAY"];
    return AI_BACKGROUND_SCENES[heroKeys[Math.floor(Math.random() * heroKeys.length)]];
}

export function getScenePrompt(sceneKey: SceneKey): string {
    const scene = AI_BACKGROUND_SCENES[sceneKey];
    return `SCENE: ${scene.description}
LIGHTING: ${scene.lighting}
STYLE: ${scene.style}`;
}
