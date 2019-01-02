using System;

namespace Soundboard.Server.Services
{
    public class PlayerNotFoundException : Exception
    {
        public string Id { get; }
        public PlayerNotFoundException(string id) : base("The specified player is not registered.")
        {
            Id = id;
        }

    }

}
