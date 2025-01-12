import { FC } from 'react';

interface Message {
    type: 'status' | 'output';
    message: string;
    duration?: 'until_next' | number;
    start?: number;
    end?: number;
}

interface WorkerMessage {
    error?: string;
    type?: 'status';
    message?: string;
    buffer?: Float32Array;
}

interface AudioWorkletMessage {
    buffer: Float32Array;
}

declare const ASR: FC;

export type { Message, WorkerMessage, AudioWorkletMessage };
export default ASR;
