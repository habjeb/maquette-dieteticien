/**
 * Police du titre du hero seulement. Les autres titres restent en Big Shoulders Display.
 * Pour essayer une autre : remplacer la valeur de `heroTitleFont`.
 * Fraunces est le choix par défaut : un serif chaud, lisible à côté de la photo,
 * distinct du titrage condensé du reste du site. Les trois sont sous licence OFL.
 */
export const heroTitleFonts = ["fraunces", "instrument-serif", "newsreader"] as const;

export type HeroTitleFont = (typeof heroTitleFonts)[number];

export const heroTitleFont: HeroTitleFont = "fraunces";
