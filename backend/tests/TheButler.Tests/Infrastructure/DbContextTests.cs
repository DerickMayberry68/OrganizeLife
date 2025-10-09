using Microsoft.EntityFrameworkCore;
using TheButler.Infrastructure.Data;
using TheButler.Core.Domain.Model;
using FluentAssertions;
using Moq;

namespace TheButler.Tests.Infrastructure;

[TestFixture]
public class DbContextTests
{
    private DbContextOptions<TheButlerDbContext> _options;
    private TheButlerDbContext _context;

    [SetUp]
    public void Setup()
    {
        // Use in-memory database for testing
        _options = new DbContextOptionsBuilder<TheButlerDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new TheButlerDbContext(_options);
    }

    [TearDown]
    public void TearDown()
    {
        _context?.Dispose();
    }

    [Test]
    public void DbContext_Should_Create_Successfully()
    {
        // Arrange & Act
        using var context = new TheButlerDbContext(_options);

        // Assert
        context.Should().NotBeNull();
    }

    [Test]
    public void DbContext_Should_Have_Accounts_DbSet()
    {
        // Arrange & Act
        var accountsDbSet = _context.Accounts;

        // Assert
        accountsDbSet.Should().NotBeNull();
    }

    [Test]
    public void DbContext_Should_Add_And_Retrieve_Household()
    {
        // Arrange
        var household = new Households
        {
            Id = Guid.NewGuid(),
            Name = "Test Household",
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        // Act
        _context.Households.Add(household);
        _context.SaveChanges();

        var retrieved = _context.Households.FirstOrDefault(h => h.Id == household.Id);

        // Assert
        retrieved.Should().NotBeNull();
        retrieved!.Name.Should().Be("Test Household");
        retrieved.IsActive.Should().BeTrue();
    }

    // Note: Transaction test removed because InMemory database doesn't support transactions
    // For real transaction testing, use a TestContainers with PostgreSQL
}

