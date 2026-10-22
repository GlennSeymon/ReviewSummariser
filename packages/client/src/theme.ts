import { createTheme } from '@mui/material/styles';

const theme = createTheme({
	// Puts .light / .dark on <html>, which also drives Tailwind's dark: variant
	cssVariables: { colorSchemeSelector: 'class' },
	colorSchemes: {
		light: {
			palette: {
				primary: { main: '#2f4b9e', light: '#5a73c4', dark: '#1f3474' },
				secondary: { main: '#0f8a7e' },
				background: { default: '#f5f7fb', paper: '#ffffff' },
				text: { primary: '#1a2233', secondary: '#5b6577' },
				divider: '#e3e7ef',
			},
		},
		dark: {
			palette: {
				primary: { main: '#8ea6ff', light: '#b3c3ff', dark: '#5f7ad6' },
				secondary: { main: '#4fd1c1' },
				background: { default: '#0d1220', paper: '#151c2e' },
				text: { primary: '#e6e9f2', secondary: '#9aa3b8' },
				divider: '#242d43',
			},
		},
	},
	shape: { borderRadius: 10 },
	typography: {
		fontFamily: "'Noto Sans Variable', system-ui, sans-serif",
		h5: { fontWeight: 700, letterSpacing: '-0.01em' },
		h6: { fontWeight: 600 },
		subtitle1: { fontWeight: 600 },
		button: { textTransform: 'none', fontWeight: 600 },
	},
	components: {
		MuiAppBar: {
			defaultProps: { elevation: 0, color: 'inherit' },
			styleOverrides: {
				root: ({ theme }) => ({
					backgroundColor: theme.vars.palette.background.paper,
					borderBottom: `1px solid ${theme.vars.palette.divider}`,
				}),
			},
		},
		MuiButton: {
			defaultProps: { disableElevation: true },
		},
		MuiCard: {
			defaultProps: { variant: 'outlined' },
		},
		MuiPaper: {
			styleOverrides: {
				outlined: ({ theme }) => ({ borderColor: theme.vars.palette.divider }),
			},
		},
		MuiTableCell: {
			styleOverrides: {
				head: ({ theme }) => ({
					fontWeight: 600,
					color: theme.vars.palette.text.secondary,
					textTransform: 'uppercase',
					fontSize: '0.75rem',
					letterSpacing: '0.05em',
				}),
				body: { verticalAlign: 'top' },
			},
		},
	},
});

export default theme;
