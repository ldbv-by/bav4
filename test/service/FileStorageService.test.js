/* eslint-disable no-undef */
import { $injector } from '../../src/injection';
import { BvvFileStorageService, FileStorageServiceDataTypes } from '../../src/services/FileStorageService';

describe('BvvFileStorageService', () => {

	const configService = {
		getValueAsPath: () => { }
	};

	const httpService = {
		post() { },
		get() { }
	};

	beforeAll(() => {
		$injector
			.registerSingleton('ConfigService', configService)
			.registerSingleton('HttpService', httpService);
	});

	describe('get', () => {

		it('loads a KML file by id', async () => {
			const data = 'data';
			const fileId = 'someId';
			const backendUrl = 'https://backend.url/';
			const expectedUrl = backendUrl + 'files/' + fileId;
			spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
			spyOn(httpService, 'get').withArgs(expectedUrl).and.returnValue(Promise.resolve(
				new Response(data, {
					headers: new Headers({
						'Content-Type': FileStorageServiceDataTypes.KML
					})
				})

			));
			const instanceUnderTest = new BvvFileStorageService();


			const result = await instanceUnderTest.get('someId');

			expect(result.data).toBe(data);
			expect(result.type).toBe(FileStorageServiceDataTypes.KML);
			expect(result.srid).toBe(4326);
		});

		it('throws an error when content-type is not supported', (done) => {
			const contentType = 'someContentType';
			const data = 'data';
			const fileId = 'someId';
			const backendUrl = 'https://backend.url/';
			const expectedUrl = backendUrl + 'files/' + fileId;
			spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
			spyOn(httpService, 'get').withArgs(expectedUrl).and.returnValue(Promise.resolve(
				new Response(data, {
					headers: new Headers({
						'Content-Type': contentType
					})
				})

			));
			const instanceUnderTest = new BvvFileStorageService();

			instanceUnderTest.get('someId').then(() => {
				done(new Error('Promise should not be resolved'));
			}, (reason) => {
				expect(reason.message).toBe('Content-Type ' + contentType + ' currently not supported');
				done();
			});
		});

		it('throws an error when file cannot be loaded', (done) => {
			const fileId = 'someId';
			const backendUrl = 'https://backend.url/';
			const expectedUrl = backendUrl + 'files/' + fileId;
			spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
			spyOn(httpService, 'get').withArgs(expectedUrl).and.returnValue(Promise.resolve(
				new Response(null, { status: 404 })

			));
			const instanceUnderTest = new BvvFileStorageService();

			instanceUnderTest.get('someId').then(() => {
				done(new Error('Promise should not be resolved'));
			}, (reason) => {
				expect(reason.message).toBe('File could not be loaded: ' + expectedUrl);
				done();
			});
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
			spyOn(httpService, 'post').withArgs(expectedUrl, data, FileStorageServiceDataTypes.KML).and.returnValue(Promise.resolve(
				new Response(
					JSON.stringify(
						{
							adminId: adminId,
							fileId: fileId,
						}
					),
					{ status: 200 })
			));
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
			spyOn(httpService, 'post').withArgs(expectedUrl, data, FileStorageServiceDataTypes.KML).and.returnValue(Promise.resolve(
				new Response(
					JSON.stringify(
						{
							adminId: adminId,
							fileId: fileId,
						}
					),
					{ status: 200 })
			));
			const instanceUnderTest = new BvvFileStorageService();

			const result = await instanceUnderTest.save(fileId, data, FileStorageServiceDataTypes.KML);

			expect(result.adminId).toBe(adminId);
			expect(result.fileId).toBe(fileId);
		});
		
		it('throws an error when content-type is not supported', (done) => {
			const contentType = 'someContentType';
			const data = 'data';
			const instanceUnderTest = new BvvFileStorageService();

			instanceUnderTest.save(null, data, contentType).then(() => {
				done(new Error('Promise should not be resolved'));
			}, (reason) => {
				expect(reason.message).toBe('Content-Type ' + contentType + ' currently not supported');
				done();
			});

		});

		it('throws an error when file cannot be saved',  (done) => {
			const data = 'data';
			const backendUrl = 'https://backend.url/';
			const expectedUrl = backendUrl + 'files';
			spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
			spyOn(httpService, 'post').withArgs(expectedUrl, data, FileStorageServiceDataTypes.KML).and.returnValue(Promise.resolve(
				new Response(null, { status: 500 })
			));
			const instanceUnderTest = new BvvFileStorageService();


			instanceUnderTest.save(null, data, FileStorageServiceDataTypes.KML).then(() => {
				done(new Error('Promise should not be resolved'));
			}, (reason) => {
				expect(reason.message).toBe('File could not be saved: ' + expectedUrl);
				done();
			});
		});
	});
});

