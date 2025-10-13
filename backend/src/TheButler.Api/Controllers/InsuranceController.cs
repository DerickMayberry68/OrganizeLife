using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TheButler.Api.DTOs;
using TheButler.Core.Domain.Model;
using TheButler.Infrastructure.Data;

namespace TheButler.Api.Controllers;

/// <summary>
/// Controller for managing insurance policies
/// </summary>
[Authorize]
[ApiController]
[Route("api/[controller]")]
public class InsuranceController : ControllerBase
{
    private readonly TheButlerDbContext _context;

    public InsuranceController(TheButlerDbContext context)
    {
        _context = context;
    }

    private Guid GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst("sub")?.Value;
        if (string.IsNullOrEmpty(userIdClaim))
        {
            throw new UnauthorizedAccessException("Invalid token - no user ID found");
        }
        return Guid.Parse(userIdClaim);
    }

    private async Task<bool> IsUserMemberOfHousehold(Guid householdId)
    {
        var userId = GetCurrentUserId();
        return await _context.HouseholdMembers
            .AnyAsync(hm => hm.HouseholdId == householdId 
                         && hm.UserId == userId 
                         && hm.IsActive == true);
    }

    /// <summary>
    /// Get all insurance policies for a household
    /// </summary>
    [HttpGet("household/{householdId}")]
    [ProducesResponseType(typeof(List<InsurancePolicyResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetHouseholdInsurance(
        Guid householdId,
        [FromQuery] Guid? insuranceTypeId = null,
        [FromQuery] bool? isActive = null)
    {
        if (!await IsUserMemberOfHousehold(householdId))
        {
            return Forbid();
        }

        var query = _context.InsurancePolicies
            .Include(ip => ip.InsuranceType)
            .Include(ip => ip.BillingFrequency)
            .Where(ip => ip.HouseholdId == householdId && ip.DeletedAt == null);

        if (insuranceTypeId.HasValue)
            query = query.Where(ip => ip.InsuranceTypeId == insuranceTypeId.Value);

        if (isActive.HasValue)
            query = query.Where(ip => ip.IsActive == isActive.Value);

        var policies = await query
            .OrderBy(ip => ip.RenewalDate)
            .Select(ip => new InsurancePolicyResponseDto(
                ip.Id,
                ip.HouseholdId,
                ip.InsuranceTypeId,
                ip.InsuranceType.Name,
                ip.Provider,
                ip.PolicyNumber,
                ip.Premium,
                ip.BillingFrequencyId,
                ip.BillingFrequency.Name,
                ip.StartDate,
                ip.RenewalDate,
                ip.CoverageAmount,
                ip.Deductible,
                ip.CoverageDetails,
                ip.IsActive ?? true,
                ip.DocumentUrl,
                ip.Notes,
                ip.CreatedAt,
                ip.UpdatedAt
            ))
            .ToListAsync();

        return Ok(policies);
    }

    /// <summary>
    /// Get a specific insurance policy by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(InsurancePolicyResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetInsurancePolicy(Guid id)
    {
        var policy = await _context.InsurancePolicies
            .Include(ip => ip.InsuranceType)
            .Include(ip => ip.BillingFrequency)
            .Where(ip => ip.Id == id && ip.DeletedAt == null)
            .FirstOrDefaultAsync();

        if (policy == null)
        {
            return NotFound(new { Message = "Insurance policy not found" });
        }

        if (!await IsUserMemberOfHousehold(policy.HouseholdId))
        {
            return Forbid();
        }

        var response = new InsurancePolicyResponseDto(
            policy.Id,
            policy.HouseholdId,
            policy.InsuranceTypeId,
            policy.InsuranceType.Name,
            policy.Provider,
            policy.PolicyNumber,
            policy.Premium,
            policy.BillingFrequencyId,
            policy.BillingFrequency.Name,
            policy.StartDate,
            policy.RenewalDate,
            policy.CoverageAmount,
            policy.Deductible,
            policy.CoverageDetails,
            policy.IsActive ?? true,
            policy.DocumentUrl,
            policy.Notes,
            policy.CreatedAt,
            policy.UpdatedAt
        );

        return Ok(response);
    }

    /// <summary>
    /// Create a new insurance policy
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(InsurancePolicyResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreateInsurancePolicy([FromBody] CreateInsurancePolicyDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Provider))
        {
            return BadRequest(new { Message = "Provider is required" });
        }

        if (!await IsUserMemberOfHousehold(dto.HouseholdId))
        {
            return Forbid();
        }

        // Verify insurance type
        var insuranceTypeExists = await _context.InsuranceTypes
            .AnyAsync(it => it.Id == dto.InsuranceTypeId);
        if (!insuranceTypeExists)
        {
            return BadRequest(new { Message = "Invalid insurance type ID" });
        }

        // Verify billing frequency
        var frequencyExists = await _context.Frequencies
            .AnyAsync(f => f.Id == dto.BillingFrequencyId);
        if (!frequencyExists)
        {
            return BadRequest(new { Message = "Invalid billing frequency ID" });
        }

        var userId = GetCurrentUserId();
        var now = DateTime.UtcNow;

        var policy = new InsurancePolicies
        {
            Id = Guid.NewGuid(),
            HouseholdId = dto.HouseholdId,
            InsuranceTypeId = dto.InsuranceTypeId,
            Provider = dto.Provider,
            PolicyNumber = dto.PolicyNumber,
            Premium = dto.Premium,
            BillingFrequencyId = dto.BillingFrequencyId,
            StartDate = dto.StartDate,
            RenewalDate = dto.RenewalDate,
            CoverageAmount = dto.CoverageAmount,
            Deductible = dto.Deductible,
            CoverageDetails = dto.CoverageDetails,
            IsActive = dto.IsActive,
            DocumentUrl = dto.DocumentUrl,
            Notes = dto.Notes,
            CreatedAt = now,
            UpdatedAt = now,
            CreatedBy = userId,
            UpdatedBy = userId
        };

        _context.InsurancePolicies.Add(policy);
        await _context.SaveChangesAsync();

        var createdPolicy = await _context.InsurancePolicies
            .Include(ip => ip.InsuranceType)
            .Include(ip => ip.BillingFrequency)
            .FirstAsync(ip => ip.Id == policy.Id);

        var response = new InsurancePolicyResponseDto(
            createdPolicy.Id,
            createdPolicy.HouseholdId,
            createdPolicy.InsuranceTypeId,
            createdPolicy.InsuranceType.Name,
            createdPolicy.Provider,
            createdPolicy.PolicyNumber,
            createdPolicy.Premium,
            createdPolicy.BillingFrequencyId,
            createdPolicy.BillingFrequency.Name,
            createdPolicy.StartDate,
            createdPolicy.RenewalDate,
            createdPolicy.CoverageAmount,
            createdPolicy.Deductible,
            createdPolicy.CoverageDetails,
            createdPolicy.IsActive ?? true,
            createdPolicy.DocumentUrl,
            createdPolicy.Notes,
            createdPolicy.CreatedAt,
            createdPolicy.UpdatedAt
        );

        return CreatedAtAction(nameof(GetInsurancePolicy), new { id = policy.Id }, response);
    }

    /// <summary>
    /// Update an existing insurance policy
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(InsurancePolicyResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateInsurancePolicy(Guid id, [FromBody] UpdateInsurancePolicyDto dto)
    {
        var policy = await _context.InsurancePolicies
            .Include(ip => ip.InsuranceType)
            .Include(ip => ip.BillingFrequency)
            .Where(ip => ip.Id == id && ip.DeletedAt == null)
            .FirstOrDefaultAsync();

        if (policy == null)
        {
            return NotFound(new { Message = "Insurance policy not found" });
        }

        if (!await IsUserMemberOfHousehold(policy.HouseholdId))
        {
            return Forbid();
        }

        if (dto.InsuranceTypeId.HasValue)
        {
            var insuranceTypeExists = await _context.InsuranceTypes
                .AnyAsync(it => it.Id == dto.InsuranceTypeId.Value);
            if (!insuranceTypeExists)
            {
                return BadRequest(new { Message = "Invalid insurance type ID" });
            }
            policy.InsuranceTypeId = dto.InsuranceTypeId.Value;
        }

        if (dto.BillingFrequencyId.HasValue)
        {
            var frequencyExists = await _context.Frequencies
                .AnyAsync(f => f.Id == dto.BillingFrequencyId.Value);
            if (!frequencyExists)
            {
                return BadRequest(new { Message = "Invalid billing frequency ID" });
            }
            policy.BillingFrequencyId = dto.BillingFrequencyId.Value;
        }

        if (dto.Provider != null) policy.Provider = dto.Provider;
        if (dto.PolicyNumber != null) policy.PolicyNumber = dto.PolicyNumber;
        if (dto.Premium.HasValue) policy.Premium = dto.Premium.Value;
        if (dto.StartDate.HasValue) policy.StartDate = dto.StartDate.Value;
        if (dto.RenewalDate.HasValue) policy.RenewalDate = dto.RenewalDate.Value;
        if (dto.CoverageAmount.HasValue) policy.CoverageAmount = dto.CoverageAmount;
        if (dto.Deductible.HasValue) policy.Deductible = dto.Deductible;
        if (dto.CoverageDetails != null) policy.CoverageDetails = dto.CoverageDetails;
        if (dto.IsActive.HasValue) policy.IsActive = dto.IsActive;
        if (dto.DocumentUrl != null) policy.DocumentUrl = dto.DocumentUrl;
        if (dto.Notes != null) policy.Notes = dto.Notes;

        policy.UpdatedAt = DateTime.UtcNow;
        policy.UpdatedBy = GetCurrentUserId();

        await _context.SaveChangesAsync();

        await _context.Entry(policy).Reference(ip => ip.InsuranceType).LoadAsync();
        await _context.Entry(policy).Reference(ip => ip.BillingFrequency).LoadAsync();

        var response = new InsurancePolicyResponseDto(
            policy.Id,
            policy.HouseholdId,
            policy.InsuranceTypeId,
            policy.InsuranceType.Name,
            policy.Provider,
            policy.PolicyNumber,
            policy.Premium,
            policy.BillingFrequencyId,
            policy.BillingFrequency.Name,
            policy.StartDate,
            policy.RenewalDate,
            policy.CoverageAmount,
            policy.Deductible,
            policy.CoverageDetails,
            policy.IsActive ?? true,
            policy.DocumentUrl,
            policy.Notes,
            policy.CreatedAt,
            policy.UpdatedAt
        );

        return Ok(response);
    }

    /// <summary>
    /// Delete an insurance policy (soft delete)
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteInsurancePolicy(Guid id)
    {
        var policy = await _context.InsurancePolicies
            .Where(ip => ip.Id == id && ip.DeletedAt == null)
            .FirstOrDefaultAsync();

        if (policy == null)
        {
            return NotFound(new { Message = "Insurance policy not found" });
        }

        if (!await IsUserMemberOfHousehold(policy.HouseholdId))
        {
            return Forbid();
        }

        policy.DeletedAt = DateTime.UtcNow;
        policy.UpdatedAt = DateTime.UtcNow;
        policy.UpdatedBy = GetCurrentUserId();

        await _context.SaveChangesAsync();

        return NoContent();
    }

    /// <summary>
    /// Get insurance summary for a household
    /// </summary>
    [HttpGet("household/{householdId}/summary")]
    [ProducesResponseType(typeof(InsuranceSummaryDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetInsuranceSummary(Guid householdId)
    {
        if (!await IsUserMemberOfHousehold(householdId))
        {
            return Forbid();
        }

        var policies = await _context.InsurancePolicies
            .Include(ip => ip.InsuranceType)
            .Include(ip => ip.BillingFrequency)
            .Where(ip => ip.HouseholdId == householdId && ip.DeletedAt == null)
            .ToListAsync();

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var next90Days = today.AddDays(90);

        var totalPolicies = policies.Count;
        var activePolicies = policies.Count(p => p.IsActive == true);
        
        // Calculate total monthly cost
        decimal totalMonthlyCost = 0;
        foreach (var policy in policies.Where(p => p.IsActive == true))
        {
            var frequencyName = policy.BillingFrequency.Name?.ToLower() ?? "";
            if (frequencyName.Contains("month"))
                totalMonthlyCost += policy.Premium;
            else if (frequencyName.Contains("year"))
                totalMonthlyCost += policy.Premium / 12;
            else if (frequencyName.Contains("quarter"))
                totalMonthlyCost += policy.Premium / 3;
        }

        var totalYearlyCost = totalMonthlyCost * 12;
        var totalCoverageAmount = policies.Where(p => p.CoverageAmount.HasValue).Sum(p => p.CoverageAmount!.Value);
        var policiesNeedingRenewal = policies.Count(p => p.RenewalDate >= today && p.RenewalDate <= next90Days);

        var upcomingRenewals = policies
            .Where(p => p.RenewalDate >= today && p.RenewalDate <= next90Days)
            .OrderBy(p => p.RenewalDate)
            .Select(p => new RenewalReminderDto(
                p.Id,
                p.Provider,
                p.PolicyNumber,
                p.InsuranceType.Name,
                p.RenewalDate,
                p.RenewalDate.DayNumber - today.DayNumber,
                p.Premium
            ))
            .ToList();

        var summary = new InsuranceSummaryDto(
            totalPolicies,
            activePolicies,
            totalMonthlyCost,
            totalYearlyCost,
            totalCoverageAmount,
            policiesNeedingRenewal,
            upcomingRenewals
        );

        return Ok(summary);
    }

    // ==================== INSURANCE BENEFICIARIES ====================

    /// <summary>
    /// Get all beneficiaries for an insurance policy
    /// </summary>
    [HttpGet("{policyId}/beneficiaries")]
    [ProducesResponseType(typeof(List<BeneficiaryResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetBeneficiaries(Guid policyId)
    {
        var policy = await _context.InsurancePolicies
            .Where(ip => ip.Id == policyId && ip.DeletedAt == null)
            .FirstOrDefaultAsync();

        if (policy == null)
            return NotFound(new { message = "Insurance policy not found" });

        if (!await IsUserMemberOfHousehold(policy.HouseholdId))
            return Forbid();

        var beneficiaries = await _context.InsuranceBeneficiaries
            .Where(ib => ib.InsurancePolicyId == policyId)
            .Select(ib => new BeneficiaryResponseDto
            {
                Id = ib.Id,
                InsurancePolicyId = ib.InsurancePolicyId,
                Name = ib.Name,
                Relationship = ib.Relationship,
                Percentage = ib.Percentage,
                ContactInfo = ib.ContactInfo,
                CreatedAt = ib.CreatedAt,
                UpdatedAt = ib.UpdatedAt
            })
            .ToListAsync();

        return Ok(beneficiaries);
    }

    /// <summary>
    /// Add a beneficiary to an insurance policy
    /// </summary>
    [HttpPost("{policyId}/beneficiaries")]
    [ProducesResponseType(typeof(BeneficiaryResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> AddBeneficiary(Guid policyId, [FromBody] CreateBeneficiaryDto dto)
    {
        var policy = await _context.InsurancePolicies
            .Where(ip => ip.Id == policyId && ip.DeletedAt == null)
            .FirstOrDefaultAsync();

        if (policy == null)
            return NotFound(new { message = "Insurance policy not found" });

        if (!await IsUserMemberOfHousehold(policy.HouseholdId))
            return Forbid();

        var userId = GetCurrentUserId();
        var now = DateTime.UtcNow;

        var beneficiary = new InsuranceBeneficiaries
        {
            Id = Guid.NewGuid(),
            InsurancePolicyId = policyId,
            Name = dto.Name,
            Relationship = dto.Relationship,
            Percentage = dto.Percentage,
            ContactInfo = dto.ContactInfo,
            CreatedAt = now,
            CreatedBy = userId,
            UpdatedAt = now,
            UpdatedBy = userId
        };

        _context.InsuranceBeneficiaries.Add(beneficiary);
        await _context.SaveChangesAsync();

        var response = new BeneficiaryResponseDto
        {
            Id = beneficiary.Id,
            InsurancePolicyId = beneficiary.InsurancePolicyId,
            Name = beneficiary.Name,
            Relationship = beneficiary.Relationship,
            Percentage = beneficiary.Percentage,
            ContactInfo = beneficiary.ContactInfo,
            CreatedAt = beneficiary.CreatedAt,
            UpdatedAt = beneficiary.UpdatedAt
        };

        return CreatedAtAction(nameof(GetBeneficiaries), new { policyId = policyId }, response);
    }

    /// <summary>
    /// Update a beneficiary
    /// </summary>
    [HttpPut("beneficiaries/{id}")]
    [ProducesResponseType(typeof(BeneficiaryResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateBeneficiary(Guid id, [FromBody] UpdateBeneficiaryDto dto)
    {
        var beneficiary = await _context.InsuranceBeneficiaries
            .Include(ib => ib.InsurancePolicy)
            .Where(ib => ib.Id == id)
            .FirstOrDefaultAsync();

        if (beneficiary == null)
            return NotFound(new { message = "Beneficiary not found" });

        if (!await IsUserMemberOfHousehold(beneficiary.InsurancePolicy.HouseholdId))
            return Forbid();

        if (dto.Name != null) beneficiary.Name = dto.Name;
        if (dto.Relationship != null) beneficiary.Relationship = dto.Relationship;
        if (dto.Percentage.HasValue) beneficiary.Percentage = dto.Percentage;
        if (dto.ContactInfo != null) beneficiary.ContactInfo = dto.ContactInfo;

        beneficiary.UpdatedAt = DateTime.UtcNow;
        beneficiary.UpdatedBy = GetCurrentUserId();

        await _context.SaveChangesAsync();

        var response = new BeneficiaryResponseDto
        {
            Id = beneficiary.Id,
            InsurancePolicyId = beneficiary.InsurancePolicyId,
            Name = beneficiary.Name,
            Relationship = beneficiary.Relationship,
            Percentage = beneficiary.Percentage,
            ContactInfo = beneficiary.ContactInfo,
            CreatedAt = beneficiary.CreatedAt,
            UpdatedAt = beneficiary.UpdatedAt
        };

        return Ok(response);
    }

    /// <summary>
    /// Delete a beneficiary
    /// </summary>
    [HttpDelete("beneficiaries/{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteBeneficiary(Guid id)
    {
        var beneficiary = await _context.InsuranceBeneficiaries
            .Include(ib => ib.InsurancePolicy)
            .Where(ib => ib.Id == id)
            .FirstOrDefaultAsync();

        if (beneficiary == null)
            return NotFound(new { message = "Beneficiary not found" });

        if (!await IsUserMemberOfHousehold(beneficiary.InsurancePolicy.HouseholdId))
            return Forbid();

        _context.InsuranceBeneficiaries.Remove(beneficiary);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}

public record BeneficiaryResponseDto
{
    public Guid Id { get; init; }
    public Guid InsurancePolicyId { get; init; }
    public string Name { get; init; } = null!;
    public string? Relationship { get; init; }
    public decimal? Percentage { get; init; }
    public string? ContactInfo { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime UpdatedAt { get; init; }
}

public record CreateBeneficiaryDto
{
    public string Name { get; init; } = null!;
    public string? Relationship { get; init; }
    public decimal? Percentage { get; init; }
    public string? ContactInfo { get; init; }
}

public record UpdateBeneficiaryDto
{
    public string? Name { get; init; }
    public string? Relationship { get; init; }
    public decimal? Percentage { get; init; }
    public string? ContactInfo { get; init; }
}

