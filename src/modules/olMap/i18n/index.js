import { $injector } from '../../../injection';
import { provide as olMapProvide } from '../../olMap/i18n/olMap.provider';

const { TranslationService: translationService } = $injector.inject('TranslationService');
translationService.register('mapProvider', olMapProvide);
