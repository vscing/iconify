import { matchName } from './index';

/**
 * Icon name
 */
export interface IconifyIconName {
	readonly provider: string;
	readonly prefix: string;
	readonly name: string;
}

/**
 * Icon source: icon object without name
 */
export type IconifyIconSource = Omit<IconifyIconName, 'name'>;

/**
 * Convert string to Icon object.
 */
export const stringToIcon = (
	value: string,
	validate?: boolean,
	allowSimpleName?: boolean,
	provider = ''
): IconifyIconName | null => {
	const colonSeparated = value.split(':');

	// Check for provider with correct '@' at start
	if (value.slice(0, 1) === '@') {
		// First part is provider
		if (colonSeparated.length < 2 || colonSeparated.length > 3) {
			// "@provider:prefix:name" or "@provider:prefix-name"
			return null;
		}
		provider = (colonSeparated.shift() as string).slice(1);
	}

	// Check split by colon: "prefix:name", "provider:prefix:name"
	if (colonSeparated.length > 3 || !colonSeparated.length) {
		return null;
	}
	if (colonSeparated.length > 1) {
		// "prefix:name"
		const name = colonSeparated.pop() as string;
		const prefix = colonSeparated.pop() as string;
		const result: IconifyIconName = {
			// Allow provider without '@': "provider:prefix:name"
			provider: colonSeparated.length > 0 ? colonSeparated[0] : provider,
			prefix,
			name,
		};
		return validate && !validateIcon(result) ? null : result;
	}

	// Attempt to split by dash: "prefix-name"
	const name = colonSeparated[0];
	const dashSeparated = name.split('-');
	if (dashSeparated.length > 1) {
		const result: IconifyIconName = {
			provider: provider,
			prefix: dashSeparated.shift() as string,
			name: dashSeparated.join('-'),
		};
		return validate && !validateIcon(result) ? null : result;
	}

	// If allowEmpty is set, allow empty provider and prefix, allowing names like "home"
	if (allowSimpleName && provider === '') {
		const result: IconifyIconName = {
			provider: provider,
			prefix: '',
			name,
		};
		return validate && !validateIcon(result, allowSimpleName)
			? null
			: result;
	}

	return null;
};

/**
 * Check if icon is valid.
 *
 * This function is not part of stringToIcon because validation is not needed for most code.
 */
export const validateIcon = (
	icon: IconifyIconName | null,
	allowSimpleName?: boolean
): boolean => {
	if (!icon) {
		return false;
	}

	return !!(
		(icon.provider === '' || icon.provider.match(matchName)) &&
		((allowSimpleName && icon.prefix === '') ||
			icon.prefix.match(matchName)) &&
		icon.name.match(matchName)
	);
};
