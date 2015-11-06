import {getUniqueId} from '../util/uniqueId';

export default function Mesh( geometry, material, mass ) {
	if ( mass == null ) {
		throw new Error( 'Physijs: attempted to create rigid body without specifying mass' );
	}

	THREE.Mesh.call( this, geometry, material );
	this.rotationAutoUpdate = false;
	this.matrixAutoUpdate = false;

	this.physijs = {
		id: getUniqueId(),
		mass: mass || Infinity,
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
				this.parent.setRigidBodyMass( this );
			}
		}
	}
);