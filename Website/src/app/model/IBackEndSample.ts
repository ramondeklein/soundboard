import { IBackEndLocation } from './IBackEndLocation';

export interface IBackEndSample {
    id: string;
    playCount: number;
    addedUtc: Date;
    lastPlayedUtc?: Date;
    locations: IBackEndLocation[];
}
