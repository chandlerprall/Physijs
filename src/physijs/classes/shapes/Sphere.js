import BODY_TYPES from '../../../BODY_TYPES';
import PhysicsObject from '../PhysicsObject';

export default function Sphere( first, second, third ) {
	return PhysicsObject.call( this, first, second, third, getShapeDefinition );
}

function getShapeDefinition( geometry ) {
	geometry.computeBoundingSphere(); // make sure bounding radius has been calculated

	return {
		body_type: BODY_TYPES.SPHERE,
		radius: geometry.boundingSphere.radius
	};
}