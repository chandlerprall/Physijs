import BODY_TYPES from '../../../BODY_TYPES';
import Mesh from './Mesh';

export default function BoxMesh( geometry, material, physics_descriptor ) {
	Mesh.call( this, geometry, material, physics_descriptor );
}

BoxMesh.prototype = Object.create( Mesh.prototype );
BoxMesh.prototype.constructor = BoxMesh;

BoxMesh.prototype.getShapeDefinition = function() {
	this.geometry.computeBoundingBox(); // make sure bounding radius has been calculated

	return {
		body_type: BODY_TYPES.BOX,
		width: this.geometry.boundingBox.max.x,
		height: this.geometry.boundingBox.max.y,
		depth: this.geometry.boundingBox.max.z
	};
};