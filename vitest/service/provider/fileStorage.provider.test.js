import { $injector } from '@src/injection';
import { GeoResourceFuture, VectorGeoResource, VectorSourceType } from '@src/domain/geoResources';
import { FileStorageServiceDataTypes } from '@src/services/FileStorageService';
import { loadBvvFileStorageResourceById, _newLoader } from '@src/services/provider/fileStorage.provider';
import { getAttributionForLocallyImportedOrCreatedGeoResource } from '@src/services/provider/attribution.provider';
import { UnavailableGeoResourceError } from '@src/domain/errors';

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
				const fileStorageServiceSpy = vi.spyOn(fileStorageService, 'isFileId').mockReturnValue(true);

				const future = loadBvvFileStorageResourceById(id);

				expect(future instanceof GeoResourceFuture).toBe(true);
				expect(future.id).toBe(id);
				expect(future.label).toBeNull();
				expect(future._loader).toBeDefined();
				expect(fileStorageServiceSpy).toHaveBeenCalledWith(id);
			});
		});

		describe('Id is a FileStorage adminId', () => {
			it('loads a GeoResource via the FileStorageService', () => {
				const id = 'foo';
				const fileStorageServiceSpy = vi.spyOn(fileStorageService, 'isFileId').mockReturnValue(true);

				const future = loadBvvFileStorageResourceById(id);

				expect(future instanceof GeoResourceFuture).toBe(true);
				expect(future.id).toBe(id);
				expect(future.label).toBeNull();
				expect(future._loader).toBeDefined();
				expect(fileStorageServiceSpy).toHaveBeenCalledWith(id);
			});
		});

		describe('Id is neither an adminId nor a fileId', () => {
			it('return Null', () => {
				const id = 'foo';
				const fileStorageServiceSpy0 = vi.spyOn(fileStorageService, 'isAdminId').mockReturnValue(false);
				const fileStorageServiceSpy1 = vi.spyOn(fileStorageService, 'isFileId').mockReturnValue(false);

				const future = loadBvvFileStorageResourceById(id);

				expect(future).toBeNull();
				expect(fileStorageServiceSpy0).toHaveBeenCalledWith(id);
				expect(fileStorageServiceSpy1).toHaveBeenCalledWith(id);
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
			const fileStorageServiceSpy0 = vi.spyOn(fileStorageService, 'getFileId').mockResolvedValue(fileId);
			const fileStorageServiceSpy1 = vi.spyOn(fileStorageService, 'isAdminId').mockReturnValueOnce(false).mockReturnValueOnce(true);
			const fileStorageServiceSpy2 = vi
				.spyOn(fileStorageService, 'get')
				.mockResolvedValue({ data: data, type: type, srid: srid, lastModified: 123456789 });
			const loader = _newLoader(id);

			const geoResource0 = await loader();

			expect(geoResource0 instanceof VectorGeoResource).toBe(true);
			expect(geoResource0._data).toBe(data);
			expect(geoResource0._srid).toBe(srid);
			expect(geoResource0._srid).toBe(srid);
			expect(geoResource0._attributionProvider).toBe(getAttributionForLocallyImportedOrCreatedGeoResource);
			expect(geoResource0._sourceType).toBe(VectorSourceType.KML);
			expect(geoResource0.label).toBe('KML');
			expect(geoResource0.hasLastModifiedTimestamp()).toBe(true);
			expect(geoResource0.lastModified).toBe(123456789);
			expect(geoResource0.collaborativeData).toBe(false);
			expect(fileStorageServiceSpy0).toHaveBeenCalledWith(id);
			expect(fileStorageServiceSpy1).toHaveBeenCalledWith(id);
			expect(fileStorageServiceSpy2).toHaveBeenCalledWith(fileId);

			const geoResource1 = await loader();

			expect(geoResource1 instanceof VectorGeoResource).toBe(true);
			expect(geoResource1.collaborativeData).toBe(true);
		});

		it('throws an error when source type is not supported', async () => {
			const id = 'id';
			const fileId = 'f_id';
			const data = 'data';
			const type = 'unsupported';
			const srid = 1234;
			const fileStorageServiceSpy0 = vi.spyOn(fileStorageService, 'getFileId').mockResolvedValue(fileId);
			const fileStorageServiceSpy1 = vi
				.spyOn(fileStorageService, 'get')
				.mockResolvedValue({ data: data, type: type, srid: srid, lastModified: 123456789 });
			const loader = _newLoader(id);

			expect(loader()).rejects.toThrow(new UnavailableGeoResourceError(`Unsupported FileStorageServiceDataType '${type}'`, id));
			expect(fileStorageServiceSpy0).toHaveBeenCalledWith(id);
			expect(fileStorageServiceSpy1).not.toHaveBeenCalled();
		});

		it('throws an error when FileStorageService throws an error', async () => {
			const id = 'id';
			const fileId = 'f_id';
			const serviceError = new Error('foo');
			const fileStorageServiceSpy0 = vi.spyOn(fileStorageService, 'getFileId').mockResolvedValue(fileId);
			const fileStorageServiceSpy1 = vi.spyOn(fileStorageService, 'get').mockRejectedValue(serviceError);
			const loader = _newLoader(id);

			expect(loader()).rejects.toThrow(
				new UnavailableGeoResourceError(`Could not load vector data for id '${id}'`, id, null, { cause: serviceError })
			);
			expect(fileStorageServiceSpy0).toHaveBeenCalledWith(id);
			expect(fileStorageServiceSpy1).not.toHaveBeenCalled();
		});
	});
});
