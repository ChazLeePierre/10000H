import { Sequelize, Model, DataTypes } from 'sequelize';

export class _Hero extends Model {} 

export default function Hero(sequelize: Sequelize) {
    _Hero.init({
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        timePlayed: {
            type: DataTypes.STRING,
            allowNull: false
        },
        gamesWon: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        winPercentage: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, { sequelize, modelName: 'hero', tableName: 'hero' });
    return _Hero;
}