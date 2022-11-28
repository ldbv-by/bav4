import { $injector } from '../../../src/injection';
import { SourceType, SourceTypeMaxFileSize, SourceTypeName, SourceTypeResult, SourceTypeResultStatus } from '../../../src/domain/sourceType';
import { MediaType } from '../../../src/services/HttpService';
import { bvvUrlSourceTypeProvider, _createCredentialPanel, defaultDataSourceTypeProvider, defaultMediaSourceTypeProvider } from '../../../src/services/provider/sourceType.provider';
import { modalReducer } from '../../../src/store/modal/modal.reducer';
import { isTemplateResultOf } from '../../../src/utils/checks';
import { TestUtils } from '../../test-utils';
import { PasswordCredentialPanel } from '../../../src/modules/auth/components/PasswordCredentialPanel';
import { closeModal } from '../../../src/store/modal/modal.action';

describe('createCredentialPanel', () => {

	it('returns a PasswordCredentialPanel template result', async () => {

		const templateResult = _createCredentialPanel('url', () => { }, () => { });
		expect(isTemplateResultOf(templateResult, PasswordCredentialPanel.tag)).toBeTrue();
	});
});

describe('sourceType provider', () => {

	describe('bvvUrlSourceTypeProvider', () => {

		const configService = {
			getValueAsPath: () => { }
		};

		const httpService = {
			post: async () => { }
		};

		const baaCredentialService = {
			addOrReplace: () => { },
			get: () => { }
		};

		const projectionService = {
			getProjections: () => { }
		};

		let store;
		beforeEach(() => {

			const initialState = {
				modal: {
					active: false
				}
			};
			store = TestUtils.setupStoreAndDi(initialState, { modal: modalReducer });

			$injector
				.registerSingleton('ConfigService', configService)
				.registerSingleton('HttpService', httpService)
				.registerSingleton('BaaCredentialService', baaCredentialService)
				.registerSingleton('TranslationService', { translate: (key) => key })
				.registerSingleton('ProjectionService', projectionService);
		});

		afterEach(() => {
			$injector.reset();
		});

		it('returns a SourceTypeServiceResult for KML', async () => {
			const srid = 4326;
			spyOn(projectionService, 'getProjections').and.returnValue([srid]);
			const backendUrl = 'https://backend.url/';
			const url = 'http://foo.bar';
			const version = 'version';
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
			const payload = JSON.stringify({ url: url });
			const sourceTypeResultPayload = { name: 'KML', version: 'version', srid: srid };
			const baaCredentialServiceSpy = spyOn(baaCredentialService, 'get').withArgs(url).and.returnValue(null);
			const httpServiceSpy = spyOn(httpService, 'post').withArgs(backendUrl + 'sourceType', payload, MediaType.JSON).and.returnValue(Promise.resolve(
				new Response(
					JSON.stringify(
						sourceTypeResultPayload
					)
				)
			));

			const { status, sourceType } = await bvvUrlSourceTypeProvider(url);

			expect(configServiceSpy).toHaveBeenCalled();
			expect(httpServiceSpy).toHaveBeenCalled();
			expect(sourceType).toBeInstanceOf(SourceType);
			expect(sourceType.name).toBe(SourceTypeName.KML);
			expect(sourceType.version).toBe(version);
			expect(sourceType.srid).toBe(srid);
			expect(status).toEqual(SourceTypeResultStatus.OK);
			expect(baaCredentialServiceSpy).toHaveBeenCalled();
		});

		it('returns a SourceTypeServiceResult for GPX', async () => {
			const srid = 4326;
			spyOn(projectionService, 'getProjections').and.returnValue([srid]);
			const backendUrl = 'https://backend.url/';
			const url = 'http://foo.bar';
			const version = 'version';
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
			const payload = JSON.stringify({ url: url });
			const sourceTypeResultPayload = { name: 'GPX', version: 'version', srid: srid };
			const baaCredentialServiceSpy = spyOn(baaCredentialService, 'get').withArgs(url).and.returnValue(null);
			const httpServiceSpy = spyOn(httpService, 'post').withArgs(backendUrl + 'sourceType', payload, MediaType.JSON).and.returnValue(Promise.resolve(
				new Response(
					JSON.stringify(
						sourceTypeResultPayload
					)
				)
			));

			const { status, sourceType } = await bvvUrlSourceTypeProvider(url);

			expect(configServiceSpy).toHaveBeenCalled();
			expect(httpServiceSpy).toHaveBeenCalled();
			expect(sourceType).toBeInstanceOf(SourceType);
			expect(sourceType.name).toBe(SourceTypeName.GPX);
			expect(sourceType.version).toBe(version);
			expect(sourceType.srid).toBe(srid);
			expect(status).toEqual(SourceTypeResultStatus.OK);
			expect(baaCredentialServiceSpy).toHaveBeenCalled();
		});

		it('returns a SourceTypeServiceResult for GeoJSON', async () => {
			const srid = 4326;
			spyOn(projectionService, 'getProjections').and.returnValue([srid]);
			const backendUrl = 'https://backend.url/';
			const url = 'http://foo.bar';
			const version = 'version';
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
			const payload = JSON.stringify({ url: url });
			const sourceTypeResultPayload = { name: 'GeoJSON', version: 'version', srid: srid };
			const baaCredentialServiceSpy = spyOn(baaCredentialService, 'get').withArgs(url).and.returnValue(null);
			const httpServiceSpy = spyOn(httpService, 'post').withArgs(backendUrl + 'sourceType', payload, MediaType.JSON).and.returnValue(Promise.resolve(
				new Response(
					JSON.stringify(
						sourceTypeResultPayload
					)
				)
			));

			const { status, sourceType } = await bvvUrlSourceTypeProvider(url);

			expect(configServiceSpy).toHaveBeenCalled();
			expect(httpServiceSpy).toHaveBeenCalled();
			expect(sourceType).toBeInstanceOf(SourceType);
			expect(sourceType.name).toBe(SourceTypeName.GEOJSON);
			expect(sourceType.version).toBe(version);
			expect(sourceType.srid).toBe(srid);
			expect(status).toEqual(SourceTypeResultStatus.OK);
			expect(baaCredentialServiceSpy).toHaveBeenCalled();
		});

		it('returns a SourceTypeServiceResult for EWKT', async () => {
			const srid = 4326;
			spyOn(projectionService, 'getProjections').and.returnValue([srid]);
			const backendUrl = 'https://backend.url/';
			const url = 'http://foo.bar';
			const version = 'version';
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
			const payload = JSON.stringify({ url: url });
			const sourceTypeResultPayload = { name: 'EWKT', version: 'version', srid: srid };
			const baaCredentialServiceSpy = spyOn(baaCredentialService, 'get').withArgs(url).and.returnValue(null);
			const httpServiceSpy = spyOn(httpService, 'post').withArgs(backendUrl + 'sourceType', payload, MediaType.JSON).and.returnValue(Promise.resolve(
				new Response(
					JSON.stringify(
						sourceTypeResultPayload
					)
				)
			));

			const { status, sourceType } = await bvvUrlSourceTypeProvider(url);

			expect(configServiceSpy).toHaveBeenCalled();
			expect(httpServiceSpy).toHaveBeenCalled();
			expect(sourceType).toBeInstanceOf(SourceType);
			expect(sourceType.name).toBe(SourceTypeName.EWKT);
			expect(sourceType.version).toBe(version);
			expect(sourceType.srid).toBe(srid);
			expect(status).toEqual(SourceTypeResultStatus.OK);
			expect(baaCredentialServiceSpy).toHaveBeenCalled();
		});

		it('returns UNSUPPORTED_SRID when data have an unsupported SRID', async () => {
			spyOn(projectionService, 'getProjections').and.returnValue([4326]);
			const backendUrl = 'https://backend.url/';
			const url = 'http://foo.bar';
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
			const payload = JSON.stringify({ url: url });
			const sourceTypeResultPayload = { name: 'EWKT', version: 'version', srid: 5555 };
			spyOn(baaCredentialService, 'get').withArgs(url).and.returnValue(null);
			const httpServiceSpy = spyOn(httpService, 'post').withArgs(backendUrl + 'sourceType', payload, MediaType.JSON).and.returnValue(Promise.resolve(
				new Response(
					JSON.stringify(
						sourceTypeResultPayload
					)
				)
			));

			const { status, sourceType } = await bvvUrlSourceTypeProvider(url);

			expect(configServiceSpy).toHaveBeenCalled();
			expect(httpServiceSpy).toHaveBeenCalled();
			expect(sourceType).toBeNull();
			expect(status).toEqual(SourceTypeResultStatus.UNSUPPORTED_SRID);
		});

		it('returns UNSUPPORTED_TYPE when property `name` is unknown', async () => {
			spyOn(projectionService, 'getProjections').and.returnValue([4326]);
			const backendUrl = 'https://backend.url/';
			const url = 'http://foo.bar';
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
			const payload = JSON.stringify({ url: url });
			const sourceTypeResultPayload = { name: 'OTHER', version: 'version', srid: 4326 };
			spyOn(baaCredentialService, 'get').withArgs(url).and.returnValue(null);
			const httpServiceSpy = spyOn(httpService, 'post').withArgs(backendUrl + 'sourceType', payload, MediaType.JSON).and.returnValue(Promise.resolve(
				new Response(
					JSON.stringify(
						sourceTypeResultPayload
					)
				)
			));

			const { status, sourceType } = await bvvUrlSourceTypeProvider(url);

			expect(configServiceSpy).toHaveBeenCalled();
			expect(httpServiceSpy).toHaveBeenCalled();
			expect(sourceType).toBeNull();
			expect(status).toEqual(SourceTypeResultStatus.UNSUPPORTED_TYPE);
		});

		it('returns a SourceTypeServiceResult for WMS', async () => {
			spyOn(projectionService, 'getProjections').and.returnValue([3857]);
			const backendUrl = 'https://backend.url/';
			const url = 'http://foo.bar';
			const version = 'version';
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
			const payload = JSON.stringify({ url: url });
			const sourceTypeResultPayload = { name: 'WMS', version: 'version', srid: 3857 };
			const baaCredentialServiceSpy = spyOn(baaCredentialService, 'get').withArgs(url).and.returnValue(null);
			const httpServiceSpy = spyOn(httpService, 'post').withArgs(backendUrl + 'sourceType', payload, MediaType.JSON).and.returnValue(Promise.resolve(
				new Response(
					JSON.stringify(
						sourceTypeResultPayload
					)
				)
			));

			const { status, sourceType } = await bvvUrlSourceTypeProvider(url);

			expect(configServiceSpy).toHaveBeenCalled();
			expect(httpServiceSpy).toHaveBeenCalled();
			expect(sourceType).toBeInstanceOf(SourceType);
			expect(sourceType.name).toBe(SourceTypeName.WMS);
			expect(sourceType.version).toBe(version);
			expect(status).toEqual(SourceTypeResultStatus.OK);
			expect(baaCredentialServiceSpy).toHaveBeenCalled();
		});

		it('returns SourceTypeServiceResultStatus.UNSUPPORTED_TYPE_ERROR when no content is available', async () => {
			spyOn(projectionService, 'getProjections').and.returnValue([3857]);
			const backendUrl = 'https://backend.url/';
			const url = 'http://foo.bar';
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
			const payload = JSON.stringify({ url: url });
			const httpServiceSpy = spyOn(httpService, 'post').withArgs(backendUrl + 'sourceType', payload, MediaType.JSON).and.returnValue(Promise.resolve(
				new Response(null, { status: 204 })
			));

			const { status, sourceType } = await bvvUrlSourceTypeProvider(url);

			expect(configServiceSpy).toHaveBeenCalled();
			expect(httpServiceSpy).toHaveBeenCalled();
			expect(sourceType).toBeNull();
			expect(status).toEqual(SourceTypeResultStatus.UNSUPPORTED_TYPE);
		});

		it('returns SourceTypeServiceResultStatus.OTHER when backend responds with other status codes', async () => {
			spyOn(projectionService, 'getProjections').and.returnValue([3857]);
			const backendUrl = 'https://backend.url/';
			const url = 'http://foo.bar';
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
			const payload = JSON.stringify({ url: url });
			const httpServiceSpy = spyOn(httpService, 'post').withArgs(backendUrl + 'sourceType', payload, MediaType.JSON).and.returnValue(Promise.resolve(
				new Response(null, { status: 500 })
			));

			const { status, sourceType } = await bvvUrlSourceTypeProvider(url);

			expect(configServiceSpy).toHaveBeenCalled();
			expect(httpServiceSpy).toHaveBeenCalled();
			expect(sourceType).toBeNull();
			expect(status).toEqual(SourceTypeResultStatus.OTHER);
		});

		describe('authentication is required', () => {

			describe('credential succesfully provided', () => {

				it('opens a credential UI and returns a SourceTypeServiceResult', async () => {
					spyOn(projectionService, 'getProjections').and.returnValue([4326]);
					const sourceTypeResultPayload = { name: 'GPX', version: 'version', srid: 4326 };
					const mockCredential = { username: 'username', password: 'password' };
					const response200 = new Response(
						JSON.stringify(
							sourceTypeResultPayload
						)
					);
					const response401 = new Response(null, { status: 401 });
					const createAuthenticationUiFunction = async (url, authenticateFunction, onCloseFunction) => {
						// simulate call by UI
						const authenticationResult = await authenticateFunction(mockCredential, url);

						expect(authenticationResult).toEqual(response200);
						expect(store.getState().modal.active).toBeTrue();
						expect(store.getState().modal.data.title).toBe('global_import_authenticationModal_title');
						// simulate call by UI
						await onCloseFunction(mockCredential, response200);

						expect(store.getState().modal.active).toBeFalse();
					};
					const backendUrl = 'https://backend.url/';
					const url = 'http://foo.bar';
					const version = 'version';
					const baaCredentialServiceSpy = spyOn(baaCredentialService, 'addOrReplace');
					spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
					spyOn(httpService, 'post').withArgs(backendUrl + 'sourceType', jasmine.anything(), MediaType.JSON).and
						.callFake((_, payloadAsJson) => {
							const { username, password } = JSON.parse(payloadAsJson);
							if (username && password) {
								return Promise.resolve(response200);
							}
							return Promise.resolve(response401);
						});

					const { status, sourceType } = await bvvUrlSourceTypeProvider(url, createAuthenticationUiFunction);

					expect(sourceType).toBeInstanceOf(SourceType);
					expect(sourceType.name).toBe(SourceTypeName.GPX);
					expect(sourceType.version).toBe(version);
					expect(status).toEqual(SourceTypeResultStatus.BAA_AUTHENTICATED);
					expect(baaCredentialServiceSpy).toHaveBeenCalledWith(url, mockCredential);
				});
			});

			describe('credential already in store', () => {

				it('fetches the credential from the BaaService', async () => {
					spyOn(projectionService, 'getProjections').and.returnValue([4326]);
					const sourceTypeResultPayload = { name: 'GPX', version: 'version', srid: 4326 };
					const mockCredential = { username: 'username', password: 'password' };
					const response200 = new Response(
						JSON.stringify(
							sourceTypeResultPayload
						)
					);
					const backendUrl = 'https://backend.url/';
					const url = 'http://foo.bar';
					const version = 'version';
					const baaCredentialServiceSpy = spyOn(baaCredentialService, 'get').withArgs(url).and.returnValue(mockCredential);
					spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
					spyOn(httpService, 'post').withArgs(backendUrl + 'sourceType', JSON.stringify({ url: url, ...mockCredential }), MediaType.JSON).and.resolveTo(response200);

					const { status, sourceType } = await bvvUrlSourceTypeProvider(url, true);

					expect(sourceType).toBeInstanceOf(SourceType);
					expect(sourceType.name).toBe(SourceTypeName.GPX);
					expect(sourceType.version).toBe(version);
					expect(status).toEqual(SourceTypeResultStatus.BAA_AUTHENTICATED);
					expect(baaCredentialServiceSpy).toHaveBeenCalled();
				});
			});

			describe('credential NOT succesfully provided', () => {

				it('opens a credential UI and returns a SourceTypeServiceResult with status RESTRICTED', async () => {
					spyOn(projectionService, 'getProjections').and.returnValue([4326]);
					const mockCredential = { username: 'username', password: 'password' };
					const response401 = new Response(null, { status: 401 });
					const createAuthenticationUiFunction = async (url, authenticateFunction, onCloseFunction) => {
						// simulate call by UI
						const authenticationResult = await authenticateFunction(mockCredential, url);

						expect(authenticationResult).toBeFalse();
						expect(store.getState().modal.active).toBeTrue();
						expect(store.getState().modal.data.title).toBe('global_import_authenticationModal_title');
						// simulate call by UI
						await onCloseFunction(null);

						expect(store.getState().modal.active).toBeFalse();
					};
					const backendUrl = 'https://backend.url/';
					const url = 'http://foo.bar';
					spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
					spyOn(httpService, 'post').withArgs(backendUrl + 'sourceType', jasmine.anything(), MediaType.JSON).and
						.callFake(() => {
							return Promise.resolve(response401);
						});

					const { status } = await bvvUrlSourceTypeProvider(url, createAuthenticationUiFunction);

					expect(status).toEqual(SourceTypeResultStatus.RESTRICTED);
				});
			});

			describe('modal is closed by user', () => {

				it('returns a SourceTypeServiceResult with status RESTRICTED', async () => {
					spyOn(projectionService, 'getProjections').and.returnValue([4326]);
					const mockCredential = { username: 'username', password: 'password' };
					const response401 = new Response(null, { status: 401 });
					const createAuthenticationUiFunction = async (url, authenticateFunction) => {
						// simulate call by UI
						await authenticateFunction(mockCredential, url);

						expect(store.getState().modal.active).toBeTrue();
						expect(store.getState().modal.data.title).toBe('global_import_authenticationModal_title');

						//now let's close the modal
						closeModal();
					};
					const backendUrl = 'https://backend.url/';
					const url = 'http://foo.bar';
					spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
					spyOn(httpService, 'post').withArgs(backendUrl + 'sourceType', jasmine.anything(), MediaType.JSON).and
						.callFake(() => {
							return Promise.resolve(response401);
						});

					const { status } = await bvvUrlSourceTypeProvider(url, createAuthenticationUiFunction);

					expect(status).toEqual(SourceTypeResultStatus.RESTRICTED);
				});
			});
		});
	});

	describe('defaultDataSourceTypeProvider', () => {

		const projectionService = {
			getProjections: () => { }
		};

		beforeAll(() => {
			$injector
				.registerSingleton('ProjectionService', projectionService);
		});

		it('tries to detect the source type for KML sources', () => {
			expect(defaultDataSourceTypeProvider('<kml some>foo</kml>'))
				.toEqual(new SourceTypeResult(SourceTypeResultStatus.OK, new SourceType(SourceTypeName.KML, null, 4326)));
		});

		it('tries to detect the source type for GPX sources', () => {
			expect(defaultDataSourceTypeProvider('<gpx some>foo</gpx>'))
				.toEqual(new SourceTypeResult(SourceTypeResultStatus.OK, new SourceType(SourceTypeName.GPX, null, 4326)));
		});

		it('tries to detect the source type for GeoJSON sources', () => {
			expect(defaultDataSourceTypeProvider(JSON.stringify({ type: 'foo' })))
				.toEqual(new SourceTypeResult(SourceTypeResultStatus.OK, new SourceType(SourceTypeName.GEOJSON, null, 4326)));
		});

		it('tries to detect the source type for EWKT sources', () => {
			spyOn(projectionService, 'getProjections').and.returnValue([55]);
			expect(defaultDataSourceTypeProvider('SRID=55;POINT(21, 42)'))
				.toEqual(new SourceTypeResult(SourceTypeResultStatus.OK, new SourceType(SourceTypeName.EWKT, null, 55)));
		});

		it('returns UNSUPPORTED_SRID when data have an unsupported SRID', () => {
			spyOn(projectionService, 'getProjections').and.returnValue([]);
			expect(defaultDataSourceTypeProvider('SRID=55;POINT(21, 42)'))
				.toEqual(new SourceTypeResult(SourceTypeResultStatus.UNSUPPORTED_SRID));
		});
		it('returns UNSUPPORTED_TYPE when data are not parseable', () => {
			const errornousJsonString = '({ some: [] )';
			expect(defaultDataSourceTypeProvider(errornousJsonString))
				.toEqual(new SourceTypeResult(SourceTypeResultStatus.UNSUPPORTED_TYPE));
		});

		it('returns MAX_SIZE_EXCEEDED when data-size is too large', () => {
			const tooLargeData = 'x'.repeat(SourceTypeMaxFileSize);
			expect(defaultDataSourceTypeProvider(tooLargeData))
				.toEqual(new SourceTypeResult(SourceTypeResultStatus.MAX_SIZE_EXCEEDED));
		});
	});


	describe('defaultMediaSourceTypeProvider', () => {

		it('tries to detect the source type for KML sources', () => {
			expect(defaultMediaSourceTypeProvider(MediaType.KML))
				.toEqual(new SourceTypeResult(SourceTypeResultStatus.OK, new SourceType(SourceTypeName.KML)));
		});

		it('tries to detect the source type for GPX sources', () => {
			expect(defaultMediaSourceTypeProvider(MediaType.GPX))
				.toEqual(new SourceTypeResult(SourceTypeResultStatus.OK, new SourceType(SourceTypeName.GPX)));
		});

		it('tries to detect the source type for GeoJSON sources', () => {
			expect(defaultMediaSourceTypeProvider(MediaType.GeoJSON))
				.toEqual(new SourceTypeResult(SourceTypeResultStatus.OK, new SourceType(SourceTypeName.GEOJSON)));
		});

		it('returns null when type can not be detected', () => {
			expect(defaultMediaSourceTypeProvider('foo'))
				.toEqual(new SourceTypeResult(SourceTypeResultStatus.UNSUPPORTED_TYPE));
		});
	});
});
