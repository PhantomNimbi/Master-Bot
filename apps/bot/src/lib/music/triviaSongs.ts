export interface TriviaSong {
	title: string;
	artist: string;
	aliases?: string[];
	artistAliases?: string[];
	query: string;
	category: 'pop' | 'rock' | '80s' | '90s' | '2000s' | '2010s' | 'modern';
}

export const TRIVIA_SONGS: TriviaSong[] = [
	// 80s
	{
		title: 'Billie Jean',
		artist: 'Michael Jackson',
		aliases: ['billie jean'],
		artistAliases: ['mj'],
		query: 'ytmsearch:Michael Jackson Billie Jean',
		category: '80s'
	},
	{
		title: 'Take On Me',
		artist: 'a-ha',
		aliases: ['take on me'],
		artistAliases: ['aha'],
		query: 'ytmsearch:a-ha Take On Me',
		category: '80s'
	},
	{
		title: 'Sweet Child O Mine',
		artist: "Guns N' Roses",
		aliases: ["sweet child o' mine", 'sweet child of mine'],
		artistAliases: ['guns n roses', 'gnr'],
		query: "ytmsearch:Guns N' Roses Sweet Child O' Mine",
		category: '80s'
	},
	{
		title: 'Never Gonna Give You Up',
		artist: 'Rick Astley',
		aliases: ['never gonna give you up', 'rickroll'],
		artistAliases: ['rick astley'],
		query: 'ytmsearch:Rick Astley Never Gonna Give You Up',
		category: '80s'
	},
	{
		title: "Livin' On A Prayer",
		artist: 'Bon Jovi',
		aliases: ['livin on a prayer', 'living on a prayer'],
		artistAliases: ['bon jovi'],
		query: "ytmsearch:Bon Jovi Livin' On A Prayer",
		category: '80s'
	},
	{
		title: 'Africa',
		artist: 'Toto',
		aliases: ['africa'],
		artistAliases: ['toto'],
		query: 'ytmsearch:Toto Africa',
		category: '80s'
	},
	// 90s
	{
		title: 'Smells Like Teen Spirit',
		artist: 'Nirvana',
		aliases: ['smells like teen spirit'],
		artistAliases: ['nirvana'],
		query: 'ytmsearch:Nirvana Smells Like Teen Spirit',
		category: '90s'
	},
	{
		title: 'Wonderwall',
		artist: 'Oasis',
		aliases: ['wonderwall'],
		artistAliases: ['oasis'],
		query: 'ytmsearch:Oasis Wonderwall',
		category: '90s'
	},
	{
		title: 'Wannabe',
		artist: 'Spice Girls',
		aliases: ['wannabe'],
		artistAliases: ['spice girls'],
		query: 'ytmsearch:Spice Girls Wannabe',
		category: '90s'
	},
	{
		title: 'No Scrubs',
		artist: 'TLC',
		aliases: ['no scrubs'],
		artistAliases: ['tlc'],
		query: 'ytmsearch:TLC No Scrubs',
		category: '90s'
	},
	{
		title: 'Gangstas Paradise',
		artist: 'Coolio',
		aliases: ["gangsta's paradise", 'gangstas paradise', 'gangsta paradise'],
		artistAliases: ['coolio'],
		query: "ytmsearch:Coolio Gangsta's Paradise",
		category: '90s'
	},
	// 2000s
	{
		title: 'In The End',
		artist: 'Linkin Park',
		aliases: ['in the end'],
		artistAliases: ['linkin park', 'lp'],
		query: 'ytmsearch:Linkin Park In The End',
		category: '2000s'
	},
	{
		title: 'Toxic',
		artist: 'Britney Spears',
		aliases: ['toxic'],
		artistAliases: ['britney spears', 'britney'],
		query: 'ytmsearch:Britney Spears Toxic',
		category: '2000s'
	},
	{
		title: 'Seven Nation Army',
		artist: 'The White Stripes',
		aliases: ['seven nation army'],
		artistAliases: ['the white stripes', 'white stripes'],
		query: 'ytmsearch:The White Stripes Seven Nation Army',
		category: '2000s'
	},
	{
		title: 'Hey Ya',
		artist: 'Outkast',
		aliases: ['hey ya!', 'hey ya'],
		artistAliases: ['outkast'],
		query: 'ytmsearch:Outkast Hey Ya!',
		category: '2000s'
	},
	{
		title: 'Mr Brightside',
		artist: 'The Killers',
		aliases: ['mr brightside', 'mr. brightside'],
		artistAliases: ['the killers', 'killers'],
		query: 'ytmsearch:The Killers Mr Brightside',
		category: '2000s'
	},
	{
		title: 'Viva La Vida',
		artist: 'Coldplay',
		aliases: ['viva la vida'],
		artistAliases: ['coldplay'],
		query: 'ytmsearch:Coldplay Viva La Vida',
		category: '2000s'
	},
	// 2010s
	{
		title: 'Rolling in the Deep',
		artist: 'Adele',
		aliases: ['rolling in the deep'],
		artistAliases: ['adele'],
		query: 'ytmsearch:Adele Rolling in the Deep',
		category: '2010s'
	},
	{
		title: 'Shape of You',
		artist: 'Ed Sheeran',
		aliases: ['shape of you'],
		artistAliases: ['ed sheeran'],
		query: 'ytmsearch:Ed Sheeran Shape of You',
		category: '2010s'
	},
	{
		title: 'Uptown Funk',
		artist: 'Bruno Mars',
		aliases: ['uptown funk'],
		artistAliases: ['bruno mars', 'mark ronson'],
		query: 'ytmsearch:Mark Ronson Uptown Funk Bruno Mars',
		category: '2010s'
	},
	{
		title: 'Counting Stars',
		artist: 'OneRepublic',
		aliases: ['counting stars'],
		artistAliases: ['onerepublic', 'one republic'],
		query: 'ytmsearch:OneRepublic Counting Stars',
		category: '2010s'
	},
	{
		title: 'Bad Guy',
		artist: 'Billie Eilish',
		aliases: ['bad guy'],
		artistAliases: ['billie eilish'],
		query: 'ytmsearch:Billie Eilish bad guy',
		category: '2010s'
	},
	{
		title: 'Old Town Road',
		artist: 'Lil Nas X',
		aliases: ['old town road'],
		artistAliases: ['lil nas x'],
		query: 'ytmsearch:Lil Nas X Old Town Road',
		category: '2010s'
	},
	// Modern
	{
		title: 'Blinding Lights',
		artist: 'The Weeknd',
		aliases: ['blinding lights'],
		artistAliases: ['the weeknd', 'weeknd'],
		query: 'ytmsearch:The Weeknd Blinding Lights',
		category: 'modern'
	},
	{
		title: 'Levitating',
		artist: 'Dua Lipa',
		aliases: ['levitating'],
		artistAliases: ['dua lipa'],
		query: 'ytmsearch:Dua Lipa Levitating',
		category: 'modern'
	},
	{
		title: 'Stay',
		artist: 'The Kid LAROI & Justin Bieber',
		aliases: ['stay'],
		artistAliases: ['the kid laroi', 'justin bieber', 'kid laroi'],
		query: 'ytmsearch:The Kid LAROI Justin Bieber Stay',
		category: 'modern'
	},
	{
		title: 'As It Was',
		artist: 'Harry Styles',
		aliases: ['as it was'],
		artistAliases: ['harry styles'],
		query: 'ytmsearch:Harry Styles As It Was',
		category: 'modern'
	},
	{
		title: 'Flowers',
		artist: 'Miley Cyrus',
		aliases: ['flowers'],
		artistAliases: ['miley cyrus'],
		query: 'ytmsearch:Miley Cyrus Flowers',
		category: 'modern'
	}
];
