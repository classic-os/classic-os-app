// src/services/protocols/select.ts
export function selectByFlag<T>(flag: boolean, live: T, mock: T): T {
    return flag ? live : mock;
}
