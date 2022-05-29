
// Persists player stats in browser storage, meant to be shared between tools
class PlayerConfigStorage
{
    static IDENTIFIER = "ELDEN_RING_TOOLS_PLAYER_CONFIG";
    static INSTANCE = new PlayerConfigStorage();

    _config = PlayerConfigStorage.getDefaultConfig();
    _loaded = false;

    static getInstance()
    {
        return PlayerConfigStorage.INSTANCE;
    }

    getConfig()
    {
        if (!this._loaded)
        {
            this._config = PlayerConfigStorage.loadConfiguration();
            this._loaded = true;
        }
        return this._config;
    }

    setConfig(value)
    {
        this._config = value;
        PlayerConfigStorage.saveConfiguration(value);
    }

    static loadConfiguration()
    {
        const config = localStorage.getItem(PlayerConfigStorage.IDENTIFIER);
        if (config != null)
            return JSON.parse(config);
        else
            return PlayerConfigStorage.getDefaultConfig();
    }

    static saveConfiguration(config)
    {
        localStorage.setItem(PlayerConfigStorage.IDENTIFIER, JSON.stringify(config));
    }

    // This isn't used anywhere, it's just for reference and to provide type-checking
    // (TypeScript automatically infers the type of the return value, which we want to apply to the "config" property)
    static getDefaultConfig()
    {
        return {
            selectedStaff: 2,
            selectedSeal: 3,
            showCharged : false,
            weaponLevels : {
                regular: 25,
                somber: 10
            },
            damageTypes : [
                {
                    defense: 90,
                    negation: 10.00
                },
                {
                    defense: 90,
                    negation: 10.00
                },
                {
                    defense: 90,
                    negation: 10.00
                },
                {
                    defense: 90,
                    negation: 10.00
                },
                {
                    defense: 90,
                    negation: 10.00
                }
            ],
            sort : ELDEN_RING_TOOLS_CONSTANTS.SPELL_COMPARER.SORT_DMG_FP,
            filter : SPELL_TYPE_ALL,
            stats: [
                {
                    name: "strength",
                    value: 10
                },
                {
                    name: "dexterity",
                    value: 10
                },
                {
                    name: "intelligence",
                    value: 80
                },
                {
                    name: "faith",
                    value: 50
                },
                {
                    name: "arcane",
                    value: 18
                }
            ]
        }
    }
}