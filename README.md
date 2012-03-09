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

See `shapes.html` in examples directory for usage or `physi.js` for current API methods.

*Built on top of [ammo.js](https://github.com/kripken/ammo.js/)*