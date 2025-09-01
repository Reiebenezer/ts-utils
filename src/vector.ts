import { Unit, type UnitType } from './unit';

/** 
 * Handles two-dimensional (2D) vector operations. 
 * The x- and y-coordinates are of type `Unit`
 */
interface Vector {

	// ------------------------------------------------------------------------------------
	// Values
	// ------------------------------------------------------------------------------------

	/** The x-projection of the vector (in units) */
	readonly x: Unit;

	/** The y-projection of the vector (in units) */
	readonly y: Unit;

	/** The magnitude value of the vector (in units) */
	readonly magnitude: Unit;

	/** The normalized vector (1 unit width) */
	readonly normalized: Vector;

	/** Returns the vector as a js-ready translate value */
	readonly translate: readonly [string, string];


	// ------------------------------------------------------------------------------------
	// Operations
	// ------------------------------------------------------------------------------------

	/** Returns the sum of this vector with another */
	add(vector: Vector): Vector;

	/** Returns the difference of this vector with another */
	subtract(vector: Vector): Vector;

	/** Returns the scalar product of this vector with another */
	multiply(scalar: Unit): Vector;

	/** Returns the dot product of this vector with another */
	dot(vector: Vector): number;

	/** Returns the perpendicular dot product of this vector with another */
	pDot(vector: Vector): number;

	/** Get angle difference between this vector and another */
	getAngleDiff(vector: Vector): number;

	/**
	 * Returns a rotated version of this vector
	 * @param angle The angle in degrees
	 * @param isDeg Asserts whether `angle` is in degrees. Default `true`
	 */
	rotate(angle: number, isDeg?: boolean): Vector;
}

function Vector(x: Unit, y: Unit): Vector {
	return {
		get x() {
			return Unit(x.value, x.type);
		},

		get y() {
			return Unit(y.value, y.type);
		},

		get magnitude() {
			return Unit.sum(this.x.pow(2), this.y.pow(2)).pow(1 / 2);
		},

		get normalized() {
			return Vector(this.x.divide(this.magnitude), this.y.divide(this.magnitude));
		},

		get translate() {
			return [this.x.px(), this.y.px()] as const;
		},

		add(vector) {
			return Vector.sum(this, vector);
		},

		subtract(vector) {
			return Vector.difference(this, vector);
		},

		multiply(scalar) {
			return Vector(this.x.multiply(scalar), this.y.multiply(scalar));
		},

		dot(vector) {
			return Unit.sum(this.x.multiply(vector.x), this.y.multiply(vector.y)).value;
		},

		pDot(vector) {
			return Unit.sum(this.x.multiply(vector.y), this.y.multiply(vector.x)).value;
		},

		getAngleDiff(vector) {
			return Math.acos(this.dot(vector) / Unit.product(this.magnitude, vector.magnitude).value);
		},

		rotate(angle: number, isDeg = true) {
			const rad = isDeg ? angle * (Math.PI / 180) : angle;

			return Vector(
				Unit.difference(this.x.multiply(Unit(Math.cos(rad))), this.y.multiply(Unit(Math.sin(rad)))),
				Unit.sum(this.x.multiply(Unit(Math.sin(rad))), this.y.multiply(Unit(Math.cos(rad))))
			);
		}
	};
}

Vector.from = (x: number, y: number, unitType: UnitType = 'px') =>
	Vector(Unit(x, unitType), Unit(y, unitType));

Vector.sum = (...vectors: Vector[]) => {
	return vectors.reduce((p, v) => Vector(p.x.add(v.x), p.y.add(v.y)));
};

Vector.difference = (...vectors: Vector[]) => {
	return vectors.reduce((p, v) => Vector(p.x.subtract(v.x), p.y.subtract(v.y)));
};

Vector.ZERO = Vector.from(0, 0);
Vector.ONE  = Vector.from(1, 1);

export default Vector;