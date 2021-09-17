import { provide as notificationsProvider } from './notifications.provider';
import { $injector } from '../../../injection';
const { TranslationService: translationService } = $injector.inject('TranslationService');
translationService.register('notificationsProvider', notificationsProvider);
