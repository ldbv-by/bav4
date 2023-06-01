import { FileSaveService } from '../../src/services/FileSaveService';
import { MediaType } from '../../src/services/HttpService';

describe('FileSaveService', () => {
	describe('saveAs', () => {
		it('throws errors', () => {
			const instanceUnderTest = new FileSaveService();

			expect(() => instanceUnderTest.saveAs(null, MediaType.JSON, 'foo.bar')).toThrowError('content, mimetype and fileName must be specified');
			expect(() => instanceUnderTest.saveAs('foo', null, 'foo.bar')).toThrowError('content, mimetype and fileName must be specified');
			expect(() => instanceUnderTest.saveAs('foo', MediaType.TEXT_PLAIN, null)).toThrowError('content, mimetype and fileName must be specified');
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
	});
});
