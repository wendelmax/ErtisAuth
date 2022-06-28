using System;
using System.Threading.Tasks;
using Ertis.Core.Collections;
using Ertis.MongoDB.Queries;
using ErtisAuth.Events.EventArgs;

namespace ErtisAuth.Abstractions.Services.Interfaces
{
	public interface IGenericCrudService<T>
	{
		#region Events

		event EventHandler<CreateResourceEventArgs<T>> OnCreated;
		
		event EventHandler<UpdateResourceEventArgs<T>> OnUpdated;
		
		event EventHandler<DeleteResourceEventArgs<T>> OnDeleted;

		#endregion
		
		#region Methods

		T Get(string id);
		
		ValueTask<T> GetAsync(string id);

		IPaginationCollection<T> Get(int? skip = null, int? limit = null, bool withCount = false, string orderBy = null, SortDirection? sortDirection = null);
		
		ValueTask<IPaginationCollection<T>> GetAsync(int? skip = null, int? limit = null, bool withCount = false, string orderBy = null, SortDirection? sortDirection = null);
		
		IPaginationCollection<T> Search(
			string keyword, 
			TextSearchOptions options = null,
			int? skip = null, 
			int? limit = null,
			bool? withCount = null, 
			string sortField = null, 
			SortDirection? sortDirection = null);
		
		ValueTask<IPaginationCollection<T>> SearchAsync(
			string keyword, 
			TextSearchOptions options = null,
			int? skip = null, 
			int? limit = null,
			bool? withCount = null, 
			string sortField = null, 
			SortDirection? sortDirection = null);
		
		T Create(T model);
		
		ValueTask<T> CreateAsync(T model);

		T Update(T model);
		
		ValueTask<T> UpdateAsync(T model);

		bool Delete(string id);

		ValueTask<bool> DeleteAsync(string id);

		#endregion
	}
}