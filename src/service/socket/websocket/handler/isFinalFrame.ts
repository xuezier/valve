export function isFinalFrame(byte: number) {
    return (byte & 0x80) !== 0;
}