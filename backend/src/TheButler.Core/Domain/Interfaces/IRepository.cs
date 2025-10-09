using System.Linq.Expressions;
using System.Security.Principal;

namespace TheButler.Core.Domain.Interfaces
{
    public interface IRepository
    {
        T Get<T>(Expression<Func<T, bool>> predicate) where T : class, IEntity;
        IQueryable<T> Find<T>(Expression<Func<T, bool>> predicate) where T : class, IEntity;
        IQueryable<T> Find<T>() where T : class, IEntity;
        T Save<T>(T entity) where T : class, IEntity;
        void Delete<T>(T entity) where T : class, IEntity;
        void Update<T>(T Entity) where T : class, IEntity;
        void SubmitChanges();
        void BatchSave<T>(List<T> batch) where T : class, IEntity;

        Task<T> GetAsync<T>(Expression<Func<T, bool>> predicate) where T : class, IEntity;
        Task<T> SaveAsync<T>(T entity) where T : class, IEntity;
        Task DeleteAsync<T>(T entity) where T : class, IEntity;
        Task UpdateAsync<T>(T entity) where T : class, IEntity;
        Task BatchSaveAsync<T>(List<T> batch) where T : class, IEntity;
        Task<List<T>> GetAllAsync<T>() where T : class, IEntity;
        Task<List<T>> GetListAsync<T>(Expression<Func<T, bool>> predicate) where T : class, IEntity;
    }
}
