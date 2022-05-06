import { provide as olMapProvide } from '../../olMap/i18n/olMap.provider';
import { $injector } from '../../../injection';
const { TranslationService: translationService } = $injector.inject('TranslationService');
translationService.register('mapProvider', olMapProvide);
