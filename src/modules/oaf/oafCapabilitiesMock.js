/**
 * @module modules/oaf/oafCapabilitiesMock
 */
import { OafQueryableType } from '../../domain/oaf';

export const CapabilitiesMock = Object.freeze({
	totalNumberOfItems: 25,
	sampled: false,
	queryables: [
		// ----- STRING VARIATIONS ----
		{
			id: 'string_type',
			title: 'Instruments (String)',
			description: 'A lot of instruments to find',
			type: OafQueryableType.STRING,
			finalized: false,
			values: [
				'Accordion',
				'Alto Saxophone',
				'Bagpipes',
				'Banjo',
				'Bass Clarinet',
				'Bass Guitar',
				'Bongo Drums',
				'Celesta',
				'Cello',
				'Clarinet',
				'Congas',
				'Didgeridoo',
				'Djembe',
				'Drums',
				'Electric Guitar',
				'Electric Violin',
				'Flute',
				'French Horn',
				'Guitar',
				'Harmonica',
				'Harp',
				'Kalimba',
				'Lute',
				'Mandolin',
				'Marimba',
				'Melodica',
				'Oboe',
				'Ocarina',
				'Pan Flute',
				'Piano',
				'Piccolo',
				'Recorder',
				'Saxophone',
				'Sitar',
				'Steel Drums',
				'Soprano Saxophone',
				'Synthesizer',
				'Tabla',
				'Theremin',
				'Tenor Saxophone',
				'Trombone',
				'Trumpet',
				'Tuba',
				'Tubular Bells',
				'Timpani',
				'Ukulele',
				'Violin',
				'Washboard',
				'Xylophone',
				'Zither'
			],
			minValue: null,
			maxValue: null
		},
		{
			id: 'string_type_finalized',
			title: 'Color (Finalized)',
			description: "Choose a color or type it's name",
			type: OafQueryableType.STRING,
			finalized: true,
			values: [
				'Amber',
				'Beige',
				'Black',
				'Blue',
				'Brown',
				'Crimson',
				'Cyan',
				'Emerald',
				'Gold',
				'Gray',
				'Green',
				'Indigo',
				'Lavender',
				'Magenta',
				'Maroon',
				'Navy',
				'Olive',
				'Orange',
				'Pink',
				'Purple'
			],
			minValue: null,
			maxValue: null
		},
		{
			id: 'integer_type',
			title: 'Integer',
			description: 'Some optional description',
			type: OafQueryableType.INTEGER,
			finalized: false,
			values: []
		},

		{
			id: 'integer_type_finalized',
			title: 'Integer Finalized',
			type: OafQueryableType.INTEGER,
			description: 'Some optional description',
			finalized: true,
			values: [5, 10, 15, 25, 35, 55, 75, 85],
			minValue: 5,
			maxValue: 85
		}
	]
});
