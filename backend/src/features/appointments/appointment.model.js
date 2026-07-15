import { DataTypes } from 'sequelize'
import sequelize from '../../config/connection.js'

const Appointment = sequelize.define('Appointment', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    patientId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    doctorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    departmentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    appointmentDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('pending', 'assigned', 'confirmed', 'rejected', 'completed', 'cancelled'),
        defaultValue: 'pending'
    },
    clinicalNotes: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    prescription: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    report: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
}, {
    tableName: 'appointments',
    timestamps: true,
})

export default Appointment;