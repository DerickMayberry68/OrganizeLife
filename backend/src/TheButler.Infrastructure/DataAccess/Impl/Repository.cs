using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;
using TheButler.Core.Domain.Interfaces;

namespace TheButler.Infrastructure.DataAccess.Impl
{
    public class Repository
    {
        private readonly IDbContext _dbContext;
        public Repository(IDbContext dbContext) => _dbContext = dbContext;

        public T Get<T>(Expression<Func<T, bool>> predicate) where T : class, IEntity => Find(predicate).FirstOrDefault();

        public Task<List<T>> FindAsync<T>(Expression<Func<T, bool>> predicate) where T : class, IEntity => Find<T>(predicate).ToListAsync();
        public Task<List<T>> FindASync<T>() where T : class, IEntity => _dbContext.Set<T>().ToListAsync();

        public IQueryable<T> Find<T>(Expression<Func<T, bool>> predicate) where T : class, IEntity => Find<T>().Where(predicate);

        public IQueryable<T> Find<T>() where T : class, IEntity => _dbContext.Set<T>();

        public T Save<T>(T entity) where T : class, IEntity
        {
            _dbContext.Set<T>().Add(entity);
            return entity;
        }

        public void Delete<T>(T entity) where T : class, IEntity => _dbContext.Set<T>().Remove(entity);

        public void Update<T>(T entity) where T : class, IEntity => _dbContext.Entry(entity).State = Microsoft.EntityFrameworkCore.EntityState.Modified;

        public void SubmitChanges() => _dbContext.SaveChanges();

        public void BatchSave<T>(List<T> batch) where T : class, IEntity => _dbContext.Set<T>().AddRange(batch);

        public async Task<T> GetAsync<T>(Expression<Func<T, bool>> predicate) where T : class, IEntity => await _dbContext.Set<T>().FirstOrDefaultAsync(predicate);

        public async Task<T> SaveAsync<T>(T entity) where T : class, IEntity
        {
            await _dbContext.Set<T>().AddAsync(entity);
            return entity;
        }

        public async Task DeleteAsync<T>(T entity) where T : class, IEntity
        {
            _dbContext.Set<T>().Remove(entity);
            await Task.CompletedTask; // No async operation, but return Task for consistency
        }

        public async Task UpdateAsync<T>(T entity) where T : class, IEntity
        {
            _dbContext.Entry(entity).State = EntityState.Modified;
            await Task.CompletedTask; // No async operation, but return Task for consistency
        }

        public async Task BatchSaveAsync<T>(List<T> batch) where T : class, IEntity
        {
            await _dbContext.Set<T>().AddRangeAsync(batch);
        }

        public async Task<List<T>> GetAllAsync<T>() where T : class, IEntity
        {
            return await _dbContext.Set<T>().ToListAsync();
        }

        public async Task<List<T>> GetListAsync<T>(Expression<Func<T, bool>> predicate) where T : class, IEntity
        {
            return await _dbContext.Set<T>().Where(predicate).ToListAsync();
        }
    }
}
