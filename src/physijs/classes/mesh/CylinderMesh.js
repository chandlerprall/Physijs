import BODY_TYPES from '../../../BODY_TYPES';
import Mesh from './Mesh';

export default function CylinderMesh( geometry, material, physics_descriptor ) {
	Mesh.call( this, geometry, material, physics_descriptor );
}

CylinderMesh.prototype = Object.create( Mesh.prototype );
CylinderMesh.prototype.constructor = CylinderMesh;

CylinderMesh.prototype.getShapeDefinition = function() {
	this.geometry.computeBoundingBox(); // make sure bounding radius has been calculated

	return {
		body_type: BODY_TYPES.CYLINDER,
		radius: this.geometry.boundingBox.max.x,
		height: this.geometry.boundingBox.max.y
	};
};