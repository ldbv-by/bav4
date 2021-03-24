import { Topic } from '../../../src/services/domain/topic';


describe('Topic', () => {

	it('provides setter for properties', () => {
		const topic = new Topic('id', 'label', 'description', ['bg0', 'bg1'], 'bg0', ['ac0', 'ac2'], ['sel0', 'sel2']);

		expect(topic.id).toBe('id');
		expect(topic.label).toBe('label');
		expect(topic.description).toBe('description');
		expect(topic.defaultBackground).toBe('bg0');
		expect(topic.backgroundLayers).toEqual(['bg0', 'bg1']);
		expect(topic.activatedLayers).toEqual(['ac0', 'ac2']);
		expect(topic.selectedLayers).toEqual(['sel0', 'sel2']);
	});

	it('provides default properties', () => {
		const topic = new Topic('id', 'label', 'description', ['bg0', 'bg1']);

		expect(topic.defaultBackground).toBe('bg0');
		expect(topic.selectedLayers).toEqual([]);
		expect(topic.selectedLayers).toEqual([]);
	});
});
