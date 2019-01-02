using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Cryptography;
using System.Threading;
using System.Threading.Tasks;

using LiteDB;
using Microsoft.AspNetCore.SignalR;
using Soundboard.Server.Hubs;
using Soundboard.Server.Model;

namespace Soundboard.Server.Services
{
    public class PlayerService : IPlayerService, IDisposable
    {
        private class Registration : Player
        {
            public DateTime FirstRegistrationUtc { get; set; }
            public DateTime LastRegistrationUtc { get; set; }
        }

        private const string HubRegisterEvent = "playerRegistered";
        private const string HubUnregisterEvent = "playerUnregistered";
        private const string HubSetActivePlayerEvent = "playerActiveChanged";

        private readonly IHubContext<SoundboardHub> _hubContext;
        private readonly IList<Registration> _registrations;
        private readonly CancellationTokenSource _registrationCheckCancellationTokenSource;
        private readonly Task _registrationCheckerTask;
        private Player _activePlayer;
        private bool _isDisposed;

        public PlayerService(IHubContext<SoundboardHub> hubContext)
        {
            _hubContext = hubContext;
            _registrations = new List<Registration>();
            _registrationCheckCancellationTokenSource = new CancellationTokenSource();
            _registrationCheckerTask = CheckRegistrationsAsync(_registrationCheckCancellationTokenSource.Token);
        }

        private static readonly TimeSpan CheckRegistrationInterval = TimeSpan.FromSeconds(30);
        private static readonly TimeSpan MaxRegistrationAge = TimeSpan.FromSeconds(150);

        ~PlayerService()
        {
            Dispose(false);
        }

        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        protected virtual void Dispose(bool disposing)
        {
            if (!_isDisposed)
            {
                _registrationCheckCancellationTokenSource.Cancel();
                
                if (disposing)
                    _registrationCheckerTask.Wait();

                _isDisposed = true;
            }
        }

        public async Task RegisterAsync(Player player)
        {
            lock (_registrations)
            {
                var utcNow = DateTime.UtcNow;
                var existingRegistration = _registrations.FirstOrDefault(p => p.Id == player.Id);
                if (existingRegistration == null)
                {
                    _registrations.Add(existingRegistration = new Registration
                    {
                        Id = player.Id,
                        Description = player.Description,
                        FirstRegistrationUtc = utcNow
                    });
                }
                else
                {
                    if (existingRegistration.Description == player.Description)
                        return;
                    existingRegistration.Description = player.Description;
                }
                existingRegistration.LastRegistrationUtc = utcNow;
            }

            await _hubContext.Clients.All.SendAsync(HubRegisterEvent, player);
        }

        public async Task UnregisterAsync(string id)
        {
            var resetActivePlayer = false;
            Registration registration;

            lock (_registrations)
            {
                registration = _registrations.FirstOrDefault(p => p.Id == id);
                if (registration == null)
                    throw new PlayerNotFoundException(id);

                resetActivePlayer = registration?.Id == _activePlayer?.Id;
                _registrations.Remove(registration);
            }

            if (resetActivePlayer)
                await this.SetActivePlayerAsync(null);
            await _hubContext.Clients.All.SendAsync(HubUnregisterEvent, registration);
        }

        public IEnumerable<Player> GetPlayers()
        {
            lock (_registrations)
            {
                return _registrations.ToList();
            }
        }

        public async Task SetActivePlayerAsync(string id)
        {
            bool sendUpdate;
            Player activePlayer;

            lock (_registrations)
            {

                if (id == null)
                {
                    activePlayer = null;
                }
                else
                {
                    activePlayer = _registrations.FirstOrDefault(p => p.Id == id);
                    if (activePlayer == null)
                        throw new PlayerNotFoundException(id);
                }

                sendUpdate = _activePlayer?.Id != activePlayer?.Id;
            }

            if (sendUpdate)
                await _hubContext.Clients.All.SendAsync(HubSetActivePlayerEvent, activePlayer);
        }

        public Player GetActivePlayer() => _activePlayer;

        private async Task CheckRegistrationsAsync(CancellationToken cancellationToken)
        {
            while (!cancellationToken.IsCancellationRequested)
            {
                try
                {
                    await Task.Delay(CheckRegistrationInterval, cancellationToken).ConfigureAwait(false);
                }
                catch (OperationCanceledException)
                {
                    return;
                }

                var autoUnregistrations = new List<Registration>();
                lock (_registrations)
                {
                    var utcNow = DateTime.UtcNow;

                    var i = 0;
                    while (i < _registrations.Count)
                    {
                        var registration = _registrations[i];
                        if (registration.LastRegistrationUtc + MaxRegistrationAge < utcNow)
                        {
                            autoUnregistrations.Add(registration);
                            _registrations.RemoveAt(i);
                        }
                        else
                        {
                            ++i;
                        }
                    }
                }

                foreach (var autoUnregistration in autoUnregistrations)
                    await _hubContext.Clients.All.SendAsync(HubUnregisterEvent, autoUnregistration, cancellationToken);
            }
        }
    }
}
