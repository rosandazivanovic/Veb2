using System;
using System.Diagnostics;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.ServiceFabric.Services.Runtime;

namespace TravelService
{
    internal static class Program
    {
        private static async Task Main(string[] args)
        {
            try
            {
                await ServiceRuntime.RegisterServiceAsync("TravelServiceType",
                    context => new TravelService(context));

                ServiceEventSource.Current.ServiceTypeRegistered(
                    Process.GetCurrentProcess().Id, typeof(TravelService).Name);

                Thread.Sleep(Timeout.Infinite);
            }
            catch (Exception e)
            {
                ServiceEventSource.Current.ServiceHostInitializationFailed(e.ToString());
                throw;
            }

        }
    }
}