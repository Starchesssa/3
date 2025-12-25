import numpy as np
import mcubes

# Simple example: sphere
res = 50
x = np.linspace(-1, 1, res)
y = np.linspace(-1, 1, res)
z = np.linspace(-1, 1, res)
X, Y, Z = np.meshgrid(x, y, z)
points = np.stack([X, Y, Z], axis=-1).reshape(-1,3)

grid = np.linalg.norm(points, axis=-1) - 0.5
grid = grid.reshape(res,res,res)

vertices, triangles = mcubes.marching_cubes(grid, 0)

with open("sphere.obj", "w") as f:
    for v in vertices:
        f.write(f"v {v[0]} {v[1]} {v[2]}\n")
    for tri in triangles:
        f.write(f"f {tri[0]+1} {tri[1]+1} {tri[2]+1}\n")

print("OBJ generated: sphere.obj")
