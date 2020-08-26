/**
 * File: database.ts
 * Date: July 30, 2020
 * Author: Chaz-Lee Pierre
 * Purpose: This file contains the logic for interacting with the 10000H database.
 *          This file is the only file that interacts with the database - it will 
 *          return view models of the database models.
 */

import { Sequelize } from 'sequelize';

import { OWProfile } from './models/owprofile';
import { Player } from './models/player';
import { Authenticate } from './models/authenticate';

import PlayerModel from './dbmodels/player';
import OWProfileModel from './dbmodels/owprofile';
import RatingModel from './dbmodels/rating';
import HeroModel from './dbmodels/hero';
import AuthenticateModel from './dbmodels/authenticate';

import QueueModel from './dbmodels/overwatch/queue';
import PlayerQueueModel from './dbmodels/overwatch/playerqueue';
import MatchModel from './dbmodels/overwatch/match';
import ModeModel from './dbmodels/overwatch/mode';
import MapModel from './dbmodels/overwatch/map';

require('dotenv').config({ path: "./.env" });
const { DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT } = process.env;

// initialize database connection
const sequelize = new Sequelize(DB_NAME!, DB_USER!, DB_PASSWORD!, {
    host: DB_HOST!,
    dialect: 'postgres',
    port: parseInt(DB_PORT!),
    logging: false,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    }
});

// initialize database tables
export const _Player = PlayerModel(sequelize); // exported for PlayerQueue
const _OWProfile = OWProfileModel(sequelize);
const _Rating = RatingModel(sequelize);
const _Hero = HeroModel(sequelize);
const _Authenticate = AuthenticateModel(sequelize);

export const _Queue = QueueModel(sequelize); // exported for PlayerQueue
const _PlayerQueue = PlayerQueueModel(sequelize);
const _Match = MatchModel(sequelize);
const _Mode = ModeModel(sequelize);
const _Map = MapModel(sequelize);

// setup database relationships
_Player.hasOne(_OWProfile, { sourceKey: 'id', foreignKey: 'id' });
_OWProfile.belongsTo(_Player, { targetKey: 'id', foreignKey: 'id' });

_OWProfile.hasMany(_Rating);
_Rating.belongsTo(_OWProfile);

_OWProfile.hasMany(_Hero);
_Hero.belongsTo(_OWProfile);

_Match.belongsTo(_Map);
_Map.hasMany(_Match);

_Map.belongsTo(_Mode);
_Mode.hasMany(_Map);

_Player.belongsToMany(_Queue, { through: _PlayerQueue });
_Queue.belongsToMany(_Player, { through: _PlayerQueue });




/**
 * Function: insertAuth
 * Purpose: Creates a temporary authentication record.
 */

export async function insertAuth(auth: Authenticate): Promise<Authenticate> {
    await _Authenticate.create({
        id: auth.id,
        portrait: auth.portrait
    });

    return auth;
}

/**
 * Function: getAuth
 * Purpose: Gets a temporary authentication record.
 */

export async function getAuth(id: number): Promise<Authenticate | null> {
    let auth = await _Authenticate.findOne({ where: { id: id } })

    return auth ? new Authenticate(id, <string>auth.get('portrait')) : null;
}

/**
 * Function: authExists
 * Purpose: Checks to see if the auth exists.
 */

export async function authExists(id: number): Promise<boolean> {
    let auth = await _Authenticate.findOne({ where: { id : id } });
    
    return auth ? true : false;
}

/**
 * Function: testAuth
 * Purpose: Tests the auth to see if it's valid.
 */

export async function testAuth(id: number, portrait: string): Promise<boolean> {
    let auth = await _Authenticate.findOne({ where: { id : id }});
    if (!auth) throw 'ERROR: Authentication record does not exist.';

    return <string>auth.get('portrait') == portrait;
}

/**
 * Function: removeAuth
 * Purpose: Deletes a temporary authentication record.
 */

export async function removeAuth(id: number): Promise<boolean> {
    let auth = await _Authenticate.findOne({ where: { id : id }});
    if (!auth) throw 'ERROR: Authentication record does not exist.';
    auth.destroy();
    return true;
}


/**
 * Function: createPlayer
 * Purpose: Create a new player.
 */

export async function createPlayer(player: Player): Promise<Player> {
    if (!player) throw 'ERROR: Player not provided.';

    await _Player.create({
        id: player.id,
        username: player.username,
        discriminator: player.discriminator,
        avatar: player.avatar
    });

    return player;
}

/**
 * Function: getPlayer
 * Purpose: Get an existing player.
 */

export async function getPlayer(id: number): Promise<Player | null> {
    let _player = await _Player.findOne({ where: { id: id } });
    if (!_player) return null;
    
    let username = <string>_player.get('username');
    let discriminator = <number>_player.get('discriminator');
    let avatar = <string>_player.get('avatar');

    return new Player(id, username, discriminator, avatar);
}

/**
 * Function: playerExists
 * Purpose: Checks to see if player exists.
 */

export async function playerExists(id: number): Promise<boolean> {
    return await getPlayer(id) ? true : false;
}

/**
 * Function: updatePlayer
 * Purpose: Update an existing player.
 */

export async function updatePlayer(player: Player): Promise<Player> {
    if (!player) throw 'ERROR: Player not provided.';

    let _player = await _Player.findOne({ where: { id: player.id } });
    if (!_player) throw 'ERROR: Player does not exist.';

    await _player.update({ username: player.username });
    await _player.update({ discriminator: player.discriminator });
    await _player.update({ avatar: player.avatar });

    return player;
}

