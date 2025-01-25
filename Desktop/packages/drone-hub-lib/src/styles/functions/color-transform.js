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