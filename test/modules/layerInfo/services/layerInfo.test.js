import { LayerInfo } from '../../../../src/modules/layerInfo/services/layerInfo';

describe('LayerInfo', () => {

	it('provides getter for properties', () => {
		const layerInfo = new LayerInfo('<b>content</b>', 'title');

		expect(layerInfo.content).toBe('<b>content</b>');
		expect(layerInfo.title).toBe('title');
	});

	it('provides default properties', () => {
		const layerInfo = new LayerInfo('<b>content</b>');

		expect(layerInfo.content).toBe('<b>content</b>');
		expect(layerInfo.title).toBeNull();
	});
});
