using Microsoft.ServiceFabric.Data;
using Microsoft.ServiceFabric.Data.Collections;
using System;
using System.Threading;
using System.Threading.Tasks;
using TravelService.Models;

namespace TravelService.Services
{
    public class TokenCacheService
    {
        private readonly IReliableStateManager _stateManager;
        private const string DictionaryName = "sharedPlanTokens";

        public TokenCacheService(IReliableStateManager stateManager)
        {
            _stateManager = stateManager;
        }

        private async Task<IReliableDictionary<string, SharedPlanCacheEntry>> GetDictionaryAsync()
        {
            return await _stateManager.GetOrAddAsync<IReliableDictionary<string, SharedPlanCacheEntry>>(DictionaryName);
        }

        public async Task SetAsync(string token, SharedPlanCacheEntry entry)
        {
            var dict = await GetDictionaryAsync();
            using var tx = _stateManager.CreateTransaction();
            await dict.SetAsync(tx, token, entry);
            await tx.CommitAsync();
        }

  
        public async Task<SharedPlanCacheEntry?> GetAsync(string token)
        {
            var dict = await GetDictionaryAsync();
            using var tx = _stateManager.CreateTransaction();
            var result = await dict.TryGetValueAsync(tx, token);

            if (!result.HasValue)
                return null;

            var entry = result.Value;

            if (entry.ExpiresAt <= DateTime.UtcNow)
            {
                await dict.TryRemoveAsync(tx, token);
                await tx.CommitAsync();
                return null;
            }

            await tx.CommitAsync();
            return entry;
        }

 
        public async Task RemoveByPlanIdAsync(int planId)
        {
            var dict = await GetDictionaryAsync();
            using var tx = _stateManager.CreateTransaction();

            var toRemove = new System.Collections.Generic.List<string>();

            var enumerable = await dict.CreateEnumerableAsync(tx);
            var enumerator = enumerable.GetAsyncEnumerator();

            using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(10));
            while (await enumerator.MoveNextAsync(cts.Token))
            {
                if (enumerator.Current.Value.TravelPlanId == planId)
                    toRemove.Add(enumerator.Current.Key);
            }

            foreach (var key in toRemove)
                await dict.TryRemoveAsync(tx, key);

            await tx.CommitAsync();
        }


        public async Task RemoveByPlanIdsAsync(System.Collections.Generic.IEnumerable<int> planIds)
        {
            var planIdSet = new System.Collections.Generic.HashSet<int>(planIds);
            var dict = await GetDictionaryAsync();
            using var tx = _stateManager.CreateTransaction();

            var toRemove = new System.Collections.Generic.List<string>();

            var enumerable = await dict.CreateEnumerableAsync(tx);
            var enumerator = enumerable.GetAsyncEnumerator();

            using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(10));
            while (await enumerator.MoveNextAsync(cts.Token))
            {
                if (planIdSet.Contains(enumerator.Current.Value.TravelPlanId))
                    toRemove.Add(enumerator.Current.Key);
            }

            foreach (var key in toRemove)
                await dict.TryRemoveAsync(tx, key);

            await tx.CommitAsync();
        }
    }
}