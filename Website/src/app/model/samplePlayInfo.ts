import Sample from './sample';

class SamplePlayInfo {
    private readonly playCount: number;

    constructor(private readonly sample: Readonly<Sample>, private readonly timestamp: Date = new Date()) {
        this.playCount = sample.getPlayCount();
    }

    public getTitle = () => this.sample.getTitle();
    public getPlayCount = () => this.playCount;
    public getTimestamp = () => this.timestamp;
    public getSample = () => this.sample as Readonly<Sample>;
}

export default SamplePlayInfo;