import { Topic } from '../../src/domain/topic';

describe('Topic', () => {
	it('provides getter for properties', () => {
		const topic = new Topic('id', 'label', 'description', ['bg0', 'bg1'], 'bg0', ['ac0', 'ac2'], ['sel0', 'sel2'], { hue: 42, icon: 'svg' });

		expect(topic.id).toBe('id');
		expect(topic.label).toBe('label');
		expect(topic.description).toBe('description');
		expect(topic.defaultBaseGeoR).toBe('bg0');
		expect(topic.baseGeoRs).toEqual(['bg0', 'bg1']);
		expect(topic.activatedGeoRs).toEqual(['ac0', 'ac2']);
		expect(topic.selectedGeoRs).toEqual(['sel0', 'sel2']);
		expect(topic.style).toEqual({ hue: 42, icon: 'svg' });
	});

	it('provides default properties', () => {
		const topic = new Topic('id', 'label', 'description', ['bg0', 'bg1']);

		expect(topic.defaultBaseGeoR).toBe('bg0');
		expect(topic.selectedGeoRs).toEqual([]);
		expect(topic.activatedGeoRs).toEqual([]);
		expect(topic.style.hue).toBeNull();
		expect(topic.style.icon).toBeNull();
	});
});
