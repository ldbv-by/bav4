

import { html } from 'lit-html';
import { $injector } from '../../injection';
import { closeModal, openModal } from '../../store/modal/modal.action';
import { observe } from '../../utils/storeUtils';
import { SourceType, SourceTypeMaxFileSize, SourceTypeName, SourceTypeResult, SourceTypeResultStatus } from '../../domain/sourceType';
import { MediaType } from '../HttpService';
import { parse } from '../../utils/ewkt';

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

/**
 * Returns the default authentification panel bound to the corresponding url and required callback functions.
 * @param {string} url
 * @param {function} authenticateFunction
 * @param {function} onCloseFunction
 * @returns TemplateResult
 */
export const _createCredentialPanel = (url, authenticateFunction, onCloseFunction) => {
	return html`<ba-auth-password-credential-panel .url=${url} .authenticate=${authenticateFunction} .onClose=${onCloseFunction}>`;
};

/**
 * Uses a BVV endpoint to detect the source type for a url.
 * @function
 * @param {string} url
 * @param {function} createModalContent function that provides the credential ui as the modals content
 * @returns {SourceTypeResult}
 */
export const bvvUrlSourceTypeProvider = async (url, createModalContent = _createCredentialPanel) => {

	const { HttpService: httpService, ConfigService: configService, BaaCredentialService: baaCredentialService, ProjectionService: projectionService }
		= $injector.inject('HttpService', 'ConfigService', 'BaaCredentialService', 'ProjectionService');
	const endpointUrl = configService.getValueAsPath('BACKEND_URL') + 'sourceType';

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
				const { name, version, srids } = await result.json();

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
						case 'EWKT':
							return SourceTypeName.EWKT;
					}
				};
				const sourceTypeName = sourceTypeNameFor(name);
				if (sourceTypeName) {
					if (srids.some(srid => projectionService.getProjections().includes(srid))) { // check if SRID is supported
						return new SourceTypeResult(authenticated ? SourceTypeResultStatus.BAA_AUTHENTICATED : SourceTypeResultStatus.OK,
							new SourceType(sourceTypeName, version, srids));
					}
					return new SourceTypeResult(SourceTypeResultStatus.UNSUPPORTED_SRID);
				}
				return new SourceTypeResult(SourceTypeResultStatus.UNSUPPORTED_TYPE);
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

	const credential = baaCredentialService.get(url);
	const response = await post(url, credential);

	// in that case we open the credential ui as modal window
	if (response.status === 401) {

		return new Promise((resolve) => {

			const { StoreService: storeService, TranslationService: translationService }
				= $injector.inject('StoreService', 'TranslationService');
			const translate = (key) => translationService.translate(key);

			const authenticate = async (credential, url) => {
				const responseFetchedWithCredentials = await post(url, credential);
				return responseFetchedWithCredentials.status === 401 ? false : responseFetchedWithCredentials;
			};

			// in case of aborting the authentification-process by closing the modal we call the onClose callback
			const resolveBeforeClosing = ({ active }) => {
				if (!active) {
					onClose(null);
				}
			};

			const unsubscribe = observe(storeService.getStore(), state => state.modal, modal => resolveBeforeClosing(modal));

			// onClose-callback is called with a verified credential object and the result object or simply null
			const onClose = async (credential, latestResponse) => {
				unsubscribe();
				closeModal();
				if (credential && latestResponse) {
					// store credential
					baaCredentialService.addOrReplace(url, credential);
					// resolve with the latest response
					resolve(await mapResponseToSourceType(latestResponse, true));
				}
				else {
					// resolve with the original response
					resolve(await mapResponseToSourceType(response));
				}
			};

			openModal(translate('importPlugin_authenticationModal_title'), createModalContent(url, authenticate, onClose));
		});
	}
	return await mapResponseToSourceType(response, !!credential);
};

/**
 * Default source type provider for data.
 * Currently only character data are supported.
 * @function
 * @param {string} data
 * @returns {SourceTypeResult}
 */
export const defaultDataSourceTypeProvider = (data) => {

	const { ProjectionService: projectionService } = $injector.inject('ProjectionService');

	if (new Blob([data]).size >= SourceTypeMaxFileSize) {
		return new SourceTypeResult(SourceTypeResultStatus.MAX_SIZE_EXCEEDED);
	}
	// we check the content in a naive manner
	if (data.includes('<kml') && data.includes('</kml>')) {
		return new SourceTypeResult(SourceTypeResultStatus.OK, new SourceType(SourceTypeName.KML, null, [4326]));
	}
	if (data.includes('<gpx') && data.includes('</gpx>')) {
		return new SourceTypeResult(SourceTypeResultStatus.OK, new SourceType(SourceTypeName.GPX, null, [4326]));
	}
	const ewkt = parse(data);
	if (ewkt) {
		if (!projectionService.getProjections().includes(ewkt.srid)) {
			return new SourceTypeResult(SourceTypeResultStatus.UNSUPPORTED_SRID);
		}
		return new SourceTypeResult(SourceTypeResultStatus.OK, new SourceType(SourceTypeName.EWKT, null, [ewkt.srid]));
	}
	try {
		JSON.parse(data);
		return new SourceTypeResult(SourceTypeResultStatus.OK, new SourceType(SourceTypeName.GEOJSON, null, [4326]));
	}
	catch {
		// Nothing todo here
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
