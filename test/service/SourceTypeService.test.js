import { SourceType } from '../../src/services/domain/sourceType';
import { bvvUrlSourceTypeProvider, defaultDataSourceTypeProvider } from '../../src/services/provider/sourceType.provider';
import { SourceTypeService } from '../../src/services/SourceTypeService';

describe('SourceTypeService', () => {

	const setup = (urlSourceTypeProvider = bvvUrlSourceTypeProvider, dataSourceTypeProvider = defaultDataSourceTypeProvider) => {
		return new SourceTypeService(urlSourceTypeProvider, dataSourceTypeProvider);
	};

	describe('constructor', () => {

		it('initializes the service with default providers', async () => {

			const instanceUnderTest = new SourceTypeService();
			expect(instanceUnderTest._urlSourceTypeProvider).toEqual(bvvUrlSourceTypeProvider);
			expect(instanceUnderTest._dataSourceTypeProvider).toEqual(defaultDataSourceTypeProvider);
		});

		it('initializes the service with custom provider', async () => {

			const customUrlSourceTypeProvider = async () => { };
			const customDataSourceTypeProvider = async () => { };
			const instanceUnderTest = setup(customUrlSourceTypeProvider, customDataSourceTypeProvider);
			expect(instanceUnderTest._urlSourceTypeProvider).toEqual(customUrlSourceTypeProvider);
			expect(instanceUnderTest._dataSourceTypeProvider).toEqual(customDataSourceTypeProvider);
		});
	});

	describe('forUrl', () => {

		it('provides a SourceType result', async () => {

			const url = 'http://foo.bar';
			const sourceTypeResultMock = new SourceType('name', 'version');
			const providerSpy = jasmine.createSpy().withArgs(url).and.resolveTo(sourceTypeResultMock);
			const instanceUnderTest = setup(providerSpy);

			const sourceTypeResult = await instanceUnderTest.forUrl(url);

			expect(sourceTypeResult).toEqual(sourceTypeResultMock);
		});

		it('returns Null when SourceType was not detectable', async () => {

			const url = 'http://foo.bar';
			const providerSpy = jasmine.createSpy().withArgs(url).and.resolveTo(null);
			const instanceUnderTest = setup(providerSpy);

			const sourceTypeResult = await instanceUnderTest.forUrl(url);

			expect(sourceTypeResult).toBeNull();
		});

		it('throws an exception when provider throws one', async () => {

			const url = 'http://foo.bar';
			const errorMessage = 'something got wrong';
			const providerSpy = jasmine.createSpy().withArgs(url).and.returnValue(Promise.reject(errorMessage));
			const instanceUnderTest = setup(providerSpy);

			try {
				await instanceUnderTest.forUrl(url);
				throw new Error('Promise should not be resolved');
			}
			catch (e) {
				expect(e.message).toBe(`Could not detect a SourceType: ${errorMessage}`);
				expect(providerSpy).toHaveBeenCalled();
			}
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
			const sourceTypeResultMock = new SourceType('name', 'version');
			const providerSpy = jasmine.createSpy().withArgs(data, mediaType).and.returnValue(sourceTypeResultMock);
			const instanceUnderTest = setup(null, providerSpy);

			const sourceTypeResult = instanceUnderTest.forData(data, mediaType);

			expect(sourceTypeResult).toEqual(sourceTypeResultMock);
		});

		it('provides a SourceType result given <data> only', () => {

			const data = 'data';
			const sourceTypeResultMock = new SourceType('name', 'version');
			const providerSpy = jasmine.createSpy().withArgs(data, null).and.returnValue(sourceTypeResultMock);
			const instanceUnderTest = setup(null, providerSpy);

			const sourceTypeResult = instanceUnderTest.forData(data);

			expect(sourceTypeResult).toEqual(sourceTypeResultMock);
		});

		it('returns Null when SourceType was not detectable', () => {

			const data = 'data';
			const providerSpy = jasmine.createSpy().withArgs(data, null).and.returnValue(null);
			const instanceUnderTest = setup(providerSpy);

			const sourceTypeResult = instanceUnderTest.forData(data);

			expect(sourceTypeResult).toBeNull();
		});
	});
});
