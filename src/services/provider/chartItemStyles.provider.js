/**
 * @module services/provider/chartItemStyles_provider
 */
/**
 * @implements chartItemStylesProvider
 * @returns {Map<string,module:domain/routing~ChartItemStyle>} available chartItems
 */
export const bvvChartItemStylesProvider = () => {
	const bvvRoadStyles = {
		unknown: {
			// Default-/Fallback-Wert, wenn der vom Backend gelieferte Wert
			// nicht in dieser Auflistung gefunden werden kann
			id: 0,
			color: 'transparent',
			image: 'repeating-linear-gradient(45deg,#eee 0px,#eee 7px, #999 8px, #999 10px, #eee 11px)',
			label: 'Unbekannt'
		},
		path: {
			id: 1,
			color: 'rgb(139,71,38)',
			label: 'Pfad'
		},
		track: {
			id: 2,
			color: 'rgb(238,213,183)',
			label: 'Wald-, Feldweg'
		},
		footway: {
			id: 3,
			color: 'rgb(205,183,158)',
			label: 'Rad-, Fußweg'
		},
		street: {
			id: 4,
			color: 'rgb(190,190,190)',
			label: 'Nebenstraße'
		},
		mainstreet: {
			id: 5,
			color: 'rgb(255,193,7)',
			label: 'Hauptstraße'
		}
	};

	const bvvSurfaceStyles = {
		unknown: {
			id: 0,
			color: 'transparent',
			image: 'repeating-linear-gradient(45deg,gray 25%, transparent 25%,transparent 50%, gray 50%, gray 55%, transparent 55%, transparent)',
			label: 'Unbekannt'
		},
		ground: {
			id: 100,
			color: 'rgb(139,71,38)',
			label: 'gewachsen, naturbelassen'
		},
		compacted: {
			id: 200,
			color: 'rgb(238,213,183)',
			label: 'befestigt'
		},
		other: {
			id: 201,
			color: 'rgb(238,213,183)',
			// FIXME: Workaround for graphhopper version 0.13 due to incomplete mapping for BasisDLM-Values for surface types
			// this Workaround musst be reverted if graphhopper version >= 1.0
			// label: "verschieden",
			label: 'befestigt'
		},
		asphalt: {
			id: 300,
			color: 'rgb(190,190,190)',
			label: 'asphaltiert'
		},
		paved: {
			id: 400,
			color: 'rgb(195,195,195)',
			label: 'Straßenbelag'
		}
	};

	return { surface: bvvSurfaceStyles, road: bvvRoadStyles };
};
