/**
 * Geometry Helper Functions
 * Reusable geometry calculations for 3D scene
 */

/**
 * Get roof parameters for solar panel placement
 * Calculates ridge height and dimensions based on house structure
 */
export function getRoofParameters() {
  const houseHeight = 6; // Match single-story house
  const houseWidth = 18;
  const panelAngle = 30;
  const angleRad = (panelAngle * Math.PI) / 180;
  const halfHouseWidth = houseWidth / 2;
  const ridgeHeight = halfHouseWidth * Math.tan(angleRad);

  return {
    ridgeY: houseHeight + ridgeHeight,
    ridgeHeight,
    houseHeight,
    houseWidth,
    panelAngle,
  };
}