/**
 * Function: createOWProfile
 * Purpose: Create an OW profile for an existing player.
 */

export async function createOWProfile(id: number, owProfile: OWProfile) : Promise<OWProfile> {
    if (owProfile.isPrivate) throw 'ERROR: Profile must not be private.';

    let player = await _Player.findOne({ where: { id: id } });
    if (!player) throw 'ERROR: Player does not exist.';

    let _owProfile = await _OWProfile.findOne({ where: { id: id }});
    if (_owProfile) throw 'ERROR: OW Profile already linked.';

    _owProfile = await _OWProfile.create({
        id: id,
        battletag: owProfile.battletag,
        platform: owProfile.platform,
        region: owProfile.region,
        endorsement: owProfile.endorsement,
        isPrivate: owProfile.isPrivate,
        level: owProfile.level,
        prestige: owProfile.prestige
    });

    if (owProfile.topHeroes) {
        owProfile.topHeroes.forEach(async h => {
            await _Hero.create({ 
                name: h.name,
                timePlayed: h.timePlayed,
                gamesWon: h.gamesWon,
                winPercentage: h.winPercentage,
                owprofileId: <number>_owProfile?.get('id')
            });
        })
    }

    if (owProfile.ratings) {
        owProfile.ratings.forEach(async r => {
            await _Rating.create({ 
                role: r.role,
                rank: r.rank,
                owprofileId: <number>_owProfile?.get('id')
            });
        })
    }

    return owProfile;
}

/**
 * Function: getOWProfile
 * Purpose: Get an OW profile for an existing player.
 */

export async function getOWProfile(id: number) : Promise<OWProfile | null> {
    let player = await _Player.findOne({ where: { id: id } });
    if (!player) throw 'ERROR: Player does not exist.';

    let _owProfile = await _OWProfile.findOne({ where: { id: id }});
    if (!_owProfile) return null;

    let _topHeroes = await _Hero.findAll({ where: { owprofileId: id } });
    let _ratings = await _Rating.findAll({ where: { owprofileId: id } });

    let owProfile = new OWProfile(<string>_owProfile.get('battletag'), <string>_owProfile.get('platform'), <string>_owProfile.get('region'));

    owProfile.isPrivate = <boolean>_owProfile.get('isPrivate');
    owProfile.prestige = <number>_owProfile.get('prestige');
    owProfile.level = <number>_owProfile.get('level');
    owProfile.endorsement = <number>_owProfile.get('endorsement');
    owProfile.updatedAt = <Date>_owProfile.get('updatedAt');

    if (_topHeroes) {
        _topHeroes.forEach(h => {
            let name = <string>h.get('name');
            let timePlayed = <string>h.get('timePlayed');
            let gamesWon = <number>h.get('gamesWon');
            let winPercentage = <number>h.get('winPercentage');
            owProfile.topHeroes.push({ name, timePlayed, gamesWon, winPercentage });
        })
    }

    if (_ratings) {
        _ratings.forEach(r => {
            let role = <string>r.get('role');
            let rank = <number>r.get('rank');
            owProfile.ratings.push({ role, rank });
        })
    }

    return owProfile;
}

/**
 * Function: OWProfileExists
 * Purpose: Checks to see if OW Profile exists.
 */

export async function OWProfileExists(id: number) : Promise<boolean> {
    return await getOWProfile(id) ? true : false;
}

/**
 * Function: updateOWProfile
 * Purpose: Update an OW profile for an existing player.
 */

export async function updateOWProfile(id: number, owProfile: OWProfile) : Promise<OWProfile> {
    if (!owProfile) throw 'ERROR: OW Profile not provided.';

    let player = await _Player.findOne({ where: { id: id } });
    if (!player) throw 'ERROR: Player does not exist.';

    let _owProfile = await _OWProfile.findOne({ where: { id: id }});
    if (!_owProfile) throw 'ERROR: OW Profile does not exist.';

    await _Hero.destroy({ where: { owprofileId: id } });
    await _Rating.destroy({ where: { owprofileId: id } });

    await _owProfile.update({ isPrivate: owProfile.isPrivate });
    await _owProfile.update({ prestige: owProfile.prestige });
    await _owProfile.update({ level: owProfile.level });
    await _owProfile.update({ endorsement: owProfile.endorsement });

    if (owProfile.topHeroes) {
        owProfile.topHeroes.forEach(async h => {
            await _Hero.create({ 
                name: h.name,
                timePlayed: h.timePlayed,
                gamesWon: h.gamesWon,
                winPercentage: h.winPercentage,
                owprofileId: id
            });
        })
    }

    if (owProfile.ratings) {
        owProfile.ratings.forEach(async r => {
            await _Rating.create({ 
                role: r.role,
                rank: r.rank,
                owprofileId: id
            });
        })
    }

    return owProfile;
}

/**
 * Function: deleteOWProfile
 * Purpose: Delete an OW profile for an existing player.
 */

export async function deleteOWProfile(id: number) : Promise<boolean> {
    let player = await _Player.findOne({ where: { id: id } });
    if (!player) throw 'ERROR: Player does not exist.';

    let _owProfile = await _OWProfile.findOne({ where: { id: id }});
    if (!_owProfile) throw 'ERROR: OW Profile does not exist.';

    await _Hero.destroy({ where: { owprofileId: id } });
    await _Rating.destroy({ where: { owprofileId: id } });

    await _owProfile.destroy();

    return true;
}

/**
 * Function: sync
 * Purpose: Syncs the Sequelize instance with the database.
 */

export async function sync(): Promise<void> {
   sequelize.sync();
}