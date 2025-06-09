const UIHelpers = {
    _tooltipElement: null,

    _createTooltipElement: function() {
        if (!this._tooltipElement) {
            this._tooltipElement = document.createElement('div');
            this._tooltipElement.style.position = 'absolute';
            this._tooltipElement.style.visibility = 'hidden';
            this._tooltipElement.style.backgroundColor = 'rgba(0, 0, 0, 0.85)';
            this._tooltipElement.style.color = 'white';
            this._tooltipElement.style.padding = '8px 12px';
            this._tooltipElement.style.borderRadius = '6px';
            this._tooltipElement.style.fontSize = '12px';
            this._tooltipElement.style.maxWidth = '250px';
            this._tooltipElement.style.zIndex = '10000';
            this._tooltipElement.style.pointerEvents = 'none';
            this._tooltipElement.style.transition = 'opacity 0.2s, visibility 0.2s';
            this._tooltipElement.style.opacity = '0';
            document.body.appendChild(this._tooltipElement);
        }
    },

    addTooltip: function(element, text, position = 'top') {
        if (typeof element === 'string') {
            element = document.getElementById(element);
        }
        if (!element) {
            console.warn("Tooltip konnte nicht an ein nicht-existierendes Element angehängt werden.");
            return;
        }

        this._createTooltipElement();

        element.addEventListener('mouseenter', (event) => {
            this._tooltipElement.innerHTML = text;
            this._tooltipElement.style.visibility = 'visible';
            this._tooltipElement.style.opacity = '1';
            this._updateTooltipPosition(event, element, position);
        });

        element.addEventListener('mousemove', (event) => {
           if(this._tooltipElement.style.visibility === 'visible') {
               this._updateTooltipPosition(event, element, position);
           }
        });

        element.addEventListener('mouseleave', () => {
            this._tooltipElement.style.visibility = 'hidden';
            this._tooltipElement.style.opacity = '0';
        });
    },

    _updateTooltipPosition: function(event, element, position) {
        const rect = element.getBoundingClientRect();
        const tooltipRect = this._tooltipElement.getBoundingClientRect();
        
        let top, left;

        switch (position) {
            case 'bottom':
                top = rect.bottom + window.scrollY + 8;
                left = rect.left + window.scrollX + (rect.width / 2) - (tooltipRect.width / 2);
                break;
            case 'left':
                top = rect.top + window.scrollY + (rect.height / 2) - (tooltipRect.height / 2);
                left = rect.left + window.scrollX - tooltipRect.width - 8;
                break;
            case 'right':
                top = rect.top + window.scrollY + (rect.height / 2) - (tooltipRect.height / 2);
                left = rect.right + window.scrollX + 8;
                break;
            case 'top':
            default:
                top = rect.top + window.scrollY - tooltipRect.height - 8;
                left = rect.left + window.scrollX + (rect.width / 2) - (tooltipRect.width / 2);
                break;
        }

        // Adjust for viewport boundaries
        if (left < 0) left = 5;
        if (left + tooltipRect.width > window.innerWidth) {
            left = window.innerWidth - tooltipRect.width - 5;
        }
        if (top < 0) top = 5;

        this._tooltipElement.style.left = `${left}px`;
        this._tooltipElement.style.top = `${top}px`;
    }
};

window.UIHelpers = UIHelpers;
