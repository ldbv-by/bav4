import { $injector } from '../../../injection';
import { provide } from './modal.provider';

const { TranslationService: translationService } = $injector.inject('TranslationService');
translationService.register('modalProvider', provide);
