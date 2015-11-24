import BODY_TYPES from '../../../BODY_TYPES';
import Mesh from './Mesh';

export default function ConvexMesh( geometry, material, physics_descriptor ) {
	Mesh.call( this, geometry, material, physics_descriptor );
}

ConvexMesh.prototype = Object.create( Mesh.prototype );
ConvexMesh.prototype.constructor = ConvexMesh;

ConvexMesh.prototype.getShapeDefinition = function() {
	var vertices = this.geometry.vertices.reduce(
		function( vertices, vertex ) {
			vertices.push( vertex.x, vertex.y, vertex.z );
			return vertices;
		},
		[]
	);

	return {
		body_type: BODY_TYPES.CONVEX,
		vertices: vertices
	};
};