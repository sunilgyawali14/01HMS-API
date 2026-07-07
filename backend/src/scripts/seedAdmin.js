import dotenv from 'dotenv';
dotenv.config();
import bcrypt from 'bcrypt';
import sequelize from '../config/connection.js';
import User from '../features/user/user.model.js';

const seedAdmin = async () => {
    try {
        // Connect to the database
        await sequelize.authenticate();
        console.log('Database connected successfully');

        // Sync the model (so the table exists)
        await sequelize.sync({ alter: true });

        // Admin credentials
        const adminEmail = 'admin@hospital.com';
        const adminPassword = 'admin123#$';
        const adminName = 'Super Admin';

        // Check if admin already exists
        const existingAdmin = await User.findOne({
            where: { email: adminEmail }
        });

        if (existingAdmin) {
            console.log('Admin user already exists with email:', adminEmail);
            await sequelize.close();
            process.exit(0);
        }

        // Hash the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);

        // Create the admin user
        const admin = await User.create({
            name: adminName,
            email: adminEmail,
            password: hashedPassword,
            roles: 'admin'
        });

        // console.log('Admin user seeded successfully!');
        // console.log('Email:', adminEmail);
        // console.log('Password:', adminPassword);
        // console.log('User ID:', admin.id);

        await sequelize.close();
        process.exit(0);
    } catch (error) {
        console.error('Error seeding admin:', error);
        await sequelize.close();
        process.exit(1);
    }
};

seedAdmin();