/*
maxeven
Copyright (C) 2025 Josias Matschulat

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { preferences } from "./preferences.js";
import { drawCircle } from "./circles.js";
import { loadSession } from "./session.js";
import { selectCircle } from "./actions.js";
import { attachCircleMenu, attachSectionMenu } from "./menus.js";
import { keyPressHandler } from "./keyboard.js";

import {
    circleClickHandler,
    circleDoubleClickHandler,
    outsideCircleClickHandler,
    outsideSectionClickHandler,
    wheelHandler
} from "./mouse.js";


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
