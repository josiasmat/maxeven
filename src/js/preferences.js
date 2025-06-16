import { updateCircleLabel } from "./circles.js";
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

    /**
     * "set", "cadinality"
     * @return {String}
     */
    get label_type() {
        return this.storage.readString("label-type", "set");
    },

    setLabelTypeToSet() {
        this.storage.writeString("label-type", "set");
        this.updateApp();
    },

    setLabelTypeToCardinality() {
        this.storage.writeString("label-type", "cardinality");
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
        for ( const circle of circles )
            updateCircleLabel(circle);
    }

}

