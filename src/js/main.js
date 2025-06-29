
// import { ctxmenu } from "./ctxmenu.js";
import { drawCircle } from "./circles.js";
import {
    attachCircleMenu, 
    attachSectionMenu,
    circleClickHandler,
    circleDoubleClickHandler,
    keyPressHandler,
    outsideCircleClickHandler,
    outsideSectionClickHandler,
    selectCircle,
    wheelHandler
} from "./actions.js";
import { preferences } from "./preferences.js";
import { hasSavedSession, loadSession } from "./session.js";

export const main_container = document.getElementById("main-container");

var section_count = 0;


/** 
 * @param {HTMLElement} insert_after 
 * @returns {HTMLElement} 
 */
export function createSectionContainer(insert_after=null) 
{
    const elm = document.createElement("div");
    elm.classList.add("section-container");
    elm.id = `section${section_count++}`;
    if ( insert_after )
        insert_after.after(elm);
    else
        main_container.appendChild(elm);
    attachSectionMenu(elm);
    elm.addEventListener("pointerdown", outsideCircleClickHandler, { capture: true });
    return elm;
}


/** 
 * @param {HTMLElement} section_container 
 * @param {HTMLElement} insert_after 
 * @returns {HTMLElement} 
 */
function createCircleContainer(section_container, insert_after=null) 
{
    const elm = document.createElement("div");
    elm.classList.add("circle-container");
    if ( insert_after )
        insert_after.after(elm);
    else
        section_container.appendChild(elm);
    elm.addEventListener("pointerdown", outsideCircleClickHandler, { capture: true });
    return elm;
}


export function createCircle(section_container, insert_after=null)
{
    const circle = drawCircle(createCircleContainer(section_container, insert_after));
    attachCircleMenu(circle);
    selectCircle(circle);
    circle.addEventListener("pointerdown", circleClickHandler, { capture: true });
    circle.addEventListener("dblclick", circleDoubleClickHandler, { capture: true });
    return circle;
}


// Init

preferences.updateApp();

loadSession();

document.addEventListener("pointerdown", outsideSectionClickHandler, { capture: true });
document.addEventListener("wheel", wheelHandler, { capture: true, passive: false });
window.addEventListener("keydown", keyPressHandler, { passive: false });
