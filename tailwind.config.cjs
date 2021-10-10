const config = {
	mode: 'jit',
	purge: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				une: {
					red: '#A22E3E',
					gold: '#D5AB43',
					green: '#35A07A',
					purple: '#9862B1',
					black: '#202020'
				},
				status: {
					success: '#2D983E',
					warning: '#DEB72C',
					danger: '#CE2F55'
				},
				text: {
					1: '#222222',
					2: '#444444',
					3: '#666666',
					4: '#888888',
					inv: '#FFFFFF'
				},
				accent: {
					DEFAULT: '#4676D3',
					inv: '#6995EB'
				},
				neutral: {
					100: '#EAEAEA',
					200: '#D3D3D3',
					300: '#AFAFAF',
					400: '#8C8C8C',
					500: '#6C6C6C'
				}
			}
		}
	},
	plugins: []
};

module.exports = config;
