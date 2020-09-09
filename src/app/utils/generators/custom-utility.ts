import { Injectable } from '@angular/core';
@Injectable()
export class CustomUtil {
    public SplitToChunk = <T>(arr: T[], size: number) => {

        const rest = arr.length % size; // how much to divide
        let restUsed = rest; // to keep track of the division over the elements
        const partLength = Math.floor(arr.length / size),
            result = [];

        for (let i = 0; i < arr.length; i += partLength) {
            let end = partLength + i,
                add = false;

            if (rest !== 0 && restUsed) { // should add one element for the division
                end++;
                restUsed--; // we've used one division element now
                add = true;
            }

            result.push(arr.slice(i, end)); // part of the array

            if (add) {
                i++; // also increment i in the case we added an extra element for division
            }
        }

        return result;
    }
}


export const copyToClipboard = (str: string) => {
    const el = document.createElement('textarea');  // Create a <textarea> element
    el.value = str;                                 // Set its value to the string that you want copied
    el.setAttribute('readonly', '');                // Make it readonly to be tamper-proof
    el.style.position = 'absolute';
    el.style.left = '-9999px';                      // Move outside the screen to make it invisible
    document.body.appendChild(el);                  // Append the <textarea> element to the HTML document
    const selected =
        document.getSelection().rangeCount > 0        // Check if there is any content selected previously
            ? document.getSelection().getRangeAt(0)     // Store selection if found
            : false;                                    // Mark as false to know no selection existed before
    el.select();                                    // Select the <textarea> content
    document.execCommand('copy');                   // Copy - only works as a result of a user action (e.g. click events)
    document.body.removeChild(el);                  // Remove the <textarea> element
    if (selected) {                                 // If a selection existed before copying
        document.getSelection().removeAllRanges();    // Unselect everything on the HTML document
        document.getSelection().addRange(selected);   // Restore the original selection
    }
};
