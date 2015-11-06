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
		position: new THREE.Vector3(),
		quaternion: new THREE.Quaternion(),
		linear_velocity: new THREE.Vector3(),
		angular_velocity: new THREE.Vector3()
	};

	this.linear_velocity = new THREE.Vector3();
	this.angular_velocity = new THREE.Vector3();
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