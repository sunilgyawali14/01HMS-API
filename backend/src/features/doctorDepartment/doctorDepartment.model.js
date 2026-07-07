import { DataTypes } from "sequelize";
import sequelize from "../../config/connection.js";

const DoctorDepartment = sequelize.define(
  "DoctorDepartment",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    doctorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "doctors",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    departmentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "department",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    role: {
      type: DataTypes.ENUM("head", "senior", "junior"),
      defaultValue: "junior",
    },
    joinedAt: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
  },
  {
    tableName: "doctor_departments",
    timestamps: true,
  },
);

export default DoctorDepartment;
