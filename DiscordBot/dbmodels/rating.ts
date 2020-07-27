import { Sequelize, Model, DataTypes } from 'sequelize';

export class _Rating extends Model {} 

export default function Rating(sequelize: Sequelize) {
    _Rating.init({
        role: {
            type: DataTypes.STRING,
            allowNull: false
        },
        rank: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, { sequelize, modelName: 'rating', tableName: 'rating' });
    return _Rating;
}