import { Topic } from '../../src/domain/topic';

describe('Topic', () => {
	it('provides getter for properties', () => {
		const topic = new Topic('id', 'label', 'description', { default: ['bg0', 'bg1'] }, 'bg0', ['ac0', 'ac2'], ['sel0', 'sel2'], {
			hue: 42,
			icon: 'svg'
		});

		expect(topic.id).toBe('id');
		expect(topic.label).toBe('label');
		expect(topic.description).toBe('description');
		expect(topic.baseGeoRs).toEqual({ default: ['bg0', 'bg1'] });
		expect(topic.defaultBaseGeoR).toBe('bg0');
		expect(topic.activatedGeoRs).toEqual(['ac0', 'ac2']);
		expect(topic.selectedGeoRs).toEqual(['sel0', 'sel2']);
		expect(topic.style).toEqual({ hue: 42, icon: 'svg' });
	});

	it('provides default values for optional properties', () => {
		const topic = new Topic('id', 'label', 'description');

		expect(topic.baseGeoRs).toBeNull();
		expect(topic.defaultBaseGeoR).toBeNull();
		expect(topic.selectedGeoRs).toEqual([]);
		expect(topic.activatedGeoRs).toEqual([]);
		expect(topic.style.hue).toBeNull();
		expect(topic.style.icon).toBeNull();
	});
});
