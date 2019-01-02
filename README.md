Web-based MP3 soundboard that allows control from multiple clients, where only a single client is responsible for playback.

It uses the following technologies:
* [Angular V6](https://angular.io/) for the web application.
* [Howler.js](https://howlerjs.com) for audio playback.
* Regular HTTP for JSON/REST API, extended with [Core SignalR](https://docs.microsoft.com/en-us/aspnet/core/signalr/introduction?view=aspnetcore-2.2) for eventing.
* [ASP.NET core v2.2 WebAPI](https://docs.microsoft.com/en-us/aspnet/core/web-api/?view=aspnetcore-2.2) for backend implementation.
* [LiteDB](http://www.litedb.org/) for backend-database (used to store meta-information).

# TODO
* [ ] Improve UI.
* [ ] Add filtering to quickly find samples.
* [ ] Show current sample.
* [X] Refactor client-side service to make it less complex.
* [ ] Refactor back-end services to make it less complex.
* [ ] Allow only a single client to play samples.
* [ ] Allow editing of the category title.
* [ ] Allow editing of sample metadata (title, volume and start/end trimming).
* [ ] Better publish script.
* [ ] Compatible with other file-formats.
* [ ] Add caching to prevent redownloading samples over and over again.
