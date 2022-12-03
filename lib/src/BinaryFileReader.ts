/**
 * A wrapper for DataView to simplify reading sequential bytes: it
 * keeps track of the index of the next byte and the endianness.
 */
export class BinaryFileReader {
    index: number = 0;
    private dv: DataView;
    private littleEndian = true;

    constructor(dv: DataView) {
        this.dv = dv;
    }

    getInt8() {
        const val = this.dv.getInt8(this.index);
        this.index += 1;
        return val;
    }

    getInt16() {
        const val = this.dv.getInt16(this.index, this.littleEndian);
        this.index += 2;
        return val;
    }

    getInt32() {
        const val = this.dv.getInt32(this.index, this.littleEndian);
        this.index += 4;
        return val;
    }

    getInt64() {
        const val = this.dv.getBigInt64(this.index, this.littleEndian);
        if (val > Number.MAX_SAFE_INTEGER) {
            throw new Error('Int64 value is over ' + Number.MAX_SAFE_INTEGER)
        }
        this.index += 8;
        return Number(val);
    }

    getBigInt64(): bigint {
        const val = this.dv.getBigInt64(this.index, this.littleEndian);
        this.index += 8;
        return val;
    }

    getUint8() {
        const val = this.dv.getUint8(this.index);
        this.index += 1;
        return val;
    }

    getUint16() {
        const val = this.dv.getUint16(this.index, this.littleEndian);
        this.index += 2;
        return val;
    }

    getUint32() {
        const val = this.dv.getUint32(this.index, this.littleEndian);
        this.index += 4;
        return val;
    }

    getUint64() {
        const val = this.dv.getBigUint64(this.index, this.littleEndian);
        if (val > Number.MAX_SAFE_INTEGER) {
            throw new Error('Uint64 value is over ' + Number.MAX_SAFE_INTEGER)
        }
        this.index += 8;
        return Number(val);
    }

    getBigUint64(): bigint {
        const val = this.dv.getBigUint64(this.index, this.littleEndian);
        this.index += 8;
        return val;
    }

}

