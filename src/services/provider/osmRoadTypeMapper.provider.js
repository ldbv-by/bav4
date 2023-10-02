/**
 * @module services/provider/osmRoadTypeMapper_provider
 */
import { isNumber } from '../../utils/checks';

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

export const bvvOsmRoadTypeMappingProvider = (osmRoadClasses) => {
	const getRoadTypeFor = (osmRoadType) => {
		for (const roadTypeName in bvvMapping) {
			const osmClasses = bvvMapping[roadTypeName];
			if (osmClasses.indexOf(osmRoadType) > -1) {
				return roadTypeName;
			}
		}
		return null;
	};
	const getDistance = (candidate) => {
		return isNumber(candidate) ? candidate : candidate.distance;
	};

	const getSegmentsOrEmpty = (candidate) => {
		return candidate.segments ?? [];
	};

	const merge = (roadType, data) => {
		return { ...roadType, distance: roadType.distance + getDistance(data), segments: roadType.segments.concat(getSegmentsOrEmpty(data)) };
	};
	const add = (data) => {
		return {
			distance: getDistance(data),
			segments: getSegmentsOrEmpty(data)
		};
	};

	const mappedRoadType = {};
	for (const osmRoadClass in osmRoadClasses) {
		const roadType = getRoadTypeFor(osmRoadClass);
		if (roadType) {
			mappedRoadType[roadType] = mappedRoadType[roadType]
				? merge(mappedRoadType[roadType], osmRoadClasses[osmRoadClass])
				: add(osmRoadClasses[osmRoadClass]);
		} else {
			mappedRoadType[osmRoadClass] = add(osmRoadClasses[osmRoadClass]);
		}
	}
	return mappedRoadType;
};
