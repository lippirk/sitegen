import un_country
from pathlib import Path

html = []
for id in un_country.string_of_id:
    assert Path(f"../../assets/flags/4x3/{id}.svg").exists()
    img_str = f'<image id="flag-{id}" xlink:href="/assets/flags/4x3/{id}.svg" width="0px" height="0px"></image>'
    html.append(img_str)

print('\n'.join(html), end='')
