namespace TheButler.Api.DTOs;

#region Healthcare Providers DTOs

/// <summary>
/// Request DTO for creating a healthcare provider
/// </summary>
public record CreateHealthcareProviderDto(
    Guid HouseholdId,
    string Name,
    string? ProviderType = null,
    string? Specialty = null,
    string? PhoneNumber = null,
    string? Email = null,
    string? Website = null,
    string? AddressLine1 = null,
    string? AddressLine2 = null,
    string? City = null,
    string? State = null,
    string? PostalCode = null,
    string? Country = null,
    string? Notes = null,
    bool IsActive = true
);

/// <summary>
/// Request DTO for updating a healthcare provider
/// </summary>
public record UpdateHealthcareProviderDto(
    string? Name = null,
    string? ProviderType = null,
    string? Specialty = null,
    string? PhoneNumber = null,
    string? Email = null,
    string? Website = null,
    string? AddressLine1 = null,
    string? AddressLine2 = null,
    string? City = null,
    string? State = null,
    string? PostalCode = null,
    string? Country = null,
    string? Notes = null,
    bool? IsActive = null
);

/// <summary>
/// Response DTO for healthcare provider details
/// </summary>
public record HealthcareProviderResponseDto(
    Guid Id,
    Guid HouseholdId,
    string Name,
    string? ProviderType,
    string? Specialty,
    string? PhoneNumber,
    string? Email,
    string? Website,
    string? AddressLine1,
    string? AddressLine2,
    string? City,
    string? State,
    string? PostalCode,
    string? Country,
    string? Notes,
    bool IsActive,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

#endregion

#region Medical Records DTOs

/// <summary>
/// Request DTO for creating a medical record
/// </summary>
public record CreateMedicalRecordDto(
    Guid HouseholdId,
    Guid HouseholdMemberId,
    Guid? ProviderId,
    DateOnly RecordDate,
    string RecordType,
    string? Diagnosis = null,
    string? Treatment = null,
    string? Medications = null,
    string? TestResults = null,
    string? FollowUpInstructions = null,
    DateOnly? FollowUpDate = null,
    string? DocumentUrl = null,
    string? Notes = null
);

/// <summary>
/// Request DTO for updating a medical record
/// </summary>
public record UpdateMedicalRecordDto(
    Guid? ProviderId = null,
    DateOnly? RecordDate = null,
    string? RecordType = null,
    string? Diagnosis = null,
    string? Treatment = null,
    string? Medications = null,
    string? TestResults = null,
    string? FollowUpInstructions = null,
    DateOnly? FollowUpDate = null,
    string? DocumentUrl = null,
    string? Notes = null
);

/// <summary>
/// Response DTO for medical record details
/// </summary>
public record MedicalRecordResponseDto(
    Guid Id,
    Guid HouseholdId,
    Guid HouseholdMemberId,
    string? HouseholdMemberName,
    Guid? ProviderId,
    string? ProviderName,
    DateOnly RecordDate,
    string RecordType,
    string? Diagnosis,
    string? Treatment,
    string? Medications,
    string? TestResults,
    string? FollowUpInstructions,
    DateOnly? FollowUpDate,
    string? DocumentUrl,
    string? Notes,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

#endregion

#region Medications DTOs

/// <summary>
/// Request DTO for creating a medication
/// </summary>
public record CreateMedicationDto(
    Guid HouseholdId,
    Guid HouseholdMemberId,
    Guid? ProviderId,
    string Name,
    string? GenericName = null,
    string? Dosage = null,
    string? Frequency = null,
    string? Route = null,
    string? Reason = null,
    DateOnly? StartDate = null,
    DateOnly? EndDate = null,
    bool IsActive = true,
    bool IsPrescription = false,
    string? PrescriptionNumber = null,
    int? RefillsRemaining = null,
    string? Pharmacy = null,
    string? PharmacyPhone = null,
    string? SideEffects = null,
    string? Instructions = null,
    string? Notes = null
);

/// <summary>
/// Request DTO for updating a medication
/// </summary>
public record UpdateMedicationDto(
    Guid? ProviderId = null,
    string? Name = null,
    string? GenericName = null,
    string? Dosage = null,
    string? Frequency = null,
    string? Route = null,
    string? Reason = null,
    DateOnly? StartDate = null,
    DateOnly? EndDate = null,
    bool? IsActive = null,
    bool? IsPrescription = null,
    string? PrescriptionNumber = null,
    int? RefillsRemaining = null,
    string? Pharmacy = null,
    string? PharmacyPhone = null,
    string? SideEffects = null,
    string? Instructions = null,
    string? Notes = null
);

/// <summary>
/// Response DTO for medication details
/// </summary>
public record MedicationResponseDto(
    Guid Id,
    Guid HouseholdId,
    Guid HouseholdMemberId,
    string? HouseholdMemberName,
    Guid? ProviderId,
    string? ProviderName,
    string Name,
    string? GenericName,
    string? Dosage,
    string? Frequency,
    string? Route,
    string? Reason,
    DateOnly? StartDate,
    DateOnly? EndDate,
    bool IsActive,
    bool IsPrescription,
    string? PrescriptionNumber,
    int? RefillsRemaining,
    string? Pharmacy,
    string? PharmacyPhone,
    string? SideEffects,
    string? Instructions,
    string? Notes,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

#endregion

#region Medication Schedules DTOs

/// <summary>
/// Request DTO for creating a medication schedule
/// </summary>
public record CreateMedicationScheduleDto(
    Guid MedicationId,
    TimeOnly ScheduledTime,
    string? DayOfWeek = null,
    bool IsActive = true,
    bool ReminderEnabled = true,
    int ReminderMinutesBefore = 30,
    string? Notes = null
);

/// <summary>
/// Request DTO for updating a medication schedule
/// </summary>
public record UpdateMedicationScheduleDto(
    TimeOnly? ScheduledTime = null,
    string? DayOfWeek = null,
    bool? IsActive = null,
    bool? ReminderEnabled = null,
    int? ReminderMinutesBefore = null,
    string? Notes = null
);

/// <summary>
/// Response DTO for medication schedule details
/// </summary>
public record MedicationScheduleResponseDto(
    Guid Id,
    Guid MedicationId,
    string? MedicationName,
    TimeOnly ScheduledTime,
    string? DayOfWeek,
    bool IsActive,
    bool ReminderEnabled,
    int? ReminderMinutesBefore,
    string? Notes,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

#endregion

#region Appointments DTOs

/// <summary>
/// Request DTO for creating an appointment
/// </summary>
public record CreateAppointmentDto(
    Guid HouseholdId,
    Guid HouseholdMemberId,
    Guid? ProviderId,
    DateOnly AppointmentDate,
    TimeOnly? AppointmentTime,
    string? AppointmentType = null,
    string? Reason = null,
    string Status = "scheduled",
    string? Location = null,
    string? ProviderName = null,
    int ReminderDays = 1,
    bool ReminderEnabled = true,
    string? PrepInstructions = null,
    string? FollowUpNotes = null,
    string? Notes = null
);

/// <summary>
/// Request DTO for updating an appointment
/// </summary>
public record UpdateAppointmentDto(
    Guid? ProviderId = null,
    DateOnly? AppointmentDate = null,
    TimeOnly? AppointmentTime = null,
    string? AppointmentType = null,
    string? Reason = null,
    string? Status = null,
    string? Location = null,
    string? ProviderName = null,
    int? ReminderDays = null,
    bool? ReminderEnabled = null,
    string? PrepInstructions = null,
    string? FollowUpNotes = null,
    string? Notes = null
);

/// <summary>
/// Response DTO for appointment details
/// </summary>
public record AppointmentResponseDto(
    Guid Id,
    Guid HouseholdId,
    Guid HouseholdMemberId,
    string? HouseholdMemberName,
    Guid? ProviderId,
    string? ProviderName,
    DateOnly AppointmentDate,
    TimeOnly? AppointmentTime,
    string? AppointmentType,
    string? Reason,
    string Status,
    string? Location,
    int? ReminderDays,
    bool ReminderEnabled,
    string? PrepInstructions,
    string? FollowUpNotes,
    string? Notes,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

/// <summary>
/// Response DTO for upcoming appointments
/// </summary>
public record UpcomingAppointmentDto(
    Guid Id,
    string? HouseholdMemberName,
    DateOnly AppointmentDate,
    TimeOnly? AppointmentTime,
    string? AppointmentType,
    string? ProviderName,
    int DaysUntilAppointment,
    string Status
);

#endregion

#region Vaccinations DTOs

/// <summary>
/// Request DTO for creating a vaccination record
/// </summary>
public record CreateVaccinationDto(
    Guid HouseholdId,
    Guid HouseholdMemberId,
    Guid? ProviderId,
    string VaccineName,
    DateOnly DateAdministered,
    string? DoseNumber = null,
    string? LotNumber = null,
    string? Site = null,
    string? Route = null,
    DateOnly? NextDoseDate = null,
    bool IsUpToDate = true,
    string? AdministeredBy = null,
    string? Location = null,
    string? Reactions = null,
    string? DocumentUrl = null,
    string? Notes = null
);

/// <summary>
/// Request DTO for updating a vaccination record
/// </summary>
public record UpdateVaccinationDto(
    Guid? ProviderId = null,
    string? VaccineName = null,
    DateOnly? DateAdministered = null,
    string? DoseNumber = null,
    string? LotNumber = null,
    string? Site = null,
    string? Route = null,
    DateOnly? NextDoseDate = null,
    bool? IsUpToDate = null,
    string? AdministeredBy = null,
    string? Location = null,
    string? Reactions = null,
    string? DocumentUrl = null,
    string? Notes = null
);

/// <summary>
/// Response DTO for vaccination details
/// </summary>
public record VaccinationResponseDto(
    Guid Id,
    Guid HouseholdId,
    Guid HouseholdMemberId,
    string? HouseholdMemberName,
    Guid? ProviderId,
    string? ProviderName,
    string VaccineName,
    DateOnly DateAdministered,
    string? DoseNumber,
    string? LotNumber,
    string? Site,
    string? Route,
    DateOnly? NextDoseDate,
    bool IsUpToDate,
    string? AdministeredBy,
    string? Location,
    string? Reactions,
    string? DocumentUrl,
    string? Notes,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

#endregion

#region Allergies DTOs

/// <summary>
/// Request DTO for creating an allergy record
/// </summary>
public record CreateAllergyDto(
    Guid HouseholdId,
    Guid HouseholdMemberId,
    string AllergyType,
    string Allergen,
    string? Severity = null,
    string? Reaction = null,
    DateOnly? DiagnosedDate = null,
    string? Treatment = null,
    bool IsActive = true,
    string? Notes = null
);

/// <summary>
/// Request DTO for updating an allergy record
/// </summary>
public record UpdateAllergyDto(
    string? AllergyType = null,
    string? Allergen = null,
    string? Severity = null,
    string? Reaction = null,
    DateOnly? DiagnosedDate = null,
    string? Treatment = null,
    bool? IsActive = null,
    string? Notes = null
);

/// <summary>
/// Response DTO for allergy details
/// </summary>
public record AllergyResponseDto(
    Guid Id,
    Guid HouseholdId,
    Guid HouseholdMemberId,
    string? HouseholdMemberName,
    string AllergyType,
    string Allergen,
    string? Severity,
    string? Reaction,
    DateOnly? DiagnosedDate,
    string? Treatment,
    bool IsActive,
    string? Notes,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

#endregion

#region Health Metrics DTOs

/// <summary>
/// Request DTO for creating a health metric
/// </summary>
public record CreateHealthMetricDto(
    Guid HouseholdId,
    Guid HouseholdMemberId,
    DateOnly RecordDate,
    TimeOnly? RecordTime,
    string MetricType,
    decimal? Value = null,
    string? Unit = null,
    decimal? Weight = null,
    decimal? Height = null,
    decimal? Bmi = null,
    int? BloodPressureSystolic = null,
    int? BloodPressureDiastolic = null,
    int? HeartRate = null,
    decimal? Temperature = null,
    int? BloodGlucose = null,
    int? OxygenSaturation = null,
    string? Notes = null
);

/// <summary>
/// Request DTO for updating a health metric
/// </summary>
public record UpdateHealthMetricDto(
    DateOnly? RecordDate = null,
    TimeOnly? RecordTime = null,
    string? MetricType = null,
    decimal? Value = null,
    string? Unit = null,
    decimal? Weight = null,
    decimal? Height = null,
    decimal? Bmi = null,
    int? BloodPressureSystolic = null,
    int? BloodPressureDiastolic = null,
    int? HeartRate = null,
    decimal? Temperature = null,
    int? BloodGlucose = null,
    int? OxygenSaturation = null,
    string? Notes = null
);

/// <summary>
/// Response DTO for health metric details
/// </summary>
public record HealthMetricResponseDto(
    Guid Id,
    Guid HouseholdId,
    Guid HouseholdMemberId,
    string? HouseholdMemberName,
    DateOnly RecordDate,
    TimeOnly? RecordTime,
    string MetricType,
    decimal? Value,
    string? Unit,
    decimal? Weight,
    decimal? Height,
    decimal? Bmi,
    int? BloodPressureSystolic,
    int? BloodPressureDiastolic,
    int? HeartRate,
    decimal? Temperature,
    int? BloodGlucose,
    int? OxygenSaturation,
    string? Notes,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

/// <summary>
/// Response DTO for health metrics summary
/// </summary>
public record HealthMetricsSummaryDto(
    Guid HouseholdMemberId,
    string? HouseholdMemberName,
    decimal? LatestWeight,
    decimal? LatestHeight,
    decimal? LatestBmi,
    int? LatestBloodPressureSystolic,
    int? LatestBloodPressureDiastolic,
    int? LatestHeartRate,
    decimal? LatestTemperature,
    int? LatestBloodGlucose,
    int? LatestOxygenSaturation,
    DateOnly? LastRecordDate
);

#endregion

#region Healthcare Summary DTOs

/// <summary>
/// Response DTO for household healthcare summary
/// </summary>
public record HealthcareSummaryDto(
    int TotalProviders,
    int TotalActiveProviders,
    int TotalMedicalRecords,
    int TotalActiveMedications,
    int UpcomingAppointments,
    int TotalVaccinations,
    int TotalActiveAllergies,
    List<UpcomingAppointmentDto> NextAppointments
);

#endregion

