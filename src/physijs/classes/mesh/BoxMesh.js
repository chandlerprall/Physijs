import Mesh from './Mesh';

export default function BoxMesh( geometry, material, mass ) {
	Mesh.call( this, geometry, material, mass );
}

BoxMesh.prototype = Object.create( Mesh.prototype );
BoxMesh.prototype.constructor = BoxMesh;