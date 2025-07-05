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

import { drawLines } from "./circles.js";
import { addDot } from "./dots.js";
import { createCircle, createSectionContainer, main_container } from "./main.js";
import { SessionStorageHandler } from "./storage-handler.js";

const session = new SessionStorageHandler("maxeven");


export function hasSavedSession()
{
    return session.has("session-data");
}


export function saveSession()
{
    const data = Array.from(main_container.querySelectorAll(".section-container"))
        .map((section_container) => {
            return Array.from(section_container.querySelectorAll(".circle-container"))
                .map( (circle) => {
                    const nlines = circle.querySelectorAll(".lines>line.line").length;
                    const dots = Array.from(circle.querySelectorAll(".dots>circle.dot"))
                        .map( (dot) => Number.parseFloat(dot.getAttribute("pos")));
                    return { l: nlines, d: dots };
                })
        });
    const s = JSON.stringify(data);
    // console.log(`SESSION SAVED:\n${s}`);
    session.writeString("session-data", s);
}


export function loadSession()
{
    if ( hasSavedSession() ) {
        const s = session.readString("session-data", '[[{"l:12,d:[]"}]]');
        // console.log(`SESSION LOADED:\n${s}`);
        const data = JSON.parse(s);
        for ( const section_data of data ) {
            const section_container = createSectionContainer();
            for ( const circle_data of section_data ) {
                const circle = createCircle(section_container);
                drawLines(circle, circle_data.l);
                for ( const dot_pos of circle_data.d ) {
                    addDot(circle, dot_pos * circle_data.l);
                }
            }
        }
    } else {
        createCircle(createSectionContainer());
    }
}

