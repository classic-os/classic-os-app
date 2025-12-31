type RawAmount = bigint | number | string;

function toBigIntStrict(value: RawAmount): bigint {
    if (typeof value === "bigint") return value;
    if (typeof value === "number") {
        if (!Number.isFinite(value) || !Number.isInteger(value)) {
            throw new Error("formatTokenAmount: number inputs must be finite integers");
        }
        return BigInt(value);
    }
    // string
    const v = value.trim();
    if (!/^-?\d+$/.test(v)) {
        throw new Error("formatTokenAmount: string inputs must be an integer string");
    }
    return BigInt(v);
}

export function formatTokenAmount(
    raw: RawAmount,
    decimals: number,
    opts?: {
        maxFractionDigits?: number; // default 6
        trimTrailingZeros?: boolean; // default true
        useGrouping?: boolean; // default true
    }
): string {
    const maxFractionDigits = opts?.maxFractionDigits ?? 6;
    const trimTrailingZeros = opts?.trimTrailingZeros ?? true;
    const useGrouping = opts?.useGrouping ?? true;

    if (!Number.isInteger(decimals) || decimals < 0 || decimals > 255) {
        throw new Error("formatTokenAmount: decimals must be an integer in [0, 255]");
    }

    let x = toBigIntStrict(raw);
    const negative = x < 0n;
    if (negative) x = -x;

    const base = 10n ** BigInt(decimals);
    const whole = decimals === 0 ? x : x / base;
    const frac = decimals === 0 ? 0n : x % base;

    const wholeStr = whole.toString();
    const groupedWhole = useGrouping
        ? new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(Number(wholeStr))
        : wholeStr;

    if (decimals === 0 || maxFractionDigits === 0) {
        return negative ? `-${groupedWhole}` : groupedWhole;
    }

    let fracStr = frac.toString().padStart(decimals, "0");

    // limit displayed fraction digits
    if (fracStr.length > maxFractionDigits) {
        fracStr = fracStr.slice(0, maxFractionDigits);
    }

    if (trimTrailingZeros) {
        fracStr = fracStr.replace(/0+$/, "");
    }

    const out =
        fracStr.length === 0 ? groupedWhole : `${groupedWhole}.${fracStr}`;

    return negative ? `-${out}` : out;
}

export function formatUsd(
    value: number,
    opts?: {
        maximumFractionDigits?: number; // default 2
    }
): string {
    const maximumFractionDigits = opts?.maximumFractionDigits ?? 2;
    return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: "USD",
        maximumFractionDigits,
    }).format(value);
}
