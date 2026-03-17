# Bird Data Guide

## Schema (`birds.json`)

Each bird entry has the following fields:

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique kebab-case identifier (e.g. `japanese-crane`) |
| `nameZh` | string | Chinese common name |
| `pinyin` | string | Pinyin romanization of the Chinese name |
| `nameEn` | string | English common name |
| `scientificName` | string | Latin binomial name |
| `lat` | number | Latitude of a representative location |
| `lng` | number | Longitude of a representative location |
| `region` | string | One of: `asia`, `europe`, `africa`, `north-america`, `south-america`, `oceania`, `antarctica` |
| `funFactZh` | string | Fun fact in Chinese |
| `funFactEn` | string | Fun fact in English |
| `photoUrl` | string | Path to photo in `/public/images/birds/{id}.jpg` |
| `xenoCantoQuery` | string | Search query for xeno-canto API (usually the scientific name) |
| `silhouette` | string | Key matching an SVG filename in `src/assets/silhouettes/` (without `.svg`) |
| `audioUrl` | string? | Optional direct URL to an audio file; if set, played before falling back to xeno-canto |

## Migration Routes (`migrations.json`)

Each migration route connects two birds with an animated arc on the globe:

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique kebab-case identifier |
| `from` | string | Bird `id` of the origin point |
| `to` | string | Bird `id` of the destination point |
| `nameZh` | string? | Optional Chinese label for the route |
| `nameEn` | string? | Optional English label for the route |

The dataset currently contains **15 birds** (5 Singapore + 10 global) and **4 migration routes**.

## How to Add a New Bird

1. **Add the JSON entry**: Open `src/data/birds.json` and append a new object with all fields above.

2. **Add a photo**: Place a JPEG image at `public/images/birds/{id}.jpg`. Recommended size: 400x300px, <80 KB.

3. **Add a silhouette**: Create a 64x64px SVG file at `src/assets/silhouettes/{silhouette-key}.svg`. Use `fill="currentColor"` for theming. The silhouette index auto-discovers SVGs via `import.meta.glob`, so no manual import is needed.

4. **Verify**: Run `npm run dev` and confirm the new bird appears on the globe with its marker, info card, photo, and audio.

No code changes are required — only data files.

## Attribution & Licensing

### Photos
Bird photographs should be sourced from freely licensed repositories:
- **Wikimedia Commons** (CC BY-SA, CC BY, or public domain)
- **Pixabay** (Pixabay License — free for commercial use)
- **Unsplash** (Unsplash License — free for commercial use)

### Audio
Bird calls are fetched at runtime from the [xeno-canto API](https://xeno-canto.org/). Recordings on xeno-canto are shared under various Creative Commons licenses. This project uses them for non-commercial educational purposes.

### Silhouette SVGs
SVG silhouettes are original creations for this project. They are simple, stylized outlines and do not reproduce copyrighted artwork.
