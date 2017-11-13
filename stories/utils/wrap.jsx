import React from 'react';
import IntlWrapper from './IntlWrapper';

const GEMINI_SCREENSHOT_CLASS = 'gemini-screenshot';

export function screenshotWrap(component) {
    return (
        <div className={GEMINI_SCREENSHOT_CLASS}>{component}</div>
    );
}

export function wrap(component, height = 600, width = 600, minHeight, minWidth, key) {
    const keyProp = key ? { key } : {};
    return (
        <IntlWrapper {...keyProp}>
            <div style={{ height, width, minHeight, minWidth, border: '1px solid pink', margin: 10 }}>
                {component}
            </div>
        </IntlWrapper>
    );
}
