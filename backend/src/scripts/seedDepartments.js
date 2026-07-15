/**
 * Seed script to populate the departments table with common hospital departments.
 *
 * Usage:
 *   node src/scripts/seedDepartments.js
 *
 * This script is idempotent — it skips departments that already exist by name.
 */
import dotenv from "dotenv";
dotenv.config();
import sequelize from "../config/connection.js";
import Department from "../features/departments/department.model.js";

const DEPARTMENTS = [
  {
    name: "Cardiology",
    description:
      "Diagnosis and treatment of heart and cardiovascular system disorders including coronary artery disease, heart failure, and arrhythmias.",
  },
  {
    name: "Neurology",
    description:
      "Specializes in disorders of the nervous system including the brain, spinal cord, and peripheral nerves such as epilepsy, stroke, and Parkinson's disease.",
  },
  {
    name: "Orthopedics",
    description:
      "Focuses on the musculoskeletal system — bones, joints, ligaments, tendons, and muscles. Covers fractures, arthritis, and sports injuries.",
  },
  {
    name: "Dermatology",
    description:
      "Diagnosis and treatment of skin, hair, and nail conditions including eczema, psoriasis, acne, and skin cancer.",
  },
  {
    name: "Pediatrics",
    description:
      "Medical care of infants, children, and adolescents including routine check-ups, immunizations, and childhood illnesses.",
  },
  {
    name: "Gynecology & Obstetrics",
    description:
      "Women's reproductive health including pregnancy care, childbirth, menstrual disorders, and gynecological surgery.",
  },
  {
    name: "Ophthalmology",
    description:
      "Diagnosis and treatment of eye diseases and vision disorders including cataracts, glaucoma, and refractive errors.",
  },
  {
    name: "ENT (Otolaryngology)",
    description:
      "Ear, nose, and throat specialties covering hearing disorders, sinusitis, tonsillitis, and head and neck tumors.",
  },
  {
    name: "General Surgery",
    description:
      "Surgical procedures for a wide range of conditions including appendectomy, hernia repair, gallbladder removal, and trauma surgery.",
  },
  {
    name: "Internal Medicine",
    description:
      "Comprehensive adult healthcare including diagnosis and non-surgical treatment of internal organ diseases — diabetes, hypertension, and infections.",
  },
  {
    name: "Psychiatry",
    description:
      "Mental health diagnosis and treatment including depression, anxiety disorders, schizophrenia, and addiction management.",
  },
  {
    name: "Urology",
    description:
      "Disorders of the urinary tract and male reproductive system including kidney stones, urinary infections, and prostate conditions.",
  },
  {
    name: "Gastroenterology",
    description:
      "Digestive system disorders including stomach, liver, intestines, and pancreas conditions such as ulcers, hepatitis, and IBS.",
  },
  {
    name: "Pulmonology",
    description:
      "Respiratory system and lung diseases including asthma, COPD, pneumonia, tuberculosis, and sleep apnea.",
  },
  {
    name: "Radiology",
    description:
      "Medical imaging services including X-rays, CT scans, MRI, ultrasound, and fluoroscopy for diagnostic and interventional purposes.",
  },
  {
    name: "Emergency Medicine",
    description:
      "24/7 acute care for trauma, cardiac emergencies, respiratory distress, and other life-threatening conditions requiring immediate attention.",
  },
  {
    name: "Dentistry",
    description:
      "Oral health care including dental check-ups, fillings, root canals, extractions, and cosmetic dental procedures.",
  },
  {
    name: "Physiotherapy",
    description:
      "Rehabilitation and recovery services including post-surgical recovery, sports injuries, chronic pain management, and mobility improvement.",
  },
];

const seedDepartments = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected");

    // Ensure the departments table exists
    await Department.sync();

    let created = 0;
    let skipped = 0;

    for (const dept of DEPARTMENTS) {
      const existing = await Department.findOne({ where: { name: dept.name } });
      if (existing) {
        console.log(`  ⏭  Skipped (already exists): ${dept.name}`);
        skipped++;
      } else {
        await Department.create({ ...dept, isActive: true });
        console.log(`  ✅ Created: ${dept.name}`);
        created++;
      }
    }

    console.log(`\n🏥 Seeding complete: ${created} created, ${skipped} skipped`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

seedDepartments();
