import { $injector } from '../../../src/injection';
import { bvvChartItemStylesProvider } from '../../../src/services/provider/chartItemStyles.provider';

describe('ChartItemStyles provider', () => {
	describe('BVV ChartItemStyles provider', () => {
		const configService = {
			getValue: () => {}
		};

		beforeEach(() => {
			$injector.registerSingleton('ConfigService', configService);
		});

		afterEach(() => {
			$injector.reset();
		});
		it('provides styles for road types for "de"', () => {
			spyOn(configService, 'getValue').withArgs('DEFAULT_LANG').and.returnValue('de');
			const roadStyles = {
				unknown: {
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
			const surfaceStyles = {
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
			expect(bvvChartItemStylesProvider()).toEqual({ surface: surfaceStyles, road: roadStyles });
		});

		it('provides styles for road types for "en"', () => {
			spyOn(configService, 'getValue').withArgs('DEFAULT_LANG').and.returnValue('en');
			const roadStyles = {
				unknown: {
					id: 0,
					color: 'transparent',
					image: 'repeating-linear-gradient(45deg,#eee 0px,#eee 7px, #999 8px, #999 10px, #eee 11px)',
					label: 'Unknown'
				},
				path: {
					id: 1,
					color: 'rgb(139,71,38)',
					label: 'Path'
				},
				track: {
					id: 2,
					color: 'rgb(238,213,183)',
					label: 'Track'
				},
				footway: {
					id: 3,
					color: 'rgb(205,183,158)',
					label: 'Cycle, footway'
				},
				street: {
					id: 4,
					color: 'rgb(190,190,190)',
					label: 'Street'
				},
				mainstreet: {
					id: 5,
					color: 'rgb(255,193,7)',
					label: 'Mainstreet'
				}
			};
			const surfaceStyles = {
				unknown: {
					id: 0,
					color: 'transparent',
					image: 'repeating-linear-gradient(45deg,gray 25%, transparent 25%,transparent 50%, gray 50%, gray 55%, transparent 55%, transparent)',
					label: 'Unknown'
				},
				ground: {
					id: 100,
					color: 'rgb(139,71,38)',
					label: 'ground'
				},
				compacted: {
					id: 200,
					color: 'rgb(238,213,183)',
					label: 'compacted'
				},
				other: {
					id: 201,
					color: 'rgb(238,213,183)',
					label: 'compacted'
				},
				asphalt: {
					id: 300,
					color: 'rgb(190,190,190)',
					label: 'asphalt'
				},
				paved: {
					id: 400,
					color: 'rgb(195,195,195)',
					label: 'paved'
				}
			};
			expect(bvvChartItemStylesProvider()).toEqual({ surface: surfaceStyles, road: roadStyles });
		});
	});
});
