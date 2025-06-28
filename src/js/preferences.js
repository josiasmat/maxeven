import { updateCircleLabel } from "./circles.js";
import { updateCirclePolygon } from "./dots.js";
import { LocalStorageHandler } from "./storage-handler.js";


export const preferences = {

    storage: new LocalStorageHandler("maxeven"),

    get theme() {
        const value = this.storage.readString("theme", "auto");
        if ( value == "auto" )
            return ( window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches )
                ? "dark" : "light";
        return value;
    },

    get columns() {
        return this.storage.readNumber("columns", 4);
    },

    get polygon() {
        return this.storage.readBool("polygon-visible", false);
    },

    /** @param {Boolean} value */
    set polygon(value) {
        this.storage.writeBool("polygon-visible", value);
        this.updateApp();
    },

    /**
     * "set", "cadinality"
     * @return {String}
     */
    get label_type() {
        switch ( this.storage.readNumber("label-type", 0) ) {
            case 1: return "set";
            case 2: return "cardinality";
            default: return "";
        }
    },

    setLabelTypeToSet() {
        this.storage.writeNumber("label-type", 1);
        this.updateApp();
    },

    setLabelTypeToCardinality() {
        this.storage.writeNumber("label-type", 2);
        this.updateApp();
    },

    setLabelTypeToNone() {
        this.storage.writeNumber("label-type", 0);
        this.updateApp();
    },

    switchTheme() {
        const new_theme = ( this.theme == "light" ) ? "dark" : "light";
        this.storage.writeString("theme", new_theme);
        document.documentElement.setAttribute("theme", new_theme);
    },

    changeColumns(delta) {
        const value = this.columns + delta;
        if ( value > 0 ) {
            this.storage.writeNumber("columns", value);
            document.documentElement.style.setProperty("--columns", value);
        }
    },

    updateApp() {
        document.documentElement.setAttribute("theme", this.theme);
        document.documentElement.style.setProperty("--columns", this.columns);
        const circles = document.querySelectorAll(".circle-container>svg");
        for ( const circle of circles ) {
            updateCircleLabel(circle);
            updateCirclePolygon(circle);
        }
    }

}

