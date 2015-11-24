import BODY_TYPES from '../../../BODY_TYPES';
import Mesh from './Mesh';

export default function TriangleMesh( geometry, material, physics_descriptor ) {
	Mesh.call( this, geometry, material, physics_descriptor );
}

TriangleMesh.prototype = Object.create( Mesh.prototype );
TriangleMesh.prototype.constructor = TriangleMesh;

TriangleMesh.prototype.getShapeDefinition = function() {
	var vertices = this.geometry.vertices.reduce(
		function( vertices, vertex ) {
			vertices.push( vertex.x, vertex.y, vertex.z );
			return vertices;
		},
		[]
	);

	return {
		body_type: BODY_TYPES.CONVEX,
		vertices: vertices,
		faces: this.geometry.faces
	};
};