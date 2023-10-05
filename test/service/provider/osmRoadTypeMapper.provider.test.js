import { bvvOsmRoadTypeMappingProvider } from '../../../src/services/provider/osmRoadTypeMapper.provider';
describe('OsmRoadTypeMapper provider', () => {
	describe('BVV mapper provider', () => {
		it('maps osm road class map to application road classes', async () => {
			const osmClasses = {
				fooo: { absolute: 2, relative: 100, segments: [0, 1] },
				other: { absolute: 2, relative: 100, segments: [0, 1] }
			};
			const roadClasses = bvvOsmRoadTypeMappingProvider(osmClasses);

			expect(roadClasses.unknown.absolute).toBe(2);
			expect(roadClasses.unknown.segments).toEqual([0, 1]);
		});

		it('maps and merges osm road class map to application road classes', async () => {
			const osmClasses = {
				fooo: { absolute: 2, relative: 100, segments: [0, 1] },
				other: { absolute: 2, relative: 100, segments: [0, 2] },
				track_grade1: { absolute: 2, relative: 100, segments: [2, 4] },
				residential: { absolute: 2, relative: 100, segments: [3, 6] }
			};
			const roadClasses = bvvOsmRoadTypeMappingProvider(osmClasses);

			expect(roadClasses.street.absolute).toBe(4);
			expect(roadClasses.street.segments).toEqual([2, 4, 3, 6]);
		});
	});
});
