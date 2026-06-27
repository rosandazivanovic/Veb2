using System;
using System.Diagnostics;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.ServiceFabric.Services.Runtime;

namespace UserService
{
    internal static class Program
    {
        private static async Task Main(string[] args)
        {
            if (Environment.CommandLine.Contains("ef"))
                return;

            try
            {
                await ServiceRuntime.RegisterServiceAsync("UserServiceType",
                    context => new UserService(context));

                ServiceEventSource.Current.ServiceTypeRegistered(
                    Process.GetCurrentProcess().Id, typeof(UserService).Name);

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