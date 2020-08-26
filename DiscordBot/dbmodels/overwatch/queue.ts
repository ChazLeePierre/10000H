import { Sequelize, Model, DataTypes } from 'sequelize';

class _Queue extends Model {}

export default function Queue(sequelize: Sequelize) {
    _Queue.init({
        name: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, { sequelize, modelName: 'queue', tableName: 'queue', schema: 'overwatch' });
    return _Queue;
}

