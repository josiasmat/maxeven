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
import { DOT_RADIUS, pointOnCircle, updateCircleLabel } from "./circles.js";
import { mod } from "./utils.js";
import { preferences } from "./preferences.js";
import { saveSession } from "./session.js";
import { dotClickHandler } from "./mouse.js";


export var last_dots_count = 0;


/** @param {SVGElement} dot @param {Number} pos */
function setDotPosition(dot, pos)
{
    dot.setAttribute("pos", pos);
    dot.style.offsetDistance = `${(pos-0.25)*100}%`;
}


/**
 * @param {SVGElement} dot 
 * @param {number} nlines 
 * @param {number} amount 
 */
export function translateDot(dot, nlines, amount) 
{
    const pos = getDotPosition(dot);
    const new_pos = ((pos*nlines) + amount) / nlines;
    setDotPosition(dot, new_pos);
}


/**
 * 
 * @param {SVGElement} circle 
 * @param {[number]} positions 
 */
export function updateDots(circle, positions)
{
    for ( const dot of circle.querySelectorAll(".dot") ) {
        const i = Number.parseInt(dot.getAttribute("index"));
        setDotPosition(dot, positions[i]);
    }
    checkAlignmentOfDots(circle);
    updateCirclePolygon(circle);
    saveSession();
}


/**
 * @param {SVGElement} circle 
 * @param {Number} index
 */
export function findNearDot(circle, index)
{
    const nlines = Number.parseInt(circle.getAttribute("lines") ?? '0');
    const gdots = circle.querySelector(".dots");
    const dots = Array.from(gdots.children);
    return dots.find( 
        (dot) => mod(Math.round(getDotPosition(dot)*nlines), nlines) == index
    );
}


/**
 * @param {SVGElement} circle 
 * @param {number} index 
 */
export function addDot(circle, index) 
{
    const nlines = Number.parseInt(circle.getAttribute("lines"));
    const ndots = Number.parseInt(circle.getAttribute("dots") ?? "0");
    drawDot(circle, index, index / nlines);
    circle.setAttribute("dots", ndots+1);
    updateCircleLabel(circle);
    checkAlignmentOfDots(circle);
    updateCirclePolygon(circle);
    saveSession();
}


/**
 * @param {SVGElement} dot 
 */
export function removeDot(dot) 
{
    const gdots = dot.parentElement;
    const circle = gdots.parentElement;
    const ndots = Number.parseInt(circle.getAttribute("dots"));
    gdots.removeChild(dot);
    circle.setAttribute("dots", ndots-1);
    updateCircleLabel(circle);
    updateCirclePolygon(circle);
    saveSession();
}


/**
 * @param {SVGElement} circle 
 * @param {number} n 
 */
export function drawDots(circle, n) 
{
    clearDots(circle);
    for ( let i = 0; i < n; i++ ) {
        const p = i / n;
        drawDot(circle, i, p);
    }
    circle.setAttribute("dots", n);
    updateCircleLabel(circle);
    checkAlignmentOfDots(circle);
    updateCirclePolygon(circle);
    saveSession();
    last_dots_count = n;
}


/**
 * @param {SVGElement} circle_elm 
 * @param {number} index
 * @param {number} pos
 */
function drawDot(circle, index, pos)
{
    const gdots = circle.querySelector(".dots");
    const dot = SvgTools.makeCircle(
        0, 0, DOT_RADIUS, 
        { class: "dot", index: index });
    dot.style.offsetPath = `url(#${circle.firstElementChild.id})`;
    setDotPosition(dot, pos);
    gdots.appendChild(dot);
    dot.addEventListener("click", dotClickHandler, { capture: true });
    return dot;
}


/** @param {SVGElement} circle */
export function clearDots(circle) 
{
    const gdots = circle.querySelector(".dots");
    for ( const dot of Array.from(gdots.children) )
        gdots.removeChild(dot);
    circle.removeAttribute("dots");
    updateCircleLabel(circle);
    updateCirclePolygon(circle);
    saveSession();
}


/** @param {SVGElement} circle */
export function checkAlignmentOfDots(circle) 
{
    const nlines = circle.querySelectorAll(".line").length;
    const gdots = circle.querySelector(".dots");
    let not_aligned_count = 0;

    for ( const dot of Array.from(gdots.children) ) {
        const not_aligned = !isDotAligned(dot, nlines);
        dot.toggleAttribute("not-aligned", not_aligned);
        if ( not_aligned ) not_aligned_count++;
    }

    return not_aligned_count;
}


/** @param {SVGElement} dot @returns {Number} */
function getDotPosition(dot)
{
    return Number.parseFloat(dot.getAttribute("pos"));
}


/** 
 * @param {SVGElement} dot 
 * @param {Number} nlines
 */
function isDotAligned(dot, nlines)
{
    return Number.isInteger(getDotPosition(dot)*nlines);
}


/** @param {SVGElement} dot @param {SVGElement} circle */
export function alignDotToNearestLine(dot, circle)
{
    const nlines = circle.getAttribute("lines") ?? 0;
    const pos = getDotPosition(dot);
    const new_pos = Math.round(pos*nlines) / nlines;
    if ( pos != new_pos ) {
        setDotPosition(dot, new_pos);
        dot.removeAttribute("not-aligned");
    }
}


/** @param {SVGElement} circle */
export function alignDotsToLines(circle) 
{
    const gdots = circle.querySelector(".dots");
    for ( const dot of Array.from(gdots.children) )
        alignDotToNearestLine(dot, circle);
    updateCirclePolygon(circle);
    saveSession();
}


/** @param {SVGElement} circle */
export function changeDotsToComplement(circle) 
{
    const nlines = circle.querySelectorAll(".line").length;
    const gdots = circle.querySelector(".dots");
    const dots = Array.from(gdots.children);
    const ndots = dots.length;

    for ( let i = 0; i < nlines; i++ ) {
        const dot_at_i = dots.find( (dot) => i == mod(getDotPosition(dot)*nlines, nlines) );
        dot_at_i ? removeDot(dot_at_i) : addDot(circle, i);
    }

    circle.setAttribute("dots", nlines - ndots);
    updateCircleLabel(circle);
    updateCirclePolygon(circle);
    saveSession();
}


/** @param {SVGElement} circle @param {Number} amount */
export function translateDots(circle, amount) {
    const gdots = circle.querySelector(".dots");
    const nlines = Number.parseInt(circle.getAttribute("lines"));
    amount %= nlines;
    for ( const dot of Array.from(gdots.children) )
        translateDot(dot, nlines, amount);
    updateCircleLabel(circle);
    updateCirclePolygon(circle);
    saveSession();
}


/** @param {SVGElement} circle */
export function updateCirclePolygon(circle) 
{
    const poly = circle.querySelector(".polygon");
    if ( preferences.polygon ) {
        const dots = Array.from(circle.querySelectorAll(".dot"));
        const angles = dots.map((dot) => mod(Number.parseFloat(dot.getAttribute("pos"))*360-90, 360))
                           .sort((a,b) => a-b);
        const points = angles.map((x) => pointOnCircle(x, 0.8));
        SvgTools.changePolygon(poly, points);
    } else {
        SvgTools.changePolygon(poly, []);
    }
}

