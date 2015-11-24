import BODY_TYPES from '../../../BODY_TYPES';
import Mesh from './Mesh';

export default function PlaneMesh( geometry, material, physics_descriptor ) {
	Mesh.call( this, geometry, material, physics_descriptor );
}

PlaneMesh.prototype = Object.create( Mesh.prototype );
PlaneMesh.prototype.constructor = PlaneMesh;

PlaneMesh.prototype.getShapeDefinition = function() {
	this.geometry.computeBoundingBox(); // make sure bounding radius has been calculated

	return {
		body_type: BODY_TYPES.PLANE,
		width: this.geometry.boundingBox.max.x,
		height: this.geometry.boundingBox.max.y
	};
};