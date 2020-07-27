import { Sequelize, Model, DataTypes } from 'sequelize';

class _Mode extends Model {}

export default function Mode(sequelize: Sequelize) {
    _Mode.init({
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        }
    }, { sequelize, modelName: 'mode', tableName: 'mode', schema: 'overwatch', timestamps: false });
    return _Mode;
}