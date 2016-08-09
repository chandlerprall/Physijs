import PhysicsObject from './classes/PhysicsObject';

import Box from './classes/shapes/Box';
import Cone from './classes/shapes/Cone';
import Convex from './classes/shapes/Convex';
import Cylinder from './classes/shapes/Cylinder';
import Plane from './classes/shapes/Plane';
import Sphere from './classes/shapes/Sphere';
import TriangleMesh from './classes/shapes/TriangleMesh';

import HingeConstraint from './classes/constraints/HingeConstraint';
import PointConstraint from './classes/constraints/PointConstraint';
import SliderConstraint from './classes/constraints/SliderConstraint';
import WeldConstraint from './classes/constraints/WeldConstraint';

import CompoundObject from './classes/CompoundObject';
import Scene from './classes/Scene';

export default {
	PhysicsObject: PhysicsObject,
	Box: Box,
	Cone: Cone,
	Convex: Convex,
	Cylinder: Cylinder,
	Plane: Plane,
	Sphere: Sphere,
	TriangleMesh: TriangleMesh,

	HingeConstraint: HingeConstraint,
	PointConstraint: PointConstraint,
	SliderConstraint: SliderConstraint,
	WeldConstraint: WeldConstraint,

	CompoundObject: CompoundObject,
	Scene: Scene
};