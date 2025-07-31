import {
	EXCLUDED_COMMON_FEATURE_PROPERTY_KEYS,
	isInternalProperty,
	LEGACY_INTERNAL_FEATURE_PROPERTY_KEYS,
	asInternalProperty,
	LEGACY_DRAWING_TYPES,
	EXPORTABLE_INTERNAL_FEATURE_PROPERTY_KEYS
} from '../../src/utils/propertyUtils.js';

describe('propertyUtils', () => {
	describe('LEGACY_INTERNAL_FEATURE_PROPERTY_KEYS)', () => {
		it('defines a list of internally used legacy property keys', () => {
			expect(Object.isFrozen(LEGACY_INTERNAL_FEATURE_PROPERTY_KEYS)).toBeTrue();
			expect(LEGACY_INTERNAL_FEATURE_PROPERTY_KEYS).toEqual([
				'style',
				'styleHint',
				'showPointNames',
				'finishOnFirstPoint',
				'displayruler',
				'measurement',
				'measurement_position_x',
				'measurement_position_y',
				'area',
				'area_position_x',
				'area_position_y',
				'partitions',
				'partition_delta',
				'overlays',
				'manualPositioning',
				'dragging',
				'draggable',
				'geodesic',
				'measurement_style_listeners',
				'projectedLength'
			]);
		});
	});

	describe('EXCLUDED_COMMON_PROPERTY_KEYS', () => {
		it('defines a list of internally used legacy property keys', () => {
			expect(Object.isFrozen(EXCLUDED_COMMON_FEATURE_PROPERTY_KEYS)).toBeTrue();
			expect(EXCLUDED_COMMON_FEATURE_PROPERTY_KEYS).toEqual(['geometry', 'styleUrl']);
		});
	});

	describe('EXPORTABLE_INTERNAL_FEATURE_PROPERTY_KEYS)', () => {
		it('defines a list of internally used feature property keys', () => {
			expect(Object.isFrozen(EXPORTABLE_INTERNAL_FEATURE_PROPERTY_KEYS)).toBeTrue();
			expect(EXPORTABLE_INTERNAL_FEATURE_PROPERTY_KEYS).toEqual([
				'displayruler',
				'manualPositioning',
				'measurement_position_x',
				'measurement_position_y',
				'area_position_x',
				'area_position_y'
			]);
		});
	});

	describe('LEGACY_DRAWING_TYPES)', () => {
		it('defines a list of legacy draw types', () => {
			expect(Object.isFrozen(LEGACY_DRAWING_TYPES)).toBeTrue();
			expect(LEGACY_DRAWING_TYPES).toEqual(['line', 'linepolygon', 'polygon', 'marker', 'annotation']);
		});
	});

	describe('asInternalProperty', () => {
		it('prepends a key with the internal-property prefix', () => {
			expect(asInternalProperty('key')).toBe('_ba_key');
			expect(asInternalProperty('_ba_key')).toBe('_ba_key');
			expect(asInternalProperty(24)).toBeNull();
		});
	});

	describe('isInternalProperty', () => {
		it('Checks if a given property key denotes an internal property', () => {
			expect(isInternalProperty('key')).toBeFalse();
			expect(isInternalProperty('_ba_key')).toBeTrue();
			expect(isInternalProperty(24)).toBeFalse();
		});
	});
});
