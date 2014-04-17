Physijs
=======
#### Physics plugin for [three.js](https://github.com/mrdoob/three.js)

Physijs brings a very easy to use interface to the three.js framework. One of the reasons three.js is so popular is because it is so incredibly easy for graphics newbies to get into 3D programming. Physijs takes that philosophy to heart and makes physics simulations just as easy to run. In fact, there are just [five easy steps](https://github.com/chandlerprall/Physijs/wiki/Basic-Setup) that must be taken to make a 3D scene come alive.

#### How does Physijs work?
Physijs is built on top of [ammo.js](https://github.com/kripken/ammo.js/) (although there is also a [cannon.js branch](https://github.com/chandlerprall/Physijs/tree/cannon)) and runs the physics simulation in a separate thread (via web worker) to avoid impacting in your application's performance and taking up your 3D rendering time.

A lot of effort has been made to keep the style of code the same when using Physijs. Apart from [updating an object's position](https://github.com/chandlerprall/Physijs/wiki/Updating-an-object's-position-&-rotation), all of the normal three.js conventions remain the same. If you are used to three.js, you already know how to use the Physijs plugin.

#### Who is this for?
You, hopefully. If you are familiar with [three.js](https://github.com/mrdoob/three.js) and want to add physics to your scene, this is the plugin for you. No mucking about with shape definitions, keeping objects in their correct positions, or identifying collisions - simply use a few Physijs objects in place of three.js's and you'll automatically have a dynamic environment.

If you need (or want) a feature not already included then add it to the [issue tracker](https://github.com/chandlerprall/Physijs/issues) or implement it yourself and send over a pull request.

### Examples
[![rigid bodies](http://chandlerprall.github.com/Physijs/examples/body.jpg)](http://chandlerprall.github.com/Physijs/examples/body.html)
[![collisions](http://chandlerprall.github.com/Physijs/examples/collisions.jpg)](http://chandlerprall.github.com/Physijs/examples/collisions.html)
[![compound shapes](http://chandlerprall.github.com/Physijs/examples/compound.jpg)](http://chandlerprall.github.com/Physijs/examples/compound.html)
[![all shapes](http://chandlerprall.github.com/Physijs/examples/shapes.jpg)](http://chandlerprall.github.com/Physijs/examples/shapes.html)
[![jenga](http://chandlerprall.github.com/Physijs/examples/jenga.jpg)](http://chandlerprall.github.com/Physijs/examples/jenga.html)
[![car constraints](http://chandlerprall.github.com/Physijs/examples/constraints_car.jpg)](http://chandlerprall.github.com/Physijs/examples/constraints_car.html)
[![vehicle](http://chandlerprall.github.com/Physijs/examples/vehicle.jpg)](http://chandlerprall.github.com/Physijs/examples/vehicle.html)

### Features
* Support for [multiple object shapes](https://github.com/chandlerprall/Physijs/wiki/Basic-Shapes), including custom convex or concave objects as well as heightmaps
* [Material system](https://github.com/chandlerprall/Physijs/wiki/Materials) provides simple control over friction and restitution ("bounciness")
* Integrated collision detection and events
* Compound objects using the hierarchy system in three.js
* Vehicle system
* [Constraint systems](https://github.com/chandlerprall/Physijs/wiki/Constraints) such as point-to-point and hinge
* Rotations using either euler or quaternion systems - your preference
* Built seamlessly on top of three.js to keep the same convention and coding style

### In the Future
* More (and better) optimizations
* It would be awesome to have concave shape decomposition
