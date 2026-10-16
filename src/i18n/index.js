import { $injector } from '../injection';
import { provide } from './global.provider';

const { TranslationService: translationService } = $injector.inject('TranslationService');
translationService.register('global', provide);
