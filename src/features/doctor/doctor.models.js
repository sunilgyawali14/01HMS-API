import { DataTypes } from 'sequelize'
import sequelize from '../../config/connection.js'

const Doctor = sequelize.define('Doctor', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  specialization: {
    type: DataTypes.STRING,
    allowNull: false, 
    // e.g. "Cardiologist", "Neurologist", "Orthopedic"
  },
  qualification: {
    type: DataTypes.STRING,
    allowNull: false,
    // e.g. "MBBS", "MD", "MS"
  },
  experienceYears: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
  },
  licenseNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    // Nepal Medical Council (NMC) number
  },
  gender: {
    type: DataTypes.ENUM('male', 'female', 'other'),
    allowNull: false,
  },
  dateOfBirth: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  profileImage: {
    type: DataTypes.STRING,
    allowNull: true,
    // store image URL/path
  },
  availableDays: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    // e.g. ["monday", "tuesday", "wednesday"]
  },
  consultationFee: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0.00,
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'on_leave'),
    defaultValue: 'active',
  },
//   role: {
//     type: DataTypes.ENUM('doctor', 'admin'),
//     defaultValue: 'doctor',
//   },
}, {
  tableName: 'doctors',
  timestamps: true,
});

export default Doctor;