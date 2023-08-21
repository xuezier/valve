import * as assert from 'assert';

type Message = string | number;

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export class Logger {
    private _logger: any = console;
    set logger(logger)  {
        assert(
            typeof logger.debug === 'function' &&
            typeof logger.info === 'function' &&
            typeof logger.warn === 'function' &&
            typeof logger.error === 'function',
            new TypeError('logger must have builtin funtion includes `debug`,`info`,`warn`,`error`')
        );

        this._logger = logger;
    }

    private _isDebug = false;

    constructor(logger, debug = false) {
        if(logger) {
            this.logger = logger;
        }

        this._isDebug = debug;
    }

    private _log(level: LogLevel, message: Message, ...args) {
        if(!this._isDebug)
            return;

        return this._logger[level](message, ...args);
    }


    debug(message: Message, ...args) {
        return this._log('debug', message, ...args);
    }

    info(message: Message, ...args) {
        return this._log('info', message, ...args);
    }

    warn(message: Message, ...args) {
        return this._log('warn', message, ...args);
    }

    error(message: Message, ...args) {
        return this._log('error', message, ...args);
    }
}