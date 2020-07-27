export class Player {
    public id: number
    public username: string
    public discriminator: number
    public avatar!: string

    constructor(id: number, username: string, discriminator: number, avatar: string) {
        this.id = id;
        this.username = username;
        this.discriminator = discriminator;
        this.avatar = avatar;
    }

    get tag(): string {
        return `${this.username}#${this.discriminator}`;
    }

    get picture(): string {
        return `https://cdn.discordapp.com/avatars/${this.id}/${this.avatar}.png`;
    }
} 