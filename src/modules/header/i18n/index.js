import { $injector } from '../../../injection';
import { provide } from './header.provider';

const { TranslationService: translationService } = $injector.inject('TranslationService');
translationService.register('headerProvider', provide);
