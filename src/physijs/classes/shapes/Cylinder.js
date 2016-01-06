import BODY_TYPES from '../../../BODY_TYPES';
import PhysicsObject from '../PhysicsObject';

export default function Cylinder( first, second, third ) {
	return PhysicsObject.call( this, first, second, third, getShapeDefinition );
}

function getShapeDefinition( geometry ) {
	geometry.computeBoundingBox(); // make sure bounding radius has been calculated

	return {
		body_type: BODY_TYPES.CYLINDER,
		radius: geometry.boundingBox.max.x,
		height: geometry.boundingBox.max.y
	};
}