Physijs
=======
####Physics plugin for [three.js](https://github.com/mrdoob/three.js)####

**What is it?**

Physijs is a drop-in physics simulator for three.js scenes. Its goal is to provide a simple and fast way to add physics into your 3D scene. Built for specifically for three.js, Physijs enables physics simulation by extending the existing classes you're already using. If you use three.js then you already know how to use Physijs.

- - -

**Current State**

Supports Box, Sphere, and Cylinder shapes which correspond to `THREE.CubeGeometry`, `THREE.SphereGeometry`, and `THREE.CylinderGeometry`
Very basic API at the moment

* Position
* Rotation
* Apply basic physical force

**Live Examples**
[Body](http://chandler.prallfamily.com/labs/three/plugins/physijcs/examples/body.html) - demonstrating some body-related API methods
[Collisions](http://chandler.prallfamily.com/labs/three/plugins/physijcs/examples/collisions.html) - shows how to use the collision callbacks
[Shapes](http://chandler.prallfamily.com/labs/three/plugins/physijcs/examples/shapes.html) - demonstrates the currently implemented shapes

*Built on top of [ammo.js](https://github.com/kripken/ammo.js/)*