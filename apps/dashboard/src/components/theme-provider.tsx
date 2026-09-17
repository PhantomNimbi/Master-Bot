'use client';

import * as React from 'react';
import {
	ThemeProvider as NextThemesProvider,
	type ThemeProviderProps
} from 'next-themes';
import { THEMES, COLOR_SCHEMES, type ColorSchemeInfo } from '~/lib/theme';

interface ColorSchemeContextType {
	colorScheme: string;
	setColorScheme: (scheme: string) => void;
	availableColorSchemes: ColorSchemeInfo[];
}

const ColorSchemeContext = React.createContext<ColorSchemeContextType>({
	colorScheme: 'default',
	setColorScheme: () => undefined,
	availableColorSchemes: COLOR_SCHEMES
});

export const useColorScheme = () => React.useContext(ColorSchemeContext);

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
	const [colorScheme, setColorSchemeState] = React.useState<string>('default');

	React.useEffect(() => {
		const savedScheme = localStorage.getItem('dashboard-color-scheme') ?? 'default';
		setColorSchemeState(savedScheme);
		applyColorScheme(savedScheme);
	}, []);

	const applyColorScheme = (scheme: string) => {
		if (typeof document === 'undefined') return;
		const root = document.documentElement;
		const classesToRemove: string[] = [];
		root.classList.forEach((cls) => {
			if (cls.startsWith('scheme-')) {
				classesToRemove.push(cls);
			}
		});
		classesToRemove.forEach((cls) => root.classList.remove(cls));

		if (scheme && scheme !== 'default') {
			root.classList.add(`scheme-${scheme}`);
		}
	};

	const setColorScheme = React.useCallback((scheme: string) => {
		setColorSchemeState(scheme);
		if (typeof window !== 'undefined') {
			localStorage.setItem('dashboard-color-scheme', scheme);
			applyColorScheme(scheme);
		}
	}, []);

	return (
		<NextThemesProvider
			themes={THEMES.map((t) => t.id).concat(['system'])}
			attribute="class"
			defaultTheme="dark"
			enableSystem
			{...props}
		>
			<ColorSchemeContext.Provider
				value={{
					colorScheme,
					setColorScheme,
					availableColorSchemes: COLOR_SCHEMES
				}}
			>
				{children}
			</ColorSchemeContext.Provider>
		</NextThemesProvider>
	);
}

