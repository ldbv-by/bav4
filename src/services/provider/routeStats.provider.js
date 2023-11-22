/**
 * @module services/provider/routeStats_provider
 */

import Polyline from 'ol/format/Polyline.js';
import { Geodesic, PolygonArea } from 'geographiclib-geodesic';
import { $injector } from '../../injection/index';
import { RouteWarningCriticality } from '../../domain/routing';

/**
 * The predefined vehicle-specific SpeedOptions for Hike, Bike, MTB and Roadbike
 */
const VehicleSpeedOptions = {
	'bvv-hike': { up: 300, down: 500, horizontal: 4000 }, // Base from DIN 33466/DAV
	'bvv-bike': { up: 300, down: 250000, horizontal: 15000 }, // average cyclist with comfortable pace
	'bvv-mtb': { up: 400, down: 250000, horizontal: 20000 }, // sportive cyclist on paved roads and rough terrain with higher pace
	racingbike: { up: 400, down: 350000, horizontal: 27000 } // sportive/racing cyclist on only paved roads (asphalt,tarmac,concrete) with higher pace
};

/**
 * An Array of 2 numbers and a string, representing a single detail of route: [from, to, property]
 * Example: `[2, 4, 'apple']`
 * @typedef {Array} RouteDetail
 */

/**
 * @typedef {Object} RouteWarningRuleOptions
 * @property {string} language
 * @property {string} vehicle
 * @property {string} roadClass
 * @property {string} surface
 */

/**
 * @typedef {Object} RouteWarning
 * @property {number} id
 * @property {string} message
 * @property {string} criticality
 */

/**
 * A function that returns an attribution (or an array of them).
 * @typedef {Function} RouteWarningRuleFunction
 * @param {RouteWarningRuleOptions} ruleOptions
 * @returns {RouteWarning} the warning
 */

const defaultRuleOptions = { lang: 'de', vehicle: null, roadClass: null, surface: null };

