/**
 * @module domain/geometryStatisticTypeDef
 */
/**
 * Statistic data of a geometry.
 * The optional properties are filled
 * depending on the geometry type:
 * - Point: coordinate
 * - Line: length
 * - Line with 2 coordinates: azimuth,length
 * - Polygon: length, area
 * @typedef {Object} GeometryStatistic
 * @property {GeometryType} geometryType the geometryType of the geometry related to this statistic
 * @property {module:domain/coordinateTypeDef~Coordinate} [coordinate] the coordinate of the point geometry
 * @property {number} [azimuth] the horizontal angle in degree of the line geometry
 * @property {number} [length] the length in meter of the line or polygon geometry
 * @property {number} [area] the area in squaremeter of the polygon geometry
 */
