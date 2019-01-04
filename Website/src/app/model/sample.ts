import { IBackEndSample } from './IBackEndSample';
import { Category } from './category';

export class Sample {
    constructor(private readonly category: Category, private readonly title: string, private backEndSample: IBackEndSample) {
        this.title = title;
        this.backEndSample = backEndSample;
    }

    public getId = () => this.backEndSample.id;
    public getCategory = () => this.category;
    public getTitle = () => this.title;
    public getPlayCount = () => this.backEndSample.playCount;
    public getLastPlayedUtc = () => this.backEndSample.lastPlayedUtc && new Date(this.backEndSample.lastPlayedUtc);

    public updateFrom(backEndSample: IBackEndSample) {
        this.backEndSample = backEndSample;
    }
}
