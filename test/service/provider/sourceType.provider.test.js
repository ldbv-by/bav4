import { $injector } from '../../../src/injection';
import { SourceType, SourceTypeName, SourceTypeResult, SourceTypeResultStatus } from '../../../src/services/domain/sourceType';
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
			addOrReplace: () => {}
		};

		let store;
		beforeEach(() => {

			const initialState = {
				modal: {
					active: false
				}
			};
			store = TestUtils.setupStoreAndDi(initialState, { modal: modalReducer });

			$injector;

			$injector
				.registerSingleton('ConfigService', configService)
				.registerSingleton('HttpService', httpService)
				.registerSingleton('BaaCredentialService', baaCredentialService)
				.registerSingleton('TranslationService', { translate: (key) => key });
		});

		it('returns a SourceTypeServiceResult for KML', async () => {

			const backendUrl = 'https://backend.url/';
			const url = 'http://foo.bar';
			const version = 'version';
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
			const payload = JSON.stringify({ url: url });
			const sourceTypeResultPayload = { name: 'KML', version: 'version' };
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
			expect(status).toEqual(SourceTypeResultStatus.OK);
		});

		it('returns a SourceTypeServiceResult for GPX', async () => {

			const backendUrl = 'https://backend.url/';
			const url = 'http://foo.bar';
			const version = 'version';
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
			const payload = JSON.stringify({ url: url });
			const sourceTypeResultPayload = { name: 'GPX', version: 'version' };
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
			expect(status).toEqual(SourceTypeResultStatus.OK);
		});

		it('returns a SourceTypeServiceResult for GeoJSON', async () => {

			const backendUrl = 'https://backend.url/';
			const url = 'http://foo.bar';
			const version = 'version';
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
			const payload = JSON.stringify({ url: url });
			const sourceTypeResultPayload = { name: 'GeoJSON', version: 'version' };
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
			expect(status).toEqual(SourceTypeResultStatus.OK);
		});

		it('returns a SourceTypeServiceResult for WMS', async () => {

			const backendUrl = 'https://backend.url/';
			const url = 'http://foo.bar';
			const version = 'version';
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
			const payload = JSON.stringify({ url: url });
			const sourceTypeResultPayload = { name: 'WMS', version: 'version' };
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
		});

		it('returns SourceTypeServiceResultStatus.UNSUPPORTED_TYPE_ERROR when no content is available', async () => {

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
					const sourceTypeResultPayload = { name: 'GPX', version: 'version' };
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
						expect(store.getState().modal.data.title).toBe('importPlugin_authenticationModal_title');
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

			describe('credential NOT succesfully provided', () => {

				it('opens a credential UI and returns a SourceTypeServiceResult with status RESTRICTED', async () => {
					const mockCredential = { username: 'username', password: 'password' };
					const response401 = new Response(null, { status: 401 });
					const createAuthenticationUiFunction = async (url, authenticateFunction, onCloseFunction) => {
						// simulate call by UI
						const authenticationResult = await authenticateFunction(mockCredential, url);

						expect(authenticationResult).toBeFalse();
						expect(store.getState().modal.active).toBeTrue();
						expect(store.getState().modal.data.title).toBe('importPlugin_authenticationModal_title');
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
					const mockCredential = { username: 'username', password: 'password' };
					const response401 = new Response(null, { status: 401 });
					const createAuthenticationUiFunction = async (url, authenticateFunction) => {
						// simulate call by UI
						await authenticateFunction(mockCredential, url);

						expect(store.getState().modal.active).toBeTrue();
						expect(store.getState().modal.data.title).toBe('importPlugin_authenticationModal_title');

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

		it('tries to detect the source type for KML sources', () => {
			expect(defaultDataSourceTypeProvider('<kml some>foo</kml>'))
				.toEqual(new SourceTypeResult(SourceTypeResultStatus.OK, new SourceType(SourceTypeName.KML)));
		});

		it('tries to detect the source type for GPX sources', () => {
			expect(defaultDataSourceTypeProvider('<gpx some>foo</gpx>'))
				.toEqual(new SourceTypeResult(SourceTypeResultStatus.OK, new SourceType(SourceTypeName.GPX)));
		});

		it('tries to detect the source type for GeoJSON sources', () => {
			expect(defaultDataSourceTypeProvider(JSON.stringify({ type: 'foo' })))
				.toEqual(new SourceTypeResult(SourceTypeResultStatus.OK, new SourceType(SourceTypeName.GEOJSON)));
		});

		it('returns UNSUPPORTED_TYPE when type can not be detected', () => {
			expect(defaultDataSourceTypeProvider(JSON.stringify({ some: 'foo' })))
				.toEqual(new SourceTypeResult(SourceTypeResultStatus.UNSUPPORTED_TYPE));
		});

		it('returns UNSUPPORTED_TYPE when data are not parseable', () => {
			const errornousJsonString = '({ some: [] )';
			expect(defaultDataSourceTypeProvider(errornousJsonString))
				.toEqual(new SourceTypeResult(SourceTypeResultStatus.UNSUPPORTED_TYPE));
		});

		it('returns UNSUPPORTED_TYPE when data is NOT a string', () => {
			expect(defaultDataSourceTypeProvider({}))
				.toEqual(new SourceTypeResult(SourceTypeResultStatus.UNSUPPORTED_TYPE));
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
