using System;

namespace Soundboard.Server.Services
{
    public class RegistrationNotFoundException : Exception
    {
        public string Id { get; }
        public RegistrationNotFoundException(string id) : base("The specified registration cannot be found.")
        {
            Id = id;
        }

    }

}
