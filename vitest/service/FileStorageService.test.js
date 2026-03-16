import { MediaType } from '../../src/domain/mediaTypes';
import { $injector } from '../../src/injection';
import { BvvFileStorageService, FileStorageServiceDataTypes, TempStorageService } from '../../src/services/FileStorageService';

describe('BvvFileStorageService', () => {
	const configService = {
		getValueAsPath: () => {}
	};

	const httpService = {
		post() {},
		get() {}
	};

	beforeAll(() => {
		$injector.registerSingleton('ConfigService', configService).registerSingleton('HttpService', httpService);
	});

	describe('get', () => {
		it('loads a KML file by id', async () => {
			const data = 'data';
			const backendResultPayload = JSON.stringify({ geoXml: data, srid: 4326, lastModified: 87654321 });
			const fileId = 'someId';
			const backendUrl = 'https://backend.url/';
			const expectedUrl = backendUrl + 'files/' + fileId;
			const configServiceSpy = vi.spyOn(configService, 'getValueAsPath').mockReturnValue(backendUrl);
			const httpServiceSpy = vi.spyOn(httpService, 'get').mockResolvedValue(
				new Response(backendResultPayload, {
					headers: new Headers({
						'Content-Type': `${MediaType.JSON}`
					})
				})
			);

			const instanceUnderTest = new BvvFileStorageService();

			const result = await instanceUnderTest.get('someId');

			expect(result.data).toBe(data);
			expect(result.type).toBe(FileStorageServiceDataTypes.KML);
			expect(result.srid).toBe(4326);
			expect(result.lastModified).toBe(87654321);
			expect(httpServiceSpy).toHaveBeenCalledWith(expectedUrl);
			expect(configServiceSpy).toHaveBeenCalledWith('BACKEND_URL');
		});

		it('throws an error when content-type is not supported', async () => {
			const contentType = 'someContentType';
			const data = 'data';
			const fileId = 'someId';
			const backendUrl = 'https://backend.url/';
			const expectedUrl = backendUrl + 'files/' + fileId;
			const configServiceSpy = vi.spyOn(configService, 'getValueAsPath').mockReturnValue(backendUrl);
			const httpServiceSpy = vi.spyOn(httpService, 'get').mockResolvedValue(
				new Response(data, {
					headers: new Headers({
						'Content-Type': contentType
					})
				})
			);
			const instanceUnderTest = new BvvFileStorageService();

			await expect(instanceUnderTest.get('someId')).rejects.toThrow('Content-Type ' + contentType + ' currently not supported');
			expect(httpServiceSpy).toHaveBeenCalledWith(expectedUrl);
			expect(configServiceSpy).toHaveBeenCalledWith('BACKEND_URL');
		});

		it('throws an error when endpoint returns status-code != 200', async () => {
			const fileId = 'someId';
			const backendUrl = 'https://backend.url/';
			const expectedUrl = backendUrl + 'files/' + fileId;
			const configServiceSpy = vi.spyOn(configService, 'getValueAsPath').mockReturnValue(backendUrl);
			const httpServiceSpy = vi.spyOn(httpService, 'get').mockResolvedValue(new Response(null, { status: 404 }));
			const instanceUnderTest = new BvvFileStorageService();

			await expect(instanceUnderTest.get('someId')).rejects.toThrow('File could not be loaded: ' + expectedUrl);
			expect(httpServiceSpy).toHaveBeenCalledWith(expectedUrl);
			expect(configServiceSpy).toHaveBeenCalledWith('BACKEND_URL');
		});
	});

	describe('save', () => {
		it('saves a new KML file', async () => {
			const data = 'data';
			const fileId = 'someFileId';
			const adminId = 'someAdminId';
			const backendUrl = 'https://backend.url/';
			const expectedUrl = backendUrl + 'files';
			const configServiceSpy = vi.spyOn(configService, 'getValueAsPath').mockReturnValue(backendUrl);
			const httpServiceSpy = vi.spyOn(httpService, 'post').mockResolvedValue(
				new Response(
					JSON.stringify({
						adminId: adminId,
						fileId: fileId
					}),
					{ status: 200 }
				)
			);
			const instanceUnderTest = new BvvFileStorageService();

			const result = await instanceUnderTest.save(null, data, FileStorageServiceDataTypes.KML);

			expect(result.adminId).toBe(adminId);
			expect(result.fileId).toBe(fileId);
			expect(httpServiceSpy).toHaveBeenCalledWith(expectedUrl, data, FileStorageServiceDataTypes.KML, { timeout: 20_000 });
			expect(configServiceSpy).toHaveBeenCalledWith('BACKEND_URL');
		});

		it('updates an existing KML file', async () => {
			const data = 'data';
			const fileId = 'someFileId';
			const adminId = 'someAdminId';
			const backendUrl = 'https://backend.url/';
			const expectedUrl = backendUrl + 'files/' + fileId;
			const configServiceSpy = vi.spyOn(configService, 'getValueAsPath').mockReturnValue(backendUrl);
			const httpServiceSpy = vi.spyOn(httpService, 'post').mockResolvedValue(
				new Response(
					JSON.stringify({
						adminId: adminId,
						fileId: fileId
					}),
					{ status: 200 }
				)
			);
			const instanceUnderTest = new BvvFileStorageService();

			const result = await instanceUnderTest.save(fileId, data, FileStorageServiceDataTypes.KML);

			expect(result.adminId).toBe(adminId);
			expect(result.fileId).toBe(fileId);
			expect(httpServiceSpy).toHaveBeenCalledWith(expectedUrl, data, FileStorageServiceDataTypes.KML, { timeout: 20_000 });
			expect(configServiceSpy).toHaveBeenCalledWith('BACKEND_URL');
		});

		it('throws an error when content-type is not supported', async () => {
			const contentType = 'someContentType';
			const data = 'data';
			const instanceUnderTest = new BvvFileStorageService();

			await expect(instanceUnderTest.save(null, data, contentType)).rejects.toThrow('Content-Type ' + contentType + ' currently not supported');
		});

		it('throws an error when file cannot be saved', async () => {
			const data = 'data';
			const backendUrl = 'https://backend.url/';
			const expectedUrl = backendUrl + 'files';
			const configServiceSpy = vi.spyOn(configService, 'getValueAsPath').mockReturnValue(backendUrl);
			const httpServiceSpy = vi.spyOn(httpService, 'post').mockResolvedValue(new Response(null, { status: 500 }));
			const instanceUnderTest = new BvvFileStorageService();

			await expect(instanceUnderTest.save(null, data, FileStorageServiceDataTypes.KML)).rejects.toThrow('File could not be saved: ' + expectedUrl);
			expect(httpServiceSpy).toHaveBeenCalledWith(expectedUrl, data, FileStorageServiceDataTypes.KML, { timeout: 20_000 });
			expect(configServiceSpy).toHaveBeenCalledWith('BACKEND_URL');
		});
	});

	describe('isFileId', () => {
		it('checks if a string represents a fileId', async () => {
			const instanceUnderTest = new BvvFileStorageService();

			expect(instanceUnderTest.isFileId()).toBe(false);
			expect(instanceUnderTest.isFileId('foo')).toBe(false);
			expect(instanceUnderTest.isFileId('f_foo')).toBe(true);
		});
	});

	describe('isAdminId', () => {
		it('checks if a string represents an adminId', async () => {
			const instanceUnderTest = new BvvFileStorageService();

			expect(instanceUnderTest.isAdminId()).toBe(false);
			expect(instanceUnderTest.isAdminId('foo')).toBe(false);
			expect(instanceUnderTest.isAdminId('a_foo')).toBe(true);
		});
	});

	describe('getFileId', () => {
		it('loads a fileId file by an adminId', async () => {
			const adminId = 'a_Id';
			const fileId = 'f_Id';
			const backendUrl = 'https://backend.url/';
			const expectedUrl = backendUrl + 'files/' + adminId;
			const configServiceSpy = vi.spyOn(configService, 'getValueAsPath').mockReturnValue(backendUrl);
			const httpServiceSpy = vi.spyOn(httpService, 'get').mockResolvedValue(
				new Response(
					JSON.stringify({
						fileId: fileId
					}),
					{ status: 200 }
				)
			);
			const instanceUnderTest = new BvvFileStorageService();

			const result = await instanceUnderTest.getFileId(adminId);

			expect(result).toBe(fileId);
			expect(httpServiceSpy).toHaveBeenCalledWith(expectedUrl);
			expect(configServiceSpy).toHaveBeenCalledWith('BACKEND_URL');
		});

		it('returns the id if it is already a fileId', async () => {
			const fileId = 'f_Id';
			const instanceUnderTest = new BvvFileStorageService();

			const result = await instanceUnderTest.getFileId(fileId);

			expect(result).toBe(fileId);
		});

		it('throws an error when result contains no fileId', async () => {
			const adminId = 'a_Id';
			const backendUrl = 'https://backend.url/';
			const expectedUrl = backendUrl + 'files/' + adminId;
			const configServiceSpy = vi.spyOn(configService, 'getValueAsPath').mockReturnValue(backendUrl);
			const httpServiceSpy = vi.spyOn(httpService, 'get').mockResolvedValue(new Response(JSON.stringify({}), { status: 200 }));
			const instanceUnderTest = new BvvFileStorageService();

			await expect(instanceUnderTest.getFileId(adminId)).rejects.toThrow('FileId could not be retrieved: ' + expectedUrl);
			expect(httpServiceSpy).toHaveBeenCalledWith(expectedUrl);
			expect(configServiceSpy).toHaveBeenCalledWith('BACKEND_URL');
		});

		it('throws an error when endpoints return status-code != 200', async () => {
			const adminId = 'a_Id';
			const backendUrl = 'https://backend.url/';
			const expectedUrl = backendUrl + 'files/' + adminId;
			const configServiceSpy = vi.spyOn(configService, 'getValueAsPath').mockReturnValue(backendUrl);
			const httpServiceSpy = vi.spyOn(httpService, 'get').mockResolvedValue(new Response(null, { status: 404 }));
			const instanceUnderTest = new BvvFileStorageService();

			await expect(instanceUnderTest.getFileId(adminId)).rejects.toThrow('FileId could not be retrieved: ' + expectedUrl);
			expect(httpServiceSpy).toHaveBeenCalledWith(expectedUrl);
			expect(configServiceSpy).toHaveBeenCalledWith('BACKEND_URL');
		});
	});
});

