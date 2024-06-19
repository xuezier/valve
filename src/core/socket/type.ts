export type CHUNK_TYPES = 'PENDING' | 'OK';

export type SOCKET_EVENTS = 'chunk-ready' | 'chunk-append' | 'chunk-finish' | 'chunk-error';
export type SOCKET_STATUS = 'CHUNK_PENDING' | 'IDLE';