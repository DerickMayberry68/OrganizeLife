using TheButler.Core.Domain.Model;
using FluentAssertions;

namespace TheButler.Tests.Core;

[TestFixture]
public class HouseholdTests
{
    [Test]
    public void Household_Should_Initialize_With_Properties()
    {
        // Arrange
        var id = Guid.NewGuid();
        var name = "Smith Family";
        var now = DateTime.UtcNow;

        // Act
        var household = new Households
        {
            Id = id,
            Name = name,
            AddressLine1 = "123 Main St",
            City = "Springfield",
            State = "IL",
            PostalCode = "62701",
            Country = "USA",
            IsActive = true,
            CreatedAt = now,
            UpdatedAt = now
        };

        // Assert
        household.Id.Should().Be(id);
        household.Name.Should().Be(name);
        household.AddressLine1.Should().Be("123 Main St");
        household.City.Should().Be("Springfield");
        household.State.Should().Be("IL");
        household.PostalCode.Should().Be("62701");
        household.Country.Should().Be("USA");
        household.IsActive.Should().BeTrue();
        household.CreatedAt.Should().Be(now);
        household.UpdatedAt.Should().Be(now);
    }

    [Test]
    public void Household_Should_Support_Navigation_Properties()
    {
        // Arrange & Act
        var household = new Households
        {
            Id = Guid.NewGuid(),
            Name = "Test Household",
            Accounts = new List<Accounts>(),
            Bills = new List<Bills>(),
            HouseholdMembers = new List<HouseholdMembers>()
        };

        // Assert
        household.Accounts.Should().NotBeNull();
        household.Bills.Should().NotBeNull();
        household.HouseholdMembers.Should().NotBeNull();
    }
}

