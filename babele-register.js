Hooks.on('init', () => {

    if(typeof Babele !== 'undefined') {
        Babele.get().register({
            module: 'WH4-de-translation',
            lang: 'de',
            dir: 'compendium'
        });
    }
});
