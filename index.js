/**
 * BigDecimal class for handling large numbers with high precision.
 *
 * Wraps Javascript's BigInt type, adding support for
 * storing decimal precision, without relying on external libraries.
 */
 class BigDecimal {
  static #places = 15;
  static #round = false;
  static #shift = BigInt('1' + '0'.repeat(BigDecimal.#places));

  constructor(n, options = {}) {
    if (typeof n !== 'number' && typeof n !== 'string') {
      throw new Error('BigDecimal must be initialized with a Number or String');
    } else if (n instanceof BigDecimal) {
      return n;
    }

    this.#places = options.places || this.#places;
    this.#round = options.round || this.#round;

    const [ints, decs] = String(n).split('.').concat('');
    this._n =
      BigInt(ints + decs.padEnd(BigDecimal.#places, '0').slice(0, BigDecimal.#places)) +
      BigInt(BigDecimal.#round && decs[BigDecimal.places] >= '5');
  }

  static #fromBigInt(bigint) {
    return Object.assign(Object.create(BigDecimal.prototype), { _n: bigint });
  }

  static #divRound(dividend, divisor) {
    return BigDecimal.fromBigInt(dividend / divisor + (BigDecimal.#round ? ((dividend * 2n) / divisor) % 2n : 0n));
  }

  add(n) {
    return BigDecimal.#fromBigInt(this._n + new BigDecimal(n)._n);
  }

  minus(n) {
    return BigDecimal.#fromBigInt(this._n - new BigDecimal(n)._n);
  }

  times(n) {
    return BigDecimal.#divRound(this._n * new BigDecimal(n)._n, BigDecimal.#shift);
  }

  divide(n) {
    return BigDecimal.#divRound(this._n * BigDecimal.#shift, new BigDecimal(n)._n);
  }

  pow(n) {
    return BigDecimal.#fromBigInt(this._n ** BigInt(n));
  }

  decimalPlaces(n) {
    const str = this._n.toString().padStart(BigDecimal.#places + 1, '0');
    if (n === undefined) {
      return str.slice(-BigDecimal.DECIMALS).replace(/\.?0+$/, '')?.length ?? 0;
    }
    const whole = str.slice(0, -BigDecimal.#places);
    const decs = (
      BigInt(
        str
          .slice(-BigDecimal.#places)
          .replace(/\.?0+$/, '')
          .padEnd(BigDecimal.#places, '0')
          .slice(0, BigDecimal.#places)
      )
    )
      .toString()
      .slice(0, n);
    return new BigDecimal(whole + (decs.length > 0 ? '.' + decs : ''));
  }

  toString() {
    const str = this._n.toString().padStart(BigDecimal.places + 1, '0');
    const whole = str.slice(0, -BigDecimal.places);
    const decs = str.slice(-BigDecimal.places).replace(/\.?0+$/, '');
    return whole + (decs.length > 0 ? '.' + decs : '');
  }
}
