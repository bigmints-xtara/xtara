# MonaSans Font Implementation - GitHub Primer Typography System

## Overview
The xtara website now uses MonaSans as its primary font family, implementing the GitHub Primer typography system. This provides a clean, professional design with consistent typography scales and limited font weights for better readability.

## Font Files
- **Location**: `/public/fonts/`
- **Main Font**: `MonaSans[ital,wdth,wght].woff2` - Variable font covering weights 300-600
- **License**: `LICENSE` - MonaSans license file

## Font Weights Available
Following GitHub Primer guidelines, only four standard weights are used:
- **300** - Light
- **400** - Normal (Regular)
- **500** - Medium
- **600** - Semibold

*Note: Italics are not used in the Primer design system for better readability.*

## Typography Scale
Based on GitHub Primer's typography system:

### Display Text
- **Size**: 2.5rem (40px)
- **Weight**: Medium (500)
- **Line Height**: 1.4

### Title Text
- **Large**: 2rem (32px), Semibold (600), Line Height: 1.5
- **Medium**: 1.25rem (20px), Semibold (600), Line Height: 1.6
- **Small**: 1rem (16px), Semibold (600), Line Height: 1.5

### Subtitle
- **Size**: 1.25rem (20px)
- **Weight**: Normal (400)
- **Line Height**: 1.6

### Body Text
- **Large**: 1rem (16px), Normal (400), Line Height: 1.5
- **Medium**: 0.875rem (14px), Normal (400), Line Height: 1.4285
- **Small**: 0.75rem (12px), Normal (400), Line Height: 1.6666

### Caption
- **Size**: 0.75rem (12px)
- **Weight**: Normal (400)
- **Line Height**: 1.3333

## CSS Variables
```css
:root {
  --font-heading: 'MonaSans', sans-serif;
  --font-body: 'MonaSans', sans-serif;
  
  /* Font Weights */
  --font-weight-light: 300;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  
  /* Typography Scale */
  --font-display: 2.5rem;
  --font-title-large: 2rem;
  --font-title-medium: 1.25rem;
  --font-title-small: 1rem;
  --font-subtitle: 1.25rem;
  --font-body-large: 1rem;
  --font-body-medium: 0.875rem;
  --font-body-small: 0.75rem;
  --font-caption: 0.75rem;
}
```

## Tailwind Classes

### Font Family
```css
.font-monasans        /* MonaSans font family */
.font-monasans-heading /* MonaSans font family for headings */
```

### Font Weights
```css
.font-light           /* Weight 300 */
.font-normal          /* Weight 400 */
.font-medium          /* Weight 500 */
.font-semibold        /* Weight 600 */
```

### Typography Scale
```css
.text-display         /* Display text - 2.5rem, medium weight */
.text-title-large     /* Title large - 2rem, semibold weight */
.text-title-medium    /* Title medium - 1.25rem, semibold weight */
.text-title-small     /* Title small - 1rem, semibold weight */
.text-subtitle        /* Subtitle - 1.25rem, normal weight */
.text-body-large      /* Body large - 1rem, normal weight */
.text-body-medium     /* Body medium - 0.875rem, normal weight */
.text-body-small      /* Body small - 0.75rem, normal weight */
.text-caption         /* Caption - 0.75rem, normal weight */
```

## Usage Examples

### In CSS
```css
.heading {
  font-family: var(--font-heading);
  font-size: var(--font-title-large);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-title-large);
}

.body-text {
  font-family: var(--font-body);
  font-size: var(--font-body-large);
  font-weight: var(--font-weight-normal);
  line-height: var(--line-height-body-large);
}
```

### In Tailwind
```jsx
<h1 className="text-display font-medium">
  Display Heading with MonaSans Medium
</h1>

<h2 className="text-title-large font-semibold">
  Large Title with MonaSans Semibold
</h2>

<p className="text-body-large font-normal">
  Body text with MonaSans Normal weight
</p>

<small className="text-caption font-normal">
  Caption text with MonaSans Normal weight
</small>
```

## Design Principles

### GitHub Primer Guidelines
- **Limited Font Weights**: Only 4 weights (300, 400, 500, 600) for consistency
- **No Italics**: Improves readability and maintains clean design
- **Structured Scale**: Consistent typography hierarchy
- **Optimal Line Heights**: Carefully calculated for each text size

### Benefits
- **Consistency**: Uniform typography across all components
- **Readability**: Optimized line heights and weights
- **Performance**: Limited font weights reduce file size
- **Accessibility**: Clear hierarchy and good contrast

## Performance Benefits
- **Single variable font file** reduces HTTP requests
- **Font preloading** improves loading performance
- **Local fonts** eliminate external dependencies
- **Font-display: swap** prevents layout shifts
- **Limited weights** optimize font loading

## Browser Support
- **Modern browsers**: Full support for variable fonts
- **Fallback**: Sans-serif fallback for older browsers

## Maintenance
- Font files are stored in `/public/fonts/`
- CSS declarations are in `/src/app/globals.css`
- Tailwind configuration in `/tailwind.config.ts`
- Font preloading in `/src/app/layout.tsx`

## License
MonaSans is licensed under the SIL Open Font License. See `/public/fonts/LICENSE` for details.
