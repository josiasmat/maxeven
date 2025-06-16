import { preferences } from "./preferences.js";

import {
    createSectionContainer, createCircle
} from "./main.js";

import { 
    drawLines,
    clearLines, 
    copyCircle,
    last_lines_count,
} from "./circles.js";

import { 
    drawDots,
    clearDots,
    alignDotsToLines,
    translateDots,
    last_dots_count,
    changeDotsToComplement,
    checkAlignmentOfDots,
    addDot,
    removeDot,
    findNearDot,
    alignDotToNearestLine
} from "./dots.js";


/** @type {SVGElement?} */
var selected_circle = null;


/** @param {HTMLElement} section_container */
export function attachSectionMenu(section_container)
{
    const elm_id = section_container.id;

    var menu_def = [
        {
            text: "Add circle",
            action: () => createCircle(section_container)
        },
        { isDivider: true },
        {
            text: "Add new section",
            action: () => createCircle(createSectionContainer(section_container))
        },
        { isDivider: true },
        {
            text: "Delete section",
            action: () => deleteSectionPrompt(section_container),
            disabled: () => section_container.parentElement.childElementCount == 1
        },
        { isDivider: true },
        {
            text: "Label type",
            subMenu: [
                {
                    text: "Set content",
                    action: () => preferences.setLabelTypeToSet()
                },
                {
                    text: "Set cardinality",
                    action: () => preferences.setLabelTypeToCardinality()
                },
            ]
        },
        {
            text: "Switch theme (F9)",
            action: () => preferences.switchTheme()
        },
    ];

    ctxmenu.attach(`#${elm_id}`, menu_def);
}


/** @param {SVGElement} circle */
export function attachCircleMenu(circle) 
{
    const circle_container = circle.parentElement;
    const section_container = circle_container.parentElement;
    const elm_id = circle.id;

    var menu_def = [
        {
            text: "Put n lines (L)",
            action: () => putLinesPrompt(circle)
        },
        {
            text: "Put n dots (D)",
            action: () => putDotsPrompt(circle),
            disabled: () => !circle.hasAttribute("lines")
        },
        {
            text: "Align dots to lines (A)",
            action: () => alignDotsToLines(circle),
            disabled: () => !checkAlignmentOfDots(circle)
        },
        {
            text: "Get complement (C)",
            action: () => changeDotsToComplement(circle),
            disabled: () => !circle.hasAttribute("lines") || circle.querySelector(".dot[not-aligned]")
        },
        { isDivider: true },
        {
            text: "Translate dots",
            subMenu: [
                {
                    text: "1 step clockwise (↑)",
                    action: () => translateDots(circle, 1),
                },
                {
                    text: "1 step counterclockwise (↓)",
                    action: () => translateDots(circle, -1),
                },
                {
                    text: "n steps (T)",
                    action: () => translateDotsPrompt(circle),
                },
            ],
            disabled: () => !circle.hasAttribute("dots")
        },
        { isDivider: true },
        {
            text: () => {
                return `Duplicate circle (Ctrl+D)`;
            },
            action: () => duplicateCircle(circle)
        },
        {
            text: "Add empty circle (Ctrl+C)",
            action: () => createCircle(section_container, circle_container)
        },
        { isDivider: true },
        {
            text: "Add new section (Ctrl+S)",
            action: () => createCircle(createSectionContainer(section_container))
        },
        { isDivider: true },
        {
            text: "Delete",
            subMenu: [
                {
                    text: "Delete circle (Del)",
                    action: () => deleteCirclePrompt(circle_container),
                    disabled: () => section_container.childElementCount == 1
                },
                {
                    text: "Delete section",
                    action: () => deleteSectionPrompt(section_container),
                    disabled: () => section_container.parentElement.childElementCount == 1
                },
            ]
        },
        { isDivider: true },
        {
            text: "Label type",
            subMenu: [
                {
                    text: "Set content",
                    action: () => preferences.setLabelTypeToSet()
                },
                {
                    text: "Set cardinality",
                    action: () => preferences.setLabelTypeToCardinality()
                },
            ]
        },
        {
            text: "Switch theme (F9)",
            action: () => preferences.switchTheme()
        },
    ];
    ctxmenu.attach(`#${elm_id}`, menu_def);
}


