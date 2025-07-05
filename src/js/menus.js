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
import { createCircle, createSectionContainer } from "./main.js";

import { 
    deleteCirclePrompt,
    deleteSectionPrompt, 
    duplicateCircle, 
    putDotsPrompt, 
    putLinesPrompt, 
    translateDotsPrompt
} from "./actions.js";

import { 
    alignDotsToLines, 
    changeDotsToComplement, 
    checkAlignmentOfDots, 
    translateDots 
} from "./dots.js";


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
            text: "Label type (F7)",
            subMenu: [
                {
                    text: "Set content",
                    action: () => preferences.setLabelTypeToSet(),
                    icon: () => checkMarkIfTrue(preferences.label_type == "set")
                },
                {
                    text: "Cardinalities",
                    action: () => preferences.setLabelTypeToCardinality(),
                    icon: () => checkMarkIfTrue(preferences.label_type == "cardinality")
                },
                {
                    text: "None",
                    action: () => preferences.setLabelTypeToNone(),
                    icon: () => checkMarkIfTrue(preferences.label_type == "")
                },
            ]
        },
        {
            text: () => preferences.polygon ? "Hide polygons (F8)" : "Show polygons (F8)",
            action: () => { preferences.polygon = !preferences.polygon; }
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
            text: "Complement (C)",
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
            text: "Label type (F7)",
            subMenu: [
                {
                    text: "Set content",
                    action: () => preferences.setLabelTypeToSet(),
                    icon: () => checkMarkIfTrue(preferences.label_type == "set")
                },
                {
                    text: "Cardinalities",
                    action: () => preferences.setLabelTypeToCardinality(),
                    icon: () => checkMarkIfTrue(preferences.label_type == "cardinality")
                },
                {
                    text: "None",
                    action: () => preferences.setLabelTypeToNone(),
                    icon: () => checkMarkIfTrue(preferences.label_type == "")
                },
            ]
        },
        {
            text: () => preferences.polygon ? "Hide polygons (F8)" : "Show polygons (F8)",
            action: () => { preferences.polygon = !preferences.polygon; }
        },
        {
            text: "Switch theme (F9)",
            action: () => preferences.switchTheme()
        },
    ];
    ctxmenu.attach(`#${elm_id}`, menu_def);
}


function checkMarkIfTrue(condition)
{
    return condition ? "/assets/checked.svg" : ""
}

