import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HubConnectionBuilder, HubConnection } from '@aspnet/signalr';
import { Subject } from 'rxjs';
import { IBackEndSample } from '../model/IBackEndSample';

export interface IQueuedSample {
  sampleId: string;
  category: string;
  title: string;
}

export interface IRegistration {
  id: string;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private static readonly baseUrl = 'http://localhost:5000/api/'; // TODO: Fetch from a service
  private readonly enableLogging = true;

  public readonly onScan = new Subject();
  public readonly onSampleUpdated = new Subject<Readonly<IBackEndSample>>();
  public readonly onPlayListSampleEnqueued = new Subject<Readonly<IQueuedSample>>();
  public readonly onPlayListSamplePopped = new Subject<Readonly<IQueuedSample>>();
  public readonly onPlayListCleared = new Subject();
  public readonly onRegistrationRegistered = new Subject<Readonly<IRegistration>>();
  public readonly onRegistrationUnregistered = new Subject<Readonly<IRegistration>>();
  public readonly onRegistrationActiveChanged = new Subject<Readonly<IRegistration>>();

  private readonly connection: HubConnection;

  constructor(private readonly http: HttpClient) {
    const hubUrl = `${ApiService.baseUrl}hub`;
    this.connection = new HubConnectionBuilder().withUrl(hubUrl).build();
    this.connection.start().catch(err => {
      console.error(`Cannot connect to event-hub at '${hubUrl}': ${err.message}`);
    });

    // Respond to SignalR events
    this.onEvent('scan', () => this.onScan.next());
    this.onEvent('sampleUpdated', (backEndSample: IBackEndSample) => this.onSampleUpdated.next(backEndSample));
    this.onEvent('sampleEnqueued', (queuedSample: IQueuedSample) => this.onPlayListSampleEnqueued.next(queuedSample));
    this.onEvent('samplePopped', (queuedSample: IQueuedSample) => this.onPlayListSamplePopped.next(queuedSample));
    this.onEvent('playListCleared', () => this.onPlayListCleared.next());
    this.onEvent('registrationRegistered', (registration: IRegistration) => this.onRegistrationRegistered.next(registration));
    this.onEvent('registrationUnregistered', (registration: IRegistration) => this.onRegistrationUnregistered.next(registration));
    this.onEvent('registrationActiveChanged', (registration: IRegistration) => this.onRegistrationActiveChanged.next(registration));

    // Raise the initial event of the active registration
    this.registrationGetActive().subscribe((activeRegistration) => {
      this.onRegistrationActiveChanged.next(activeRegistration);
    });
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
  registrationRegister = (player: IRegistration) =>
    this.http.put(`${ApiService.baseUrl}registration/register`, player)

  registrationUnregister = (id: string) =>
    this.http.delete(`${ApiService.baseUrl}registration/unregister?id=${encodeURIComponent(id)}`)

  registrationGetAll = () =>
    this.http.get<IRegistration[]>(`${ApiService.baseUrl}registration/getAll`)

  registrationGetActive = () =>
    this.http.get<IRegistration>(`${ApiService.baseUrl}registration/getActive`)

  registrationSetActive = (id: string) =>
    this.http.put(`${ApiService.baseUrl}registration/setActive`, { id })

  private onEvent(methodName: string, method: (...args: any[]) => void) {
    this.connection.on(methodName, this.enableLogging ? ((...args: any[]) => {
      console.log(`Received: ${methodName}: ${JSON.stringify(args)}`);
      method(...args);
    }) : method);
  }
}