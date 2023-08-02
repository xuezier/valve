import { EnviromentConfigKey } from "./const/Enviroment";

export function loadEnv<T>(key: EnviromentConfigKey, defaultValue: T) {
    const value = process.env[key];
    if(value)
        return value as unknown as T;

    return defaultValue;
}