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

	var faces = geometry.faces.reduce(
		function( faces, face ) {
			faces.push( face.a, face.b, face.c );
			return faces;
		},
		[]
	);

	return {
		body_type: BODY_TYPES.TRIANGLE,
		vertices: vertices,
		faces: faces
	};
}