import { $injector } from '../../../src/injection';
import { GeoResourceFuture, VectorGeoResource, VectorSourceType } from '../../../src/domain/geoResources';
import { FileStorageServiceDataTypes } from '../../../src/services/FileStorageService';
import { loadBvvFileStorageResourceById, _newLoader } from '../../../src/services/provider/fileStorage.provider';
import { getAttributionForLocallyImportedOrCreatedGeoResource } from '../../../src/services/provider/attribution.provider';

describe('BVV GeoResource provider', () => {
	const fileStorageService = {
		async get() {},
		isFileId() {},
		isAdminId() {},
		async getFileId() {}
	};

	beforeEach(() => {
		$injector.registerSingleton('FileStorageService', fileStorageService);
	});

	afterEach(() => {
		$injector.reset();
	});

	describe('loadBvvFileStorageResourceById', () => {
		describe('Id is a FileStorage fileId', () => {
			it('loads a GeoResource via the FileStorageService', () => {
				const id = 'foo';
				spyOn(fileStorageService, 'isFileId').withArgs(id).and.returnValue(true);

				const future = loadBvvFileStorageResourceById(id);

				expect(future instanceof GeoResourceFuture).toBeTrue();
				expect(future.id).toBe(id);
				expect(future.label).toBeNull();
				expect(future._loader).toBeDefined();
			});
		});

		describe('Id is a FileStorage adminId', () => {
			it('loads a GeoResource via the FileStorageService', () => {
				const id = 'foo';
				spyOn(fileStorageService, 'isAdminId').withArgs(id).and.returnValue(true);

				const future = loadBvvFileStorageResourceById(id);

				expect(future instanceof GeoResourceFuture).toBeTrue();
				expect(future.id).toBe(id);
				expect(future.label).toBeNull();
				expect(future._loader).toBeDefined();
			});
		});

		describe('Id is neither an adminId nor a fileId', () => {
			it('return Null', () => {
				const id = 'foo';
				spyOn(fileStorageService, 'isAdminId').withArgs(id).and.returnValue(false);
				spyOn(fileStorageService, 'isFileId').withArgs(id).and.returnValue(false);

				const future = loadBvvFileStorageResourceById(id);

				expect(future).toBeNull();
			});
		});
	});

	describe('_newLoader', () => {
		it('returns a loader that loads a VectorGeoResource', async () => {
			const id = 'id';
			const fileId = 'f_id';
			const data = 'data';
			const type = FileStorageServiceDataTypes.KML;
			const srid = 1234;
			spyOn(fileStorageService, 'getFileId').withArgs(id).and.resolveTo(fileId);
			spyOn(fileStorageService, 'get')
				.withArgs(fileId)
				.and.returnValue(Promise.resolve({ data: data, type: type, srid: srid }));
			const loader = _newLoader(id);

			const geoResource = await loader();

			expect(geoResource instanceof VectorGeoResource).toBeTrue();
			expect(geoResource._data).toBe(data);
			expect(geoResource._srid).toBe(srid);
			expect(geoResource._srid).toBe(srid);
			expect(geoResource._attributionProvider).toBe(getAttributionForLocallyImportedOrCreatedGeoResource);
			expect(geoResource._sourceType).toBe(VectorSourceType.KML);
			expect(geoResource.label).toBe('KML');
		});

		it('throws an error when source type is not supported', async () => {
			const id = 'id';
			const fileId = 'f_id';
			const data = 'data';
			const type = 'unsupported';
			const srid = 1234;
			spyOn(fileStorageService, 'getFileId').withArgs(id).and.resolveTo(fileId);
			spyOn(fileStorageService, 'get')
				.withArgs(fileId)
				.and.returnValue(Promise.resolve({ data: data, type: type, srid: srid }));
			const loader = _newLoader(id);

			await expectAsync(loader()).toBeRejectedWith(
				jasmine.objectContaining({
					message: "Could not load vector data for id 'id'",
					cause: jasmine.objectContaining({
						message: `Unsupported FileStorageServiceDataType '${type}'`
					})
				})
			);
		});

		it('throws an error when FileStorageService throws an error', async () => {
			const id = 'id';
			const fileId = 'f_id';
			const serviceError = new Error('foo');
			spyOn(fileStorageService, 'getFileId').withArgs(id).and.resolveTo(fileId);
			spyOn(fileStorageService, 'get').withArgs(fileId).and.rejectWith(serviceError);
			const loader = _newLoader(id);

			await expectAsync(loader()).toBeRejectedWithError("Could not load vector data for id 'id'");
			await expectAsync(loader()).toBeRejectedWith(jasmine.objectContaining({ cause: serviceError }));
		});
	});
});
