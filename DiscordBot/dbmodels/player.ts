import { Sequelize, Model, DataTypes } from 'sequelize';

class _Player extends Model {}

export default function Player(sequelize: Sequelize) {
    _Player.init({
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false
        },
        discriminator: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        avatar: DataTypes.STRING
    }, { sequelize, modelName: 'player', tableName: 'player' });
    return _Player;
}