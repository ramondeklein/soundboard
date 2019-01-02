import IBackEndLocation from './IBackEndLocation';

export default interface IBackEndSample {
    id: string;
    playCount: number;
    addedUtc: Date;
    lastPlayedUtc?: Date;
    locations: IBackEndLocation[];
}
