import { RefreshableXYZ } from '../../../../../src/modules/olMap/ol/source/RefreshableXYZ';
import { XYZ } from 'ol/source';

describe('RefreshableXYZ', () => {
	describe('constructor', () => {
		it('initializes an instance with correct parameters', async () => {
			const options = { url: 'https://foo.bar' };

			const instanceUnderTest = new RefreshableXYZ(options);

			expect(instanceUnderTest.getUrls()).toEqual(['https://foo.bar']);
		});
	});

	describe('smoothRefresh', () => {
		it('calls the protected method "setKey"', async () => {
			const instanceUnderTest = new RefreshableXYZ();

			const spy = spyOn(XYZ.prototype, 'setKey');

			expect(instanceUnderTest.smoothRefresh('someKey'));

			expect(spy).toHaveBeenCalledWith('someKey');
		});
	});
});
