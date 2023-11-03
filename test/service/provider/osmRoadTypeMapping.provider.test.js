import { bvvOsmRoadTypeMappingProvider } from '../../../src/services/provider/osmRoadTypeMapping.provider';
describe('OsmRoadTypeMapper provider', () => {
	describe('BVV mapper provider', () => {
		it('maps osm road class name to catalogId', async () => {
			expect(bvvOsmRoadTypeMappingProvider('foo')).toBeNull();
			expect(bvvOsmRoadTypeMappingProvider('other')).toBe('unknown');
			expect(bvvOsmRoadTypeMappingProvider('track_other')).toBe('unknown');
			expect(bvvOsmRoadTypeMappingProvider('path_other')).toBe('unknown');
			expect(bvvOsmRoadTypeMappingProvider('footway_other')).toBe('unknown');

			expect(bvvOsmRoadTypeMappingProvider('path_grade3')).toBe('path');
			expect(bvvOsmRoadTypeMappingProvider('path_grade4')).toBe('path');
			expect(bvvOsmRoadTypeMappingProvider('path_grade5')).toBe('path');

			expect(bvvOsmRoadTypeMappingProvider('track_grade2')).toBe('track');
			expect(bvvOsmRoadTypeMappingProvider('track_grade3')).toBe('track');
			expect(bvvOsmRoadTypeMappingProvider('track_grade4')).toBe('track');
			expect(bvvOsmRoadTypeMappingProvider('track_grade5')).toBe('track');

			expect(bvvOsmRoadTypeMappingProvider('footway_grade2')).toBe('footway');
			expect(bvvOsmRoadTypeMappingProvider('footway_grade3')).toBe('footway');
			expect(bvvOsmRoadTypeMappingProvider('pedestrian')).toBe('footway');
			expect(bvvOsmRoadTypeMappingProvider('cycleway')).toBe('footway');
			expect(bvvOsmRoadTypeMappingProvider('path_grade1')).toBe('footway');
			expect(bvvOsmRoadTypeMappingProvider('path_grade2')).toBe('footway');

			expect(bvvOsmRoadTypeMappingProvider('track_grade1')).toBe('street');
			expect(bvvOsmRoadTypeMappingProvider('residential')).toBe('street');
			expect(bvvOsmRoadTypeMappingProvider('unclassified')).toBe('street');
			expect(bvvOsmRoadTypeMappingProvider('tertiary')).toBe('street');
			expect(bvvOsmRoadTypeMappingProvider('service')).toBe('street');

			expect(bvvOsmRoadTypeMappingProvider('secondary')).toBe('mainstreet');
			expect(bvvOsmRoadTypeMappingProvider('primary')).toBe('mainstreet');
			expect(bvvOsmRoadTypeMappingProvider('motorway')).toBe('mainstreet');
		});
	});
});
