import Mesh from './Mesh';

export default function SphereMesh( geometry, material, mass ) {
	Mesh.call( this, geometry, material, mass );
}

SphereMesh.prototype = Object.create( Mesh.prototype );
SphereMesh.prototype.constructor = SphereMesh;