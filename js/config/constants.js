const CONSTANTS = Object.freeze({
    KOLEKTIV: Object.freeze({
        GESAMT: 'Gesamt',
        DIREKT_OP: 'direkt OP',
        NRCT: 'nRCT'
    }),

    LOGIC_OPERATORS: Object.freeze({
        AND: 'UND',
        OR: 'ODER',
        KOMBINIERT: 'KOMBINIERT'
    }),

    T2_CRITERIA_KEYS: Object.freeze({
        SIZE: 'size',
        FORM: 'form',
        KONTUR: 'kontur',
        HOMOGENITAET: 'homogenitaet',
        SIGNAL: 'signal'
    }),

    DATA_KEYS: Object.freeze({
        PATIENT_NR: 'nr',
        N_STATUS: 'n',
        AS_STATUS: 'as',
        T2_STATUS: 't2',
        THERAPIE: 'therapie',
        LYMPHKNOTEN_T2: 'lymphknoten_t2'
    }),

    STORAGE_KEYS: Object.freeze({
        APPLIED_CRITERIA: 'avocado_app_applied_criteria_v2.5',
        APPLIED_LOGIC: 'avocado_app_applied_logic_v2.5',
        CURRENT_KOLLEKTIV: 'avocado_app_current_kollektiv_v2.5',
        PUBLIKATION_LANG: 'avocado_app_publication_lang_v2.5',
        PUBLIKATION_SECTION: 'avocado_app_publication_section_v2.5',
        PUBLIKATION_BF_METRIC: 'avocado_app_publication_bf_metric_v2.5',
        STATS_LAYOUT: 'avocado_app_stats_layout_v2.5',
        STATS_KOLLEKTIV1: 'avocado_app_stats_kollektiv1_v2.5',
        STATS_KOLLEKTIV2: 'avocado_app_stats_kollektiv2_v2.5',
        PRESENTATION_VIEW: 'avocado_app_presentation_view_v2.5',
        PRESENTATION_STUDY_ID: 'avocado_app_presentation_study_id_v2.5',
    }),

    SELECTORS: Object.freeze({
        // Main Containers
        APP_CONTAINER: '#app-container',
        MAIN_TAB_CONTENT: '#mainTabContent',
        TOAST_CONTAINER: '#toast-container',

        // Header
        HEADER_KOLLEKTIV: '#header-kollektiv',
        HEADER_ANZAHL_PATIENTEN: '#header-anzahl-patienten',
        HEADER_STATUS_N: '#header-status-n',
        HEADER_STATUS_AS: '#header-status-as',
        HEADER_STATUS_T2: '#header-status-t2',
        KOLLEKTIV_BUTTONS: 'button[data-kollektiv]',
        HEADER_BUTTON_GROUP: 'header .btn-group[aria-label="Kollektiv Auswahl"]',

        // Navigation
        MAIN_TAB_NAV: '#mainTab',
        NAV_LINKS: '.nav-link',

        // Modals
        BRUTE_FORCE_MODAL: '#brute-force-modal',
        BRUTE_FORCE_MODAL_BODY: '#brute-force-modal .modal-body',
        BRUTE_FORCE_MODAL_EXPORT_BTN: '#export-bruteforce-modal-txt',
        KURANLEITUNG_MODAL: '#kurzanleitung-modal',
        KURANLEITUNG_MODAL_BODY: '#kurzanleitung-modal .modal-body',
        KURANLEITUNG_MODAL_TITLE: '#kurzanleitungModalLabel',

        // General UI
        BTN_KURANLEITUNG: '#btn-kurzanleitung',

        // Auswertung Tab
        AUSWERTUNG_TAB_PANE: '#auswertung-tab-pane',
        AUSWERTUNG_DASHBOARD: '#auswertung-dashboard',
        T2_CRITERIA_CARD: '#t2-criteria-card',
        T2_LOGIC_SWITCH: '#t2-logic-switch',
        T2_LOGIC_LABEL: '#t2-logic-label',
        CRITERIA_CHECKBOX: '.criteria-checkbox',
        T2_CRITERIA_BUTTON: '.t2-criteria-button',
        RANGE_SIZE: '#range-size',
        INPUT_SIZE: '#input-size',
        VALUE_SIZE: '#value-size',
        BTN_RESET_CRITERIA: '#btn-reset-criteria',
        BTN_APPLY_CRITERIA: '#btn-apply-criteria',
        T2_METRICS_OVERVIEW: '#t2-metrics-overview',
        BRUTE_FORCE_METRIC_SELECT: '#brute-force-metric',
        BTN_START_BRUTE_FORCE: '#btn-start-brute-force',
        BRUTE_FORCE_INFO: '#brute-force-info',
        BF_STATUS_TEXT: '#bf-status-text',
        BF_KOLLEKTIV_INFO: '#bf-kollektiv-info',
        BRUTE_FORCE_PROGRESS_CONTAINER: '#brute-force-progress-container',
        BF_PROGRESS_BAR: '#bf-progress-bar',
        BF_PROGRESS_PERCENT: '#bf-progress-percent',
        BF_TESTED_COUNT: '#bf-tested-count',
        BF_TOTAL_COUNT: '#bf-total-count',
        BF_METRIC_LABEL: '#bf-metric-label',
        BF_BEST_METRIC: '#bf-best-metric',
        BF_BEST_CRITERIA: '#bf-best-criteria',
        BTN_CANCEL_BRUTE_FORCE: '#btn-cancel-brute-force',
        BRUTE_FORCE_RESULT_CONTAINER: '#brute-force-result-container',
        BTN_APPLY_BEST_BF_CRITERIA: '#btn-apply-best-bf-criteria',
        AUSWERTUNG_TABLE_BODY: '#auswertung-table-body',
        AUSWERTUNG_TABLE_HEADER: '#auswertung-table-header',
        AUSWERTUNG_TOGGLE_DETAILS: '#auswertung-toggle-details',

        // Daten Tab
        DATEN_TABLE_BODY: '#daten-table-body',
        DATEN_TABLE_HEADER: '#daten-table-header',
        DATEN_TOGGLE_DETAILS: '#daten-toggle-details',

        // Statistik Tab
        STATISTIK_TOGGLE_VERGLEICH: '#statistik-toggle-vergleich',
        STATISTIK_KOLLEKTIV_SELECT_1: '#statistik-kollektiv-select-1',
        STATISTIK_KOLLEKTIV_SELECT_2: '#statistik-kollektiv-select-2',
        STATISTIK_KOLLEKTIV_CONTAINER_1: '#statistik-kollektiv-select-1-container',
        STATISTIK_KOLLEKTIV_CONTAINER_2: '#statistik-kollektiv-select-2-container',
        CRITERIA_COMPARISON_CONTAINER: '#criteria-comparison-container',
        
        // Präsentation Tab
        PRAESENTATION_VIEW_RADIOS: 'input[name="praesentationAnsicht"]',
        PRAESENTATION_STUDY_SELECT: '#praes-study-select',
        PRAESENTATION_CONTENT_AREA: '#praesentation-content-area',

        // Publikation Tab
        PUBLIKATION_TAB_PANE: '#publikation-tab-pane',
        PUBLIKATION_SECTIONS_NAV: '#publikation-sections-nav',
        PUBLIKATION_CONTENT_AREA: '#publikation-content-area',
        PUBLIKATION_SPRACHE_SWITCH: '#publikation-sprache-switch',
        PUBLIKATION_BF_METRIC_SELECT: '#publikation-bf-metric-select',

        // Export Tab
        EXPORT_TAB_PANE: '#export-tab-pane',
        EXPORT_BUTTONS: '#export-tab-pane button[id^="export-"]'
    }),

    CLASSES: Object.freeze({
        ACTIVE: 'active',
        D_NONE: 'd-none',
        CRITERIA_UNSAVED: 'criteria-unsaved-indicator',
        DISABLED_CRITERION: 'disabled-criterion-control'
    }),

    EVENTS: Object.freeze({
        STATE_CHANGED: 'app:stateChanged',
        KOLLEKTIV_CHANGED: 'app:kollektivChanged',
        T2_CRITERIA_CHANGED: 'app:t2CriteriaChanged',
        BRUTE_FORCE_STARTED: 'bf:started',
        BRUTE_FORCE_PROGESS: 'bf:progress',
        BRUTE_FORCE_FINISHED: 'bf:finished'
    }),

    SPECIAL_IDS: Object.freeze({
        APPLIED_CRITERIA_STUDY_ID: 'applied_criteria',
        AVOCADO_SIGN_ID: 'avocado_sign',
    })
});
