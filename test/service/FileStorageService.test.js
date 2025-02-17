/* eslint-disable no-undef */
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
			const fileId = 'someId';
			const backendUrl = 'https://backend.url/';
			const expectedUrl = backendUrl + 'files/' + fileId;
			spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
			spyOn(httpService, 'get')
				.withArgs(expectedUrl)
				.and.returnValue(
					Promise.resolve(
						new Response(data, {
							headers: new Headers({
								'Content-Type': FileStorageServiceDataTypes.KML
							})
						})
					)
				);
			const instanceUnderTest = new BvvFileStorageService();

			const result = await instanceUnderTest.get('someId');

			expect(result.data).toBe(data);
			expect(result.type).toBe(FileStorageServiceDataTypes.KML);
			expect(result.srid).toBe(4326);
		});

		it('throws an error when content-type is not supported', async () => {
			const contentType = 'someContentType';
			const data = 'data';
			const fileId = 'someId';
			const backendUrl = 'https://backend.url/';
			const expectedUrl = backendUrl + 'files/' + fileId;
			spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
			spyOn(httpService, 'get')
				.withArgs(expectedUrl)
				.and.returnValue(
					Promise.resolve(
						new Response(data, {
							headers: new Headers({
								'Content-Type': contentType
							})
						})
					)
				);
			const instanceUnderTest = new BvvFileStorageService();

			try {
				await instanceUnderTest.get('someId');
				throw new Error('Promise should not be resolved');
			} catch (error) {
				expect(error.message).toBe('Content-Type ' + contentType + ' currently not supported');
			}
		});

		it('throws an error when endpoint returns status-code != 200', async () => {
			const fileId = 'someId';
			const backendUrl = 'https://backend.url/';
			const expectedUrl = backendUrl + 'files/' + fileId;
			spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
			spyOn(httpService, 'get')
				.withArgs(expectedUrl)
				.and.returnValue(Promise.resolve(new Response(null, { status: 404 })));
			const instanceUnderTest = new BvvFileStorageService();

			try {
				await instanceUnderTest.get('someId');
				throw new Error('Promise should not be resolved');
			} catch (error) {
				expect(error.message).toBe('File could not be loaded: ' + expectedUrl);
			}
		});
	});

	describe('save', () => {
		it('saves a new KML file', async () => {
			const data = 'data';
			const fileId = 'someFileId';
			const adminId = 'someAdminId';
			const backendUrl = 'https://backend.url/';
			const expectedUrl = backendUrl + 'files';
			spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
			spyOn(httpService, 'post')
				.withArgs(expectedUrl, data, FileStorageServiceDataTypes.KML, { timeout: 20_000 })
				.and.returnValue(
					Promise.resolve(
						new Response(
							JSON.stringify({
								adminId: adminId,
								fileId: fileId
							}),
							{ status: 200 }
						)
					)
				);
			const instanceUnderTest = new BvvFileStorageService();

			const result = await instanceUnderTest.save(null, data, FileStorageServiceDataTypes.KML);

			expect(result.adminId).toBe(adminId);
			expect(result.fileId).toBe(fileId);
		});

		it('updates an existing KML file', async () => {
			const data = 'data';
			const fileId = 'someFileId';
			const adminId = 'someAdminId';
			const backendUrl = 'https://backend.url/';
			const expectedUrl = backendUrl + 'files/' + fileId;
			spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
			spyOn(httpService, 'post')
				.withArgs(expectedUrl, data, FileStorageServiceDataTypes.KML, { timeout: 20_000 })
				.and.returnValue(
					Promise.resolve(
						new Response(
							JSON.stringify({
								adminId: adminId,
								fileId: fileId
							}),
							{ status: 200 }
						)
					)
				);
			const instanceUnderTest = new BvvFileStorageService();

			const result = await instanceUnderTest.save(fileId, data, FileStorageServiceDataTypes.KML);

			expect(result.adminId).toBe(adminId);
			expect(result.fileId).toBe(fileId);
		});

		it('throws an error when content-type is not supported', async () => {
			const contentType = 'someContentType';
			const data = 'data';
			const instanceUnderTest = new BvvFileStorageService();

			try {
				await instanceUnderTest.save(null, data, contentType);
				throw new Error('Promise should not be resolved');
			} catch (error) {
				expect(error.message).toBe('Content-Type ' + contentType + ' currently not supported');
			}
		});

		it('throws an error when file cannot be saved', async () => {
			const data = 'data';
			const backendUrl = 'https://backend.url/';
			const expectedUrl = backendUrl + 'files';
			spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
			spyOn(httpService, 'post')
				.withArgs(expectedUrl, data, FileStorageServiceDataTypes.KML, { timeout: 20_000 })
				.and.returnValue(Promise.resolve(new Response(null, { status: 500 })));
			const instanceUnderTest = new BvvFileStorageService();

			try {
				await instanceUnderTest.save(null, data, FileStorageServiceDataTypes.KML);
				throw new Error('Promise should not be resolved');
			} catch (error) {
				expect(error.message).toBe('File could not be saved: ' + expectedUrl);
			}
		});
	});

	describe('isFileId', () => {
		it('checks if a string represents a fileId', async () => {
			const instanceUnderTest = new BvvFileStorageService();

			expect(instanceUnderTest.isFileId()).toBeFalse();
			expect(instanceUnderTest.isFileId('foo')).toBeFalse();
			expect(instanceUnderTest.isFileId('f_foo')).toBeTrue();
		});
	});

	describe('isAdminId', () => {
		it('checks if a string represents an adminId', async () => {
			const instanceUnderTest = new BvvFileStorageService();

			expect(instanceUnderTest.isAdminId()).toBeFalse();
			expect(instanceUnderTest.isAdminId('foo')).toBeFalse();
			expect(instanceUnderTest.isAdminId('a_foo')).toBeTrue();
		});
	});

	describe('getFileId', () => {
		it('loads a fileId file by an adminId', async () => {
			const adminId = 'a_Id';
			const fileId = 'f_Id';
			const backendUrl = 'https://backend.url/';
			const expectedUrl = backendUrl + 'files/' + adminId;
			spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
			spyOn(httpService, 'get')
				.withArgs(expectedUrl)
				.and.returnValue(
					Promise.resolve(
						new Response(
							JSON.stringify({
								fileId: fileId
							}),
							{ status: 200 }
						)
					)
				);
			const instanceUnderTest = new BvvFileStorageService();

			const result = await instanceUnderTest.getFileId(adminId);

			expect(result).toBe(fileId);
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
			spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
			spyOn(httpService, 'get')
				.withArgs(expectedUrl)
				.and.returnValue(Promise.resolve(new Response(JSON.stringify({}), { status: 200 })));
			const instanceUnderTest = new BvvFileStorageService();

			try {
				await instanceUnderTest.getFileId(adminId);
				throw new Error('Promise should not be resolved');
			} catch (error) {
				expect(error.message).toBe('FileId could not be retrieved: ' + expectedUrl);
			}
		});

		it('throws an error when endpoints return status-code != 200', async () => {
			const adminId = 'a_Id';
			const backendUrl = 'https://backend.url/';
			const expectedUrl = backendUrl + 'files/' + adminId;
			spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
			spyOn(httpService, 'get')
				.withArgs(expectedUrl)
				.and.returnValue(Promise.resolve(new Response(null, { status: 404 })));
			const instanceUnderTest = new BvvFileStorageService();

			try {
				await instanceUnderTest.getFileId(adminId);
				throw new Error('Promise should not be resolved');
			} catch (error) {
				expect(error.message).toBe('FileId could not be retrieved: ' + expectedUrl);
			}
		});
	});
});