const RouteWarningRuleFunctions = [
	(ruleOptions) => {
		// Kein Fahrrad auf schwieriger Steig im Gebirge
		const vulnerableVehicles = ['bike', 'racingbike'];
		const dangerousRoadClasses = ['path_grade4'];
		if (vulnerableVehicles.includes(ruleOptions.vehicle) && dangerousRoadClasses.includes(ruleOptions.roadClass)) {
			return {
				id: 100,
				message:
					ruleOptions.lang === 'de'
						? '(schwieriger) Steig, Trittsicherheit erforderlich. Fahrrad muss vorher abgestellt werden.'
						: '(Difficult) climb, sure-footedness required. Bicycle must be parked beforehand.',
				criticality: RouteWarningCriticality.WARNING
			};
		}
		return null;
	},
	(ruleOptions) => {
		// Kein MTB auf schwieriger Steig im Gebirge
		const vulnerableVehicles = ['hike', 'mtb'];
		const dangerousRoadClasses = ['path_grade4'];
		if (vulnerableVehicles.indexOf(ruleOptions.vehicle) > -1 && dangerousRoadClasses.indexOf(ruleOptions.roadClass) > -1) {
			return ruleOptions.vehicle === 'hike'
				? {
						id: 102,
						message: ruleOptions.lang === 'de' ? '(schwieriger) Steig, Trittsicherheit erforderlich.' : '(Difficult) climb, surefootedness required.',
						criticality: RouteWarningCriticality.HINT
				  }
				: {
						id: 101,
						message:
							ruleOptions.lang === 'de'
								? '(schwieriger) Steig, Trittsicherheit erforderlich. MTB muss evtl. vorher abgestellt oder getragen werden.'
								: '(Difficult) climb, surefootedness required. MTB may have to be parked or carried beforehand.',
						criticality: RouteWarningCriticality.HINT
				  };
		}
		return null;
	},
	(ruleOptions) => {
		// Kein Fahrrad auf Klettersteig
		const vulnerableVehicles = ['hike', 'bike', 'mtb', 'racingbike'];
		const dangerousRoadClasses = ['path_grade5'];
		if (vulnerableVehicles.indexOf(ruleOptions.vehicle) > -1 && dangerousRoadClasses.indexOf(ruleOptions.roadClass) > -1) {
			return ruleOptions.vehicle === 'hike'
				? {
						id: 201,
						message:
							ruleOptions.lang === 'de'
								? 'schwieriger Steig mit Kletterpassagen; gute Trittsicherheit, ggf. spezielle Ausrüstung erforderlich'
								: 'difficult climb with climbing passages; good surefootedness, special equipment may be required',
						criticality: RouteWarningCriticality.WARNING
				  }
				: {
						id: 200,
						message:
							ruleOptions.lang === 'de'
								? 'schwieriger Steig mit Kletterpassagen; gute Trittsicherheit, ggf. spezielle Ausrüstung erforderlich; Fahrrad muss vorher abgestellt werden.'
								: 'difficult trail with climbing sections; good surefootedness, special equipment may be required; bikes must be parked beforehand.',
						criticality: RouteWarningCriticality.WARNING
				  };
		}
		return null;
	},
	(ruleOptions) => {
		// Kein Rennrad auf nicht asphaltierter Oberfläche
		const dangerousSurface = ['compacted'];
		const isDangerousSurfaceOrRoadClass = dangerousSurface.indexOf(ruleOptions.surface) > -1;
		if (ruleOptions.vehicle === 'racingbike' && isDangerousSurfaceOrRoadClass) {
			return {
				id: 300,
				message:
					ruleOptions.lang === 'de'
						? 'Befestigter Weg/Pfad. Rennrad evtl. muss geschoben werden.'
						: 'Paved path/trail. Racing bike may have to be pushed.',
				criticality: RouteWarningCriticality.HINT
			};
		}
		return null;
	},
	(ruleOptions) => {
		// Kein Rennrad auf losem Untergrund
		const id = 301;
		const dangerousSurface = ['ground'];
		const dangerousRoadClass = ['path_grade3', 'track_grade5', 'other'];
		const isDangerousSrufaceOrRoadClass =
			dangerousSurface.indexOf(ruleOptions.surface) > -1 && dangerousRoadClass.indexOf(ruleOptions.roadClass) > -1;
		if (ruleOptions.vehicle === 'racingbike' && isDangerousSrufaceOrRoadClass) {
			return {
				id: id,
				message:
					ruleOptions.lang === 'de' ? 'Unbefestigter Weg/Pfad. Rennrad muss geschoben werden.' : 'Unpaved path/trail. Road bike must be pushed.',
				criticality: RouteWarningCriticality.WARNING
			};
		}
		return null;
	},
	(ruleOptions) => {
		// Kein Fahrrad/Rennrad auf Fahrwegspur
		const id = 400;
		const vulnerableVehicles = ['bike'];
		if (vulnerableVehicles.indexOf(ruleOptions.vehicle) > -1 && ruleOptions.surface === 'ground' && ruleOptions.roadClass === 'track_grade5') {
			return {
				id: id,
				message:
					ruleOptions.lang === 'de'
						? 'Unbefestigter Weg/Pfad. Fahrrad muss evtl. geschoben werden.'
						: 'Unpaved path/trail. Bicycle may have to be pushed.',
				criticality: RouteWarningCriticality.HINT
			};
		}
		return null;
	},
	(ruleOptions) => {
		// Kein Wandern an Fernstraßen
		const id = 500;
		const dangerousRoadClass = ['primary', 'motorway', 'secondary'];
		return dangerousRoadClass.includes(ruleOptions.roadClass)
			? {
					id: id,
					message: ruleOptions.lang === 'de' ? 'Evtl. hohes Verkehrsaufkommen' : 'Possibly high traffic volume',
					criticality: RouteWarningCriticality.HINT
			  }
			: null;
	}
];

/**
 * BVV specific calculation for ETAs (Estimated Time Arrived)
 * for defined vehicle classes (Hike, Bike,MTB.Racingbike).
 * Based on formulas from DAV and DIN (DIN 33466) for hiking only
 * ({@link https://de.wikipedia.org/wiki/Marschzeitberechnung})
 * but adapted for Bike, MTB and Racingbike.
 *
 * walking duration estimate based on DAV-Normative:
 *  - {@link https://discuss.graphhopper.com/t/walking-duration-estimate-elevation-ignored/4621/4}
 *  - {@link https://www.alpenverein.de/chameleon/public/908f5f80-1a20-3930-1692-41be014372d2/Formel-Gehzeitberechnung_19001.pdf} *
 *
 */
const getETAFor = (distance, elevationUp, elevationDown, speedOptions) => {
	const { up: upSpeed, down: downSpeed, horizontal: horizontalSpeed } = speedOptions;
	const hourInMilliSeconds = 3600000;

	const verticalTime = (elevationUp / upSpeed + elevationDown / downSpeed) * hourInMilliSeconds;
	const horizontalTime = (distance / horizontalSpeed) * hourInMilliSeconds;

	return verticalTime > horizontalTime ? horizontalTime / 2 + verticalTime : verticalTime / 2 + horizontalTime;
};

