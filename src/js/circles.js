
import { SvgTools } from "./svgtools.js";
import { clamp, degToRad, mod } from "./utils.js";
import { dotPlaceholderClickHandler } from "./actions.js";

import { 
    checkAlignmentOfDots, 
    clearDots, 
    drawDots, 
    updateDots 
} from "./dots.js";

import { preferences } from "./preferences.js";
import { saveSession } from "./session.js";


var circle_count = 0;
export var last_lines_count = 12;


/** @param {SVGElement} circle */
function createCircleLabel(circle)
{
    const label = SvgTools.createElement("text", 
            { class: "label", x: 500, y: 500 }
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
            label.style.fontSize = `${clamp(Math.round(1500/text.length), 12, 140)}px`;
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
        height: "1000px", width: "1000px", 
        viewBox: "0 0 1000 1000", id: circle_id
    });

    const circle = SvgTools.makeCircle(500, 500, 450,
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
    factor *= 450;
    const x = 500 + (Math.cos(a) * factor);
    const y = 500 + (Math.sin(a) * factor);
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
            p.x, p.y, 45, p.a, 
            { class: "line", index: i, angle: d }
        );
        glines.appendChild(line);

        const dot_placeholder = SvgTools.makeCircle(
            p.x, p.y, 30,
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
