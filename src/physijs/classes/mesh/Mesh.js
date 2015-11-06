import {getUniqueId} from '../util/uniqueId';

export default function Mesh( geometry, material, physics_descriptor ) {
	if ( physics_descriptor == null ) {
		throw new Error( 'Physijs: attempted to create rigid body without specifying physics details' );
	}

	THREE.Mesh.call( this, geometry, material );
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

Mesh.prototype = Object.create( THREE.Mesh.prototype );
Mesh.prototype.constructor = Mesh;

Object.defineProperty(
	Mesh.prototype,
	'mass',
	{
		get: function() {
			return this.physijs.mass;
		},
		set: function( mass ) {
			this.physijs.mass = mass;
			if ( this.parent != null ) {
				this.parent.physijs.setRigidBodyMass( this );
			}
		}
	}
);

Object.defineProperty(
	Mesh.prototype,
	'restitution',
	{
		get: function() {
			return this.physijs.restitution;
		},
		set: function( restitution ) {
			this.physijs.restitution = restitution;
			if ( this.parent != null ) {
				this.parent.physijs.setRigidBodyRestitution( this );
			}
		}
	}
);

Object.defineProperty(
	Mesh.prototype,
	'friction',
	{
		get: function() {
			return this.physijs.friction;
		},
		set: function( friction ) {
			this.physijs.friction = friction;
			if ( this.parent != null ) {
				this.parent.physijs.setRigidBodyFriction( this );
			}
		}
	}
);

Object.defineProperty(
	Mesh.prototype,
	'linear_damping',
	{
		get: function() {
			return this.physijs.linear_damping;
		},
		set: function( linear_damping ) {
			this.physijs.linear_damping = linear_damping;
			if ( this.parent != null ) {
				this.parent.physijs.setRigidBodyLinearDamping( this );
			}
		}
	}
);

Object.defineProperty(
	Mesh.prototype,
	'angular_damping',
	{
		get: function() {
			return this.physijs.angular_damping;
		},
		set: function( angular_damping ) {
			this.physijs.angular_damping = angular_damping;
			if ( this.parent != null ) {
				this.parent.physijs.setRigidBodyAngularDamping( this );
			}
		}
	}
);

Object.defineProperty(
	Mesh.prototype,
	'collision_groups',
	{
		get: function() {
			return this.physijs.collision_groups;
		},
		set: function( collision_groups ) {
			this.physijs.collision_groups = collision_groups;
			if ( this.parent != null ) {
				this.parent.physijs.setRigidBodyCollisionGroups( this );
			}
		}
	}
);
Object.defineProperty(
	Mesh.prototype,
	'collision_mask',
	{
		get: function() {
			return this.physijs.collision_mask;
		},
		set: function( collision_mask ) {
			this.physijs.collision_mask = collision_mask;
			if ( this.parent != null ) {
				this.parent.physijs.setRigidBodyCollisionMask( this );
			}
		}
	}
);
