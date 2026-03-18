import { FileSaveService } from '@src/services/FileSaveService';
import { MediaType } from '@src/domain/mediaTypes';

describe('FileSaveService', () => {
	describe('saveAs', () => {
		it('throws errors', () => {
			const instanceUnderTest = new FileSaveService();

			expect(() => instanceUnderTest.saveAs(null, MediaType.JSON)).toThrowError('content and mimeType must be specified');
			expect(() => instanceUnderTest.saveAs('foo', null)).toThrowError('content and mimeType must be specified');
		});

		it('saves a blob with known MIME-Type', () => {
			const content = 'foo';
			const mimetype = MediaType.JSON;

			const ankerMock = { href: null, download: null, click: () => {} };
			const ankerClickSpy = vi.spyOn(ankerMock, 'click');
			vi.spyOn(document, 'createElement').mockReturnValue(ankerMock);
			const createUrlSpy = vi.spyOn(window.URL, 'createObjectURL').mockImplementation(() => 'foo');
			const revokeUrlSpy = vi.spyOn(window.URL, 'revokeObjectURL').mockImplementation(() => {});

			const instanceUnderTest = new FileSaveService();
			instanceUnderTest.saveAs(content, mimetype);

			expect(createUrlSpy).toHaveBeenCalledWith(expect.any(Blob));
			expect(revokeUrlSpy).toHaveBeenCalledWith('foo');
			expect(ankerMock.href).toBe('foo');
			expect(ankerMock.download).toMatch(/^bayernatlas_\d{14}\.json/);
			expect(ankerClickSpy).toHaveBeenCalled();
		});

		it('saves a blob with known MIME-Type and filename', () => {
			const content = 'foo';
			const mimetype = MediaType.JSON;
			const fileName = 'fooBarBaz';
			const ankerMock = { href: null, download: null, click: () => {} };
			const ankerClickSpy = vi.spyOn(ankerMock, 'click');
			vi.spyOn(document, 'createElement').mockReturnValue(ankerMock);
			const createUrlSpy = vi.spyOn(window.URL, 'createObjectURL').mockImplementation(() => 'foo');
			const revokeUrlSpy = vi.spyOn(window.URL, 'revokeObjectURL').mockImplementation(() => {});

			const instanceUnderTest = new FileSaveService();
			instanceUnderTest.saveAs(content, mimetype, fileName);

			expect(createUrlSpy).toHaveBeenCalledWith(expect.any(Blob));
			expect(revokeUrlSpy).toHaveBeenCalledWith('foo');
			expect(ankerMock.href).toBe('foo');
			expect(ankerMock.download).toMatch(/^fooBarBaz\.json/);
			expect(ankerClickSpy).toHaveBeenCalled();
		});

		it('saves a blob with unknown MIME-Type and filename', () => {
			const content = 'foo';
			const mimetype = 'something';
			const fileName = 'fooBarBaz';
			const ankerMock = { href: null, download: null, click: () => {} };
			const ankerClickSpy = vi.spyOn(ankerMock, 'click');
			vi.spyOn(document, 'createElement').mockReturnValue(ankerMock);
			const createUrlSpy = vi.spyOn(window.URL, 'createObjectURL').mockImplementation(() => 'foo');
			const revokeUrlSpy = vi.spyOn(window.URL, 'revokeObjectURL').mockImplementation(() => {});

			const instanceUnderTest = new FileSaveService();
			instanceUnderTest.saveAs(content, mimetype, fileName);

			expect(createUrlSpy).toHaveBeenCalledWith(expect.any(Blob));
			expect(revokeUrlSpy).toHaveBeenCalledWith('foo');
			expect(ankerMock.href).toBe('foo');
			expect(ankerMock.download).toMatch(/^fooBarBaz/);
			expect(ankerClickSpy).toHaveBeenCalled();
		});

		it('saves a blob with unknown MIME-Type', () => {
			const content = 'foo';
			const mimetype = 'something';

			const ankerMock = { href: null, download: null, click: () => {} };
			const ankerClickSpy = vi.spyOn(ankerMock, 'click');
			vi.spyOn(document, 'createElement').mockReturnValue(ankerMock);
			const createUrlSpy = vi.spyOn(window.URL, 'createObjectURL').mockImplementation(() => 'foo');
			const revokeUrlSpy = vi.spyOn(window.URL, 'revokeObjectURL').mockImplementation(() => {});

			const instanceUnderTest = new FileSaveService();
			instanceUnderTest.saveAs(content, mimetype);

			expect(createUrlSpy).toHaveBeenCalledWith(expect.any(Blob));
			expect(revokeUrlSpy).toHaveBeenCalledWith('foo');
			expect(ankerMock.href).toBe('foo');
			expect(ankerMock.download).toMatch(/^bayernatlas_\d{14}/);
			expect(ankerClickSpy).toHaveBeenCalled();
		});
		describe('when mapping MIME-Types', () => {
			it('maps application/json to json', () => {
				const content = 'foo';
				const mimetype = MediaType.JSON;

				const ankerMock = { href: null, download: null, click: () => {} };

				vi.spyOn(document, 'createElement').mockReturnValue(ankerMock);
				vi.spyOn(window.URL, 'createObjectURL').mockImplementation(() => 'foo');
				vi.spyOn(window.URL, 'revokeObjectURL').mockImplementation(() => {});

				const instanceUnderTest = new FileSaveService();
				instanceUnderTest.saveAs(content, mimetype);

				expect(ankerMock.download).toMatch(/^bayernatlas_\d{14}\.json/);
			});

			it('maps text/html to html', () => {
				const content = 'foo';
				const mimetype = MediaType.TEXT_HTML;

				const ankerMock = { href: null, download: null, click: () => {} };

				vi.spyOn(document, 'createElement').mockReturnValue(ankerMock);
				vi.spyOn(window.URL, 'createObjectURL').mockImplementation(() => 'foo');
				vi.spyOn(window.URL, 'revokeObjectURL').mockImplementation(() => {});

				const instanceUnderTest = new FileSaveService();
				instanceUnderTest.saveAs(content, mimetype);

				expect(ankerMock.download).toMatch(/^bayernatlas_\d{14}\.html/);
			});

			it('maps text/plain to txt', () => {
				const content = 'foo';
				const mimetype = MediaType.TEXT_PLAIN;

				const ankerMock = { href: null, download: null, click: () => {} };

				vi.spyOn(document, 'createElement').mockReturnValue(ankerMock);
				vi.spyOn(window.URL, 'createObjectURL').mockImplementation(() => 'foo');
				vi.spyOn(window.URL, 'revokeObjectURL').mockImplementation(() => {});

				const instanceUnderTest = new FileSaveService();
				instanceUnderTest.saveAs(content, mimetype);

				expect(ankerMock.download).toMatch(/^bayernatlas_\d{14}\.txt/);
			});

			it('maps application/vnd.google-earth.kml+xml to kml', () => {
				const content = 'foo';
				const mimetype = MediaType.KML;

				const ankerMock = { href: null, download: null, click: () => {} };

				vi.spyOn(document, 'createElement').mockReturnValue(ankerMock);
				vi.spyOn(window.URL, 'createObjectURL').mockImplementation(() => 'foo');
				vi.spyOn(window.URL, 'revokeObjectURL').mockImplementation(() => {});

				const instanceUnderTest = new FileSaveService();
				instanceUnderTest.saveAs(content, mimetype);

				expect(ankerMock.download).toMatch(/^bayernatlas_\d{14}\.kml/);
			});

			it('maps application/gpx+xml to gpx', () => {
				const content = 'foo';
				const mimetype = MediaType.GPX;

				const ankerMock = { href: null, download: null, click: () => {} };

				vi.spyOn(document, 'createElement').mockReturnValue(ankerMock);
				vi.spyOn(window.URL, 'createObjectURL').mockImplementation(() => 'foo');
				vi.spyOn(window.URL, 'revokeObjectURL').mockImplementation(() => {});

				const instanceUnderTest = new FileSaveService();
				instanceUnderTest.saveAs(content, mimetype);

				expect(ankerMock.download).toMatch(/^bayernatlas_\d{14}\.gpx/);
			});

			it('maps application/geo+json to geojson', () => {
				const content = 'foo';
				const mimetype = MediaType.GeoJSON;

				const ankerMock = { href: null, download: null, click: () => {} };

				vi.spyOn(document, 'createElement').mockReturnValue(ankerMock);
				vi.spyOn(window.URL, 'createObjectURL').mockImplementation(() => 'foo');
				vi.spyOn(window.URL, 'revokeObjectURL').mockImplementation(() => {});

				const instanceUnderTest = new FileSaveService();
				instanceUnderTest.saveAs(content, mimetype);

				expect(ankerMock.download).toMatch(/^bayernatlas_\d{14}\.geojson/);
			});
		});
	});
});
