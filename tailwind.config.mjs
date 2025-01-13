/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
	  extend: {
		colors: {
		  itaGreen: '#006341', // Replace with your exact green color code
		  itaRed: '#CD1719',
		  itaGray: '#58595B',
		  itaDarkGray: '#333333',
		  itaLightGray: '#E6E6E6',
		  itaWhite: '#FFFFFF',
		},		
        transitionDuration: {'300': '300ms', }
    ,
		fontFamily: {
		  archivo: ['Archivo Narrow', 'sans-serif'],
		  roboto: ['Roboto', 'sans-serif'],
		},
		zIndex: {
			'1': '1',
			'30': '30',
			'40': '40',
			'50': '50',
		  }
	  },
	},
	plugins: [],
  }