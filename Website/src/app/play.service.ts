import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HubConnectionBuilder } from '@aspnet/signalr';
import { Howl } from 'howler';
import { Subject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import Sample from './model/sample';
import SamplePlayInfo from './model/samplePlayInfo';
import Category from './model/category';

import IBackEndSample from './model/IBackEndSample';

interface IQueuedSample {
  sampleId: string;
  category: string;
  title: string;
}

const compareNames = (n1: string, n2: string) => {
  if (n1 < n2) {
    return -1;
  } else if (n1 > n2) {
    return 1;
  } else {
    return 0;
  }
};

@Injectable({
  providedIn: 'root'
})
export class PlayService {
  private static readonly baseUrl = 'http://localhost:5000/';
  public readonly samplePlayed = new Subject<Readonly<SamplePlayInfo>>();
  private categories: Category[] = [];
  private playList: Sample[] = [];
  private sampleHistory: SamplePlayInfo[] = [];
  private isPlaying: boolean;

  constructor(private http: HttpClient) {
    const hubUrl = `${PlayService.baseUrl}hub`;
    const connection = new HubConnectionBuilder().withUrl(hubUrl).build();
    connection.start().catch(err => {
      console.error(`Cannot connect to event-hub at '${hubUrl}': ${err.message}`);
    });
    connection.on('enqueued', (queuedSample: IQueuedSample) => {
      this.onItemAddedToPlayList(queuedSample);
    });
    connection.on('popped', (queuedSample: IQueuedSample) => {
      this.onItemPoppedFromPlayList(queuedSample);
    });
    connection.on('update', (backEndSample: IBackEndSample) => {
      this.onSampleUpdated(backEndSample);
    });
    connection.on('clearPlayList', () => {
      this.onClearPlayList();
    });
  }

  public enqueueSample(sample: Readonly<Sample>): void {
    this.http.post(`${PlayService.baseUrl}api/playList/enqueue`, this.createEnqueuedSample(sample))
      .subscribe(
        () => { /* NOP */ },
        err => console.error(`Oops: ${err.message}`)
      );
  }

  public popSample(): Observable<Sample> {
    return this.http.post<IQueuedSample>(`${PlayService.baseUrl}api/playList/pop`, {})
      .pipe(map((queuedSample) => {
        if (queuedSample) {
          const category = this.categories.find(c => c.getTitle() === queuedSample.category);
          if (category) {
            const sample = category.getSamples().find(s => s.getId() === queuedSample.sampleId);
            if (sample) {
              return sample;
            }
          }
        }
      }));
  }

  public getPlayList() {
    return this.playList;
  }

  public clearPlayList() {
    return this.http.post<IQueuedSample>(`${PlayService.baseUrl}api/playlist/clear`, {})
      .subscribe(
        () => { /* NOP */ },
        err => console.error(`Oops: ${err.message}`)
      );
  }

  public getHistory(lastItems: number = 10): Readonly<SamplePlayInfo>[] {
    return this.sampleHistory.slice(0, lastItems);
  }

  public getCategories(): Observable<Category[]> {
    return this.http.get<IBackEndSample[]>(`${PlayService.baseUrl}api/samples/getSamples`)
      .pipe(map(backEndSamples => {
        const categories: Category[] = [];
        for (const backEndSample of backEndSamples) {
          for (const backEndLocation of backEndSample.locations) {
            const categoryName = backEndLocation.category;
            let category = categories.find(c => c.getTitle() === categoryName);
            if (category == null) {
              category = new Category(categoryName);
              categories.push(category);
            }
            category.addSample(new Sample(category, backEndLocation.title, backEndSample));
          }
        }
        for (const category of categories) {
          category.getSamples().sort((s1, s2) => compareNames(s1.getTitle(), s2.getTitle()));
        }
        categories.sort((c1, c2) => compareNames(c1.getTitle(), c2.getTitle()));
        return this.categories = categories;
      }));
  }

  private createEnqueuedSample(sample: Readonly<Sample>): IQueuedSample {
    return {
      sampleId: sample.getId(),
      category: sample.getCategory().getTitle(),
      title: sample.getTitle(),
    };
  }

  private determineSample(queuedSample: IQueuedSample): Sample | undefined {
    const category = this.categories.find(c => c.getTitle() === queuedSample.category);
    if (category) {
      const sample = category.getSamples().find(s => s.getId() === queuedSample.sampleId);
      if (sample) {
        return sample;
      }
    }
  }

  private onItemAddedToPlayList(queuedSample: IQueuedSample) {
    const sample = this.determineSample(queuedSample);
    if (sample) {
      this.playList.push(sample);
      this.playNextSample();
    }
  }

  private onItemPoppedFromPlayList(queuedSample: IQueuedSample) {
    const sample = this.determineSample(queuedSample);
    const index = this.playList.findIndex(s => s === sample);
    if (index >= 0) {
      this.playList.splice(index, 1);
    }
  }

  private onClearPlayList() {
    this.playList.length = 0;
  }

  private onSampleUpdated(backEndSample: IBackEndSample) {
    // TODO: Also update locations and categories
    for (const category of this.categories) {
      for (const sample of category.getSamples()) {
        if (sample.getId() === backEndSample.id) {
          sample.updateFrom(backEndSample);
        }
      }
    }
  }


  private playSample(sample: Sample) {
    const url = `${PlayService.baseUrl}api/samples/getSample?id=${encodeURIComponent(sample.getId())}`;
    const sound = new Howl({
      src: [url],
      format: 'mp3',
      onloaderror: (soundId, err) => {
        console.error(`Cannot load sample '${sample.getCategory().getTitle()}${sample.getTitle()}': ${err.message}`);
        this.isPlaying = false;
        this.playNextSample();
      },
      onplayerror: (soundId, err) => {
        console.error(`Cannot play sample '${sample.getCategory().getTitle()}${sample.getTitle()}': ${err.message}`);
        this.isPlaying = false;
        this.playNextSample();
      },
      onend: () => {
        this.isPlaying = false;
        this.http.post<IQueuedSample>(`${PlayService.baseUrl}api/playList/markAsPlayed`, this.createEnqueuedSample(sample))
        .subscribe(
          () => this.playNextSample(),
          err => {
            console.error(`Cannot mark sample as played: ${err.message}`);
            this.playNextSample();
          }
        );
      }
    });
    sound.play();
  }

  private playNextSample() {
    if (!this.isPlaying && this.playList.length > 0) {
      this.isPlaying = true;
      this.http.post<IQueuedSample>(`${PlayService.baseUrl}api/playList/pop`, {})
        .subscribe(
          (queudSample: IQueuedSample) => {
            const sample = this.determineSample(queudSample);
            if (!sample) {
              console.error(`Cannot find sample '${queudSample.category}${queudSample.title}'.`);
              this.isPlaying = false;
              return;
            }
            this.playSample(sample);
          },
          err => {
            console.error(`Cannot determine next sample (pop failed): ${err.message}`);
            this.isPlaying = false;
          }
        );
    }
  }
}
