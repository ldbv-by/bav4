import { provide } from './global.provider';
import { $injector } from '../injection';
const { TranslationService: translationService } = $injector.inject('TranslationService');
translationService.register('global', provide);
