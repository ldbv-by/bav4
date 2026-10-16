import { $injector } from '../../../injection';
import { provide } from './chips.provider';

const { TranslationService: translationService } = $injector.inject('TranslationService');
translationService.register('chipsProvider', provide);
