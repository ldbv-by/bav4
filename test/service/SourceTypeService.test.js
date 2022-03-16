import { SourceType, SourceTypeMaxFileSize, SourceTypeResult, SourceTypeResultStatus } from '../../src/services/domain/sourceType';
import { bvvUrlSourceTypeProvider, defaultDataSourceTypeProvider, defaultMediaSourceTypeProvider } from '../../src/services/provider/sourceType.provider';
import { SourceTypeService } from '../../src/services/SourceTypeService';
import { TestUtils } from '../test-utils';


describe('SourceTypeService', () => {

	const setup = (urlSourceTypeProvider = bvvUrlSourceTypeProvider, dataSourceTypeProvider = defaultDataSourceTypeProvider, mediaSourceTypeProvider = defaultMediaSourceTypeProvider) => {
		return new SourceTypeService(urlSourceTypeProvider, dataSourceTypeProvider, mediaSourceTypeProvider);
	};

	describe('constructor', () => {

		it('initializes the service with default providers', async () => {

			const instanceUnderTest = new SourceTypeService();
			expect(instanceUnderTest._urlSourceTypeProvider).toEqual(bvvUrlSourceTypeProvider);
			expect(instanceUnderTest._dataSourceTypeProvider).toEqual(defaultDataSourceTypeProvider);
			expect(instanceUnderTest._mediaSourceTypeProvider).toEqual(defaultMediaSourceTypeProvider);
		});

		it('initializes the service with custom provider', async () => {

			const customUrlSourceTypeProvider = async () => { };
			const customDataSourceTypeProvider = async () => { };
			const customMediaSourceTypeProvider = async () => { };
			const instanceUnderTest = setup(customUrlSourceTypeProvider, customDataSourceTypeProvider, customMediaSourceTypeProvider);
			expect(instanceUnderTest._urlSourceTypeProvider).toEqual(customUrlSourceTypeProvider);
			expect(instanceUnderTest._dataSourceTypeProvider).toEqual(customDataSourceTypeProvider);
			expect(instanceUnderTest._mediaSourceTypeProvider).toEqual(customMediaSourceTypeProvider);
		});
	});

	describe('forUrl', () => {

		it('provides a SourceType result', async () => {

			const url = 'http://foo.bar';
			const sourceTypeResultMock = new SourceType('name', 'version');
			const result = new SourceTypeResult(SourceTypeResultStatus.OK, sourceTypeResultMock);
			const providerSpy = jasmine.createSpy().withArgs(url).and.resolveTo(result);
			const instanceUnderTest = setup(providerSpy);

			const sourceTypeServiceResult = await instanceUnderTest.forUrl(url);

			expect(sourceTypeServiceResult)
				.toEqual(result);
		});

		it('throws an exception when <url> is not a string', async () => {

			const url = {};
			const providerSpy = jasmine.createSpy();
			const instanceUnderTest = setup(providerSpy);

			try {
				await instanceUnderTest.forUrl(url);
				throw new Error('Promise should not be resolved');
			}
			catch (e) {
				expect(e.message).toBe('Parameter <url> must represent an Http URL');
				expect(providerSpy).not.toHaveBeenCalled();
			}
		});
	});

	describe('forData', () => {

		it('provides a SourceType result given <data> and <mediaType>', () => {

			const data = 'data';
			const mediaType = 'mediatype';
			const result = new SourceTypeResult(SourceTypeResultStatus.OK, new SourceType('name', 'version'));
			const mediaProviderSpy = jasmine.createSpy().withArgs(mediaType).and.returnValue(result);
			const instanceUnderTest = setup(null, null, mediaProviderSpy);

			const sourceTypeResult = instanceUnderTest.forData(data, mediaType);

			expect(sourceTypeResult).toEqual(result);
		});

		it('provides a SourceType result given <data> only', () => {

			const data = 'data';
			const result = new SourceTypeResult(SourceTypeResultStatus.OK, new SourceType('name', 'version'));
			const providerSpy = jasmine.createSpy().withArgs(data).and.returnValue(result);
			const instanceUnderTest = setup(null, providerSpy);

			const sourceTypeResult = instanceUnderTest.forData(data);

			expect(sourceTypeResult).toEqual(result);
		});

		it('returns MAX_SIZE_EXCEEDED when data-size is too large', () => {
			const tooLargeData = 'x'.repeat(SourceTypeMaxFileSize);
			const instanceUnderTest = setup();

			const result = instanceUnderTest.forData(tooLargeData);

			expect(result)
				.toEqual(new SourceTypeResult(SourceTypeResultStatus.MAX_SIZE_EXCEEDED));
		});
	});

	describe('forBlob', () => {

		const getBlob = (data, size = 10) => TestUtils.newBlob(data, 'text/mimeType', size);

		it('provides a SourceType result given <blob>', async () => {

			const data = '<kml>some</kml>';
			const blobMock = getBlob(data);
			const result = new SourceTypeResult(SourceTypeResultStatus.OK, new SourceType('name', 'version'));
			const providerSpy = jasmine.createSpy().withArgs(data).and.returnValue(result);
			const instanceUnderTest = setup(null, providerSpy);

			const sourceTypeResult = await instanceUnderTest.forBlob(blobMock);

			expect(sourceTypeResult).toEqual(result);

		});

		it('throws an exception when blob is not a Blob', async () => {

			const providerSpy = jasmine.createSpy();
			const instanceUnderTest = setup(undefined, providerSpy);
			const blobFake = { type: 'some', size: 0 };

			try {
				await instanceUnderTest.forBlob(blobFake);
				throw new Error('Promise should not be resolved');
			}
			catch (e) {
				expect(e.message).toBe('Parameter <blob> must be an instance of Blob');
				expect(providerSpy).not.toHaveBeenCalled();
			}
		});

		it('returns MAX_SIZE_EXCEEDED when blob-size is too large', async () => {

			const blobMock = getBlob('some', SourceTypeMaxFileSize + 1);
			const instanceUnderTest = setup();

			const result = await instanceUnderTest.forBlob(blobMock);

			expect(result).toEqual(new SourceTypeResult(SourceTypeResultStatus.MAX_SIZE_EXCEEDED));
		});
	});

	describe('SourceTypeServiceResult', () => {


		it('provides a SourceType result given <blob>', () => {
		});
	});
});