const getGeodesicLength = (wgs84Coordinates) => {
	const geodesicPolygon = new PolygonArea.PolygonArea(Geodesic.WGS84, true);
	for (const [lon, lat] of wgs84Coordinates) {
		geodesicPolygon.AddPoint(lat, lon);
	}
	const res = geodesicPolygon.Compute(false, true);
	return res.perimeter;
};

/**
 * Aggregates RouteDetails by the property value
 * @param {Array<RouteDetail>} detailData
 * @param {Array<Coordinate>} coordinates
 * @returns {Object.<string, module:domain/routing~RouteDetailTypeAttribute>}
 */
const aggregateDetailData = (detailData, coordinates) => {
	return detailData.reduce((accumulator, current) => {
		const [from, to, category] = current;
		const subset = coordinates.slice(from, to + 1);
		const length = getGeodesicLength(subset);

		if (category) {
			const segment = [from, to];
			if (accumulator[category]) {
				accumulator[category].distance = accumulator[category].distance + length;
				accumulator[category].segments = [...accumulator[category].segments, segment];
			} else {
				accumulator[category] = { distance: length, segments: [segment] };
			}
		}
		return accumulator;
	}, {});
};

/**
 * Finds any routeDetail, which have the following relations to thisDetail:
 * equal,contains, overlap, partially overlap
 * @param {RouteDetail} thisDetail
 * @param {Array<RouteDetail>} otherDetails
 * @returns {Array<RouteDetail>} the interacting routeDetails
 */
const findAnyInteractingRouteDetail = (thisDetail, otherDetails) => {
	const startThis = thisDetail[0];
	const endThis = thisDetail[1];

	return otherDetails.filter((other) => {
		const startOther = other[0];
		const endOther = other[1];
		return endOther > startThis && startOther < endThis;
	});
};

/**
 * Merges RouteDetails
 * @param {RouteDetail} thisDetail
 * @param {Array<RouteDetail>} otherDetails
 * @param {function(RouteDetail, RouteDetail): *} propertyMergeFunction callback function for the resulting property of two RouteDetails
 * @param {function(RouteDetail): *} propertyDefaultFunction
 * @returns {Array<RouteDetail>} the merged array of RouteDetails
 */
const mergeRouteDetails = (thisDetail, otherDetails, propertyMergeFunction, propertyDefaultFunction = null) => {
	const mergedDetails = otherDetails.map((otherDetail) => {
		const from = otherDetail[0] <= thisDetail[0] ? thisDetail[0] : otherDetail[0];
		const to = otherDetail[1] <= thisDetail[1] ? otherDetail[1] : thisDetail[1];
		const property = propertyMergeFunction(thisDetail, otherDetail);
		return [from, to, property];
	});
	const justifyStart = (primaryDetail, details, property) => {
		const first = details[0];
		return [first[0] > primaryDetail[0] ? [primaryDetail[0], first[1], property] : first, ...details.slice(1)];
	};

	const justifyLast = (primaryDetail, details, property) => {
		const last = details[details.length - 1];
		return [...details.slice(0, -1), last[1] < primaryDetail[1] ? [last, primaryDetail[1], property] : last];
	};

	const propertyDefault = propertyDefaultFunction ? propertyDefaultFunction(thisDetail) : thisDetail[2];

	return justifyLast(thisDetail, justifyStart(thisDetail, mergedDetails, propertyDefault), propertyDefault);
};

/**
 * Merges arrays of RouteDetail (roadClass and trackType). The indices of the merged RouteDetails must not have any causal
 * relation. So road_class and track_type elements can have the following segment-relations:
 * equal,contains, overlap, partially overlap
 * @param {Array<RouteDetail>} roadClassDetails
 * @param {Array<RouteDetail>} trackTypeDetails
 */
const mergeRoadClassAndTrackTypeData = (roadClassDetails, trackTypeDetails) => {
	const MergeableRoadClass = ['track', 'path', 'footway'];

	const mergeWithTrackType = (roadClassDetail, trackTypeDetails) => {
		const trackTypes = findAnyInteractingRouteDetail(roadClassDetail, trackTypeDetails);
		const concatNames = (thisDetail, otherDetail) => {
			return thisDetail[2] + '_' + otherDetail[2];
		};
		return trackTypes.length > 0 ? mergeRouteDetails(roadClassDetail, trackTypes, concatNames) : roadClassDetail;
	};
	return roadClassDetails.reduce((merged, roadClassDetail) => {
		// eslint-disable-next-line no-unused-vars
		const [from, to, property] = roadClassDetail;
		return MergeableRoadClass.includes(property)
			? [...merged, ...mergeWithTrackType(roadClassDetail, trackTypeDetails)]
			: [...merged, roadClassDetail];
	}, []);
};

