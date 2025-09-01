import convert, { type Convert } from 'color-convert';

interface RGB {
	r: number;
	g: number;
	b: number;
}

interface HSL {
	h: number;
	s: number;
	l: number;
}

/**
 * If only validating this is possible during type checking
 */
type Hex = `#${string}`;

export interface Color {
	toString(): string;

	hsl(useDecimals?: boolean): HSL;
	hex(): Hex;
	rgb(): RGB;

	readonly alpha: number;
}

/**
 * ## Color
 *
 * A simple class that represents a color string in a `Uint8Array` for performance.
 * Stores the individual r, g, and b channels as bits
 */
export function Color(color: RGB, alpha?: number): Color;
export function Color(color: HSL, alpha?: number): Color;
export function Color(color: Hex, alpha?: number): Color;
export function Color(color: RGB | HSL | Hex, alpha = 255): Color {
	let _color: Uint8Array;

	if (typeof color === 'string' && color.startsWith('#')) {
		_color = new Uint8Array(convert.hex.rgb(color));
	}
	
	else if (Object.keys(color).every((k) => ['r', 'g', 'b'].includes(k)))
		_color = new Uint8Array([...Object.values(color)]);
	
		else {
		color = color as HSL;
		_color = new Uint8Array(convert.hsl.rgb([color.h, color.s, color.l]));
	}

	return {
		/** @returns the hex value of this class. Includes the alpha value unless specified otherwise */
		toString() {
			return this.hex();
		},

		/** @returns an object with individual h, s, and l values. Includes alpha */
		hsl(useDecimals = false): HSL {
			const { hsl } = convert.rgb;
			const [h, s, l] = useDecimals
				? hsl.raw(_color[0], _color[1], _color[2])
				: hsl(_color[0], _color[1], _color[2]);

			return {
				h,
				s,
				l
			};
		},

		hex() {
			return `#${convert.rgb.hex(_color[0], _color[1], _color[2])}`;
		},

		rgb() {
			const [r, g, b, a] = _color;
			return { r, g, b, alpha: a };
		},

		get alpha() {
			return alpha;
		}
	};
}
