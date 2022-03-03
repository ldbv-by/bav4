import { $injector } from '../../../src/injection';
import { getBvvMapDefinitions } from '../../../src/services/provider/mapDefinitions.provider';

describe('MapDefinitions provider', () => {

	describe('Bvv mapDefinitions provider', () => {

		const coordinateService = {
			toLonLat: () => {

			}
		};

		beforeAll(() => {
			$injector
				.registerSingleton('CoordinateService', coordinateService);
		});

		it('provides map related meta data', () => {
			const { defaultExtent, srid, defaultSridForView, sridDefinitionsForView, defaultGeodeticSrid, maxZoomLevel } = getBvvMapDefinitions();

			expect(defaultExtent).toEqual([995772.9694449581, 5982715.763684852, 1548341.2904285304, 6544564.28740462]);
			expect(srid).toBe(3857);
			expect(defaultSridForView).toBe(25832);
			expect(sridDefinitionsForView()).toEqual([{ label: 'UTM', code: 25832, digits: 0 }, { label: 'WGS84', code: 4326, digits: 5 }]);
			expect(defaultGeodeticSrid).toEqual(25832);
			expect(maxZoomLevel).toBe(19);
		});

		it('sridDefinitionsForView provides coordinate dependent definitions for a 25832 coordinate', () => {
			const fakeCoord3857In32 = [42, 42];
			spyOn(coordinateService, 'toLonLat').and.returnValue([11.18526, 48.64087]);
			const { sridDefinitionsForView } = getBvvMapDefinitions();

			expect(sridDefinitionsForView(fakeCoord3857In32)).toEqual([{ label: 'UTM', code: 25832, digits: 0 }, { label: 'WGS84', code: 4326, digits: 5 }]);
		});

		it('sridDefinitionsForView provides coordinate dependent definitions for a 25833 coordinate', () => {
			const fakeCoord3857In33 = [42, 42];
			spyOn(coordinateService, 'toLonLat').and.returnValue([12.18526, 48.64087]);
			const { sridDefinitionsForView } = getBvvMapDefinitions();

			expect(sridDefinitionsForView(fakeCoord3857In33)).toEqual([{ label: 'UTM', code: 25833, digits: 0 }, { label: 'UTM', code: 25832, digits: 0 }, { label: 'WGS84', code: 4326, digits: 5 }]);
		});

		it('sridDefinitionsForView provides coordinate dependent definitions for a coordinate with a longitude value < 6°', () => {
			const fakeCoord3857In33 = [42, 42];
			spyOn(coordinateService, 'toLonLat').and.returnValue([5.18526, 48.64087]);
			const { sridDefinitionsForView } = getBvvMapDefinitions();

			expect(sridDefinitionsForView(fakeCoord3857In33)).toEqual([{ label: 'WGS84', code: 4326, digits: 5 }]);
		});

		it('sridDefinitionsForView provides coordinate dependent definitions for a coordinate with a longitude value > 18°', () => {
			const fakeCoord3857In33 = [42, 42];
			spyOn(coordinateService, 'toLonLat').and.returnValue([18.18526, 48.64087]);
			const { sridDefinitionsForView } = getBvvMapDefinitions();

			expect(sridDefinitionsForView(fakeCoord3857In33)).toEqual([{ label: 'WGS84', code: 4326, digits: 5 }]);
		});
	});
});
