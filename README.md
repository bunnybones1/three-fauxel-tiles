# three-fauxel-tiles
A experiment to render faux PBR pixel-art, by prerendering it onto a tile atlas, just in time.


# Approach and History #
This is an attempt to combine these ideas:

- Deferred rendering (PBR)
- Just-in-time model prerendering into atlases
- Only updating parts of the world that move past the scroll edge (old NES games)
- making adjacency rules to control/generate tiles with correct transitions to their neighbors
