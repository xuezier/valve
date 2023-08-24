/**
 * 表示存储单位的类型。
 */
export type StorageUnit = 'B' | 'KB' | 'MB' | 'GB';

// 定义各个存储单位的字节数
const B = 1;
const KB = 1 << 10;
const MB = KB << 10;
const GB = MB << 10;

// 存储各个存储单位的字节数，用于优化 getUnit 函数
const UNIT_VALUES: Record<StorageUnit, number> = {
    'B': B,
    'KB': KB,
    'MB': MB,
    'GB': GB,
};

// 用于匹配存储字符串的正则表达式
const regexp = /^(\d+)(B|KB|MB|GB)$/i;

/**
 * 测试给定字符串是否符合存储格式。
 *
 * @param storage - 要测试的存储字符串。
 * @returns 如果匹配存储格式则返回 true，否则返回 false。
 */
export function testStorage(storage: string): boolean {
    return regexp.test(storage);
}

/**
 * 根据存储单位返回对应的字节数。
 *
 * @param unit - 存储单位。
 * @returns 对应的字节数。
 * @throws {TypeError} 如果提供了无效的存储单位。
 */
export function getUnit(unit: StorageUnit) {
    const normalizedUnit = unit.toUpperCase() as StorageUnit;

    if (!UNIT_VALUES[normalizedUnit]) {
        throw new TypeError('Invalid storage unit');
    }

    return UNIT_VALUES[normalizedUnit];
}

/**
 * 将给定存储字符串转换为指定存储单位的值。
 *
 * @param storage - 要转换的存储字符串。
 * @param toUnit - 要转换为的目标存储单位。
 * @returns 转换后的存储值，如果输入格式不正确则返回 undefined。
 */
export function convertStorage(storage: string, toUnit: StorageUnit) {
    // 使用正则表达式匹配存储字符串，例如 '192KB'
    const result = regexp.exec(storage);

    if (!result)
        throw new TypeError('Invalid storage format');

    const [, value, unit] = result;
    const fromUnitValue = getUnit(unit as StorageUnit);
    const toUnitValue = getUnit(toUnit);

    // 如果源单位和目标单位相同，直接返回原始值
    if (fromUnitValue === toUnitValue) {
        return +value;
    }

    const rate = fromUnitValue / toUnitValue;

    // 进行转换并返回结果
    return +value * rate;
}
