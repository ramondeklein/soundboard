import { Sample } from './sample';

export class Category {
    constructor(private title: string, private readonly samples: Sample[] = []) {
    }

    public addSample(sample: Sample) {
        this.samples.push(sample);
    }

    public getTitle = () => this.title;
    public getSamples = () => this.samples;
}
