import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import bcrypt from 'bcryptjs';

const User = sequelize.define('User', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    fullName: {
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
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    phone: {
        type: DataTypes.STRING,
    },
    age: {
        type: DataTypes.INTEGER,
    },
    gender: {
        type: DataTypes.ENUM('male', 'female', 'other'),
    },
    role: {
        type: DataTypes.ENUM('patient', 'doctor', 'admin'),
        defaultValue: 'patient',
    },
    baselineCompleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    doctorId: {
        type: DataTypes.UUID,
        allowNull: true,
    },
}, {
    hooks: {
        beforeCreate: async (user) => {
            if (user.password) {
                user.password = await bcrypt.hash(user.password, 10);
            }
        },
    },
});

User.prototype.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

export default User;