function putLinesPrompt(circle) 
{
    const s = prompt(
        "Type the number of lines:", 
        last_lines_count ? last_lines_count : 12
    );
    const n = Number.parseInt(s);
    if ( n && !Number.isNaN(n) ) {
        clearLines(circle);
        drawLines(circle, n);
    }
}


function putDotsPrompt(circle)
{
    const s = prompt(
        "Type the number of dots:", 
        last_dots_count ? last_dots_count : ""
    );
    const n = Number.parseInt(s);
    if ( n && !Number.isNaN(n) ) {
        if ( n > circle.querySelectorAll(".line").length ) {
            alert("Number of dots cannot be greater than number of lines!");
            return;
        }
        clearDots(circle);
        drawDots(circle, n);
    }
}


function translateDotsPrompt(circle)
{
    const s = prompt("Type the value of x for T(x):", 0);
    const x = Number.parseInt(s);
    if ( x && !Number.isNaN(x) )
        translateDots(circle, x);
}


function duplicateCircle(source_circle)
{
    const circle_container = source_circle.parentElement;
    const section_container = circle_container.parentElement;
    const new_circle = createCircle(section_container, circle_container);
    copyCircle(source_circle, new_circle);
    selectCircle(new_circle);
}


function deleteCirclePrompt(circle_container)
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
function deleteSectionPrompt(section_container)
{
    const sibling = section_container.previousElementSibling ?? section_container.nextElementSibling;
    if ( section_container.nextElementSibling || section_container.previousElementSibling )
        if ( confirm("Delete section?") ) {
            selectCircle(sibling.firstChild.firstChild);
            section_container.parentElement.removeChild(section_container);
        }
}


/** @returns {HTMLElement} */
function firstCircle()
{   
    const main_container = document.getElementById("main-container");
    return main_container.firstElementChild.firstElementChild.firstElementChild;
}


/** @returns {HTMLElement} */
function lastCircle()
{   
    const main_container = document.getElementById("main-container");
    return main_container.lastElementChild.lastElementChild.firstElementChild;
}


/** @param {HTMLElement} circle @returns {HTMLElement} */
function nextCircle(circle)
{
    if ( !circle ) return firstCircle();
    const circle_container = circle.parentElement;
    const next_circle_container = circle_container.nextElementSibling;
    if ( next_circle_container ) {
        return next_circle_container.firstElementChild;
    } else {
        const section_container = circle_container.parentElement;
        const next_section_container = section_container.nextElementSibling;
        return next_section_container?.firstElementChild.firstElementChild;
    }
}


/** @param {HTMLElement} circle @returns {HTMLElement} */
function previousCircle(circle)
{
    if ( !circle ) return lastCircle();
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


/** @param {HTMLElement} circle @returns {HTMLElement} */
function nextSection(circle)
{
    if ( !circle ) return firstCircle();
    const circle_container = circle.parentElement;
    const section_container = circle_container.parentElement;
    const next_section_container = section_container.nextElementSibling;
    return next_section_container?.firstElementChild.firstElementChild;
}


/** @param {HTMLElement} circle @returns {HTMLElement} */
function previousSection(circle)
{
    if ( !circle ) return lastCircle();
    const circle_container = circle.parentElement;
    const section_container = circle_container.parentElement;
    const prev_section_container = section_container.previousElementSibling;
    return prev_section_container?.firstElementChild.firstElementChild;
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


function unselectCircle(circle)
{
    if ( !circle ) return;
    selected_circle = null;
    const circle_container = circle.parentElement;
    circle_container.toggleAttribute("selected", false);
}


function unselectAllCircles()
{
    selected_circle = null;
    for ( const elm of document.querySelectorAll(".circle-container") )
        elm.removeAttribute("selected");
}


function doDefaultCircleAction(circle)
{
    if ( !circle.hasAttribute("lines") )
        putLinesPrompt(circle);
    else if ( !circle.hasAttribute("dots") )
        putDotsPrompt(circle);
    else
        alignDotsToLines(circle);
}


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
        ["arrowright", () => selectCircle(nextCircle(selected_circle))],
        ["arrowleft", () => selectCircle(previousCircle(selected_circle))],
        ["shift+arrowright", () => selectCircle(nextSection(selected_circle))],
        ["shift+arrowleft", () => selectCircle(previousSection(selected_circle))],
        ["home", () => selectCircle(firstCircle())],
        ["end", () => selectCircle(lastCircle())],
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

