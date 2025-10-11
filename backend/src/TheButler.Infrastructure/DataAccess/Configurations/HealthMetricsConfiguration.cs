using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TheButler.Core.Domain.Model;

namespace TheButler.Infrastructure.DataAccess.Configurations;

public class HealthMetricsConfiguration : IEntityTypeConfiguration<HealthMetrics>
{
    public void Configure(EntityTypeBuilder<HealthMetrics> builder)
    {
        builder.HasKey(e => e.Id).HasName("health_metrics_pkey");

        builder.ToTable("health_metrics", tb => tb.HasComment("Health metrics and vital signs tracking for household members."));

        builder.HasIndex(e => e.HouseholdId, "idx_health_metrics_household");

        builder.HasIndex(e => e.HouseholdMemberId, "idx_health_metrics_member");

        builder.HasIndex(e => e.RecordDate, "idx_health_metrics_date");

        builder.HasIndex(e => e.MetricType, "idx_health_metrics_type");

        builder.Property(e => e.Id)
            .HasDefaultValueSql("uuid_generate_v4()")
            .HasColumnName("id");
        builder.Property(e => e.HouseholdId).HasColumnName("household_id");
        builder.Property(e => e.HouseholdMemberId).HasColumnName("household_member_id");
        builder.Property(e => e.RecordDate).HasColumnName("record_date");
        builder.Property(e => e.RecordTime).HasColumnName("record_time");
        builder.Property(e => e.MetricType)
            .HasMaxLength(100)
            .HasColumnName("metric_type");
        builder.Property(e => e.Value)
            .HasPrecision(10, 2)
            .HasColumnName("value");
        builder.Property(e => e.Unit)
            .HasMaxLength(50)
            .HasColumnName("unit");
        builder.Property(e => e.Weight)
            .HasPrecision(10, 2)
            .HasColumnName("weight");
        builder.Property(e => e.Height)
            .HasPrecision(10, 2)
            .HasColumnName("height");
        builder.Property(e => e.Bmi)
            .HasPrecision(5, 2)
            .HasColumnName("bmi");
        builder.Property(e => e.BloodPressureSystolic).HasColumnName("blood_pressure_systolic");
        builder.Property(e => e.BloodPressureDiastolic).HasColumnName("blood_pressure_diastolic");
        builder.Property(e => e.HeartRate).HasColumnName("heart_rate");
        builder.Property(e => e.Temperature)
            .HasPrecision(5, 2)
            .HasColumnName("temperature");
        builder.Property(e => e.BloodGlucose).HasColumnName("blood_glucose");
        builder.Property(e => e.OxygenSaturation).HasColumnName("oxygen_saturation");
        builder.Property(e => e.Notes).HasColumnName("notes");
        builder.Property(e => e.CreatedAt)
            .HasDefaultValueSql("now()")
            .HasColumnName("created_at");
        builder.Property(e => e.CreatedBy).HasColumnName("created_by");
        builder.Property(e => e.UpdatedAt)
            .HasDefaultValueSql("now()")
            .HasColumnName("updated_at");
        builder.Property(e => e.UpdatedBy).HasColumnName("updated_by");
        builder.Property(e => e.DeletedAt).HasColumnName("deleted_at");

        builder.HasOne(d => d.Household).WithMany(p => p.HealthMetrics)
            .HasForeignKey(d => d.HouseholdId)
            .HasConstraintName("health_metrics_household_id_fkey");

        builder.HasOne(d => d.HouseholdMember).WithMany(p => p.HealthMetrics)
            .HasForeignKey(d => d.HouseholdMemberId)
            .HasConstraintName("health_metrics_household_member_id_fkey");
    }
}

