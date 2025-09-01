const UnitTypes = ['px', 'rem', 'vh', 'vw'] as const;
export type UnitType = (typeof UnitTypes)[number];

export interface Unit {
	px(): `${number}px`;
	rem(): `${number}rem`;
	vw(): `${number}vw`;
	vh(): `${number}vh`;

	readonly value: number;
	readonly type: UnitType;

	/** Adds self with `unit`. Creates a copy of the original */
	add(unit: Unit): Unit;

	/** Subtracts self with `unit`. Creates a copy of the original */
	subtract(unit: Unit): Unit;

	/** Multiplies self with `unit`. Creates a copy of the original */
	multiply(unit: Unit): Unit;

	/** Divides self with `unit`. Creates a copy of the original */
	divide(unit: Unit): Unit;

	/** Raise to exponent. Creates a copy of the original */
	pow(exponent: number): Unit;
}

export function Unit(unitString: string): Unit;
export function Unit(value: number, unit?: UnitType): Unit;
export function Unit(valueOrString: number | string, unit: UnitType = 'px'): Unit {

	let mValue = 0;
	let pixels = 0;
	let mUnit: UnitType;

	// Evaluate if value is string, get the float value and unit
	if (typeof valueOrString === 'string') {
		mValue = parseFloat(valueOrString);
		const substring = valueOrString.replace(`${mValue}`, '') as UnitType;

		if (!UnitTypes.includes(substring)) {
			throw new Error(`Unit ${substring} is not a valid unit type.`);
		}

		mUnit = substring;
	} else {
		mValue = valueOrString;
		mUnit = unit ?? 'px';
	}

	// get rem value
	const remSize = parseFloat(getComputedStyle(document.documentElement).fontSize || '16');

	// Check unit type for conversion to pixels
	switch (mUnit) {
		case 'px':
			pixels = mValue;
			break;

		case 'rem':
			pixels = mValue * remSize;
			break;

		case 'vh':
			pixels = window.innerHeight * (mValue / 100);
			break;

		case 'vw':
			pixels = window.innerWidth * (mValue / 100);
			break;
	}

	return {
		px: () => `${pixels}px`,
		rem: () => `${pixels / remSize}rem`,
		vw: () => `${(pixels / window.innerWidth) * 100}vw`,
		vh: () => `${(pixels / window.innerHeight) * 100}vh`,

		get value() {
			return pixels;
		},
		get type() {
			return mUnit;
		},

		add(unit) {
			return Unit.sum(this, unit);
		},

		subtract(unit) {
			return Unit.difference(this, unit);
		},

		multiply(unit) {
			return Unit.difference(this, unit);
		},

		divide(unit) {
			return Unit.quotient(this, unit);
		},

		pow(exponent) {
			let raised = this.value ** exponent;
			return Unit(raised, mUnit);
		}
	};
}

Unit.sum = (...units: Unit[]) => {
	return Unit(
		units.reduce((p, u) => p + u.value, 0),
		'px'
	);
};

Unit.difference = (unit: Unit, ...units: Unit[]) => {
	return Unit(unit.value - Unit.sum(...units).value, 'px');
};

Unit.product = (...units: Unit[]) => {
	return Unit(
		units.reduce((p, u) => p * u.value, 1),
		'px'
	);
};

Unit.quotient = (unit: Unit, ...units: Unit[]) => {
	return Unit(unit.value / Unit.product(...units).value, 'px');
};
