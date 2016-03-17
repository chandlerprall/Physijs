import {getUniqueId} from './util/UniqueId';

/*
IF
geometry is instanceof THREE.Geometry, the three arguments are geometry, material, physics_descriptor
ELSE
	the first argument is assumed to be an object Three.js can understand AND
	IF the second argument is an instanceof THREE.Geometry that geometry is used to determine the physics shape
	ELSE the object passed as the first argument is assumed to have a `geometry` property

The next argument in all cases is optional and allows for the object's physical properties to be changed
The fourth argument in all cases is the getShapeDefinition function
 */
export default function( first, second, third, getShapeDefinition ) {
	var three_object;
	var geometry;
	var physics_descriptor;

	if ( first instanceof THREE.Geometry ) {
		geometry = first;
		three_object = new THREE.Mesh( geometry, second );
		physics_descriptor = third;
	} else {
		three_object = first;
		if ( second instanceof THREE.Geometry ) {
			geometry = second;
			physics_descriptor = third;
		} else {
			geometry = three_object.geometry;
			physics_descriptor = second;
		}
	}

	three_object.rotationAutoUpdate = false;
	three_object.matrixAutoUpdate = false;

	three_object.physics = new _PhysicsObject( three_object, geometry, physics_descriptor, getShapeDefinition );
	three_object.clone = clone.bind( three_object, three_object.clone );

	return three_object;
}

export function _PhysicsObject( three_object, geometry, physics_descriptor, getShapeDefinition ) {
	physics_descriptor = physics_descriptor || {};

	this.three_object = three_object;
	this.geometry = geometry;
	this.getShapeDefinition = getShapeDefinition;

	this.linear_velocity = new THREE.Vector3();
	this.angular_velocity = new THREE.Vector3();
	this.linear_factor = new THREE.Vector3( 1, 1, 1 );
	this.angular_factor = new THREE.Vector3( 1, 1, 1 );

	this._ = {
		id: getUniqueId(),

		mass: physics_descriptor.mass || Infinity,
		restitution: physics_descriptor.restitution || 0.1,
		friction: physics_descriptor.friction || 0.5,
		linear_damping: physics_descriptor.linear_damping || 0,
		angular_damping: physics_descriptor.angular_damping || 0,
		collision_groups: physics_descriptor.collision_groups || 0,
		collision_mask: physics_descriptor.collision_mask || 0,

		position: new THREE.Vector3(),
		quaternion: new THREE.Quaternion(),
		linear_velocity: new THREE.Vector3(),
		angular_velocity: new THREE.Vector3(),
		linear_factor: new THREE.Vector3(1, 1, 1),
		angular_factor: new THREE.Vector3(1, 1, 1)
	};

	this.clone = function( three_object ) {
		var cloned = new _PhysicsObject( three_object, geometry, physics_descriptor, getShapeDefinition );

		cloned.mass = this.mass;
		cloned.restitution = this.restitution;
		cloned.friction = this.friction;
		cloned.linear_damping = this.linear_damping;
		cloned.angular_damping = this.angular_damping;
		cloned.collision_groups = this.collision_groups;
		cloned.collision_mask = this.collision_mask;

		cloned.linear_velocity.copy( this.linear_velocity );
		cloned.angular_velocity.copy( this.angular_velocity );
		cloned.linear_factor.copy( this.linear_factor );
		cloned.angular_factor.copy( this.angular_factor );

		return cloned;
	};
}

Object.defineProperty(
	_PhysicsObject.prototype,
	'mass',
	{
		get: function() {
			return this._.mass;
		},
		set: function( mass ) {
			this._.mass = mass;
			if ( this.three_object.parent != null ) {
				this.three_object.parent.physijs.setRigidBodyMass( this );
			}
		}
	}
);

Object.defineProperty(
	_PhysicsObject.prototype,
	'restitution',
	{
		get: function() {
			return this._.restitution;
		},
		set: function( restitution ) {
			this._.restitution = restitution;
			if ( this.three_object.parent != null ) {
				this.three_object.parent.physijs.setRigidBodyRestitution( this );
			}
		}
	}
);

Object.defineProperty(
	_PhysicsObject.prototype,
	'friction',
	{
		get: function() {
			return this._.friction;
		},
		set: function( friction ) {
			this._.friction = friction;
			if ( this.three_object.parent != null ) {
				this.three_object.parent.physijs.setRigidBodyFriction( this );
			}
		}
	}
);

Object.defineProperty(
	_PhysicsObject.prototype,
	'linear_damping',
	{
		get: function() {
			return this._.linear_damping;
		},
		set: function( linear_damping ) {
			this._.linear_damping = linear_damping;
			if ( this.three_object.parent != null ) {
				this.three_object.parent.physijs.setRigidBodyLinearDamping( this );
			}
		}
	}
);

Object.defineProperty(
	_PhysicsObject.prototype,
	'angular_damping',
	{
		get: function() {
			return this._.angular_damping;
		},
		set: function( angular_damping ) {
			this._.angular_damping = angular_damping;
			if ( this.three_object.parent != null ) {
				this.three_object.parent.physijs.setRigidBodyAngularDamping( this );
			}
		}
	}
);

Object.defineProperty(
	_PhysicsObject.prototype,
	'collision_groups',
	{
		get: function() {
			return this._.collision_groups;
		},
		set: function( collision_groups ) {
			this._.collision_groups = collision_groups;
			if ( this.three_object.parent != null ) {
				this.three_object.parent.physijs.setRigidBodyCollisionGroups( this );
			}
		}
	}
);

Object.defineProperty(
	_PhysicsObject.prototype,
	'collision_mask',
	{
		get: function() {
			return this._.collision_mask;
		},
		set: function( collision_mask ) {
			this._.collision_mask = collision_mask;
			if ( this.three_object.parent != null ) {
				this.three_object.parent.physijs.setRigidBodyCollisionMask( this );
			}
		}
	}
);

export function clone() {
	var args = Array.prototype.slice.call( arguments );
	var original_clone = args.shift();

	var cloned = original_clone.apply( this, args );

	cloned.physics = this.physics.clone( cloned );

	return cloned;
}