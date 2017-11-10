// Copyright (C) 2007-2016, GoodData(R) Corporation. All rights reserved.
/* eslint no-underscore-dangle: 0 */

import { _getLighterColor } from '../color';

describe('Transformation', () => {
    describe('Lighten color', () => {
        it('should lighten and darken color correctly', () => {
            const getLighterColor = _getLighterColor;

            expect(getLighterColor('rgb(00,128,255)', 0.5)).toEqual('rgb(128,192,255)');
            expect(getLighterColor('rgb(00,128,255)', -0.5)).toEqual('rgb(0,64,128)');
        });
    });
});
