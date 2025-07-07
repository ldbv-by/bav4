import {
	EXCLUDED_COMMON_FEATURE_PROPERTY_KEYS,
	isInternalProperty,
	LEGACY_INTERNAL_FEATURE_PROPERTY_KEYS,
	asInternalProperty
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
				'area',
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

	describe('asInternalProperty', () => {
		it('prepends a key with the internal-property prefix', () => {
			expect(asInternalProperty('key')).toBe('_ba_key');
			expect(asInternalProperty('_ba_key')).toBe('_ba_key');
			expect(asInternalProperty(22)).toBeNull();
		});
	});

	describe('isInternalProperty', () => {
		it('Checks if a given property key denotes an internal property', () => {
			expect(isInternalProperty('key')).toBeFalse();
			expect(isInternalProperty('_ba_key')).toBeTrue();
			expect(isInternalProperty(22)).toBeFalse();
		});
	});
});
