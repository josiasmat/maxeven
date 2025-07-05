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

import { SvgTools } from "./svgtools.js";
import { preferences } from "./preferences.js";
import { saveSession } from "./session.js";
import { clamp, degToRad, mod } from "./utils.js";
import { dotPlaceholderClickHandler } from "./mouse.js";

import { 
    checkAlignmentOfDots, 
    clearDots, 
    drawDots, 
    updateDots 
} from "./dots.js";


export const SVG_SIZE = 1000;
export const SVG_CENTER = SVG_SIZE / 2;
export const CIRCLE_RADIUS = SVG_SIZE * 0.44;

export const LINE_RADIUS = CIRCLE_RADIUS / 9;
export const DOT_RADIUS = LINE_RADIUS * 0.7;


var circle_count = 0;
export var last_lines_count = 12;


/** @param {SVGElement} circle */
function createCircleLabel(circle)
{
    const label = SvgTools.createElement("text", 
            { class: "label", x: SVG_CENTER, y: SVG_CENTER }
        );
    const tspan =  SvgTools.createElement("tspan", {});

    label.appendChild(tspan);
    circle.appendChild(label);
}


/** @param {SVGElement} circle */
export function updateCircleLabel(circle) 
{
    const label = circle.querySelector(".label");
    const tspan = label.firstElementChild;

    const nlines = Number.parseInt(circle.getAttribute("lines") ?? '0');

    switch ( preferences.label_type ) {
        case "cardinality": {
            const ndots = Number.parseInt(circle.getAttribute("dots") ?? '0');
            label.style.fontSize = "140px";
            tspan.innerHTML = (nlines == 0) ? "…" : `${ndots}/${nlines}`;
            }
            break;
        case "set": {
            const dots = Array.from(circle.querySelector(".dots")?.children ?? []);
            const set = dots.map( (dot) => 
                    mod(Math.round(Number.parseFloat(dot.getAttribute("pos"))*nlines), nlines) 
                ).sort((a,b)=>a-b);
            const text = `{${set.join(',')}}`;
            label.style.fontSize = `${clamp(Math.round(CIRCLE_RADIUS*3.333/text.length), 12, CIRCLE_RADIUS/3)}px`;
            tspan.innerHTML = text;
            }
            break;
        default:
            tspan.innerHTML = '';
    }
}


/** 
 * @param {SVGElement} circle 
 */
function createCirclePolygon(circle)
{
    const poly = SvgTools.makePath([], { class: "polygon" });
    circle.appendChild(poly);
}


/** 
 * @param {HTMLElement} container 
 * @returns {SVGElement} 
 */
export function drawCircle(container) 
{
    const circle_id = `circle${circle_count++}`;

    const svg = SvgTools.createElement("svg", {
        viewBox: `0 0 ${SVG_SIZE} ${SVG_SIZE}`, id: circle_id
    });

    const circle = SvgTools.makeCircle(SVG_CENTER, SVG_CENTER, CIRCLE_RADIUS,
        { class: "circle", id: `${circle_id}-shape` }
    );

    const glines = SvgTools.createGroup({ class: "lines" });
    const gdots = SvgTools.createGroup({ class: "dots" });
    
    svg.appendChild(circle);
    svg.appendChild(glines);
    svg.appendChild(gdots);

    createCircleLabel(svg);
    createCirclePolygon(svg);
    container.appendChild(svg);

    if ( last_lines_count )
        drawLines(svg, last_lines_count);
    else
        updateCircleLabel(svg);
    
    return svg;
}


/** 
 * @param {HTMLElement} src 
 * @param {HTMLElement} dest 
 * @returns {SVGElement} 
 */
export function copyCircle(src, dest)
{
    const lines = src.querySelectorAll(".line");
    const ln = lines.length;
    const dots = src.querySelectorAll(".dot")
    const dn = dots.length;

    clearDots(dest);
    clearLines(dest);
    if ( ln ) {
        drawLines(dest, ln);
        if ( dn ) {
            drawDots(dest, dn);
            const positions = Array.from(dots).map( 
                (dot) => Number.parseFloat(dot.getAttribute("pos")) 
            );
            updateDots(dest, positions);
        }
    }
}


export function pointOnCircle(deg, factor=1) 
{
    const a = degToRad(deg);
    factor *= CIRCLE_RADIUS;
    const x = SVG_CENTER + (Math.cos(a) * factor);
    const y = SVG_CENTER + (Math.sin(a) * factor);
    return {x:x, y:y, a:a};
}


/**
 * 
 * @param {SVGElement} circle 
 * @param {number} n 
 */
export function drawLines(circle, n) 
{
    clearLines(circle);
    const glines = circle.querySelector(".lines");
    for ( let i = 0; i < n; i++ ) {
        const d = mod((360 / n * i) - 90, 360);
        const p = pointOnCircle(d);

        const line = SvgTools.makeAngledLine(
            p.x, p.y, LINE_RADIUS, p.a, 
            { class: "line", index: i, angle: d }
        );
        glines.appendChild(line);

        const dot_placeholder = SvgTools.makeCircle(
            p.x, p.y, DOT_RADIUS,
            { class: "dot-placeholder", index: i, angle: d }
        );
        glines.appendChild(dot_placeholder);

        dot_placeholder.addEventListener(
            "click", dotPlaceholderClickHandler, { capture: true }
        );

    }

    circle.setAttribute("lines", n);
    checkAlignmentOfDots(circle);
    updateCircleLabel(circle);
    saveSession();
    last_lines_count = n;
}


/** @param {SVGElement} circle */
export function clearLines(circle) 
{
    const glines = circle.querySelector(".lines");
    for ( const child of Array.from(glines.children) )
        glines.removeChild(child);
    circle.removeAttribute("lines");
    updateCircleLabel(circle);
    checkAlignmentOfDots(circle);
    saveSession();
}