describe('TempStorageService', () => {
	describe('get', () => {
		it('throws an error when content-type is not supported', async () => {
			const instanceUnderTest = new TempStorageService();

			await expect(instanceUnderTest.get('someId')).rejects.toThrow('File could not be loaded: someId');
		});
	});

	describe('save / get', () => {
		it('saves a new file, updates an existing file', async () => {
			const data = 'data';
			const updatedData = 'updatedData';
			const instanceUnderTest = new TempStorageService();

			const result0 = await instanceUnderTest.save(null, data, FileStorageServiceDataTypes.KML);

			expect(result0.adminId.startsWith('a_tmp_')).toBe(true);
			expect(result0.fileId.startsWith('f_tmp_')).toBe(true);
			await expect(instanceUnderTest.get(result0.fileId)).resolves.toEqual(data);

			const result1 = await instanceUnderTest.save(result0.adminId, updatedData, FileStorageServiceDataTypes.KML);

			expect(result1).toEqual(result0);
			await expect(instanceUnderTest.get(result1.fileId)).resolves.toEqual(updatedData);
		});

		it('throws an error when content-type is not supported', async () => {
			const contentType = 'someContentType';
			const data = 'data';
			const instanceUnderTest = new TempStorageService();

			await expect(instanceUnderTest.save(null, data, contentType)).rejects.toThrow('Content-Type ' + contentType + ' currently not supported');
		});

		it('throws an error when id is a file id', async () => {
			const contentType = 'someContentType';
			const data = 'data';
			const instanceUnderTest = new TempStorageService();
			vi.spyOn(instanceUnderTest, 'isFileId').mockReturnValue(true);

			await expect(instanceUnderTest.save('f_id', data, contentType)).rejects.toThrow('Saving a file by its FileId is currently not supported');
		});
	});

	describe('isFileId', () => {
		it('checks if a string represents a fileId', async () => {
			const instanceUnderTest = new TempStorageService();

			expect(instanceUnderTest.isFileId()).toBe(false);
			expect(instanceUnderTest.isFileId('foo')).toBe(false);
			expect(instanceUnderTest.isFileId('f_foo')).toBe(true);
		});
	});

	describe('iAdminId', () => {
		it('checks if a string represents an adminId', async () => {
			const instanceUnderTest = new TempStorageService();

			expect(instanceUnderTest.isAdminId()).toBe(false);
			expect(instanceUnderTest.isAdminId('foo')).toBe(false);
			expect(instanceUnderTest.isAdminId('a_foo')).toBe(true);
		});
	});

	describe('getFileId', () => {
		it('loads a fileId file by an adminId', async () => {
			const adminId = 'a_Id';
			const fileId = 'f_Id';

			const instanceUnderTest = new TempStorageService();

			await expect(instanceUnderTest.getFileId(adminId)).resolves.toEqual(fileId);
		});

		it('returns the id if it is already a fileId', async () => {
			const fileId = 'f_Id';
			const instanceUnderTest = new TempStorageService();

			await expect(instanceUnderTest.getFileId(fileId)).resolves.toEqual(fileId);
		});

		it('throws an error when result contains no fileId', async () => {
			const instanceUnderTest = new TempStorageService();

			await expect(instanceUnderTest.getFileId('unknown_id')).rejects.toThrow('FileId could not be retrieved: unknown_id');
		});
	});
});
