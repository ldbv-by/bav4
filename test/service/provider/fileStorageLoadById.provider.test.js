import { $injector } from '../../../src/injection';
import { VectorGeoResource, VectorSourceType } from '../../../src/services/domain/geoResources';
import { FileStorageServiceDataTypes } from '../../../src/services/FileStorageService';
import { loadBvvFileStorageResourceById, _newLabelUpdateHandler, _newVectorGeoResourceLoader } from '../../../src/services/provider/fileStorageLoadById.provider';
import { addLayer } from '../../../src/store/layers/layers.action';
import { layersReducer } from '../../../src/store/layers/layers.reducer';
import { TestUtils } from '../../test-utils';

describe('BVV GeoResource provider', () => {

	let store;

	const fileStorageService = {
		async get() { },
		isFileId() { },
		isAdminId() { },
		async getFileId() { }
	};

	beforeEach(() => {
		store = TestUtils.setupStoreAndDi({}, {
			layers: layersReducer
		});
		$injector
			.registerSingleton('TranslationService', { translate: (key) => key })
			.registerSingleton('FileStorageService', fileStorageService);
	});

	afterEach(() => {
		$injector.reset();
	});


	describe('loadFileStorageResourceById', () => {

		describe('Id is a FileStorage fileId', () => {

			it('loads a GeoResource via the FileStorageService', async () => {
				const id = 'foo';
				spyOn(fileStorageService, 'isFileId').withArgs(id).and.returnValue(true);

				const geoResouce = await loadBvvFileStorageResourceById(id);

				expect(geoResouce.id).toBe(id);
				expect(geoResouce._loader).toBeDefined();
			});
		});

		describe('Id is a FileStorage adminId', () => {

			it('loads a GeoResource via the FileStorageService', async () => {
				const id = 'foo';
				spyOn(fileStorageService, 'isAdminId').withArgs(id).and.returnValue(true);

				const geoResouce = await loadBvvFileStorageResourceById(id);

				expect(geoResouce.id).toBe(id);
				expect(geoResouce._loader).toBeDefined();
			});
		});

		describe('Id is neither an adminId nor a fileId', () => {

			it('return Null', async () => {
				const id = 'foo';
				spyOn(fileStorageService, 'isAdminId').withArgs(id).and.returnValue(false);
				spyOn(fileStorageService, 'isFileId').withArgs(id).and.returnValue(false);

				const geoResouce = await loadBvvFileStorageResourceById(id);

				expect(geoResouce).toBeNull();
			});
		});
	});

	describe('_newVectorGeoResourceLoader', () => {

		it('returns a loader for KML VectorGeoResources', async () => {
			const id = 'id';
			const fileId = 'f_id';
			const data = 'data';
			const type = FileStorageServiceDataTypes.KML;
			const srid = 1234;
			spyOn(fileStorageService, 'getFileId').withArgs(id).and.resolveTo(fileId);
			spyOn(fileStorageService, 'get').withArgs(fileId).and.returnValue(
				Promise.resolve({ data: data, type: type, srid: srid })
			);


			const loader = _newVectorGeoResourceLoader(id);
			expect(typeof loader === 'function').toBeTrue();


			const result = await loader();
			expect(result.data).toBe(data);
			expect(result.sourceType).toBe(VectorSourceType.KML);
			expect(result.srid).toBe(srid);
		});

		it('throws an error when source type is not supported', async () => {
			const id = 'id';
			const fileId = 'f_id';
			const data = 'data';
			const type = 'unsupported';
			const srid = 1234;
			spyOn(fileStorageService, 'getFileId').withArgs(id).and.resolveTo(fileId);
			spyOn(fileStorageService, 'get').withArgs(fileId).and.returnValue(
				Promise.resolve({ data: data, type: type, srid: srid })
			);


			const loader = _newVectorGeoResourceLoader(id);
			expect(typeof loader === 'function').toBeTrue();

			try {
				await loader();
				throw new Error('Promise should not be resolved');
			}
			catch (error) {
				expect(error.message).toBe(`Could not load vector data for id '${id}': Error: No VectorGeoResourceLoader available for unsupported type '${type}'`);
			}
		});

		it('throws an error when FileStorageService throws an error', async () => {
			const id = 'id';
			const fileId = 'f_id';
			const message = 'foo';
			spyOn(fileStorageService, 'getFileId').withArgs(id).and.resolveTo(fileId);
			spyOn(fileStorageService, 'get').withArgs(fileId).and.rejectWith(new Error(message));


			const loader = _newVectorGeoResourceLoader(id);
			expect(typeof loader === 'function').toBeTrue();

			try {
				await loader();
				throw new Error('Promise should not be resolved');
			}
			catch (error) {
				expect(error.message).toBe(`Could not load vector data for id '${id}': Error: ${message}`);
			}
		});
	});

	describe('_newLabelUpdateHandler', () => {

		it('returns a proxy handler which updates the label property of a layer', async () => {
			const id = 'id';
			const layer0 = { label: 'label0' };
			addLayer(id, layer0);

			const handler = _newLabelUpdateHandler(id);
			const vgr = new VectorGeoResource(id, 'new Layer', null);
			const proxifiedVgr = new Proxy(vgr, handler);
			proxifiedVgr.label = 'updatedLabel';

			expect(store.getState().layers.active[0].label).toBe('updatedLabel');
		});
	});

});
