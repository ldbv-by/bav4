export const provide = (lang) => {
	switch (lang) {
		case 'en':
			return {
				ea_legend_title: 'Legend',
				ea_legend_subtitle: 'Colors in legend depict map color without transparency.'
			};

		case 'de':
			return {
				ea_legend_title: 'Legende',
				ea_legend_subtitle: 'Farben in der Legende entsprechen Kartenfarben ohne Transparenz.'
			};

		default:
			return {};
	}
};
