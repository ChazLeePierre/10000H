import { Sequelize, Model, DataTypes } from 'sequelize';

class _Map extends Model {}

export default function Map(sequelize: Sequelize) {
    _Map.init({
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        }
    }, { sequelize, modelName: 'map', tableName: 'map', schema: 'overwatch', timestamps: false });
    return _Map;
}