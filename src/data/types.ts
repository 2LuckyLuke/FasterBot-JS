export type ConfigJsonType = {
    clientId: string;
    guildId: string;
    token: string;

    testServerId: string;
    tSuckedServerId: string;
}

export type CustomColorsUnionString = 'user' | 'navy' | 'blue' | 'aqua' | 'cyan' | 'darkblue' | 'lavender' | 'purple' | 'darkpurple' | 'magenta' | 'pink' | 'red' | 'darkred' | 'wine' | 'cherry' | 'orange' | 'yellow' | 'maroon' | 'olive' | 'green' | 'jade' | 'lime' | 'black' | 'gray' | 'white';

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

export type GameChannelsUnionString = 'mc' | 'ow' | 'csgo' | 'pubg' | 'lol' | 'ttt' | 'val' | 'terra' | 'browser' | 'genshin' | 'poke' | 'mcEvent' | 'film';

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