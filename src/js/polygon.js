/*
maxeven
Copyright (C) 2026 Josias Matschulat

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
import { pointOnCircle } from "./circles.js";


/** @param {SVGElement} circle */
export function createCirclePolygon(circle)
{
    const poly = SvgTools.makePath([], { class: "polygon" });
    circle.appendChild(poly);
}


/** @param {SVGElement} circle @param {Boolean} [update=false]*/
export function recreateCirclePolygon(circle, update=false)
{
    const old_poly = circle.querySelector(".polygon");
    const new_poly = SvgTools.makePath([], { class: "polygon" });
    circle.insertBefore(new_poly, old_poly);
    circle.removeChild(old_poly);
    if ( update ) updateCirclePolygon(circle);
}


/** @param {SVGElement} circle */
export function updateCirclePolygon(circle) 
{
    const poly = circle.querySelector(".polygon");
    const nlines = Number.parseInt(circle.getAttribute("lines"));
    const rotate = parseInt(poly.getAttribute("rotate") ?? '0') * 360 / nlines;
    if ( preferences.polygon ) {
        const points = Array.from(circle.querySelectorAll(".dot"))
            .map((dot) => parseFloat(dot.getAttribute("pos")))
            .map((pos) => pos*360 - 90 - rotate)
            .sort((a,b) => b-a)
            .map((x) => pointOnCircle(x, 0.85));
        SvgTools.changePolygon(poly, points);
    } else {
        SvgTools.changePolygon(poly, []);
    }
}


/** 
 * @param {SVGElement} circle 
 * @param {Number} steps 
 * @param {Boolean} [reset=false] 
 */
export function rotateCirclePolygon(circle, steps, reset = false)
{
    const poly = circle.querySelector(".polygon");
    const nlines = Number.parseInt(circle.getAttribute("lines"));
    const rotate = ( reset ? 0 : parseInt(poly.getAttribute("rotate") ?? '0') ) + steps;
    const degrees = rotate * 360 / nlines;
    poly.setAttribute("rotate", rotate);
    poly.setAttribute("transform", `rotate(${degrees})`);
}
