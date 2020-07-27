import { Sequelize, Model, DataTypes } from 'sequelize';

class _Match extends Model {}

export default function Player(sequelize: Sequelize) {
    _Match.init({
        start: {
            type: DataTypes.DATE,
            allowNull: false
        },
        avatar: DataTypes.STRING
    }, { sequelize, modelName: 'match', tableName: 'match', schema: 'overwatch' });
    return _Match;
}