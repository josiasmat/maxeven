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
import { createSectionContainer, createCircle } from "./main.js";
import { alignDotsToLines, translateDots, changeDotsToComplement } from "./dots.js";

import { 
    deleteCirclePrompt,
    doDefaultCircleAction,
    duplicateCircle,
    getCircle,
    getSection,
    putDotsPrompt, 
    putLinesPrompt, 
    selectCircle, 
    selected_circle, 
    translateDotsPrompt,
    unselectAllCircles
} from "./actions.js";


/** @param {KeyboardEvent} e */
export function keyPressHandler(e) {
    // console.log(`e.key == "${e.key}"\ne.code == "${e.code}"`);
    const circle_container = selected_circle?.parentElement;
    const section_container = circle_container?.parentElement;
    const mapping = new Map([
        ["l", () => putLinesPrompt(selected_circle)],
        ["d", () => {
            if ( selected_circle?.hasAttribute("lines") )
                putDotsPrompt(selected_circle)
        }],
        ["a", () => {
            if ( selected_circle?.hasAttribute("dots") )
                alignDotsToLines(selected_circle); 
        }],
        ["c", () => {
            if ( selected_circle?.hasAttribute("dots") 
                    && !selected_circle.querySelector(".dot[not-aligned]") )
                changeDotsToComplement(selected_circle);
        }],
        ["arrowright", () => selectCircle(getCircle.next(selected_circle))],
        ["arrowleft", () => selectCircle(getCircle.previous(selected_circle))],
        ["shift+arrowright", () => selectCircle(getSection.next(selected_circle))],
        ["shift+arrowleft", () => selectCircle(getSection.previous(selected_circle))],
        ["home", () => selectCircle(getCircle.first())],
        ["end", () => selectCircle(getCircle.last())],
        ["arrowup", () => {
            if ( selected_circle?.hasAttribute("dots") )
                translateDots(selected_circle, 1); 
        }],
        ["arrowdown", () => {
            if ( selected_circle?.hasAttribute("dots") )
                translateDots(selected_circle, -1); 
        }],
        ["t", () => {
            if ( selected_circle?.hasAttribute("dots") )
                translateDotsPrompt(selected_circle); 
        }],
        ["ctrl+d", () => selected_circle && duplicateCircle(selected_circle)],
        ["delete", () => {
            circle_container && deleteCirclePrompt(circle_container);
        }],
        ["f7", () => preferences.toggleLabelType()],
        ["f8", () => preferences.togglePolygons()],
        ["f9", () => preferences.switchTheme()],
        ["escape", () => unselectAllCircles()],
        ["ctrl++", () => preferences.changeColumns(-1)],
        ["ctrl+=", () => preferences.changeColumns(-1)],
        ["ctrl+-", () => preferences.changeColumns(+1)],
        ["ctrl+c", () => selected_circle && createCircle(section_container, circle_container)],
        ["ctrl+s", () => createCircle(createSectionContainer(section_container))],
        ["enter", () => selected_circle && doDefaultCircleAction(selected_circle)]
    ]);

    const key = (e.ctrlKey ? "ctrl+" : '') 
              + (e.shiftKey ? "shift+" : '')
              + e.key.toLowerCase();
    if ( mapping.has(key) ) {
        e.preventDefault();
        mapping.get(key)();
    }
}

