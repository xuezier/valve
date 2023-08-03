import { EnviromentConfigKey } from "./const/Enviroment";

export function loadEnv<T>(key: EnviromentConfigKey, defaultValue: T) {
    const value = process.env[key];
    if(value)
        return value as unknown as T;

    return defaultValue;
}

export function loadNumber(key: EnviromentConfigKey, defaultValue: number) {
    const value = loadEnv(key, defaultValue);

    if(value && typeof value !== 'number')
        return +value;

    return value;
}