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
    public class RegistrationService : IRegistrationService, IDisposable
    {
        private const string HubRegisterEvent = "registrationRegistered";
        private const string HubUnregisterEvent = "registrationUnregistered";
        private const string HubSetActiveEvent = "registrationActiveChanged";

        private readonly IHubContext<SoundboardHub> _hubContext;
        private readonly IList<Registration> _registrations;
        private Registration _activeRegistration;
        private readonly CancellationTokenSource _registrationCheckCancellationTokenSource;
        private readonly Task _registrationCheckerTask;
        private bool _isDisposed;

        public RegistrationService(IHubContext<SoundboardHub> hubContext)
        {
            _hubContext = hubContext;
            _registrations = new List<Registration>();
            _registrationCheckCancellationTokenSource = new CancellationTokenSource();
            _registrationCheckerTask = CheckRegistrationsAsync(_registrationCheckCancellationTokenSource.Token);
        }

        private static readonly TimeSpan CheckRegistrationInterval = TimeSpan.FromSeconds(30);
        private static readonly TimeSpan MaxRegistrationAge = TimeSpan.FromSeconds(150);

        ~RegistrationService()
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

        public async Task RegisterAsync(Registration registration)
        {
            var setActive = false;

            Registration existingRegistration;
            lock (_registrations)
            {
                var utcNow = DateTime.UtcNow;
                existingRegistration = _registrations.FirstOrDefault(p => p.Id == registration.Id);
                if (existingRegistration == null)
                {
                    _registrations.Add(existingRegistration = new Registration
                    {
                        Id = registration.Id,
                        Description = registration.Description,
                        FirstRegistrationUtc = utcNow
                    });
                }
                else
                {
                    if (existingRegistration.Description == registration.Description)
                        return;
                    existingRegistration.Description = registration.Description;
                }
                existingRegistration.LastRegistrationUtc = utcNow;

                setActive = _activeRegistration == null;
            }

            await _hubContext.Clients.All.SendAsync(HubRegisterEvent, existingRegistration);
            if (setActive)
                await SetActiveAsync(existingRegistration.Id);
        }

        public async Task UnregisterAsync(string id)
        {
            var resetActive = false;
            Registration registration;

            lock (_registrations)
            {
                registration = _registrations.FirstOrDefault(p => p.Id == id);
                if (registration == null)
                    throw new RegistrationNotFoundException(id);

                resetActive = registration?.Id == _activeRegistration?.Id;
                _registrations.Remove(registration);
            }

            if (resetActive)
                await this.SetActiveAsync(null);
            await _hubContext.Clients.All.SendAsync(HubUnregisterEvent, registration);
        }

        public IEnumerable<Registration> GetRegistrations()
        {
            lock (_registrations)
            {
                return _registrations.ToList();
            }
        }

        public async Task SetActiveAsync(string id)
        {
            bool sendUpdate;
            Registration activeRegistration;

            lock (_registrations)
            {

                if (id == null)
                {
                    activeRegistration = null;
                }
                else
                {
                    activeRegistration = _registrations.FirstOrDefault(p => p.Id == id);
                    if (activeRegistration == null)
                        throw new RegistrationNotFoundException(id);
                }

                sendUpdate = _activeRegistration?.Id != activeRegistration?.Id;
                _activeRegistration= activeRegistration;
            }

            if (sendUpdate)
                await _hubContext.Clients.All.SendAsync(HubSetActiveEvent, activeRegistration);
        }

        public Registration GetActiveRegistration() => _activeRegistration;

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
                {
                    if (_activeRegistration != null && autoUnregistration.Id == _activeRegistration.Id)
                        await SetActiveAsync(null);
                    await _hubContext.Clients.All.SendAsync(HubUnregisterEvent, autoUnregistration, cancellationToken);
                }
            }
        }
    }
}
