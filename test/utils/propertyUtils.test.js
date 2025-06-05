import {
	COMMON_UNWANTED_PROPERTY_KEYS,
	isInternalProperty,
	LEGACY_INTERNAL_PROPERTY_KEYS,
	markAsInternalProperty
} from '../../src/utils/propertyUtils.js';

describe('propertyUtils', () => {
	describe('LEGACY_INTERNAL_PROPERTY_KEYS)', () => {
		it('defines a list of internally used legacy property keys', () => {
			expect(Object.isFrozen(LEGACY_INTERNAL_PROPERTY_KEYS)).toBeTrue();
			expect(LEGACY_INTERNAL_PROPERTY_KEYS).toEqual([
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
				'dragging'
			]);
		});
	});

	describe('COMMON_UNWANTED_PROPERTY_KEYS', () => {
		it('defines a list of internally used legacy property keys', () => {
			expect(Object.isFrozen(COMMON_UNWANTED_PROPERTY_KEYS)).toBeTrue();
			expect(COMMON_UNWANTED_PROPERTY_KEYS).toEqual(['geometry', 'styleUrl']);
		});
	});

	describe('markAsInternalProperty', () => {
		it('prepends a key with the internal-property prefix', () => {
			expect(markAsInternalProperty('key')).toBe('_ba_key');
			expect(markAsInternalProperty('_ba_key')).toBe('_ba_key');
			expect(markAsInternalProperty(21)).toBeNull();
		});
	});

	describe('isInternalProperty', () => {
		it('Checks if a given property key denotes an internal property', () => {
			expect(isInternalProperty('key')).toBeFalse();
			expect(isInternalProperty('_ba_key')).toBeTrue();
			expect(isInternalProperty(21)).toBeFalse();
		});
	});
});
