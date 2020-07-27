export class OWProfile {
    public battletag: string
    public platform: string
    public region: string
    public isPrivate!: boolean
    public prestige!: number
    public level!: number
    public endorsement!: number
    public updatedAt!: Date
    public ratings: { role: string, rank: number }[]
    public topHeroes: { name: string, timePlayed: string, gamesWon: number, winPercentage: number }[]

    constructor(battletag: string, platform: string, region: string) {
        this.battletag = battletag;
        this.platform = platform;
        this.region = region;
        this.ratings = [];
        this.topHeroes = [];
    }

    get isRanked(): boolean {
        return (this.prestige == 0 ? this.level >= 25 : this.level > 0) && this.ratings.length != 0;
    }

    get rank(): number | null {
        return (this.ratings) ? this.ratings.reduce((a,b) => a + b.rank, 0) / this.ratings.length : null;
    }
} 