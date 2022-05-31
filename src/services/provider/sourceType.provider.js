

import { html } from 'lit-html';
import { $injector } from '../../injection';
import { closeModal, openModal } from '../../store/modal/modal.action';
import { isString } from '../../utils/checks';
import { observe } from '../../utils/storeUtils';
import { SourceType, SourceTypeName, SourceTypeResult, SourceTypeResultStatus } from '../domain/sourceType';
import { MediaType } from '../HttpService';

/**
 * A function that tries to detect the source type for a url
 *
 * @typedef {function(string) : (Promise<SourceTypeResult>)} urlSourceTypeProvider
 */

/**
 * A function that tries to detect the source type for given data
 *
 * @typedef {function(string) : (SourceTypeResult)} dataSourceTypeProvider
 */

/**
 * A function that tries to detect the source by given media type
 *
 * @typedef {function(Source) : (SourceTypeResult)} mediaSourceTypeProvider
 */

export const createCredentialPanel = (url, authenticateFunction, onCloseFunction) => {
	return html`<ba-auth-password-credential-panel .url=${url} .authenticate=${authenticateFunction} .onClose=${onCloseFunction}>`;
};

/**
 * Uses a BVV endpoint to detect the source type for a url.
 * @function
 * @param {string} url
 * @returns {SourceTypeResult}
 */
export const bvvUrlSourceTypeProvider = async (url, createModalContent = createCredentialPanel) => {

	const { HttpService: httpService, ConfigService: configService } = $injector.inject('HttpService', 'ConfigService');
	const endpointUrl = configService.getValueAsPath('BACKEND_URL') + 'sourceType';
	// const result = await httpService.get(`${endpointUrl}?url=${encodeURIComponent(url)}`);

	const post = async (url, credential = null) => {
		const requestPayload = {
			url: url,
			username: credential?.username,
			password: credential?.password
		};
		return await httpService.post(endpointUrl, JSON.stringify(requestPayload), MediaType.JSON);
	};

	const mapResponseToSourceType = async (result, authenticated) => {
		switch (result.status) {
			case 200: {
				const { name, version } = await result.json();

				const sourceTypeNameFor = name => {
					switch (name) {
						case 'KML':
							return SourceTypeName.KML;
						case 'GPX':
							return SourceTypeName.GPX;
						case 'GeoJSON':
							return SourceTypeName.GEOJSON;
						case 'WMS':
							return SourceTypeName.WMS;
					}
				};

				return new SourceTypeResult(authenticated ? SourceTypeResultStatus.BAA_AUTHENTICATED : SourceTypeResultStatus.OK, new SourceType(sourceTypeNameFor(name), version));
			}
			case 204: {
				return new SourceTypeResult(SourceTypeResultStatus.UNSUPPORTED_TYPE);
			}
			case 401: {
				return new SourceTypeResult(SourceTypeResultStatus.RESTRICTED);
			}
		}
		return new SourceTypeResult(SourceTypeResultStatus.OTHER);
	};

	const result = await post(url);

	if (result.status === 401) {

		return new Promise((resolve) => {

			const { StoreService: storeService, TranslationService: translationService }
				= $injector.inject('StoreService', 'TranslationService');
			const translate = (key) => translationService.translate(key);

			const authenticate = async (credential, url) => {
				const resultFetchedWithCredentials = await post(url, credential);
				return resultFetchedWithCredentials.status === 401 ? false : resultFetchedWithCredentials;
			};

			// in case of aborting the authentification-process by closing the modal,
			// call the onCloseCallback directly
			const resolveBeforeClosing = ({ active }) => {
				if (!active) {
					onClose(null);
				}
			};

			const unsubscribe = observe(storeService.getStore(), state => state.modal, modal => resolveBeforeClosing(modal));

			// onClose-callback is called with a verified credential object and a result object or simply NULL
			const onClose = async (credential, resultFetchedWithCredentials) => {
				unsubscribe();
				closeModal();
				if (credential) {
					// Todo: store credential
					resolve(await mapResponseToSourceType(resultFetchedWithCredentials, true));
				}
				else {
					resolve(await mapResponseToSourceType(result));
				}
			};

			// using the panel as content for the modal
			openModal(translate('importPlugin_authenticationModal_title'), createModalContent(url, authenticate, onClose));
		});
	}



	return await mapResponseToSourceType(result);
};

/**
 * Default source type provider for data.
 * Currently only character data are supported.
 * @function
 * @param {string} data
 * @returns {SourceTypeResult}
 */
export const defaultDataSourceTypeProvider = (data) => {
	if (isString(data)) {
		// we check the content in a naive manner
		if (data.includes('<kml') && data.includes('</kml>')) {
			return new SourceTypeResult(SourceTypeResultStatus.OK, new SourceType(SourceTypeName.KML));
		}
		if (data.includes('<gpx') && data.includes('</gpx>')) {
			return new SourceTypeResult(SourceTypeResultStatus.OK, new SourceType(SourceTypeName.GPX));
		}
		try {
			if (JSON.parse(data).type) {
				return new SourceTypeResult(SourceTypeResultStatus.OK, new SourceType(SourceTypeName.GEOJSON));
			}
		}
		catch {
			return new SourceTypeResult(SourceTypeResultStatus.UNSUPPORTED_TYPE);
		}
	}
	return new SourceTypeResult(SourceTypeResultStatus.UNSUPPORTED_TYPE);
};

/**
 * Default source type provider for a given MediaType.
 * @function
 * @param {string} mediaType
 * @returns {SourceTypeResult}
 */
export const defaultMediaSourceTypeProvider = (mediaType) => {
	switch (mediaType) {
		case MediaType.KML:
			return new SourceTypeResult(SourceTypeResultStatus.OK, new SourceType(SourceTypeName.KML));
		case MediaType.GPX:
			return new SourceTypeResult(SourceTypeResultStatus.OK, new SourceType(SourceTypeName.GPX));
		case MediaType.GeoJSON:
			return new SourceTypeResult(SourceTypeResultStatus.OK, new SourceType(SourceTypeName.GEOJSON));
	}
	return new SourceTypeResult(SourceTypeResultStatus.UNSUPPORTED_TYPE);
};
