# Texas Ranchers shop concepts

Six homepage concepts for [shop.ranchers.com](https://shop.ranchers.com), each with its own landing pages for the holiday ads. Everything is built from renders of the real merch with the club's marks, type and textures. These are test pages only: nothing on the live store has changed.

**Live pages:** https://calebgarrard-source.github.io/ranchers-shop-concepts/

| Concept | Link | What to try |
| --- | --- | --- |
| Every Season | https://calebgarrard-source.github.io/ranchers-shop-concepts/every-season/ | Load animation, the rotating hero, the shop-the-lineup grid, the marquee |
| Try the Look | https://calebgarrard-source.github.io/ranchers-shop-concepts/try-the-look/ | Drag or swipe the ring, tap a look, tap pins, pick sizes, add a full look |
| The Rail | https://calebgarrard-source.github.io/ranchers-shop-concepts/the-rail/ | Hover along the rail, click a top, use the arrows or keyboard (desktop) |
| Lookbook | https://calebgarrard-source.github.io/ranchers-shop-concepts/lookbook/ | The hero slides and arrows, the lineup carousel, shop by category and color |
| Collections | https://calebgarrard-source.github.io/ranchers-shop-concepts/collections/ | The men's and women's tabs, the detail bands, the category tiles |
| Clubhouse | https://calebgarrard-source.github.io/ranchers-shop-concepts/clubhouse/ | The hero cards, render cards that turn on hover, and a product page for every item with five angles and a 360 per color |

## Ad landing pages

Each concept has a page for each ad in the holiday ad sets, at `<concept>/lp/official-jersey/`, `<concept>/lp/stay-cold/` and `<concept>/lp/gift/`. The page reads the link the way it would read a real ad click:

- `utm_content=hook_a` or `hook_b` sets the opening headline to the ad's hook.
- `utm_term` is the ad set name. One containing "Visitors" or "engagers" gets the returning-visitor view (straight to buying, with the free-shipping deadline); anything else gets the new-visitor view (who the club is and why to buy).

The front page has a tester that builds these links for you. Store buttons carry the parameters on to shop.ranchers.com, and the tester marks them `utm_source=concept_test` so test visits are easy to filter out.

Notes for testers:
- Product links open the real product pages. The Try the Look bag is a shortlist stored in your browser; no order or payment happens here.
- The landing pages are built for phones first. Open them on a phone, or narrow your browser window.
- The Rail scales as one picture, so it reads best on a laptop or larger.
- Type is the club's own: headlines in Solano Gothic MVB (used under the club's web licence), labels and body in Sweet Square Pro and Sweet Sans Pro from the club's Adobe Fonts kit.

#RideTall
