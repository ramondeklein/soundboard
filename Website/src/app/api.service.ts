import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HubConnectionBuilder, HubConnection } from '@aspnet/signalr';
import { Subject, Observable } from 'rxjs';
import IBackEndSample from './model/IBackEndSample';
import Sample from './model/sample';

export interface IQueuedSample {
  sampleId: string;
  category: string;
  title: string;
}

export interface IPlayer {
  id: string;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private static readonly baseUrl = 'http://localhost:5000/api/'; // TODO: Fetch from a service
  private readonly connection: HubConnection;

  public readonly onScan = new Subject();
  public readonly onSampleUpdated = new Subject<Readonly<IBackEndSample>>();
  public readonly onPlayListSampleEnqueued = new Subject<Readonly<IQueuedSample>>();
  public readonly onPlayListSamplePopped = new Subject<Readonly<IQueuedSample>>();
  public readonly onPlayListCleared = new Subject();
  public readonly onPlayerRegistered = new Subject<Readonly<IPlayer>>();
  public readonly onPlayerUnregistered = new Subject<Readonly<IPlayer>>();
  public readonly onPlayerActiveChanged = new Subject<Readonly<IPlayer>>();

  constructor(private readonly http: HttpClient) {
    const hubUrl = `${ApiService.baseUrl}hub`;
    this.connection = new HubConnectionBuilder().withUrl(hubUrl).build();
    this.connection.start().catch(err => {
      console.error(`Cannot connect to event-hub at '${hubUrl}': ${err.message}`);
    });

    // Respond to SignalR events
    this.connection.on('scan', () => this.onScan.next());
    this.connection.on('sampleUpdated', (backEndSample: IBackEndSample) => this.onSampleUpdated.next(backEndSample));
    this.connection.on('sampleEnqueued', (queuedSample: IQueuedSample) => this.onPlayListSampleEnqueued.next(queuedSample));
    this.connection.on('samplePopped', (queuedSample: IQueuedSample) => this.onPlayListSamplePopped.next(queuedSample));
    this.connection.on('playListCleared', () => this.onPlayListCleared.next());
    this.connection.on('playerRegistered', (player: IPlayer) => this.onPlayerRegistered.next(player));
    this.connection.on('playerUnregistered', (player: IPlayer) => this.onPlayerUnregistered.next(player));
    this.connection.on('playerActiveChanged', (player: IPlayer) => this.onPlayerActiveChanged.next(player));
  }

  // Playlist API
  playListEnqueueSample = (queuedSample: IQueuedSample) =>
    this.http.post(`${ApiService.baseUrl}playList/enqueue`, queuedSample)

  playListPopSample = () =>
    this.http.post<IQueuedSample>(`${ApiService.baseUrl}playList/pop`, {})

  playListClear = () =>
    this.http.delete(`${ApiService.baseUrl}playlist/clear`)

  // Sample API
  sampleScan = () =>
    this.http.post(`${ApiService.baseUrl}samples/scan`, {})

  sampleGetAll = () =>
    this.http.get<IBackEndSample[]>(`${ApiService.baseUrl}samples/getAll`)

  sampleGetStreamUrl = (id: string) =>
    `${ApiService.baseUrl}samples/getStream?id=${encodeURIComponent(id)}`

  sampleMarkPlayed = (id: string) =>
    this.http.post(`${ApiService.baseUrl}samples/markAsPlayed`, { id })

  // Registration API
  playerRegister = (player: IPlayer) =>
    this.http.put(`${ApiService.baseUrl}player/register`, player)

  playerUnregister = (id: string) =>
    this.http.delete(`${ApiService.baseUrl}player/unregister?id=${encodeURIComponent(id)}`)

  playerSetActive = (id: string) =>
    this.http.put(`${ApiService.baseUrl}player/setActivePlayer`, { id })

  playerGetAll = () =>
    this.http.get<IPlayer[]>(`${ApiService.baseUrl}player/getAll`)

  playerGetActive = () =>
    this.http.get<IPlayer>(`${ApiService.baseUrl}player/getActive`)
}
