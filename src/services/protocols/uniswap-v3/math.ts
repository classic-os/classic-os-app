// src/services/protocols/uniswap-v3/math.ts
// Minimal TickMath and LiquidityAmounts ported from Uniswap V3 core/periphery (Solidity)
// Uses bigint math throughout; truncates toward zero like Solidity.

export const Q96 = 2n ** 96n;
export const MIN_TICK = -887272;
export const MAX_TICK = 887272;

const MIN_SQRT_RATIO = 4295128739n; // getSqrtRatioAtTick(MIN_TICK)
const MAX_SQRT_RATIO = 1461446703485210103287273052203988822378723970342n; // getSqrtRatioAtTick(MAX_TICK)

export function getSqrtRatioAtTick(tick: number): bigint {
    if (tick < MIN_TICK || tick > MAX_TICK) throw new Error("TICK_OUT_OF_RANGE");

    const absTick = tick < 0 ? -tick : tick;

    let ratio = 0x100000000000000000000000000000000n;
    if (absTick & 0x1) ratio = (ratio * 0xfffcb933bd6fad37aa2d162d1a594001n) >> 128n;
    if (absTick & 0x2) ratio = (ratio * 0xfff97272373d413259a46990580e213an) >> 128n;
    if (absTick & 0x4) ratio = (ratio * 0xfff2e50f5f656932ef12357cf3c7fdccn) >> 128n;
    if (absTick & 0x8) ratio = (ratio * 0xffe5caca7e10e4e61c3624eaa0941cd0n) >> 128n;
    if (absTick & 0x10) ratio = (ratio * 0xffcb9843d60f6159c9db58835c926644n) >> 128n;
    if (absTick & 0x20) ratio = (ratio * 0xff973b41fa98c081472e6896dfb254c0n) >> 128n;
    if (absTick & 0x40) ratio = (ratio * 0xff2ea16466c96a3843ec78b326b52861n) >> 128n;
    if (absTick & 0x80) ratio = (ratio * 0xfe5dee046a99a2a811c461f1969c3053n) >> 128n;
    if (absTick & 0x100) ratio = (ratio * 0xfcbe86c7900a88aedcffc83b479aa3a4n) >> 128n;
    if (absTick & 0x200) ratio = (ratio * 0xf987a7253ac413176f2b074cf7815e54n) >> 128n;
    if (absTick & 0x400) ratio = (ratio * 0xf3392b0822b70005940c7a398e4b70f3n) >> 128n;
    if (absTick & 0x800) ratio = (ratio * 0xe7159475a2c29b7443b29c7fa6e889d9n) >> 128n;
    if (absTick & 0x1000) ratio = (ratio * 0xd097f3bdfd2022b8845ad8f792aa5825n) >> 128n;
    if (absTick & 0x2000) ratio = (ratio * 0xa9f746462d870fdf8a65dc1f90e061e5n) >> 128n;
    if (absTick & 0x4000) ratio = (ratio * 0x70d869a156d2a1b890bb3df62baf32f7n) >> 128n;
    if (absTick & 0x8000) ratio = (ratio * 0x31be135f97d08fd981231505542fcfa6n) >> 128n;
    if (absTick & 0x10000) ratio = (ratio * 0x9aa508b5b7a84e1c677de54f3e99bc9n) >> 128n;
    if (absTick & 0x20000) ratio = (ratio * 0x5d6af8dedb81196699c329225ee604n) >> 128n;
    if (absTick & 0x40000) ratio = (ratio * 0x2216e584f5fa1ea926041bedfe98n) >> 128n;
    if (absTick & 0x80000) ratio = (ratio * 0x48a170391f7dc42444e8fa2n) >> 128n;

    if (tick > 0) {
        ratio = (2n ** 256n - 1n) / ratio;
    }

    // Downshift from Q128 to Q96, rounding up if remainder
    const result = (ratio >> 32n) + (ratio % (1n << 32n) === 0n ? 0n : 1n);
    return result;
}

function mulDiv(a: bigint, b: bigint, denominator: bigint): bigint {
    if (denominator === 0n) throw new Error("DIV_BY_ZERO");
    return (a * b) / denominator;
}

export function getAmountsForLiquidity(
    sqrtPriceX96: bigint,
    sqrtRatioAX96: bigint,
    sqrtRatioBX96: bigint,
    liquidity: bigint
): { amount0: bigint; amount1: bigint } {
    // Ensure A <= B
    const a = sqrtRatioAX96 <= sqrtRatioBX96 ? sqrtRatioAX96 : sqrtRatioBX96;
    const b = sqrtRatioAX96 <= sqrtRatioBX96 ? sqrtRatioBX96 : sqrtRatioAX96;

    if (sqrtPriceX96 <= a) {
        const amount0 = mulDiv(liquidity * (b - a), Q96, a * b);
        return { amount0, amount1: 0n };
    }

    if (sqrtPriceX96 < b) {
        const amount0 = mulDiv(liquidity * (b - sqrtPriceX96), Q96, sqrtPriceX96 * b);
        const amount1 = mulDiv(liquidity, sqrtPriceX96 - a, Q96);
        return { amount0, amount1 };
    }

    const amount1 = mulDiv(liquidity, b - a, Q96);
    return { amount0: 0n, amount1 };
}

export function clampTick(tick: number): number {
    if (tick < MIN_TICK) return MIN_TICK;
    if (tick > MAX_TICK) return MAX_TICK;
    return tick;
}

export const MIN_SQRT_RATIO_X96 = MIN_SQRT_RATIO;
export const MAX_SQRT_RATIO_X96 = MAX_SQRT_RATIO;