describe('TempStorageService', () => {
	describe('get', () => {
		it('throws an error when content-type is not supported', async () => {
			const instanceUnderTest = new TempStorageService();

			await expectAsync(instanceUnderTest.get('someId')).toBeRejectedWithError('File could not be loaded: someId');
		});
	});

	describe('save / get', () => {
		it('saves a new file, updates an existing file', async () => {
			const data = 'data';
			const updatedData = 'updatedData';
			const instanceUnderTest = new TempStorageService();

			const result0 = await instanceUnderTest.save(null, data, FileStorageServiceDataTypes.KML);

			expect(result0.adminId.startsWith('a_tmp_')).toBeTrue();
			expect(result0.fileId.startsWith('f_tmp_')).toBeTrue();
			await expectAsync(instanceUnderTest.get(result0.fileId)).toBeResolvedTo(data);

			const result1 = await instanceUnderTest.save(result0.adminId, updatedData, FileStorageServiceDataTypes.KML);

			expect(result1).toEqual(result0);
			await expectAsync(instanceUnderTest.get(result1.fileId)).toBeResolvedTo(updatedData);
		});

		it('throws an error when content-type is not supported', async () => {
			const contentType = 'someContentType';
			const data = 'data';
			const instanceUnderTest = new TempStorageService();

			await expectAsync(instanceUnderTest.save(null, data, contentType)).toBeRejectedWithError(
				'Content-Type ' + contentType + ' currently not supported'
			);
		});

		it('throws an error when id is a file id', async () => {
			const contentType = 'someContentType';
			const data = 'data';
			const instanceUnderTest = new TempStorageService();
			spyOn(instanceUnderTest, 'isFileId').and.returnValue(true);

			await expectAsync(instanceUnderTest.save('f_id', data, contentType)).toBeRejectedWithError(
				'Saving a file by its FileId is currently not supported'
			);
		});
	});

	describe('isFileId', () => {
		it('checks if a string represents a fileId', async () => {
			const instanceUnderTest = new TempStorageService();

			expect(instanceUnderTest.isFileId()).toBeFalse();
			expect(instanceUnderTest.isFileId('foo')).toBeFalse();
			expect(instanceUnderTest.isFileId('f_foo')).toBeTrue();
		});
	});

	describe('iAdminId', () => {
		it('checks if a string represents an adminId', async () => {
			const instanceUnderTest = new TempStorageService();

			expect(instanceUnderTest.isAdminId()).toBeFalse();
			expect(instanceUnderTest.isAdminId('foo')).toBeFalse();
			expect(instanceUnderTest.isAdminId('a_foo')).toBeTrue();
		});
	});

	describe('getFileId', () => {
		it('loads a fileId file by an adminId', async () => {
			const adminId = 'a_Id';
			const fileId = 'f_Id';

			const instanceUnderTest = new TempStorageService();

			await expectAsync(instanceUnderTest.getFileId(adminId)).toBeResolvedTo(fileId);
		});

		it('returns the id if it is already a fileId', async () => {
			const fileId = 'f_Id';
			const instanceUnderTest = new TempStorageService();

			await expectAsync(instanceUnderTest.getFileId(fileId)).toBeResolvedTo(fileId);
		});

		it('throws an error when result contains no fileId', async () => {
			const instanceUnderTest = new TempStorageService();

			await expectAsync(instanceUnderTest.getFileId('unknown_id')).toBeRejectedWithError('FileId could not be retrieved: unknown_id');
		});
	});
});
