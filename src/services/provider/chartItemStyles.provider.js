/**
 * @module services/provider/chartItemStyles_provider
 */

import { $injector } from '../../injection/index';
import { CHART_ITEM_ROAD_STYLE_UNKNOWN, CHART_ITEM_SURFACE_STYLE_UNKNOWN } from '../RoutingService';

/**
 * BVV specific implementation of {@link module:services/RoutingService~chartItemStylesProvider}.
 * @function
 * @type {module:services/RoutingService~chartItemStylesProvider}
 */
export const bvvChartItemStylesProvider = () => {
	const { ConfigService: configService } = $injector.inject('ConfigService');
	const lang = configService.getValue('DEFAULT_LANG');

	const bvvRoadStyles = {
		unknown: { ...CHART_ITEM_ROAD_STYLE_UNKNOWN, label: lang === 'de' ? 'Unbekannt' : 'Unknown' },
		path: {
			id: 1,
			color: 'rgb(139,71,38)',
			label: lang === 'de' ? 'Pfad' : 'Path'
		},
		track: {
			id: 2,
			color: 'rgb(238,213,183)',
			label: lang === 'de' ? 'Wald-, Feldweg' : 'Track'
		},
		footway: {
			id: 3,
			color: 'rgb(205,183,158)',
			label: lang === 'de' ? 'Rad-, Fußweg' : 'Cycle, footway'
		},
		street: {
			id: 4,
			color: 'rgb(190,190,190)',
			label: lang === 'de' ? 'Nebenstraße' : 'Street'
		},
		mainstreet: {
			id: 5,
			color: 'rgb(255,193,7)',
			label: lang === 'de' ? 'Hauptstraße' : 'Mainstreet'
		}
	};

	const bvvSurfaceStyles = {
		unknown: { ...CHART_ITEM_SURFACE_STYLE_UNKNOWN, label: lang === 'de' ? 'Unbekannt' : 'Unknown' },
		ground: {
			id: 100,
			color: 'rgb(139,71,38)',
			label: lang === 'de' ? 'gewachsen, naturbelassen' : 'ground'
		},
		compacted: {
			id: 200,
			color: 'rgb(238,213,183)',
			label: lang === 'de' ? 'befestigt' : 'compacted'
		},
		other: {
			id: 201,
			color: 'rgb(238,213,183)',
			// FIXME: Workaround for Graphhopper version 0.13 due to incomplete mapping for BasisDLM-Values for surface types
			// this Workaround must be reverted if Graphhopper version >= 1.0
			label: lang === 'de' ? 'befestigt' : 'compacted'
		},
		asphalt: {
			id: 300,
			color: 'rgb(190,190,190)',
			label: lang === 'de' ? 'asphaltiert' : 'asphalt'
		},
		paved: {
			id: 400,
			color: 'rgb(195,195,195)',
			label: lang === 'de' ? 'Straßenbelag' : 'paved'
		}
	};

	return { surface: bvvSurfaceStyles, road: bvvRoadStyles };
};
