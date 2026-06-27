using Microsoft.ServiceFabric.Services.Runtime;

namespace ChecklistService
{
    internal static class Program
    {
        private static async Task Main(string[] args)
        {
            try
            {
                await ServiceRuntime.RegisterServiceAsync("ChecklistServiceType",
                    context => new ChecklistService(context));

                ServiceEventSource.Current.ServiceTypeRegistered(
                    Environment.ProcessId, typeof(ChecklistService).Name);

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