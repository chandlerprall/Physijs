import BODY_TYPES from '../../../BODY_TYPES';
import Mesh from './Mesh';

export default function ConeMesh( geometry, material, mass ) {
	Mesh.call( this, geometry, material, mass );
}

ConeMesh.prototype = Object.create( Mesh.prototype );
ConeMesh.prototype.constructor = ConeMesh;

ConeMesh.prototype.getShapeDefinition = function() {
	this.geometry.computeBoundingBox(); // make sure bounding radius has been calculated

	return {
		body_type: BODY_TYPES.CONE,
		radius: this.geometry.boundingBox.max.x,
		height: this.geometry.boundingBox.max.y
	};
};