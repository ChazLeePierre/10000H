import { Sequelize, Model, DataTypes } from 'sequelize';

export class _OWProfile extends Model {} 

export default function OWProfile(sequelize: Sequelize) {
    _OWProfile.init({
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true
        },
        battletag: {
            type: DataTypes.STRING,
            allowNull: false
        },
        platform: {
            type: DataTypes.STRING,
            allowNull: false
        },
        region: {
            type: DataTypes.STRING,
            allowNull: false
        },
        isPrivate: DataTypes.BOOLEAN,
        prestige: DataTypes.INTEGER,
        level: DataTypes.INTEGER,
        endorsement: DataTypes.INTEGER
    }, { sequelize, modelName: 'owprofile', tableName: 'owprofile' });
    return _OWProfile;
}