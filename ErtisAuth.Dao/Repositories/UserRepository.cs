using Ertis.Data.Repository;
using Ertis.MongoDB.Client;
using Ertis.MongoDB.Configuration;
using Ertis.MongoDB.Models;
using ErtisAuth.Dao.Repositories.Interfaces;

namespace ErtisAuth.Dao.Repositories
{
    public class UserRepository : DynamicRepositoryBase, IUserRepository
    {
        #region Properties
        
        protected override IIndexDefinition[] Indexes => new IIndexDefinition[]
        {
            new CompoundIndexDefinition("membership_id", "username"),
            new CompoundIndexDefinition("membership_id", "email_address")
        };

        #endregion
        
        #region Constructors

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="clientProvider"></param>
        /// <param name="settings"></param>
        /// <param name="actionBinder"></param>
        public UserRepository(IMongoClientProvider clientProvider, IDatabaseSettings settings, IRepositoryActionBinder actionBinder) : 
            base(clientProvider, settings, "users", actionBinder)
        {
            
        }

        #endregion
    }
}