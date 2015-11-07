import BODY_TYPES from '../../../BODY_TYPES';
import Mesh from './Mesh';

export default function SphereMesh( geometry, material, mass ) {
	Mesh.call( this, geometry, material, mass );
}

SphereMesh.prototype = Object.create( Mesh.prototype );
SphereMesh.prototype.constructor = SphereMesh;

SphereMesh.prototype.getShapeDefinition = function() {
	this.geometry.computeBoundingSphere(); // make sure bounding radius has been calculated

	return {
		body_type: BODY_TYPES.SPHERE,
		radius: this.geometry.boundingSphere.radius
	};
};