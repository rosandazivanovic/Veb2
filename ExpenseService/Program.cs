using ExpenseService;
using Microsoft.ServiceFabric.Services.Runtime;

namespace ExpenseService
{
    internal static class Program
    {
        private static async Task Main(string[] args)
        {
            try
            {
                await ServiceRuntime.RegisterServiceAsync("ExpenseServiceType",
                    context => new ExpenseService(context));

                ServiceEventSource.Current.ServiceTypeRegistered(
                    Environment.ProcessId, typeof(ExpenseService).Name);

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