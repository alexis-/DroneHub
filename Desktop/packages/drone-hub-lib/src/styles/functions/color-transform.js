export function hexToRgb(hex) {
  const red = parseInt(hex.substring(1, 3), 16);
  const green = parseInt(hex.substring(3, 5), 16);
  const blue = parseInt(hex.substring(5, 7), 16);

  return `${red} ${green} ${blue}`;
}

export function rgbToHex(r, g, b) {
  const toHex = (n) => {
    const hex = Math.max(0, Math.min(255, Math.round(n))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function shiftHex(hex, amount) {
  // Convert hex to RGB
  const red = parseInt(hex.substring(1, 3), 16);
  const green = parseInt(hex.substring(3, 5), 16);
  const blue = parseInt(hex.substring(5, 7), 16);

  // Calculate shift amount (0-255)
  const shift = Math.round(amount * 255);

  // Lighten each component by adding the shift amount
  const lightenedRed = Math.min(255, red + shift);
  const lightenedGreen = Math.min(255, green + shift);
  const lightenedBlue = Math.min(255, blue + shift);

  // Convert back to hex
  return rgbToHex(lightenedRed, lightenedGreen, lightenedBlue);
}

export function shiftRgb(rgb, amount) {
  // Parse RGB string (expects format: "r g b")
  const [red, green, blue] = rgb.split(' ').map(Number);

  // Calculate shift amount (0-255)
  const shift = Math.round(amount * 255);

  // Lighten each component by adding the shift amount
  const lightenedRed = Math.min(255, red + shift);
  const lightenedGreen = Math.min(255, green + shift);
  const lightenedBlue = Math.min(255, blue + shift);

  // Return space-separated RGB values
  return `${lightenedRed} ${lightenedGreen} ${lightenedBlue}`;
}

function hexToHsl(hex) {
  // Convert hex to RGB first
  let r = parseInt(hex.substring(1, 3), 16) / 255;
  let g = parseInt(hex.substring(3, 5), 16) / 255;
  let b = parseInt(hex.substring(5, 7), 16) / 255;

  // Find greatest and smallest channel values
  let cmin = Math.min(r, g, b),
      cmax = Math.max(r, g, b),
      delta = cmax - cmin,
      h = 0,
      s = 0,
      l = 0;

  // Calculate hue
  if (delta === 0) h = 0;
  else if (cmax === r) h = ((g - b) / delta) % 6;
  else if (cmax === g) h = (b - r) / delta + 2;
  else h = (r - g) / delta + 4;

  h = Math.round(h * 60);
  if (h < 0) h += 360;

  // Calculate lightness
  l = (cmax + cmin) / 2;

  // Calculate saturation
  s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

  return [h, s * 100, l * 100];
}

function hslToHex(h, s, l) {
  s /= 100;
  l /= 100;

  let c = (1 - Math.abs(2 * l - 1)) * s,
      x = c * (1 - Math.abs((h / 60) % 2 - 1)),
      m = l - c/2,
      r = 0,
      g = 0,
      b = 0;

  if (0 <= h && h < 60) {
    r = c; g = x; b = 0;
  } else if (60 <= h && h < 120) {
    r = x; g = c; b = 0;
  } else if (120 <= h && h < 180) {
    r = 0; g = c; b = x;
  } else if (180 <= h && h < 240) {
    r = 0; g = x; b = c;
  } else if (240 <= h && h < 300) {
    r = x; g = 0; b = c;
  } else if (300 <= h && h < 360) {
    r = c; g = 0; b = x;
  }

  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);

  return rgbToHex(r, g, b);
}

/**
 * Get a color from a palette based on the base color and weight.
 * @param {string} baseColor - The base color in hex format (e.g., #1C3D5A)
 * @param {number|string} weight - The weight of the color (100-1000, DEFAULT, or hover)
 * @returns {string} The resulting color in hex format
 */
export function getColorPalette(baseColor, weight) {
  const [h, s, l] = hexToHsl(baseColor);
  
  // Handle special cases
  if (weight === 0 || weight === 'DEFAULT') {
    return baseColor;
  }
  if (weight === 'hover') {
    return hslToHex(h, s, Math.min(l + 10, 100));
  }
  
  // For numeric weights (100-1000)
  // 100 is lightest (90% lightness), 1000 is darkest (10% lightness)
  const weightNum = parseInt(weight);
  if (weightNum >= 100 && weightNum <= 1000) {
    const newL = 90 - ((weightNum / 100 - 1) * 8);
    return hslToHex(h, s, Math.min(Math.max(newL, 0), 100));
  }
  
  // Return base color as fallback
  return baseColor;
}

/**
 * Get the RGB values for a color from the palette.
 * @param {string} baseColor - The base color in hex format (e.g., #1C3D5A)
 * @param {number|string} weight - The weight of the color (100-1000, DEFAULT, or hover)
 * @returns {string} Space-separated RGB values (e.g., "28 61 90")
 */
export function getColorPaletteRgb(baseColor, weight) {
  const hex = getColorPalette(baseColor, weight);
  return hexToRgb(hex);
}

export function generateColorPalette(baseColor) {
  const [h, s, l] = hexToHsl(baseColor);
  const palette = {};
  
  // Generate shades from 100 to 1000
  for (let i = 1; i <= 10; i++) {
    const weight = i * 100;
    // Adjust lightness based on weight
    // 100 is lightest (90% lightness), 1000 is darkest (10% lightness)
    const newL = 90 - ((i - 1) * 8);
    const hex = hslToHex(h, s, Math.min(Math.max(newL, 0), 100));
    palette[weight] = hex;
  }

  // Add DEFAULT and HOVER values
  palette.DEFAULT = baseColor;
  palette.hover = hslToHex(h, s, Math.max(l + 10, 0)); // 10% lighter for hover

  return palette;
}

export function generateColorVariables(colorName, baseColor) {
  const palette = generateColorPalette(baseColor);
  let css = '';

  // Generate variables for each shade
  Object.entries(palette).forEach(([weight, hex]) => {
    if (weight === 'DEFAULT') {
      css += `  --color-${colorName}: ${hex};\n`;
      css += `  --color-${colorName}-rgb: ${hexToRgb(hex)};\n`;
    } else if (weight === 'hover') {
      css += `  --color-${colorName}-hover: ${hex};\n`;
      css += `  --color-${colorName}-hover-rgb: ${hexToRgb(hex)};\n`;
    } else {
      css += `  --color-${colorName}-${weight}: ${hex};\n`;
      css += `  --color-${colorName}-${weight}-rgb: ${hexToRgb(hex)};\n`;
    }
  });

  return css;
}