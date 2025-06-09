const DOMComponents = {

    createElement: function(tag, options = {}) {
        const el = document.createElement(tag);
        if (options.id) el.id = options.id;
        if (options.className) el.className = options.className;
        if (options.textContent) el.textContent = options.textContent;
        if (options.innerHTML) el.innerHTML = options.innerHTML;
        if (options.attributes) {
            for (const [key, value] of Object.entries(options.attributes)) {
                el.setAttribute(key, value);
            }
        }
        return el;
    },

    createButton: function(options) {
        const button = this.createElement('button', {
            id: options.id,
            className: `py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 ${options.className || ''}`,
            textContent: options.text
        });
        if (options.onClick) {
            button.addEventListener('click', options.onClick);
        }
        return button;
    },

    createSelect: function(options) {
        const select = this.createElement('select', {
            id: options.id,
            className: `block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${options.className || ''}`
        });

        if (options.options) {
            options.options.forEach(opt => {
                const optionElement = this.createElement('option', {
                    textContent: opt.text,
                    attributes: { value: opt.value }
                });
                if (opt.selected) {
                    optionElement.selected = true;
                }
                select.appendChild(optionElement);
            });
        }
        
        if (options.onChange) {
            select.addEventListener('change', options.onChange);
        }

        return select;
    },
    
    createContainer: function(options) {
        return this.createElement('div', {
            id: options.id,
            className: `p-4 bg-white rounded-lg shadow ${options.className || ''}`,
            innerHTML: options.innerHTML || ''
        });
    },

    createSectionHeader: function(text) {
        return this.createElement('h3', {
            className: 'text-lg font-semibold text-gray-700 mb-3',
            textContent: text
        });
    },
    
    createProgressBar: function(id, labelId) {
        const container = this.createElement('div', { className: 'w-full bg-gray-200 rounded-full' });
        const bar = this.createElement('div', {
            id: id,
            className: 'bg-blue-600 text-xs font-medium text-blue-100 text-center p-0.5 leading-none rounded-full',
            textContent: '0%',
            attributes: { style: 'width: 0%' }
        });
        const label = this.createElement('p', {
            id: labelId,
            className: 'text-sm text-gray-600 mt-1 text-center',
            textContent: 'Bereit.'
        });
        
        container.appendChild(bar);
        
        const wrapper = this.createElement('div');
        wrapper.appendChild(container);
        wrapper.appendChild(label);
        
        return wrapper;
    }
};

window.DOMComponents = DOMComponents;
