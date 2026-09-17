'use client';

import * as React from 'react';
import {
	Check,
	Moon,
	Palette,
	Skull,
	Snowflake,
	Sparkles,
	Sun,
	Trees,
	Zap
} from 'lucide-react';
import { useTheme } from 'next-themes';

import { Button } from '~/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger
} from '~/components/ui/dropdown';
import { THEMES, COLOR_SCHEMES } from '~/lib/theme';
import { useColorScheme } from '~/components/theme-provider';

export function ModeToggle() {
	const { theme, setTheme } = useTheme();
	const { colorScheme, setColorScheme } = useColorScheme();
	const [mounted, setMounted] = React.useState(false);

	React.useEffect(() => {
		setMounted(true);
	}, []);

	const renderThemeIcon = (themeId: string, className = 'h-4 w-4') => {
		switch (themeId) {
			case 'light':
				return <Sun className={className} />;
			case 'glassmorphism':
				return <Sparkles className={className} />;
			case 'cyberpunk':
				return <Zap className={className} />;
			case 'dracula':
				return <Skull className={className} />;
			case 'nord':
				return <Snowflake className={className} />;
			case 'emerald':
				return <Trees className={className} />;
			case 'dark':
			default:
				return <Moon className={className} />;
		}
	};

	const currentTheme = mounted ? theme : 'dark';

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline" size="icon" className="relative">
					{mounted ? renderThemeIcon(currentTheme ?? 'dark') : <Palette className="h-4 w-4" />}
					<span className="sr-only">Toggle theme and accent</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-56">
				<DropdownMenuLabel className="text-xs uppercase tracking-wider text-muted-foreground">
					Visual Theme
				</DropdownMenuLabel>
				{THEMES.map((t) => {
					const isSelected = currentTheme === t.id;
					return (
						<DropdownMenuItem
							key={t.id}
							onClick={() => setTheme(t.id)}
							className="flex items-center justify-between cursor-pointer"
						>
							<div className="flex items-center gap-2">
								{renderThemeIcon(t.id, 'h-4 w-4 text-muted-foreground')}
								<span>{t.name}</span>
							</div>
							{isSelected && <Check className="h-4 w-4 text-primary" />}
						</DropdownMenuItem>
					);
				})}

				<DropdownMenuSeparator />

				<DropdownMenuSub>
					<DropdownMenuSubTrigger className="flex items-center gap-2 cursor-pointer">
						<Palette className="h-4 w-4 text-muted-foreground" />
						<span>Accent Scheme</span>
					</DropdownMenuSubTrigger>
					<DropdownMenuSubContent className="w-52">
						<DropdownMenuLabel className="text-xs uppercase tracking-wider text-muted-foreground">
							Accent Colors
						</DropdownMenuLabel>
						{COLOR_SCHEMES.map((scheme) => {
							const isSelected = colorScheme === scheme.id;
							return (
								<DropdownMenuItem
									key={scheme.id}
									onClick={() => setColorScheme(scheme.id)}
									className="flex items-center justify-between cursor-pointer"
								>
									<div className="flex items-center gap-2">
										<span
											className="h-3 w-3 rounded-full border border-border/50 shadow-sm"
											style={{ backgroundColor: scheme.color }}
										/>
										<span>{scheme.name}</span>
									</div>
									{isSelected && <Check className="h-4 w-4 text-primary" />}
								</DropdownMenuItem>
							);
						})}
					</DropdownMenuSubContent>
				</DropdownMenuSub>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

