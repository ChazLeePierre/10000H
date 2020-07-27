import { Sequelize, Model, DataTypes } from 'sequelize';

class _Authenticate extends Model {}

export default function Authenticate(sequelize: Sequelize) {
    _Authenticate.init({
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true
        },
        portrait: {
            type: DataTypes.STRING,
            allowNull: false
        },
    }, 
    { 
        sequelize, 
        timestamps: true,
        updatedAt: false,
        modelName: 'authenticate', 
        tableName: 'authenticate' 
    });
    return _Authenticate;
}