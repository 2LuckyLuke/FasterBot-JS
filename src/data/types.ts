export type ConfigJsonType = {
    clientId: string;
    guildId: string;
    token: string;

    testServerId: string;
    tSuckedServerId: string;
}

export type ColorsJsonType = {
    customColors: {
        user: string;
        navy: string;
        blue: string;
        aqua: string;
        cyan: string;
        darkblue: string;
        lavender: string;
        purple: string;
        darkpurple: string;
        magenta: string;
        pink: string;
        red: string;
        darkred: string;
        wine: string;
        cherry: string;
        orange: string;
        yellow: string;
        maroon: string;
        olive: string;
        green: string;
        jade: string;
        lime: string;
        black: string;
        gray: string;
        white: string;
    }
}

export type ChannelsJsonType = {
    gameChannels: {
        mc: string;
        ow: string;
        csgo: string;
        pubg: string;
        lol: string;
        ttt: string;
        val: string;
        terra: string;
        browser: string;
        genshin: string;
        poke: string;
        mcEvent: string;
        film: string;
    },
    categories: {
        voice: string
    }
}