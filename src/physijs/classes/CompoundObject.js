import {getUniqueId} from './util/uniqueId';
import BODY_TYPES from '../../BODY_TYPES';
import Mesh from './mesh/Mesh';

export default function CompoundObject( physics_descriptor ) {
	if ( physics_descriptor == null ) {
		throw new Error( 'Physijs: attempted to create rigid body without specifying physics details' );
	}

	THREE.Object3D.call( this );
	this.rotationAutoUpdate = false;
	this.matrixAutoUpdate = false;

	this.physijs = {
		id: getUniqueId(),

		mass: physics_descriptor.mass || Infinity,
		restitution: physics_descriptor.restitution || 0.1,
		friction: physics_descriptor.friction || 0.5,
		linear_damping: physics_descriptor.linear_damping || 0,
		angular_damping: physics_descriptor.angular_damping || 0,
		collision_groups: 0,
		collision_mask: 0,

		position: new THREE.Vector3(),
		quaternion: new THREE.Quaternion(),
		linear_velocity: new THREE.Vector3(),
		angular_velocity: new THREE.Vector3(),
		linear_factor: new THREE.Vector3( 1, 1, 1 ),
		angular_factor: new THREE.Vector3( 1, 1, 1 )
	};

	this.linear_velocity = new THREE.Vector3();
	this.angular_velocity = new THREE.Vector3();
	this.linear_factor = new THREE.Vector3( 1, 1, 1 );
	this.angular_factor = new THREE.Vector3( 1, 1, 1 );
}

CompoundObject.prototype = Object.create( THREE.Object3D.prototype );
CompoundObject.prototype.constructor = CompoundObject;

CompoundObject.prototype.getShapeDefinition = function() {
	var shapes = [];

	this.traverse(function( object ) {
		if ( object instanceof Mesh ) {
			object.updateMatrix();
			shapes.push({
				position: { x: object.position.x, y: object.position.y, z: object.position.z },
				quaternion: { x: object.quaternion._x, y: object.quaternion._y, z: object.quaternion._z, w: object.quaternion._w },
				shape_definition: object.getShapeDefinition()
			});
		}
	});

	return {
		body_type: BODY_TYPES.COMPOUND,
		shapes: shapes
	};
};