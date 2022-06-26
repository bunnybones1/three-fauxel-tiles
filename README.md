# three-volumetric-simulation
A experiment to drive a force-directed layout via WebGL, using custom shaders


# Approach and History #
The basic idea is that fragment/vertex shaders can be used to integrate physics atomically, and to mix atomic influence on a vector field, depositing density in a field, and using that to influence the atoms, in a feedback loop.