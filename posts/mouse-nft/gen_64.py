from lxml import etree
from pathlib import Path

PARENT = Path(__file__).parent
MOUSE = PARENT  / 'mouseang.svg'
OUT = PARENT / 'out'

def colors():
    colors = [('55', 'aa'), ('99', '77'), ('cc', '33'), ('ff', '00')]
    for r, rb in colors:
        for g, gb in colors:
            for b, bb in colors:
                yield (f"#{r}{g}{b}", f"#{rb}{gb}{bb}")


def tree_of_mouse_file():
    xml = etree.parse(str(MOUSE))
    svg = xml.getroot()
    return svg

def to_file(root, fname):
    b_string = etree.tostring(root)
    string = b_string.decode('utf-8')
    with open(PARENT / fname, 'w') as f:
        f.write(string)

def modify(root, color, background_color):
    for el in root.findall('.//{http://www.w3.org/2000/svg}path'):
        el.set('fill', color)
    for el in root.findall('.//{http://www.w3.org/2000/svg}ellipse'):
        el.set('fill', color)
    for el in root.findall('.//{http://www.w3.org/2000/svg}rect'):
        print('setting bg')
        el.set('stroke', background_color)
        el.set('fill', background_color)
    return root

def main():
    OUT.mkdir(exist_ok=True)
    root = tree_of_mouse_file()
    for color, background_color in colors():
        modify(root, color, background_color)
        to_file(root, Path(f'out/mouse_{color[1:]}.svg'))

if __name__ == '__main__':
    main()