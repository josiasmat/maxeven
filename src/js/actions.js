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

import { createCircle } from "./main.js";

import { 
    drawLines,
    clearLines, 
    copyCircle,
    last_lines_count
} from "./circles.js";

import { 
    drawDots,
    clearDots,
    alignDotsToLines,
    translateDots,
    last_dots_count
} from "./dots.js";


/** @type {SVGElement?} */
export var selected_circle = null;



export function putLinesPrompt(circle) 
{
    const s = prompt(
        "Type the number of lines:", 
        last_lines_count ? last_lines_count : 12
    );
    const n = Number.parseInt(s);
    if ( !Number.isNaN(n) && n > 0 ) {
        if ( n < Array.from(circle.querySelectorAll(".dot")).length ) {
            alert("Number of lines cannot be less than number of dots!");
            return;
        }
        clearLines(circle);
        drawLines(circle, n);
    }
}


export function putDotsPrompt(circle)
{
    const s = prompt(
        "Type the number of dots:", 
        last_dots_count ? last_dots_count : ""
    );
    const n = Number.parseInt(s);
    if ( !Number.isNaN(n) && n >= 0 ) {
        if ( n > Array.from(circle.querySelectorAll(".line")).length ) {
            alert("Number of dots cannot be greater than number of lines!");
            return;
        }
        clearDots(circle);
        drawDots(circle, n);
    }
}


export function translateDotsPrompt(circle)
{
    const s = prompt("Type the value of x for T(x):", 0);
    const x = Number.parseInt(s);
    if ( x && !Number.isNaN(x) )
        translateDots(circle, x);
}


export function duplicateCircle(source_circle)
{
    const circle_container = source_circle.parentElement;
    const section_container = circle_container.parentElement;
    const new_circle = createCircle(section_container, circle_container);
    copyCircle(source_circle, new_circle);
    selectCircle(new_circle);
}


export function deleteCirclePrompt(circle_container)
{
    const section_container = circle_container.parentElement;
    const sibling = circle_container.previousElementSibling ?? circle_container.nextElementSibling;
    if ( sibling ) {
        if ( confirm("Delete circle?") ) {
            section_container.removeChild(circle_container);
            selectCircle(sibling.firstChild);
        }
    } else
        deleteSectionPrompt(section_container);
}


/** @param {HTMLElement} section_container */
export function deleteSectionPrompt(section_container)
{
    const sibling = section_container.previousElementSibling ?? section_container.nextElementSibling;
    if ( section_container.nextElementSibling || section_container.previousElementSibling )
        if ( confirm("Delete section?") ) {
            selectCircle(sibling.firstChild.firstChild);
            section_container.parentElement.removeChild(section_container);
        }
}


export const getCircle = {

    first() {
        const main_container = document.getElementById("main-container");
        return main_container.firstElementChild.firstElementChild.firstElementChild;
    },

    last() {
        const main_container = document.getElementById("main-container");
        return main_container.lastElementChild.lastElementChild.firstElementChild;
    },

    next(circle) {
        if ( !circle ) return getCircle.first();
        const circle_container = circle.parentElement;
        const next_circle_container = circle_container.nextElementSibling;
        if ( next_circle_container ) {
            return next_circle_container.firstElementChild;
        } else {
            const section_container = circle_container.parentElement;
            const next_section_container = section_container.nextElementSibling;
            return next_section_container?.firstElementChild.firstElementChild;
        }
    },

    previous(circle) {
        if ( !circle ) return getCircle.last();
        const circle_container = circle.parentElement;
        const prev_circle_container = circle_container.previousElementSibling;
        if ( prev_circle_container ) {
            return prev_circle_container.firstElementChild;
        } else {
            const section_container = circle_container.parentElement;
            const prev_section_container = section_container.previousElementSibling;
            return prev_section_container?.lastElementChild.firstElementChild;
        }
    }

}


export const getSection = {

    next(circle) {
        if ( !circle ) return getCircle.first();
        const circle_container = circle.parentElement;
        const section_container = circle_container.parentElement;
        const next_section_container = section_container.nextElementSibling;
        return next_section_container?.firstElementChild.firstElementChild;
    },

    previous(circle) {
        if ( !circle ) return getCircle.last();
        const circle_container = circle.parentElement;
        const section_container = circle_container.parentElement;
        const prev_section_container = section_container.previousElementSibling;
        return prev_section_container?.firstElementChild.firstElementChild;
    }

}


export function selectCircle(circle)
{
    if ( !circle ) return;
    unselectCircle(selected_circle);
    // unselectAllCircles();
    const circle_container = circle.parentElement;
    circle_container.toggleAttribute("selected", true);
    selected_circle = circle;
    circle_container.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
    });
}


export function unselectCircle(circle)
{
    if ( !circle ) return;
    selected_circle = null;
    const circle_container = circle.parentElement;
    circle_container.toggleAttribute("selected", false);
}


export function unselectAllCircles()
{
    selected_circle = null;
    for ( const elm of document.querySelectorAll(".circle-container") )
        elm.removeAttribute("selected");
}


export function doDefaultCircleAction(circle)
{
    if ( !circle.hasAttribute("lines") )
        putLinesPrompt(circle);
    else if ( !circle.hasAttribute("dots") )
        putDotsPrompt(circle);
    else
        alignDotsToLines(circle);
}

