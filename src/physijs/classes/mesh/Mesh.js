import {getUniqueId} from '../util/uniqueId';

export default function Mesh( geometry, material, mass ) {
	if ( mass == null ) {
		throw new Error( 'Physijs: attempted to create rigid body without specifying mass' );
	}

	THREE.Mesh.call( this, geometry, material );
	this.physijs_id = getUniqueId();
	this._mass = mass || Infinity;
}

Mesh.prototype = Object.create( THREE.Mesh.prototype );
Mesh.prototype.constructor = Mesh;

Object.defineProperty(
	Mesh.prototype,
	'mass',
	{
		get: function() {
			return this._mass;
		},
		set: function( mass ) {
			this._mass = mass;
			if ( this.parent != null ) {
				this.parent.setRigidBodyMass( this, mass );
			}
		}
	}
);