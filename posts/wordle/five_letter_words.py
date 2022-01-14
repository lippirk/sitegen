#!/usr/bin/env python
# -*- coding: utf-8 -*-

import re

five_letter = re.compile(r"^[a-zA-Z]{5}$")

with open('words.txt', 'r') as f:
    five_letter_words = [l.strip() for l in f if five_letter.match(l)]

with open('five_letter_words.js', 'w') as f:
    print(f"export const five_letter_words = [", file=f)
    for w in five_letter_words:
        print(f'  "{w}",', file=f)
    print(f'];', file=f)
