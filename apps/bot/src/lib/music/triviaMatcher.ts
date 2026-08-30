export function normalizeText(text: string): string {
	return text
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/\(.*?\)|\[.*?\]/g, '')
		.replace(/[^a-z0-9\s]/g, '')
		.replace(/\s+/g, ' ')
		.trim();
}

export function levenshtein(a: string, b: string): number {
	const matrix: number[][] = [];

	for (let i = 0; i <= b.length; i++) {
		matrix[i] = [i];
	}
	for (let j = 0; j <= a.length; j++) {
		matrix[0][j] = j;
	}

	for (let i = 1; i <= b.length; i++) {
		for (let j = 1; j <= a.length; j++) {
			if (b.charAt(i - 1) === a.charAt(j - 1)) {
				matrix[i][j] = matrix[i - 1][j - 1];
			} else {
				matrix[i][j] = Math.min(
					matrix[i - 1][j - 1] + 1,
					matrix[i][j - 1] + 1,
					matrix[i - 1][j] + 1
				);
			}
		}
	}

	return matrix[b.length][a.length];
}

export function checkMatch(
	guess: string,
	target: string,
	aliases: string[] = []
): boolean {
	const cleanGuess = normalizeText(guess);
	if (!cleanGuess || cleanGuess.length < 2) return false;

	const allTargets = [target, ...aliases].map(normalizeText).filter(Boolean);

	for (const t of allTargets) {
		if (cleanGuess === t) return true;
		if (cleanGuess.includes(t) || t.includes(cleanGuess)) {
			if (cleanGuess.length >= t.length * 0.6 || t.length >= cleanGuess.length * 0.6) {
				return true;
			}
		}

		const maxDistance = t.length > 8 ? 2 : t.length > 4 ? 1 : 0;
		if (levenshtein(cleanGuess, t) <= maxDistance) {
			return true;
		}
	}

	return false;
}