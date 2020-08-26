import { Sequelize, Model, DataTypes } from 'sequelize';
import { _Player, _Queue } from '../../database';

class _PlayerQueue extends Model {}

export default function PlayerQueue(sequelize: Sequelize) {
    _PlayerQueue.init({
        playerId: {
            type: DataTypes.INTEGER,
            references: {
              model: _Player,
              key: 'id'
            }
        },
        queueId: {
            type: DataTypes.INTEGER,
            references: {
              model: _Queue,
              key: 'id'
            }
        },
    }, { sequelize, modelName: 'playerqueue', tableName: 'playerqueue', schema: 'overwatch' });
    return _PlayerQueue;
}