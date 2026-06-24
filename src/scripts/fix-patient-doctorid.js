import dotenv from 'dotenv';
dotenv.config();
import sequelize from '../config/connection.js';

const fixDoctorIdConstraint = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to DB');

    await sequelize.query(`
      ALTER TABLE patients
      ALTER COLUMN "doctorId" DROP NOT NULL;
    `);

    console.log('✅ doctorId constraint fixed — column is now nullable');
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to fix constraint:', error.message);
    process.exit(1);
  }
};

fixDoctorIdConstraint();