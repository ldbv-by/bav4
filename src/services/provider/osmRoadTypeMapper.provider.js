/**
 * @module services/provider/osmRoadTypeMapper_provider
 */

/**
 * A function that maps and reduces OSM road types to the name of defined {@link ChartItemStyle}.
 *
 * @typedef {function(Map<string,module:services/RoutingService~RoutingService#OSMRoadClass|number>) : (string|null)} osmRoadTypeMapperProvider
 */

const bvvMapping = {
	unknown: ['other', 'track_other', 'path_other', 'footway_other'],
	path: ['path_grade3', 'path_grade4', 'path_grade5'],
	track: ['track_grade2', 'track_grade3', 'track_grade4', 'track_grade5'],
	footway: ['footway_grade2', 'footway_grade3', 'pedestrian', 'cycleway', 'path_grade1', 'path_grade2'],
	street: ['track_grade1', 'residential', 'unclassified', 'tertiary', 'service'],
	mainstreet: ['secondary', 'primary', 'motorway']
};

export const bvvOsmRoadTypeMappingProvider = (osmRoadType) => {
	for (const roadTypeName in bvvMapping) {
		const osmClasses = bvvMapping[roadTypeName];
		if (osmClasses.indexOf(osmRoadType) > -1) {
			return roadTypeName;
		}
	}
	return null;
};
