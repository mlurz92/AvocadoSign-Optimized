const tooltip = (() => {
    let _globalTippyInstances = [];

    function init(scope = document.body) {
        if (!window.tippy || typeof scope?.querySelectorAll !== 'function') {
            return;
        }

        _globalTippyInstances = _globalTippyInstances.filter(instance => {
            if (instance && instance.reference && document.body.contains(instance.reference)) {
                return true;
            }
            try {
                instance?.destroy();
            } catch (e) {
                // Instance already destroyed or invalid
            }
            return false;
        });
        
        const elementsInScope = scope.matches('[data-tippy-content]') 
            ? [scope] 
            : Array.from(scope.querySelectorAll('[data-tippy-content]'));

        const newInstances = tippy(elementsInScope, {
            allowHTML: true,
            theme: 'glass',
            placement: 'top',
            animation: 'fade',
            interactive: false,
            appendTo: () => document.body,
            delay: APP_CONFIG.UI_SETTINGS.TOOLTIP_DELAY,
            maxWidth: 450,
            duration: [150, 150],
            zIndex: 3050,
            onCreate(instance) {
                if (!instance.props.content || String(instance.props.content).trim() === '') {
                    instance.disable();
                }
            },
            onShow(instance) {
                const content = instance.reference.getAttribute('data-tippy-content');
                if (content && String(content).trim() !== '') {
                    instance.setContent(content);
                    return true;
                }
                return false;
            }
        });

        if (Array.isArray(newInstances)) {
            _globalTippyInstances.push(...newInstances.filter(Boolean));
        } else if (newInstances) {
            _globalTippyInstances.push(newInstances);
        }
    }

    function destroyAll() {
        _globalTippyInstances.forEach(instance => {
            try {
                instance?.destroy();
            } catch(e) {
                // Fails silently if instance is already invalid
            }
        });
        _globalTippyInstances = [];
    }
    
    return Object.freeze({
        init,
        destroyAll
    });
})();
