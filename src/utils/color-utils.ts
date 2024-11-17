const colorNamesToHex: { [key: string]: string } = {
  white: "#FFFFFF",
  black: "#000000",
  red: "#FF0000",
  green: "#00FF00",
  blue: "#0000FF",
  yellow: "#FFFF00",
  cyan: "#00FFFF",
  magenta: "#FF00FF",
  gray: "#808080",
  grey: "#808080",
  // Add more color names as needed
};

export function convertColorToHex(color: string): string {
  // Check if the color is a named color
  if (colorNamesToHex[color.toLowerCase()]) {
    return colorNamesToHex[color.toLowerCase()];
  }

  // Check if the color is in rgb format
  const rgbMatch = color.match(/^rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1]);
    const g = parseInt(rgbMatch[2]);
    const b = parseInt(rgbMatch[3]);

    return (
      "#" +
      ("0" + r.toString(16)).slice(-2) +
      ("0" + g.toString(16)).slice(-2) +
      ("0" + b.toString(16)).slice(-2)
    );
  }

  // If the color is already in hex format, return it
  if (color.match(/^#[0-9A-Fa-f]{6}$/)) {
    return color;
  }

  // If the color format is not recognized, return white as default
  return "#FFFFFF";
}
