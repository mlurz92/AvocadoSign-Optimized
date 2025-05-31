const dataEventHandlers = (() => {
    let _mainAppInterface = null;

    function initialize(mainAppInterface) {
        _mainAppInterface = mainAppInterface;

    }

    return Object.freeze({
        initialize
    });
})();
