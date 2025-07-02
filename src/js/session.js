import { clearLines, drawLines } from "./circles.js";
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

