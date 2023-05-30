import { $injector } from '../../src/injection';
import { FileSaveService } from '../../src/services/FileSaveService';
import { MediaType } from '../../src/services/HttpService';

describe('UnitsService', () => {
	const defaultFileNameFromConfig = 'foo.bar';
	const configService = {
		getValue: () => defaultFileNameFromConfig
	};

	beforeAll(() => {
		$injector.registerSingleton('ConfigService', configService);
	});

	describe('when instantiated', () => {
		it('registers ConfigService ', () => {
			const instanceUnderTest = new FileSaveService();

			expect(instanceUnderTest._configService).toBe(configService);
		});
	});

	describe('saveAs', () => {
		it('throws errors', () => {
			const instanceUnderTest = new FileSaveService();

			expect(() => instanceUnderTest.saveAs(null, MediaType.JSON)).toThrowError('content and mimetype must be specified');
			expect(() => instanceUnderTest.saveAs('foo', null)).toThrowError('content and mimetype must be specified');
		});

		it('saves a blob with fileName', () => {
			const content = 'foo';
			const mimetype = MediaType.JSON;
			const fileName = 'bar.baz';
			const ankerMock = { href: null, download: null, click: () => {} };
			const ankerClickSpy = spyOn(ankerMock, 'click').and.callThrough();
			spyOn(document, 'createElement').and.returnValue(ankerMock);
			const createUrlSpy = spyOn(window.URL, 'createObjectURL').and.callFake(() => 'foo');
			const revokeUrlSpy = spyOn(window.URL, 'revokeObjectURL')
				.withArgs('foo')
				.and.callFake(() => {});

			const instanceUnderTest = new FileSaveService();
			instanceUnderTest.saveAs(content, mimetype, fileName);

			expect(createUrlSpy).toHaveBeenCalledWith(jasmine.any(Blob));
			expect(revokeUrlSpy).toHaveBeenCalledWith('foo');
			expect(ankerMock.href).toBe('foo');
			expect(ankerMock.download).toBe(fileName);
			expect(ankerClickSpy).toHaveBeenCalled();
		});

		it('saves a blob with default fileName from config', () => {
			const content = 'foo';
			const mimetype = MediaType.JSON;

			const ankerMock = { href: null, download: null, click: () => {} };
			const ankerClickSpy = spyOn(ankerMock, 'click').and.callThrough();
			spyOn(document, 'createElement').and.returnValue(ankerMock);
			const configSpy = spyOn(configService, 'getValue').and.callThrough();
			const createUrlSpy = spyOn(window.URL, 'createObjectURL').and.callFake(() => 'foo');
			const revokeUrlSpy = spyOn(window.URL, 'revokeObjectURL')
				.withArgs('foo')
				.and.callFake(() => {});

			const instanceUnderTest = new FileSaveService();
			instanceUnderTest.saveAs(content, mimetype);

			expect(configSpy).toHaveBeenCalledWith('DEFAULT_SAVE_FILENAME', 'fileSaved');
			expect(createUrlSpy).toHaveBeenCalledWith(jasmine.any(Blob));
			expect(revokeUrlSpy).toHaveBeenCalledWith('foo');
			expect(ankerMock.href).toBe('foo');
			expect(ankerMock.download).toBe(defaultFileNameFromConfig);
			expect(ankerClickSpy).toHaveBeenCalled();
		});
	});
});
