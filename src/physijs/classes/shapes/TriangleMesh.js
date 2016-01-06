import BODY_TYPES from '../../../BODY_TYPES';
import PhysicsObject from '../PhysicsObject';

export default function TriangleMesh( first, second, third ) {
	return PhysicsObject.call( this, first, second, third, getShapeDefinition );
}

function getShapeDefinition( geometry ) {
	var vertices = geometry.vertices.reduce(
		function( vertices, vertex ) {
			vertices.push( vertex.x, vertex.y, vertex.z );
			return vertices;
		},
		[]
	);

	return {
		body_type: BODY_TYPES.CONVEX,
		vertices: vertices,
		faces: geometry.faces
	};
}