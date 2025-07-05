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

import { 
    addDot, 
    alignDotToNearestLine, 
    removeDot 
} from "./dots.js";

import { 
    doDefaultCircleAction, 
    selectCircle, 
    selected_circle, 
    unselectAllCircles 
} from "./actions.js";


/** @param {PointerEvent} e */
export function circleClickHandler(e) {
    selectCircle(e.currentTarget);
}


/** @param {PointerEvent} e */
export function circleDoubleClickHandler(e) {
    const circle = e.currentTarget;
    doDefaultCircleAction(circle);
}


/** @param {PointerEvent} e */
export function outsideCircleClickHandler(e) {
    unselectAllCircles();
}


/** @param {PointerEvent} e */
export function outsideSectionClickHandler(e) {
    if ( e.target == document.body.parentElement )
        unselectAllCircles();
}


/** @param {PointerEvent} e */
export function dotClickHandler(e) {
    removeDot(e.currentTarget);
}


/** @param {PointerEvent} e */
export function dotPlaceholderClickHandler(e) {
    const i = Number.parseInt(e.currentTarget.getAttribute("index"));
    const circle = e.currentTarget.parentElement.parentElement;
    const near_dot = findNearDot(circle, i);
    if ( near_dot ) {
        alignDotToNearestLine(near_dot, circle)
    } else {
        addDot(circle, i);
        selectCircle(circle);
    }
}


/** @param {WheelEvent} e */
export function wheelHandler(e) 
{
    if (e.ctrlKey) {
        e.preventDefault();
        preferences.changeColumns(e.deltaY>=0 ? 1 : -1);
        if ( selected_circle )
            selected_circle.scrollIntoView({
                behavior: "smooth",
                block: "nearest"
            });
    }
}
