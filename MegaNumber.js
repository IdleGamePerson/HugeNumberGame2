class MegaNumber {
  // layer = 0: normal number, layer = 1: exponent, layer = 2: double exponent, etc.
  constructor(mantissa = 0, exponent = 0, layer = 0) {
    this.mantissa = mantissa;
    this.exponent = exponent;
    this.layer = layer;
    this.normalize();
  }

  static fromNumber(num) {
    if (num < 1e308) {
      return new MegaNumber(num, 0, 0);
    } else {
      let exp = Math.log10(num);
      return new MegaNumber(exp, 0, 1);
    }
  }

  normalize() {
    if (this.layer === 0 && this.mantissa >= 1000000000) {
      let exp = Math.log10(this.mantissa);
      this.mantissa = exp;
      this.layer = 1;
      this.exponent = 0;
    }
    while (this.layer > 0 && this.mantissa >= 1000000000) {
      this.mantissa = Math.log10(this.mantissa);
      this.layer++;
      this.exponent = 0;
    }
    return this;
  }

  clone() {
    return new MegaNumber(this.mantissa, this.exponent, this.layer);
  }

  compareTo(other) {
    if (this.layer !== other.layer) {
      return this.layer - other.layer;
    }
    if (this.mantissa !== other.mantissa) {
      return this.mantissa - other.mantissa;
    }
    return this.exponent - other.exponent;
  }

  add(other) {
    if (!(other instanceof MegaNumber)) other = MegaNumber.fromNumber(other);
    if (Math.abs(this.layer - other.layer) > 1) {
      return (this.layer > other.layer) ? this.clone() : other.clone();
    }
    if (this.layer === 0 && other.layer === 0) {
      return new MegaNumber(this.mantissa + other.mantissa, 0, 0).normalize();
    }
    if (this.layer === other.layer) {
      if (Math.abs(this.mantissa - other.mantissa) > 5) {
        return (this.mantissa > other.mantissa) ? this.clone() : other.clone();
      }
      let result = Math.pow(10, this.mantissa) + Math.pow(10, other.mantissa);
      return new MegaNumber(Math.log10(result), 0, 1).normalize();
    }
    return (this.layer > other.layer) ? this.clone() : other.clone();
  }

  sub(other) {
    if (!(other instanceof MegaNumber)) other = MegaNumber.fromNumber(other);
    if (this.compareTo(other) < 0) return new MegaNumber(0, 0, 0); // No negatives supported
    if (this.layer === 0 && other.layer === 0) {
      return new MegaNumber(this.mantissa - other.mantissa, 0, 0).normalize();
    }
    if (this.layer === other.layer) {
      if (Math.abs(this.mantissa - other.mantissa) > 5) {
        return this.clone();
      }
      let result = Math.pow(10, this.mantissa) - Math.pow(10, other.mantissa);
      return new MegaNumber(Math.log10(result), 0, 1).normalize();
    }
    return this.clone();
  }

  mul(other) {
    if (!(other instanceof MegaNumber)) other = MegaNumber.fromNumber(other);
    if (this.layer === 0 && other.layer === 0) {
      return new MegaNumber(this.mantissa * other.mantissa, 0, 0).normalize();
    }
    if (this.layer === other.layer) {
      return new MegaNumber(this.mantissa + other.mantissa, 0, this.layer).normalize();
    }
    let big = this.layer > other.layer ? this : other;
    return new MegaNumber(big.mantissa, 0, big.layer).normalize();
  }

  div(other) {
    if (!(other instanceof MegaNumber)) other = MegaNumber.fromNumber(other);
    if (other.mantissa === 0 && other.layer === 0) throw new Error("Division by zero");
    if (this.layer === 0 && other.layer === 0) {
      return new MegaNumber(this.mantissa / other.mantissa, 0, 0).normalize();
    }
    if (this.layer === other.layer) {
      return new MegaNumber(this.mantissa - other.mantissa, 0, this.layer).normalize();
    }
    return (this.layer > other.layer) ? this.clone() : new MegaNumber(0, 0, 0);
  }

  pow(power) {
    if (this.layer === 0) {
      return new MegaNumber(Math.pow(this.mantissa, power), 0, 0).normalize();
    }
    if (this.layer === 1) {
      return new MegaNumber(this.mantissa * power, 0, 1).normalize();
    }
    return new MegaNumber(this.mantissa * power, 0, this.layer).normalize();
  }

  toNumber() {
    if (this.layer === 0) {
      return this.mantissa;
    } else if (this.layer === 1) {
      return Math.pow(10, this.mantissa);
    } else if (this.layer === 2) {
      return Math.pow(10, Math.pow(10, this.mantissa));
    } else {
      return Infinity;
    }
  }

  toString() {
    if (this.layer === 0) {
      // Show up to 4 decimal places, removing trailing zeros/decimal
      return this.mantissa.toFixed(4).replace(/\.?0+$/, "");
    } else if (this.layer === 1) {
      return `e${this.mantissa}`;
    } else {
      let str = '';
      for (let i = 0; i < this.layer; i++) str += 'e';
      return `${str}${this.mantissa}`;
    }
  }
}