/**
 * Creates warnings for the specified RouteDetails (roadClass and surface)
 * @param {string} vehicle
 * @param {Array<RouteDetail>} roadClassDetails
 * @param {Array<RouteDetail>} surfaceDetails
 * @param {string} language the i18n code for language of the warning message
 * @returns {Object.<string, module:domain/routing~RouteWarningAttribute>}
 */
const createRouteWarnings = (vehicle, roadClassDetails, surfaceDetails, language) => {
	const vehicleType = vehicle.replace('bvv-', '').replace('bayernnetz-', '');

	const insertWarning = (roadClassDetail, surfaceDetail) => {
		const ruleOptions = { ...defaultRuleOptions, language: language, vehicle: vehicleType, roadClass: roadClassDetail[2], surface: surfaceDetail[2] };
		return RouteWarningRuleFunctions.map((ruleFunction) => ruleFunction(ruleOptions)).filter((warning) => warning !== null);
	};

	const insertEmpty = () => '';

	// build the warnings
	return roadClassDetails.reduce((accumulator, roadClassDetail) => {
		const interactingSurfaceDetails = findAnyInteractingRouteDetail(roadClassDetail, surfaceDetails);
		if (interactingSurfaceDetails.length > 0) {
			const warningDetails = mergeRouteDetails(roadClassDetail, interactingSurfaceDetails, insertWarning, insertEmpty).filter((detail) => {
				return detail[2].length !== 0;
			});
			warningDetails.forEach((warningDetail) => {
				const [from, to, property] = warningDetail;
				const segment = [from, to];
				const warnings = property;
				warnings.forEach((warning) => {
					const key = warning.id;
					const message = warning.message;
					const criticality = warning.criticality;

					if (Object.hasOwn(accumulator, key)) {
						accumulator[key].segments = [...accumulator[key].segments, segment];
					} else {
						accumulator[key] = {
							message: message,
							criticality: criticality,
							segments: [segment]
						};
					}
				});
			});
		}
		return accumulator;
	}, {});
};

/**
 * Converts a polyline formatted geometry to a {@link ol.Geometry}
 * @param {string} polyline the polyline formatted geometry
 * @returns {Geometry} the ol geometry
 */
const polylineToGeometry = (polyline) => {
	const polylineFormat = new Polyline();
	return polylineFormat.readGeometry(polyline);
};

/**
 * Bvv specific implementation of {@link module:services/RoutingService~routeStatsProvider}
 * @function
 * @type {module:services/RoutingService~routeStatsProvider}
 */
export const bvvRouteStatsProvider = (ghRoute, profileStats) => {
	const { ConfigService: configService } = $injector.inject('ConfigService');
	const lang = configService.getValue('DEFAULT_LANG');

	const speedOptions = Object.hasOwn(VehicleSpeedOptions, ghRoute.vehicle) ? VehicleSpeedOptions[ghRoute.vehicle] : null;
	const validProfileStats = profileStats?.sumUp && profileStats?.sumDown;
	const time =
		speedOptions && validProfileStats
			? getETAFor(ghRoute.paths[0].distance, profileStats?.sumUp, profileStats?.sumDown, speedOptions)
			: ghRoute.paths[0].time;

	const coordinates = polylineToGeometry(ghRoute.paths[0].points).getCoordinates();
	const surfaceDetails = aggregateDetailData(ghRoute.paths[0].details.surface, coordinates);
	const mergedRoadClassTrackTypeRawData = mergeRoadClassAndTrackTypeData(ghRoute.paths[0].details.road_class, ghRoute.paths[0].details.track_type);
	const roadClassTrackTypeDetails = aggregateDetailData(mergedRoadClassTrackTypeRawData, coordinates);
	const details = {
		surface: surfaceDetails,
		road_class: roadClassTrackTypeDetails
	};
	const warnings = createRouteWarnings(ghRoute.vehicle, mergedRoadClassTrackTypeRawData, ghRoute.paths[0].details.surface, lang);

	return {
		time: time,
		dist: ghRoute.paths[0].distance,
		twoDiff: profileStats?.sumUp && profileStats?.sumDown ? [profileStats.sumUp, profileStats.sumDown] : [],
		details: details,
		warnings: warnings
	};
};
